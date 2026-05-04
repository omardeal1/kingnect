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
    const slide = await db.slide.create({ data: { miniSiteId: id, imageUrl: body.imageUrl, title: body.title, subtitle: body.subtitle, buttonLabel: body.buttonLabel, buttonUrl: body.buttonUrl, enabled: body.enabled !== undefined ? body.enabled : true, sortOrder: body.sortOrder || 0 } })
    return NextResponse.json({ slide })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al crear slide" }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const { slideId, ...fields } = body
    if (!slideId) return NextResponse.json({ error: "slideId requerido" }, { status: 400 })
    const slide = await db.slide.update({ where: { id: slideId }, data: fields })
    return NextResponse.json({ slide })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al actualizar slide" }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const slideId = searchParams.get("slideId")
    if (!slideId) return NextResponse.json({ error: "slideId requerido" }, { status: 400 })
    await db.slide.delete({ where: { id: slideId } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al eliminar slide" }, { status: 500 }) }
}
