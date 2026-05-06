import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    // Get or create default config
    let config = await db.reservationConfig.findUnique({
      where: { siteId: id },
    })

    if (!config) {
      config = await db.reservationConfig.create({
        data: { siteId: id },
      })
    }

    // Parse JSON fields
    const parsedConfig = {
      ...config,
      availableDays: JSON.parse(config.availableDays),
      timeSlots: JSON.parse(config.timeSlots),
    }

    return NextResponse.json({ config: parsedConfig })
  } catch (error) {
    console.error("Error fetching reservation config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración de reservas" },
      { status: 500 }
    )
  }
}

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

    // Build update data
    const updateData: Record<string, unknown> = {}

    const allowedFields = [
      "isEnabled",
      "reservationType",
      "customTypeLabel",
      "slotDurationMinutes",
      "maxCapacityPerSlot",
      "minAdvanceHours",
      "maxAdvanceDays",
      "autoApprove",
      "confirmationMessage",
      "googleCalendarConnected",
      "googleCalendarId",
      "googleAccessToken",
      "googleRefreshToken",
      "googleTokenExpiry",
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle JSON string fields
    if (body.availableDays !== undefined) {
      updateData.availableDays = JSON.stringify(body.availableDays)
    }

    if (body.timeSlots !== undefined) {
      updateData.timeSlots = JSON.stringify(body.timeSlots)
    }

    // Validate reservationType
    if (updateData.reservationType) {
      const validTypes = [
        "appointment",
        "table",
        "space",
        "class",
        "service",
        "custom",
      ]
      if (!validTypes.includes(updateData.reservationType as string)) {
        return NextResponse.json(
          { error: "Tipo de reservación no válido" },
          { status: 400 }
        )
      }
    }

    // Validate slotDurationMinutes
    if (updateData.slotDurationMinutes !== undefined) {
      const validDurations = [15, 30, 45, 60, 90, 120]
      if (!validDurations.includes(updateData.slotDurationMinutes as number)) {
        return NextResponse.json(
          { error: "Duración de turno no válida" },
          { status: 400 }
        )
      }
    }

    // Validate numeric fields
    if (updateData.maxCapacityPerSlot !== undefined) {
      const val = updateData.maxCapacityPerSlot as number
      if (val < 1 || val > 100) {
        return NextResponse.json(
          { error: "Capacidad máxima por turno debe ser entre 1 y 100" },
          { status: 400 }
        )
      }
    }

    if (updateData.minAdvanceHours !== undefined) {
      const val = updateData.minAdvanceHours as number
      if (val < 0 || val > 720) {
        return NextResponse.json(
          { error: "Horas mínimas de anticipación inválidas" },
          { status: 400 }
        )
      }
    }

    if (updateData.maxAdvanceDays !== undefined) {
      const val = updateData.maxAdvanceDays as number
      if (val < 1 || val > 365) {
        return NextResponse.json(
          { error: "Días máximos de anticipación inválidos" },
          { status: 400 }
        )
      }
    }

    // Upsert config
    const config = await db.reservationConfig.upsert({
      where: { siteId: id },
      create: {
        siteId: id,
        ...updateData,
      },
      update: updateData,
    })

    const parsedConfig = {
      ...config,
      availableDays: JSON.parse(config.availableDays),
      timeSlots: JSON.parse(config.timeSlots),
    }

    return NextResponse.json({ config: parsedConfig })
  } catch (error) {
    console.error("Error updating reservation config:", error)
    return NextResponse.json(
      { error: "Error al actualizar configuración de reservas" },
      { status: 500 }
    )
  }
}
