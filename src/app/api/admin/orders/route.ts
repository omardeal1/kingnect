import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const businessName = searchParams.get("businessName")
    const status = searchParams.get("status")
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (businessName) {
      where.miniSite = {
        businessName: { contains: businessName },
      }
    }

    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {}
      if (fromDate) createdAt.gte = new Date(fromDate)
      if (toDate) createdAt.lte = new Date(toDate)
      where.createdAt = createdAt
    }

    const orders = await db.order.findMany({
      where,
      include: {
        miniSite: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            client: {
              select: {
                id: true,
                businessName: true,
                owner: { select: { name: true, email: true } },
              },
            },
          },
        },
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Admin orders GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId y status son requeridos" }, { status: 400 })
    }

    const validStatuses = ["new", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Pedido ${orderId.slice(-6)} cambiado a: ${status}`,
        entityType: "order",
        entityId: orderId,
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin orders PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
