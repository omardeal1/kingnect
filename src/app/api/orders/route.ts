import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimitOrders } from "@/lib/rate-limit"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId es requerido" },
        { status: 400 }
      )
    }

    // Verify the user owns this site
    const site = await db.miniSite.findUnique({
      where: { id: siteId },
      select: { clientId: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (!client || (site.clientId !== client.id && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Fetch orders for this site
    const orders = await db.order.findMany({
      where: { miniSiteId: siteId },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId y status son requeridos" },
        { status: 400 }
      )
    }

    const validStatuses = [
      "new",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      )
    }

    // Find the order and verify ownership
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        miniSite: {
          select: { clientId: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      )
    }

    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (
      !client ||
      (order.miniSite.clientId !== client.id &&
        session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: true,
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Error al actualizar pedido" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitResult = rateLimitOrders(ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: "Demasiados pedidos. Intenta de nuevo más tarde." }, { status: 429 })
    }

    const body = await request.json()
    const {
      miniSiteId,
      customerName,
      customerPhone,
      deliveryType,
      address,
      notes,
      items,
      total,
    } = body

    // Validate required fields
    if (!miniSiteId || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Verify the site exists and is active
    const site = await db.miniSite.findUnique({
      where: { id: miniSiteId },
      select: { id: true, isActive: true, isPublished: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    if (!site.isActive || !site.isPublished) {
      return NextResponse.json(
        { error: "El sitio no está activo" },
        { status: 400 }
      )
    }

    // Validate delivery type
    const validDeliveryTypes = ["pickup", "delivery"]
    if (deliveryType && !validDeliveryTypes.includes(deliveryType)) {
      return NextResponse.json(
        { error: "Tipo de entrega no válido" },
        { status: 400 }
      )
    }

    // Calculate total server-side from items (don't trust client-provided total)
    const typedItems: { name: string; quantity: number; unitPrice: number }[] = items
    const calculatedTotal = typedItems.reduce((sum: number, item) => {
      return sum + (item.unitPrice * item.quantity)
    }, 0)

    // Create the order with items
    const order = await db.order.create({
      data: {
        miniSiteId,
        customerName,
        customerPhone: customerPhone || null,
        deliveryType: deliveryType || "pickup",
        notes: notes
          ? `${notes}${address ? ` | Dirección: ${address}` : ""}`
          : address
            ? `Dirección: ${address}`
            : null,
        total: calculatedTotal,
        status: "new",
        orderItems: {
          create: items.map(
            (item: { name: string; quantity: number; unitPrice: number }) => ({
              name: item.name,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: (item.unitPrice || 0) * (item.quantity || 1),
            })
          ),
        },
      },
      include: {
        orderItems: true,
      },
    })

    // Track analytics
    try {
      await db.analyticsEvent.create({
        data: {
          miniSiteId,
          eventType: "order_created",
          metadata: JSON.stringify({ orderId: order.id, total: order.total }),
        },
      })
    } catch {
      // Silently fail analytics
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Error al crear pedido" },
      { status: 500 }
    )
  }
}
