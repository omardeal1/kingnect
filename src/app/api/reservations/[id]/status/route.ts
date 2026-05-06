import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteEvent, type CalendarConfig } from "@/lib/google-calendar"

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

    const body = await request.json()
    const { status } = body

    const validStatuses = ["approved", "cancelled", "completed", "no_show"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido. Valores permitidos: approved, cancelled, completed, no_show" },
        { status: 400 }
      )
    }

    // Get the reservation
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        config: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservación no encontrada" },
        { status: 404 }
      )
    }

    // Verify ownership: either site owner or super_admin
    const isOwner = await verifyOwnership(reservation.siteId, session.user.id)
    if (!isOwner && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Update the status
    const updated = await db.reservation.update({
      where: { id },
      data: { status },
    })

    // If cancelling an approved reservation with Google Calendar event, attempt deletion
    if (
      status === "cancelled" &&
      reservation.status === "approved" &&
      reservation.googleCalendarEventId &&
      reservation.config?.googleCalendarConnected
    ) {
      try {
        const calendarConfig: CalendarConfig = {
          googleAccessToken: reservation.config.googleAccessToken || "",
          googleRefreshToken: reservation.config.googleRefreshToken,
          googleTokenExpiry: reservation.config.googleTokenExpiry,
          googleCalendarId: reservation.config.googleCalendarId,
        }

        await deleteEvent(calendarConfig, reservation.googleCalendarEventId)
      } catch (calendarError) {
        console.error(
          "Google Calendar event deletion failed (non-blocking):",
          calendarError
        )
      }
    }

    return NextResponse.json({ reservation: updated })
  } catch (error) {
    console.error("Error updating reservation status:", error)
    return NextResponse.json(
      { error: "Error al actualizar estado de reservación" },
      { status: 500 }
    )
  }
}
