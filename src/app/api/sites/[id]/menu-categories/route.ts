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
    const cat = await db.menuCategory.create({ data: { miniSiteId: id, name: body.name || "Nueva categoría", enabled: body.enabled !== undefined ? body.enabled : true, sortOrder: body.sortOrder || 0 } })
    return NextResponse.json({ category: cat })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 }) }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const body = await request.json()
    const { categoryId, ...fields } = body
    if (!categoryId) return NextResponse.json({ error: "categoryId requerido" }, { status: 400 })
    const cat = await db.menuCategory.update({ where: { id: categoryId }, data: fields })
    return NextResponse.json({ category: cat })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    const { id } = await params
    if (!(await verifyOwnership(id, session.user.id))) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    if (!categoryId) return NextResponse.json({ error: "categoryId requerido" }, { status: 400 })
    await db.menuCategory.delete({ where: { id: categoryId } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 }) }
}
