// ─── KINGNECT — Activity Logs API (Admin) ──────────────────────────────────────
// Obtiene los registros de actividad recientes para el panel de admin
// Soporta paginación y filtrado por tipo de acción

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const action = searchParams.get("action") || undefined
    const entityType = searchParams.get("entityType") || undefined
    const userId = searchParams.get("userId") || undefined

    // Validar paginación
    const validPage = Math.max(1, page)
    const validLimit = Math.min(100, Math.max(1, limit))
    const skip = (validPage - 1) * validLimit

    // Construir filtros
    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (userId) where.userId = userId

    // Obtener total de registros
    const total = await db.activityLog.count({ where })

    // Obtener logs con paginación
    const logs = await db.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: validLimit,
    })

    // Obtener tipos de acciones únicas para filtros
    const actionTypes = await db.activityLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    })

    const entityTypes = await db.activityLog.findMany({
      select: { entityType: true },
      distinct: ["entityType"],
      orderBy: { entityType: "asc" },
    })

    return NextResponse.json({
      logs,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
      filters: {
        actionTypes: actionTypes.map((a) => a.action),
        entityTypes: entityTypes.map((e) => e.entityType).filter(Boolean),
      },
    })
  } catch (error) {
    console.error("Error obteniendo logs de actividad:", error)
    return NextResponse.json(
      { error: "Error al obtener logs de actividad" },
      { status: 500 }
    )
  }
}
