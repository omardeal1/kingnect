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
    const t = await db.testimonial.create({ data: { miniSiteId: id, name: body.name || "Cliente", photoUrl: body.photoUrl, rating: body.rating || 5, content: body.content || "", enabled: body.enabled !== undefined ? body.enabled : true, sortOrder: body.sortOrder || 0 } })
    return NextResponse.json({ testimonial: t })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al crear testimonio" }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const { testimonialId, ...fields } = body
    if (!testimonialId) return NextResponse.json({ error: "testimonialId requerido" }, { status: 400 })
    const t = await db.testimonial.update({ where: { id: testimonialId }, data: fields })
    return NextResponse.json({ testimonial: t })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al actualizar testimonio" }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const testimonialId = searchParams.get("testimonialId")
    if (!testimonialId) return NextResponse.json({ error: "testimonialId requerido" }, { status: 400 })
    await db.testimonial.delete({ where: { id: testimonialId } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al eliminar testimonio" }, { status: 500 }) }
}
