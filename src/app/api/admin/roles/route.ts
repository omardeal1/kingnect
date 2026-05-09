import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const roles = await db.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: { employees: true, permissions: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Also get all available permissions
    const allPermissions = await db.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    })

    return NextResponse.json({ roles, allPermissions })
  } catch (error) {
    console.error("Admin roles GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isSystem, permissions } = body

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Check name uniqueness
    const existing = await db.role.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: "El nombre del rol ya existe" }, { status: 400 })
    }

    const role = await db.role.create({
      data: {
        name,
        description: description || null,
        isSystem: isSystem ?? false,
        permissions: permissions
          ? {
              create: permissions.map((pId: string) => ({
                permissionId: pId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { employees: true } },
      },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Rol creado: ${name}`,
        entityType: "role",
        entityId: role.id,
      },
    })

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error("Admin roles POST error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { roleId, name, description, isActive, permissions } = body

    if (!roleId) {
      return NextResponse.json({ error: "roleId es requerido" }, { status: 400 })
    }

    const existing = await db.role.findUnique({ where: { id: roleId } })
    if (!existing) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    // Check name uniqueness if changing
    if (name && name !== existing.name) {
      const nameExists = await db.role.findUnique({ where: { name } })
      if (nameExists) {
        return NextResponse.json({ error: "El nombre del rol ya existe" }, { status: 400 })
      }
    }

    // Update basic fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const role = await db.role.update({
      where: { id: roleId },
      data: updateData,
    })

    // Update permissions if provided
    if (permissions !== undefined) {
      // Delete existing permissions
      await db.rolePermission.deleteMany({ where: { roleId } })

      // Create new permissions
      if (permissions.length > 0) {
        await db.rolePermission.createMany({
          data: permissions.map((pId: string) => ({
            roleId,
            permissionId: pId,
          })),
        })
      }
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Rol actualizado: ${existing.name}`,
        entityType: "role",
        entityId: roleId,
      },
    })

    return NextResponse.json({ role })
  } catch (error) {
    console.error("Admin roles PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get("roleId")

    if (!roleId) {
      return NextResponse.json({ error: "roleId es requerido" }, { status: 400 })
    }

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
    console.error("Admin roles DELETE error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
