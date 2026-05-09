import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const plans = await db.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Admin plans GET error:", error)
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
    const { name, slug, price, currency, billingInterval, trialDays, features, limits, isActive, sortOrder, maxProducts, maxBranches, maxMenuItems, aiDailyLimit } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "nombre y slug son requeridos" }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await db.plan.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "El slug ya está en uso" }, { status: 400 })
    }

    const plan = await db.plan.create({
      data: {
        name,
        slug,
        price: price ?? 0,
        currency: currency ?? "USD",
        billingInterval: billingInterval ?? "month",
        trialDays: trialDays ?? 0,
        features: JSON.stringify(features ?? {}),
        limits: JSON.stringify(limits ?? {}),
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        ...(maxProducts !== undefined && { maxProducts }),
        ...(maxBranches !== undefined && { maxBranches }),
        ...(maxMenuItems !== undefined && { maxMenuItems }),
        ...(aiDailyLimit !== undefined && { aiDailyLimit }),
      },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Plan creado: ${name}`,
        entityType: "plan",
        entityId: plan.id,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Admin plans POST error:", error)
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

    // Support both plan update and subscription plan change
    if (body.subscriptionId && body.planId) {
      const subscription = await db.subscription.update({
        where: { id: body.subscriptionId },
        data: { planId: body.planId },
      })
      return NextResponse.json({ subscription })
    }

    // Support creating a subscription for a client that doesn't have one
    if (body.createSubscription && body.clientId && body.planId) {
      // Check if client already has a subscription
      const existing = await db.subscription.findUnique({
        where: { clientId: body.clientId },
      })
      if (existing) {
        return NextResponse.json({ error: "El cliente ya tiene una suscripción" }, { status: 400 })
      }

      const subscription = await db.subscription.create({
        data: {
          clientId: body.clientId,
          planId: body.planId,
          status: body.status ?? "active",
        },
        include: { plan: true },
      })

      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: `Suscripción creada para cliente ${body.clientId} con plan ${body.planId}`,
          entityType: "subscription",
          entityId: subscription.id,
        },
      })

      return NextResponse.json({ subscription }, { status: 201 })
    }

    const { planId, name, slug, price, currency, billingInterval, trialDays, features, limits, isActive, sortOrder, maxProducts, maxBranches, maxMenuItems, aiDailyLimit } = body

    if (!planId) {
      return NextResponse.json({ error: "planId es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) {
      const existing = await db.plan.findFirst({
        where: { slug, id: { not: planId } },
      })
      if (existing) {
        return NextResponse.json({ error: "El slug ya está en uso" }, { status: 400 })
      }
      updateData.slug = slug
    }
    if (price !== undefined) updateData.price = price
    if (currency !== undefined) updateData.currency = currency
    if (billingInterval !== undefined) updateData.billingInterval = billingInterval
    if (trialDays !== undefined) updateData.trialDays = trialDays
    if (features !== undefined) updateData.features = JSON.stringify(features)
    if (limits !== undefined) updateData.limits = JSON.stringify(limits)
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (maxProducts !== undefined) updateData.maxProducts = maxProducts
    if (maxBranches !== undefined) updateData.maxBranches = maxBranches
    if (maxMenuItems !== undefined) updateData.maxMenuItems = maxMenuItems
    if (aiDailyLimit !== undefined) updateData.aiDailyLimit = aiDailyLimit

    const plan = await db.plan.update({
      where: { id: planId },
      data: updateData,
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Plan actualizado: ${plan.name}`,
        entityType: "plan",
        entityId: planId,
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Admin plans PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json({ error: "planId es requerido" }, { status: 400 })
    }

    // Check if plan has subscriptions
    const subCount = await db.subscription.count({
      where: { planId },
    })

    if (subCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: tiene ${subCount} suscripciones activas` },
        { status: 400 }
      )
    }

    await db.plan.delete({ where: { id: planId } })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Plan eliminado",
        entityType: "plan",
        entityId: planId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin plans DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
