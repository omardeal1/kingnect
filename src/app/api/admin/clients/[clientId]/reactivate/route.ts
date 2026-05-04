// ─── KINGNECT — Reactivar Cliente (Admin) ──────────────────────────────────────
// Permite al super_admin reactivar un cliente bloqueado/cancelado

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { clientId } = await params

    // Verificar que el cliente existe
    const client = await db.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que necesita reactivación
    if (client.accountStatus === "active") {
      return NextResponse.json(
        { error: "El cliente ya está activo" },
        { status: 400 }
      )
    }

    // Actualizar estado del cliente
    await db.client.update({
      where: { id: clientId },
      data: {
        accountStatus: "active",
      },
    })

    // Actualizar suscripción - limpiar blockedAt y reactivar
    const subscription = await db.subscription.findUnique({
      where: { clientId },
    })

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          blockedAt: null,
          // Solo reactivar si estaba inactiva por el bloqueo
          ...(subscription.status === "inactive" || subscription.status === "past_due"
            ? { status: "active" }
            : {}),
        },
      })
    }

    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "client_reactivated",
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Cliente reactivado exitosamente",
    })
  } catch (error) {
    console.error("Error reactivando cliente:", error)
    return NextResponse.json(
      { error: "Error al reactivar cliente" },
      { status: 500 }
    )
  }
}
