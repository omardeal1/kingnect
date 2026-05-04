import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user
}

export async function verifySiteOwnership(userId: string, siteId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, client: { select: { id: true } } },
  })
  if (!user) return false

  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: { clientId: true },
  })
  if (!site) return false

  if (user.role === "super_admin") return true

  const client = await db.client.findFirst({
    where: { ownerUserId: userId, id: site.clientId },
  })
  return !!client
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status })
}
