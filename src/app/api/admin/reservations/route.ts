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
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (from || to) {
      const reservationDate: Record<string, Date> = {}
      if (from) reservationDate.gte = new Date(from)
      if (to) reservationDate.lte = new Date(to)
      where.reservationDate = reservationDate
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { site: { businessName: { contains: search } } },
      ]
    }

    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
        where,
        include: {
          site: {
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
          config: {
            select: {
              reservationType: true,
            },
          },
        },
        orderBy: [{ reservationDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.reservation.count({ where }),
    ])

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin reservations GET error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { reservationId, status } = body

    if (!reservationId || !status) {
      return NextResponse.json(
        { error: "reservationId y status son requeridos" },
        { status: 400 }
      )
    }

    const validStatuses = ["pending", "approved", "cancelled", "completed", "no_show"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const reservation = await db.reservation.update({
      where: { id: reservationId },
      data: { status },
    })

    // Log admin action
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Reservación ${reservationId.slice(-6)} cambiada a: ${status}`,
        entityType: "reservation",
        entityId: reservationId,
      },
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Admin reservations PUT error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
