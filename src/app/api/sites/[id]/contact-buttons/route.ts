import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

async function verifyOwnership(siteId: string, userId: string) {
  const site = await db.miniSite.findUnique({ where: { id: siteId }, select: { clientId: true } })
  if (!site) return false
  const client = await db.client.findUnique({ where: { ownerUserId: userId }, select: { id: true } })
  if (!client) return false
  return site.clientId === client.id
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const btn = await db.contactButton.create({ data: { miniSiteId: id, type: body.type || "whatsapp", label: body.label, value: body.value || "", enabled: body.enabled !== undefined ? body.enabled : true, sortOrder: body.sortOrder || 0 } })
    return NextResponse.json({ button: btn })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al crear botón" }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const { buttonId, ...fields } = body
    if (!buttonId) return NextResponse.json({ error: "buttonId requerido" }, { status: 400 })
    const btn = await db.contactButton.update({ where: { id: buttonId }, data: fields })
    return NextResponse.json({ button: btn })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al actualizar botón" }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const buttonId = searchParams.get("buttonId")
    if (!buttonId) return NextResponse.json({ error: "buttonId requerido" }, { status: 400 })
    await db.contactButton.delete({ where: { id: buttonId } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al eliminar botón" }, { status: 500 }) }
}
