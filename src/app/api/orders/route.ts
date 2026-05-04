import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
