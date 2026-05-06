import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createEventExtended, type CalendarConfig } from "@/lib/google-calendar"

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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const where: Record<string, unknown> = { siteId: id }

    if (status) {
      where.status = status
    }

    if (from || to) {
      const reservationDate: Record<string, Date> = {}
      if (from) reservationDate.gte = new Date(from)
      if (to) reservationDate.lte = new Date(to)
      where.reservationDate = reservationDate
    }

    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
        where,
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
    console.error("Error fetching reservations:", error)
    return NextResponse.json(
      { error: "Error al obtener reservaciones" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      reservationDate,
      timeSlot,
      partySize,
      notes,
    } = body

    // Validate required fields
    if (!customerName || !reservationDate || !timeSlot) {
      return NextResponse.json(
        { error: "Nombre, fecha y hora son requeridos" },
        { status: 400 }
      )
    }

    // Get reservation config
    const config = await db.reservationConfig.findUnique({
      where: { siteId: id },
    })

    if (!config || !config.isEnabled) {
      return NextResponse.json(
        { error: "Las reservaciones no están habilitadas" },
        { status: 400 }
      )
    }

    // Parse JSON fields
    const availableDays: number[] = JSON.parse(config.availableDays)
    const timeSlots: { start: string; end: string }[] = JSON.parse(config.timeSlots)

    // Validate timeSlot exists in config
    const slotLabel = `${timeSlot} - `
    const slotExists = timeSlots.some(
      (s) => `${s.start} - ${s.end}` === timeSlot || s.start === timeSlot
    )
    if (!slotExists) {
      return NextResponse.json(
        { error: "El horario seleccionado no está disponible" },
        { status: 400 }
      )
    }

    // Validate reservation date
    const resDate = new Date(reservationDate)
    const now = new Date()

    // Check minAdvanceHours
    const minAdvanceDate = new Date(
      now.getTime() + config.minAdvanceHours * 60 * 60 * 1000
    )
    if (resDate < minAdvanceDate) {
      return NextResponse.json(
        {
          error: `La reservación debe hacerse con al menos ${config.minAdvanceHours} hora(s) de anticipación`,
        },
        { status: 400 }
      )
    }

    // Check maxAdvanceDays
    const maxAdvanceDate = new Date(
      now.getTime() + config.maxAdvanceDays * 24 * 60 * 60 * 1000
    )
    if (resDate > maxAdvanceDate) {
      return NextResponse.json(
        {
          error: `La reservación no puede ser mayor a ${config.maxAdvanceDays} días de anticipación`,
        },
        { status: 400 }
      )
    }

    // Check day of week
    const dayOfWeek = resDate.getDay() // 0=Sun..6=Sat
    if (!availableDays.includes(dayOfWeek)) {
      return NextResponse.json(
        { error: "El día seleccionado no está disponible para reservaciones" },
        { status: 400 }
      )
    }

    // Validate partySize
    const pSize = partySize || 1
    if (pSize < 1 || pSize > config.maxCapacityPerSlot) {
      return NextResponse.json(
        {
          error: `El número de personas debe ser entre 1 y ${config.maxCapacityPerSlot}`,
        },
        { status: 400 }
      )
    }

    // Check capacity for the slot
    const startOfDay = new Date(resDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(resDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingReservations = await db.reservation.count({
      where: {
        configId: config.siteId,
        siteId: id,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot: timeSlot,
        status: { in: ["pending", "approved"] },
      },
    })

    const totalPartySize = existingReservations + pSize
    if (totalPartySize > config.maxCapacityPerSlot) {
      return NextResponse.json(
        {
          error: `No hay suficiente capacidad disponible para este horario. Disponible: ${Math.max(0, config.maxCapacityPerSlot - existingReservations)}`,
        },
        { status: 400 }
      )
    }

    // Determine initial status
    const status = config.autoApprove ? "approved" : "pending"

    // Create the reservation
    const reservation = await db.reservation.create({
      data: {
        configId: config.siteId,
        siteId: id,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        customerWhatsapp: customerWhatsapp || false,
        reservationDate: resDate,
        timeSlot,
        partySize: pSize,
        status,
        notes: notes?.trim() || null,
      },
    })

    // Create Google Calendar event if connected (best effort)
    if (config.googleCalendarConnected && config.googleAccessToken) {
      try {
        const calendarConfig: CalendarConfig = {
          googleAccessToken: config.googleAccessToken,
          googleRefreshToken: config.googleRefreshToken,
          googleTokenExpiry: config.googleTokenExpiry,
          googleCalendarId: config.googleCalendarId,
        }

        // Get site business name
        const site = await db.miniSite.findUnique({
          where: { id },
          select: { businessName: true },
        })

        const result = await createEventExtended(calendarConfig, {
          customerName,
          customerEmail: customerEmail?.trim() || null,
          reservationDate: resDate,
          timeSlot,
          partySize: pSize,
          notes: notes?.trim() || null,
        }, site?.businessName || undefined)

        if (result.eventId) {
          await db.reservation.update({
            where: { id: reservation.id },
            data: { googleCalendarEventId: result.eventId },
          })
        }

        // Update tokens if they were refreshed
        if (result.newExpiry || result.newRefreshToken) {
          await db.reservationConfig.update({
            where: { siteId: id },
            data: {
              ...(result.newExpiry && { googleTokenExpiry: result.newExpiry }),
              ...(result.newRefreshToken && {
                googleRefreshToken: result.newRefreshToken,
              }),
            },
          })
        }
      } catch (calendarError) {
        console.error(
          "Google Calendar event creation failed (non-blocking):",
          calendarError
        )
      }
    }

    // Re-fetch the reservation with updated fields
    const created = await db.reservation.findUnique({ where: { id: reservation.id } })

    return NextResponse.json({ reservation: created })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      { error: "Error al crear reservación" },
      { status: 500 }
    )
  }
}
