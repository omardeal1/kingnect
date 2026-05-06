// ─── QAIROSS — Stripe Webhook Handler ─────────────────────────────────────────
// Recibe y procesa todos los eventos de webhook de Stripe
// IMPORTANTE: Usa req.text() para obtener el raw body (necesario para verificar firma)

import { NextResponse } from "next/server"
import { verifyWebhookSignature, handleWebhookEvent, isStripeConfigured } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Verificar que Stripe esté configurado
    if (!isStripeConfigured()) {
      console.warn("⚠️ Webhook recibido pero Stripe no está configurado")
      return NextResponse.json(
        { error: "Stripe no configurado" },
        { status: 503 }
      )
    }

    // Obtener el raw body para verificar la firma
    const payload = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("Webhook sin firma stripe-signature")
      return NextResponse.json(
        { error: "Firma de webhook no encontrada" },
        { status: 400 }
      )
    }

    // Verificar la firma del webhook
    const event = verifyWebhookSignature(payload, signature)

    if (!event) {
      console.error("Firma de webhook inválida")
      return NextResponse.json(
        { error: "Firma de webhook inválida" },
        { status: 400 }
      )
    }

    // Procesar el evento
    await handleWebhookEvent(event)

    // Siempre retornar 200 para que Stripe no reenvíe el evento
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error procesando webhook de Stripe:", error)

    // Retornar 200 para evitar reintentos de Stripe por errores internos
    // Los errores de procesamiento se manejan internamente
    return NextResponse.json(
      { received: true, error: "Error interno procesando webhook" },
      { status: 200 }
    )
  }
}

// Deshabilitar el parseo automático del body por Next.js
// Esto es necesario para poder leer el raw body y verificar la firma
export const dynamic = "force-dynamic"
