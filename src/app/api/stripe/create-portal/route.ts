// ─── QAIROSS — Stripe Customer Portal ─────────────────────────────────────────
// Crea una sesión del portal de cliente de Stripe para gestionar suscripción

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createPortalSession, isStripeConfigured } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que Stripe esté configurado
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Stripe no está configurado. Contacte al administrador.",
          code: "STRIPE_NOT_CONFIGURED",
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId es requerido" },
        { status: 400 }
      )
    }

    // Verificar que el cliente pertenece al usuario
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: { subscription: true },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    if (client.ownerUserId !== session.user.id && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que existe un stripeCustomerId
    if (!client.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No hay una suscripción de Stripe asociada a este cliente" },
        { status: 400 }
      )
    }

    // Crear sesión del portal
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const returnUrl = `${appUrl}/dashboard/billing`

    const portalSession = await createPortalSession({
      customerId: client.subscription.stripeCustomerId,
      returnUrl,
    })

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error("Error creando sesión del portal:", error)
    const message = error instanceof Error ? error.message : "Error al crear sesión del portal"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
