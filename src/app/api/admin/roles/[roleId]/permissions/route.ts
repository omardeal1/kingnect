import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const { permissions } = body as {
      permissions: Array<{ module: string; action: string }>
    }

    const role = await db.role.findUnique({ where: { id: roleId } })
    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 })
    }

    // Build permission IDs — upsert permissions if they don't exist yet
    const permissionIds: string[] = []

    for (const p of permissions) {
      const existing = await db.permission.findUnique({
        where: { module_action: { module: p.module, action: p.action } },
      })
      if (existing) {
        permissionIds.push(existing.id)
      } else {
        const created = await db.permission.create({
          data: { module: p.module, action: p.action },
        })
        permissionIds.push(created.id)
      }
    }

    // Replace all role permissions in a transaction
    await db.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } })
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pId) => ({ roleId, permissionId: pId })),
        })
      }
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Permisos actualizados para rol: ${role.name} (${permissionIds.length} permisos)`,
        entityType: "role",
        entityId: roleId,
      },
    })

    return NextResponse.json({ success: true, count: permissionIds.length })
  } catch (error) {
    console.error("Admin role permissions PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
