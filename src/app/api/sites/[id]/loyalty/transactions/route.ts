import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyOwnership(siteId: string, userId: string) {
  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: { clientId: true },
  })
  if (!site) return false
  const client = await db.client.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  })
  if (!client) return false
  return site.clientId === client.id
}

// ─── GET: List transactions ───────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || ""
    const customerId = searchParams.get("customerId") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { siteId: id }

    if (type) {
      where.type = type
    }

    if (customerId) {
      where.customerId = customerId
    }

    const [transactions, total] = await Promise.all([
      db.loyaltyTransaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          value: true,
          description: true,
          createdBy: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.loyaltyTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching loyalty transactions:", error)
    return NextResponse.json(
      { error: "Error al obtener transacciones" },
      { status: 500 }
    )
  }
}

// ─── POST: Manual adjustment ──────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, type, value, description } = body

    if (!customerId || !type) {
      return NextResponse.json(
        { error: "customerId y type son requeridos" },
        { status: 400 }
      )
    }

    const validTypes = ["visit", "purchase", "manual_adjustment"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo no válido. Tipos permitidos: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Verify customer belongs to this site
    const customer = await db.businessCustomer.findUnique({
      where: { id: customerId },
      include: { loyaltyConfig: true },
    })

    if (!customer || customer.siteId !== siteId || !customer.isActive) {
      return NextResponse.json(
        { error: "Cliente no encontrado en este sitio" },
        { status: 404 }
      )
    }

    const loyaltyConfig = customer.loyaltyConfig || await db.loyaltyConfig.findUnique({
      where: { siteId },
    })

    if (!loyaltyConfig) {
      return NextResponse.json(
        { error: "No hay configuración de lealtad" },
        { status: 400 }
      )
    }

    const transactionValue = typeof value === "number" ? value : 0
    const updateData: Record<string, unknown> = {}
    let rewardEarned = false
    let rewardDescription: string | null = null

    switch (type) {
      case "visit": {
        updateData.visitsCount = { increment: 1 }
        if (loyaltyConfig.accumulationType === "visits" || loyaltyConfig.accumulationType === "both") {
          const newProgress = customer.currentProgress + 1
          if (newProgress >= loyaltyConfig.targetValue) {
            updateData.currentProgress = 0
            updateData.rewardsEarned = { increment: 1 }
            rewardEarned = true
            rewardDescription = loyaltyConfig.rewardLabel
          } else {
            updateData.currentProgress = newProgress
          }
        }
        break
      }

      case "purchase": {
        const amount = transactionValue
        updateData.totalPurchases = { increment: amount }
        if (loyaltyConfig.accumulationType === "amount" || loyaltyConfig.accumulationType === "both") {
          const newProgress = customer.currentProgress + Math.floor(amount)
          if (newProgress >= loyaltyConfig.targetValue) {
            updateData.currentProgress = 0
            updateData.rewardsEarned = { increment: 1 }
            rewardEarned = true
            rewardDescription = loyaltyConfig.rewardLabel
          } else {
            updateData.currentProgress = newProgress
          }
        }
        break
      }

      case "manual_adjustment": {
        const adjustment = transactionValue
        if (adjustment > 0) {
          const newProgress = customer.currentProgress + adjustment
          if (newProgress >= loyaltyConfig.targetValue) {
            updateData.currentProgress = 0
            updateData.rewardsEarned = { increment: 1 }
            rewardEarned = true
            rewardDescription = loyaltyConfig.rewardLabel
          } else {
            updateData.currentProgress = newProgress
          }
        } else if (adjustment < 0) {
          updateData.currentProgress = Math.max(0, customer.currentProgress + adjustment)
        }
        break
      }
    }

    // Update customer
    const updatedCustomer = await db.businessCustomer.update({
      where: { id: customerId },
      data: updateData,
    })

    // Create transaction
    await db.loyaltyTransaction.create({
      data: {
        customerId,
        siteId,
        type,
        value: transactionValue,
        description: description || `Ajuste manual: ${type}`,
        createdBy: session.user.id,
      },
    })

    // Create reward transaction if earned
    if (rewardEarned) {
      await db.loyaltyTransaction.create({
        data: {
          customerId,
          siteId,
          type: "reward_earned",
          value: loyaltyConfig.rewardValue,
          description: `¡Recompensa ganada! ${loyaltyConfig.rewardLabel}`,
          createdBy: session.user.id,
        },
      })
    }

    return NextResponse.json({
      customer: updatedCustomer,
      rewardEarned,
      rewardDescription,
    })
  } catch (error) {
    console.error("Error creating loyalty transaction:", error)
    return NextResponse.json(
      { error: "Error al crear transacción" },
      { status: 500 }
    )
  }
}
