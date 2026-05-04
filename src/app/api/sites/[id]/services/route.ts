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
    const svc = await db.service.create({ data: { miniSiteId: id, name: body.name || "Nuevo servicio", description: body.description, price: body.price, imageUrl: body.imageUrl, buttonLabel: body.buttonLabel, buttonUrl: body.buttonUrl, enabled: body.enabled !== undefined ? body.enabled : true, sortOrder: body.sortOrder || 0 } })
    return NextResponse.json({ service: svc })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const { serviceId, ...fields } = body
    if (!serviceId) return NextResponse.json({ error: "serviceId requerido" }, { status: 400 })
    const svc = await db.service.update({ where: { id: serviceId }, data: fields })
    return NextResponse.json({ service: svc })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    if (!serviceId) return NextResponse.json({ error: "serviceId requerido" }, { status: 400 })
    await db.service.delete({ where: { id: serviceId } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 }) }
}
