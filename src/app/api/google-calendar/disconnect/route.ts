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

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId es requerido" },
        { status: 400 }
      )
    }

    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Clear Google Calendar connection
    const config = await db.reservationConfig.update({
      where: { siteId },
      data: {
        googleCalendarConnected: false,
        googleCalendarId: null,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error)
    return NextResponse.json(
      { error: "Error al desconectar Google Calendar" },
      { status: 500 }
    )
  }
}
