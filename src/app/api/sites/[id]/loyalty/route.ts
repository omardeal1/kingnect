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

// ─── GET: Return loyalty config ───────────────────────────────────────────────

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

    let config = await db.loyaltyConfig.findUnique({
      where: { siteId: id },
    })

    if (!config) {
      config = await db.loyaltyConfig.create({
        data: {
          siteId: id,
          isEnabled: false,
          accumulationType: "visits",
          targetValue: 10,
          rewardType: "discount",
          rewardValue: 0,
          rewardLabel: "Recompensa",
          welcomeGiftEnabled: false,
        },
      })
    }

    // Get customer count
    const customerCount = await db.businessCustomer.count({
      where: { siteId: id, isActive: true },
    })

    return NextResponse.json({ config, customerCount })
  } catch (error) {
    console.error("Error fetching loyalty config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración de lealtad" },
      { status: 500 }
    )
  }
}

// ─── PUT: Update loyalty config ───────────────────────────────────────────────

export async function PUT(
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

    const body = await request.json()

    const allowedFields = [
      "isEnabled",
      "accumulationType",
      "targetValue",
      "rewardType",
      "rewardValue",
      "rewardLabel",
      "welcomeGiftEnabled",
      "welcomeGiftDescription",
    ]

    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Validate accumulationType
    if (updateData.accumulationType !== undefined) {
      const validTypes = ["visits", "amount", "both"]
      if (!validTypes.includes(updateData.accumulationType as string)) {
        return NextResponse.json(
          { error: "Tipo de acumulación no válido" },
          { status: 400 }
        )
      }
    }

    // Validate rewardType
    if (updateData.rewardType !== undefined) {
      const validTypes = ["discount", "free_product", "custom"]
      if (!validTypes.includes(updateData.rewardType as string)) {
        return NextResponse.json(
          { error: "Tipo de recompensa no válido" },
          { status: 400 }
        )
      }
    }

    // Validate targetValue
    if (updateData.targetValue !== undefined) {
      const val = updateData.targetValue as number
      if (val < 1 || val > 1000) {
        return NextResponse.json(
          { error: "El valor objetivo debe ser entre 1 y 1000" },
          { status: 400 }
        )
      }
    }

    // Validate rewardValue
    if (updateData.rewardValue !== undefined) {
      const val = updateData.rewardValue as number
      if (val < 0 || val > 100000) {
        return NextResponse.json(
          { error: "El valor de la recompensa debe ser entre 0 y 100000" },
          { status: 400 }
        )
      }
    }

    const config = await db.loyaltyConfig.upsert({
      where: { siteId: id },
      create: {
        siteId: id,
        ...updateData,
      },
      update: updateData,
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error updating loyalty config:", error)
    return NextResponse.json(
      { error: "Error al actualizar configuración de lealtad" },
      { status: 500 }
    )
  }
}
