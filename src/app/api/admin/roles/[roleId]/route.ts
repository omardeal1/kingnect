import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { roleId } = await params

    const role = await db.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { employees: true } },
      },
    })

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Admin role GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { roleId } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    const existing = await db.role.findUnique({ where: { id: roleId } })
    if (!existing) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    if (name && name !== existing.name) {
      const nameExists = await db.role.findUnique({ where: { name } })
      if (nameExists) {
        return NextResponse.json({ error: "El nombre del rol ya existe" }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const role = await db.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { employees: true } },
      },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Rol actualizado: ${role.name}`,
        entityType: "role",
        entityId: roleId,
      },
    })

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Admin role PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { roleId } = await params

    const role = await db.role.findUnique({
      where: { id: roleId },
      include: { _count: { select: { employees: true } } },
    })

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: "No se puede eliminar un rol del sistema" },
        { status: 400 }
      )
    }

    if (role._count.employees > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: tiene ${role._count.employees} empleados asignados` },
        { status: 400 }
      )
    }

    await db.role.delete({ where: { id: roleId } })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Rol eliminado: ${role.name}`,
        entityType: "role",
        entityId: roleId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin role DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
