// ─── QAIROSS — Stripe Checkout Session ─────────────────────────────────────────
// Crea una sesión de checkout de Stripe para suscribirse a un plan

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe"

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
    const { planId, clientId } = body

    if (!planId || !clientId) {
      return NextResponse.json(
        { error: "planId y clientId son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el cliente pertenece al usuario
    const client = await db.client.findUnique({
      where: { id: clientId },
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

    // Verificar que el plan existe
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      )
    }

    // No permitir checkout para plan trial (es automático)
    if (plan.slug === "trial") {
      return NextResponse.json(
        { error: "El plan Trial no requiere pago" },
        { status: 400 }
      )
    }

    // URLs de redirección
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const successUrl = `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&status=success`
    const cancelUrl = `${appUrl}/dashboard/billing?status=cancelled`

    // Crear sesión de checkout
    const checkoutSession = await createCheckoutSession({
      clientId,
      planId,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error("Error creando sesión de checkout:", error)
    const message = error instanceof Error ? error.message : "Error al crear sesión de checkout"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
