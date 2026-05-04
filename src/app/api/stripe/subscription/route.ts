// ─── KINGNECT — Estado de Suscripción ──────────────────────────────────────────
// Obtiene el estado actual de la suscripción del cliente autenticado

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscar el cliente del usuario
    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Si no tiene suscripción, devolver estado vacío
    if (!client.subscription) {
      return NextResponse.json({
        subscription: null,
        client: {
          id: client.id,
          businessName: client.businessName,
          accountStatus: client.accountStatus,
        },
      })
    }

    // Verificar si el trial ha expirado
    const now = new Date()
    const trialExpired =
      client.subscription.status === "trial" &&
      client.subscription.trialEnd &&
      new Date(client.subscription.trialEnd) < now

    if (trialExpired && client.accountStatus === "active") {
      // Actualizar estado a trial_expired
      await db.client.update({
        where: { id: client.id },
        data: { accountStatus: "trial_expired" },
      })
      await db.subscription.update({
        where: { id: client.subscription.id },
        data: { status: "inactive" },
      })

      client.accountStatus = "trial_expired"
      client.subscription.status = "inactive"
    }

    // Obtener todos los planes disponibles para comparar
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({
      subscription: {
        id: client.subscription.id,
        status: client.subscription.status,
        planId: client.subscription.planId,
        plan: client.subscription.plan,
        stripeCustomerId: client.subscription.stripeCustomerId,
        trialStart: client.subscription.trialStart,
        trialEnd: client.subscription.trialEnd,
        currentPeriodStart: client.subscription.currentPeriodStart,
        currentPeriodEnd: client.subscription.currentPeriodEnd,
        blockedAt: client.subscription.blockedAt,
      },
      client: {
        id: client.id,
        businessName: client.businessName,
        accountStatus: client.accountStatus,
      },
      plans,
    })
  } catch (error) {
    console.error("Error obteniendo estado de suscripción:", error)
    return NextResponse.json(
      { error: "Error al obtener estado de suscripción" },
      { status: 500 }
    )
  }
}
