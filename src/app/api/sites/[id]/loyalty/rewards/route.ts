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

// ─── POST: Redeem reward ──────────────────────────────────────────────────────

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
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId es requerido" },
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

    // Check available rewards
    const availableRewards = customer.rewardsEarned - customer.rewardsRedeemed

    if (availableRewards <= 0) {
      return NextResponse.json(
        { error: "No hay recompensas disponibles para canjear" },
        { status: 400 }
      )
    }

    const loyaltyConfig = customer.loyaltyConfig || await db.loyaltyConfig.findUnique({
      where: { siteId },
    })

    // Update customer - increment redeemed
    const updatedCustomer = await db.businessCustomer.update({
      where: { id: customerId },
      data: {
        rewardsRedeemed: { increment: 1 },
      },
    })

    // Create reward_redeemed transaction
    const transaction = await db.loyaltyTransaction.create({
      data: {
        customerId,
        siteId,
        type: "reward_redeemed",
        value: loyaltyConfig?.rewardValue || 0,
        description: `Recompensa canjeada: ${loyaltyConfig?.rewardLabel || "Recompensa"}`,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      transaction,
      remainingRewards: updatedCustomer.rewardsEarned - updatedCustomer.rewardsRedeemed,
      rewardInfo: {
        type: loyaltyConfig?.rewardType || "discount",
        value: loyaltyConfig?.rewardValue || 0,
        label: loyaltyConfig?.rewardLabel || "Recompensa",
      },
    })
  } catch (error) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json(
      { error: "Error al canjear recompensa" },
      { status: 500 }
    )
  }
}
