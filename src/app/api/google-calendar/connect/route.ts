import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getGoogleAuthUrl } from "@/lib/google-calendar"
import { cookies } from "next/headers"

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

export async function GET(request: Request) {
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

    // Check that Google OAuth is configured
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET
    ) {
      return NextResponse.json(
        { error: "Google Calendar no está configurado. Contacta al administrador." },
        { status: 400 }
      )
    }

    // Generate a random state for CSRF protection, include siteId
    const state = `${siteId}:${crypto.randomUUID()}`

    // Store state in a cookie for CSRF verification in callback
    const cookieStore = await cookies()
    cookieStore.set("google_cal_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    const authUrl = getGoogleAuthUrl(siteId)

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Error generating Google Calendar auth URL:", error)
    return NextResponse.json(
      { error: "Error al generar URL de conexión" },
      { status: 500 }
    )
  }
}
