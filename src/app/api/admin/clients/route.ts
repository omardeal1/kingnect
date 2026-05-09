import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

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
        { whatsapp: { contains: search } },
        { owner: { name: { contains: search } } },
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
          select: { id: true, name: true, email: true, image: true },
        },
        subscription: {
          include: { plan: true },
        },
        miniSites: {
          select: {
            id: true,
            slug: true,
            businessName: true,
            isActive: true,
            isPublished: true,
            branches: {
              select: { id: true, name: true, slug: true, isActive: true },
            },
          },
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
    const {
      clientId,
      accountStatus,
      pipelineStatus,
      notes,
      businessName,
      contactName,
      phone,
      whatsapp,
      email,
      subscriptionId,
      extraFeatures,
    } = body

    // If subscriptionId + extraFeatures: update subscription extraFeatures
    if (subscriptionId && extraFeatures !== undefined) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { extraFeatures: typeof extraFeatures === "string" ? extraFeatures : JSON.stringify(extraFeatures) },
      })

      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: `Funciones extra actualizadas para suscripción ${subscriptionId}`,
          entityType: "subscription",
          entityId: subscriptionId,
        },
      })

      return NextResponse.json({ success: true })
    }

    // If subscriptionId + customLimits: update subscription customLimits
    if (subscriptionId && body.customLimits !== undefined) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { customLimits: typeof body.customLimits === "string" ? body.customLimits : JSON.stringify(body.customLimits) },
      })

      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: `Límites personalizados actualizados para suscripción ${subscriptionId}`,
          entityType: "subscription",
          entityId: subscriptionId,
        },
      })

      return NextResponse.json({ success: true })
    }

    if (!clientId) {
      return NextResponse.json({ error: "clientId es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus
    if (pipelineStatus !== undefined) updateData.pipelineStatus = pipelineStatus
    if (notes !== undefined) updateData.notes = notes
    if (businessName !== undefined) updateData.businessName = businessName
    if (contactName !== undefined) updateData.contactName = contactName
    if (phone !== undefined) updateData.phone = phone
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (email !== undefined) updateData.email = email

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

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { businessName, contactName, phone, email, password } = body

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: "businessName, email y password son requeridos" },
        { status: 400 }
      )
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user + client in transaction
    const client = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: contactName || businessName,
          role: "client",
          mustChangePassword: true,
        },
      })

      return tx.client.create({
        data: {
          ownerUserId: user.id,
          businessName,
          contactName: contactName || null,
          phone: phone || null,
          email,
        },
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          subscription: { include: { plan: true } },
          miniSites: true,
        },
      })
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Cliente creado: ${businessName} (${email})`,
        entityType: "client",
        entityId: client.id,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("Admin clients PATCH error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json({ error: "clientId es requerido" }, { status: 400 })
    }

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { ownerUserId: true, businessName: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Delete client (cascades to subscription, miniSites, etc.)
    await db.client.delete({ where: { id: clientId } })

    // Delete the owner user
    if (client.ownerUserId) {
      await db.user.delete({ where: { id: client.ownerUserId } })
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Cliente eliminado: ${client.businessName}`,
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin clients DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
