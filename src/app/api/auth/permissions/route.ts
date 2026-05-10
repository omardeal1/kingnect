import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getServerUserWithPermissions } from "@/lib/permissions"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userPerms = await getServerUserWithPermissions({
    user: { id: session.user.id, role: session.user.role, email: session.user.email ?? undefined },
  })

  if (!userPerms) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json(userPerms)
}
