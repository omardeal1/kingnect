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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const expiring = searchParams.get("expiring") === "true"

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.accountStatus = status
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (expiring) {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      where.subscription = {
        currentPeriodEnd: { gte: now, lte: nextWeek },
      }
    }

    const clients = await db.client.findMany({
      where,
      include: {
        owner: {
          select: { name: true, email: true, image: true },
        },
        subscription: {
          include: { plan: true },
        },
        miniSites: {
          select: { id: true, slug: true, businessName: true, isActive: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Admin clients GET error:", error)
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
    const { clientId, accountStatus, pipelineStatus, notes } = body

    if (!clientId) {
      return NextResponse.json({ error: "clientId es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus
    if (pipelineStatus !== undefined) updateData.pipelineStatus = pipelineStatus
    if (notes !== undefined) updateData.notes = notes

    const client = await db.client.update({
      where: { id: clientId },
      data: updateData,
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Cliente actualizado: ${Object.keys(updateData).join(", ")}`,
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Admin clients PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, note } = body

    if (!clientId || !note) {
      return NextResponse.json({ error: "clientId y note son requeridos" }, { status: 400 })
    }

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { notes: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const existingNotes = client.notes ? JSON.parse(client.notes) : []
    const newNote = {
      text: note,
      addedBy: session.user.email,
      addedAt: new Date().toISOString(),
    }

    await db.client.update({
      where: { id: clientId },
      data: { notes: JSON.stringify([...existingNotes, newNote]) },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Nota agregada al cliente`,
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin clients POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
