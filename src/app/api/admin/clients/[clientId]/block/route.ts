// ─── QAIROSS — Bloquear Cliente (Admin) ───────────────────────────────────────
// Permite al super_admin bloquear manualmente un cliente

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
    const body = await request.json()
    const { reason } = body as { reason?: string }

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

    // No bloquear si ya está bloqueado
    if (client.accountStatus === "blocked") {
      return NextResponse.json(
        { error: "El cliente ya está bloqueado" },
        { status: 400 }
      )
    }

    // Actualizar estado del cliente
    await db.client.update({
      where: { id: clientId },
      data: {
        accountStatus: "blocked",
        notes: reason ? `${client.notes ?? ""}\n[Bloqueado] ${reason}`.trim() : client.notes,
      },
    })

    // Actualizar suscripción
    const subscription = await db.subscription.findUnique({
      where: { clientId },
    })

    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          blockedAt: new Date(),
        },
      })
    }

    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "client_blocked",
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Cliente bloqueado exitosamente",
    })
  } catch (error) {
    console.error("Error bloqueando cliente:", error)
    return NextResponse.json(
      { error: "Error al bloquear cliente" },
      { status: 500 }
    )
  }
}
