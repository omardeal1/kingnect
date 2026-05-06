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

// ─── POST: QR Check-in ───────────────────────────────────────────────────────

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
    const { qrCheckinCode } = body

    if (!qrCheckinCode || typeof qrCheckinCode !== "string") {
      return NextResponse.json(
        { error: "Código QR de check-in es requerido" },
        { status: 400 }
      )
    }

    // Find customer by QR code for this site
    const customer = await db.businessCustomer.findUnique({
      where: { qrCheckinCode: qrCheckinCode.trim() },
      include: { loyaltyConfig: true },
    })

    if (!customer || customer.siteId !== siteId || !customer.isActive) {
      return NextResponse.json(
        { error: "Código QR no válido o cliente no encontrado" },
        { status: 404 }
      )
    }

    // Get loyalty config
    const loyaltyConfig = customer.loyaltyConfig || await db.loyaltyConfig.findUnique({
      where: { siteId },
    })

    if (!loyaltyConfig || !loyaltyConfig.isEnabled) {
      return NextResponse.json(
        { error: "El programa de lealtad no está activo" },
        { status: 400 }
      )
    }

    let rewardEarned = false
    let rewardDescription: string | null = null

    // Update customer - increment visits
    const updateData: Record<string, unknown> = {
      visitsCount: { increment: 1 },
    }

    // If accumulation type includes "visits", increment progress
    if (loyaltyConfig.accumulationType === "visits" || loyaltyConfig.accumulationType === "both") {
      const newProgress = customer.currentProgress + 1

      if (newProgress >= loyaltyConfig.targetValue) {
        // Customer earned a reward!
        rewardEarned = true
        rewardDescription = loyaltyConfig.rewardLabel

        // Reset progress and increment rewards earned
        updateData.currentProgress = 0
        updateData.rewardsEarned = { increment: 1 }

        // Create reward_earned transaction
        await db.loyaltyTransaction.create({
          data: {
            customerId: customer.id,
            siteId,
            type: "reward_earned",
            value: loyaltyConfig.rewardValue,
            description: `¡Recompensa ganada! ${loyaltyConfig.rewardLabel}`,
            createdBy: session.user.id,
          },
        })
      } else {
        updateData.currentProgress = newProgress
      }
    }

    const updatedCustomer = await db.businessCustomer.update({
      where: { id: customer.id },
      data: updateData,
    })

    // Create check_in transaction
    await db.loyaltyTransaction.create({
      data: {
        customerId: customer.id,
        siteId,
        type: "check_in",
        value: 1,
        description: "Check-in por QR",
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      customer: {
        ...updatedCustomer,
        latestProgress: updateData.currentProgress,
      },
      rewardEarned,
      rewardDescription,
      loyaltyConfig: {
        targetValue: loyaltyConfig.targetValue,
        accumulationType: loyaltyConfig.accumulationType,
        rewardType: loyaltyConfig.rewardType,
        rewardValue: loyaltyConfig.rewardValue,
        rewardLabel: loyaltyConfig.rewardLabel,
      },
    })
  } catch (error) {
    console.error("Error processing check-in:", error)
    return NextResponse.json(
      { error: "Error al procesar check-in" },
      { status: 500 }
    )
  }
}
