// ─── QAIROSS — Stripe Helper ───────────────────────────────────────────────────
// Integración con Stripe para pagos, suscripciones y webhooks
// Manejo elegante cuando Stripe no está configurado

import Stripe from "stripe"
import { db } from "@/lib/db"

// ─── Inicialización de Stripe ──────────────────────────────────────────────────

let stripeInstance: Stripe | null = null

function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey.includes("placeholder")) {
    console.warn("⚠️ Stripe no configurado: STRIPE_SECRET_KEY no encontrada o es placeholder")
    return null
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  })

  return stripeInstance
}

export function isStripeConfigured(): boolean {
  return getStripe() !== null
}

// ─── Crear sesión de checkout ──────────────────────────────────────────────────

interface CreateCheckoutParams {
  clientId: string
  planId: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession({
  clientId,
  planId,
  successUrl,
  cancelUrl,
}: CreateCheckoutParams) {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe no está configurado. Configure STRIPE_SECRET_KEY.")
  }

  // Obtener el cliente y plan
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      subscription: { include: { plan: true } },
      owner: { select: { email: true, name: true } },
    },
  })

  if (!client) {
    throw new Error("Cliente no encontrado")
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) {
    throw new Error("Plan no encontrado")
  }

  // Crear o obtener cliente en Stripe
  const customerId = await getOrCreateCustomer(clientId, client.owner.email ?? "")

  // Obtener o crear precio en Stripe
  const priceId = await getOrCreatePrice(plan)

  // Crear sesión de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      clientId,
      planId,
    },
    subscription_data: {
      metadata: {
        clientId,
        planId,
      },
    },
    allow_promotion_codes: true,
    locale: "es",
  })

  return session
}

// ─── Crear sesión del portal de cliente ────────────────────────────────────────

interface CreatePortalParams {
  customerId: string
  returnUrl: string
}

export async function createPortalSession({ customerId, returnUrl }: CreatePortalParams) {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe no está configurado. Configure STRIPE_SECRET_KEY.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    locale: "es",
  })

  return session
}

// ─── Obtener o crear cliente en Stripe ─────────────────────────────────────────

export async function getOrCreateCustomer(clientId: string, email: string): Promise<string> {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe no está configurado")
  }

  // Verificar si ya existe un stripeCustomerId en la suscripción
  const subscription = await db.subscription.findUnique({
    where: { clientId },
  })

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId
  }

  // Obtener datos del cliente
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { owner: { select: { email: true, name: true } } },
  })

  // Crear cliente en Stripe
  const customer = await stripe.customers.create({
    email: email || client?.owner.email || undefined,
    name: client?.businessName || client?.owner.name || undefined,
    metadata: {
      clientId,
    },
  })

  // Guardar stripeCustomerId en la suscripción
  if (subscription) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { stripeCustomerId: customer.id },
    })
  } else {
    // Crear suscripción si no existe
    const plan = await db.plan.findFirst({ where: { slug: "trial" } })
    await db.subscription.create({
      data: {
        clientId,
        planId: plan?.id ?? "",
        stripeCustomerId: customer.id,
        status: "trial",
      },
    })
  }

  return customer.id
}

// ─── Obtener o crear precio en Stripe ──────────────────────────────────────────

async function getOrCreatePrice(plan: { id: string; slug: string; price: number | { toNumber(): number }; currency: string; billingInterval: string }): Promise<string> {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error("Stripe no está configurado")
  }

  // Buscar precio existente por metadata
  const existingPrices = await stripe.prices.list({
    active: true,
    product: plan.id,
    limit: 1,
  })

  if (existingPrices.data.length > 0) {
    return existingPrices.data[0].id
  }

  // Crear producto
  const product = await stripe.products.create({
    name: `QAIROSS ${plan.slug.charAt(0).toUpperCase() + plan.slug.slice(1)}`,
    metadata: { planId: plan.id },
  })

  // Crear precio
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(Number(plan.price) * 100), // Convertir a centavos
    currency: plan.currency.toLowerCase(),
    recurring: {
      interval: plan.billingInterval === "year" ? "year" : "month",
    },
    metadata: { planId: plan.id },
  })

  return price.id
}

// ─── Manejar eventos de webhook ────────────────────────────────────────────────

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      await handlePaymentFailed(invoice)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaid(invoice)
      break
    }

    default:
      console.log(`Evento de Stripe no manejado: ${event.type}`)
  }
}

// ─── Handlers de eventos ───────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clientId = session.metadata?.clientId
  const planId = session.metadata?.planId

  if (!clientId || !planId) {
    console.error("checkout.session.completed: metadata sin clientId o planId")
    return
  }

  // Obtener el subscription ID de Stripe
  const stripeSubscriptionId = session.subscription as string | null
  const stripeCustomerId = session.customer as string | null

  // Actualizar suscripción en la BD
  await db.subscription.upsert({
    where: { clientId },
    update: {
      planId,
      stripeSubscriptionId,
      stripeCustomerId,
      stripePriceId: session.line_items?.data[0]?.price?.id ?? null,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      clientId,
      planId,
      stripeSubscriptionId,
      stripeCustomerId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Reactivar cuenta del cliente
  await db.client.update({
    where: { id: clientId },
    data: { accountStatus: "active" },
  })

  // Log de actividad
  await logStripeActivity(
    clientId,
    "subscription_activated",
    "subscription",
    stripeSubscriptionId ?? undefined,
    `Suscripción activada vía checkout`
  )
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string

  // Buscar la suscripción por stripeCustomerId
  const subscription = await db.subscription.findFirst({
    where: { stripeCustomerId },
  })

  if (!subscription) {
    console.error("invoice.payment_failed: suscripción no encontrada para cliente", stripeCustomerId)
    return
  }

  // Marcar suscripción como payment_failed
  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: "past_due" },
  })

  // Marcar cuenta del cliente como payment_failed
  await db.client.update({
    where: { id: subscription.clientId },
    data: { accountStatus: "payment_failed" },
  })

  await logStripeActivity(
    subscription.clientId,
    "payment_failed",
    "subscription",
    subscription.id,
    `Pago fallido en factura ${invoice.id}`
  )
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId },
  })

  if (!sub) {
    console.error("customer.subscription.deleted: suscripción no encontrada")
    return
  }

  // Marcar suscripción como cancelada
  await db.subscription.update({
    where: { id: sub.id },
    data: {
      status: "cancelled",
      currentPeriodEnd: new Date(),
    },
  })

  // Bloquear cuenta del cliente
  await db.client.update({
    where: { id: sub.clientId },
    data: { accountStatus: "cancelled" },
  })

  await logStripeActivity(
    sub.clientId,
    "subscription_cancelled",
    "subscription",
    sub.id,
    `Suscripción eliminada en Stripe`
  )
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId },
  })

  if (!sub) {
    console.error("customer.subscription.updated: suscripción no encontrada")
    return
  }

  // Obtener el plan del priceId
  const stripePriceId = subscription.items.data[0]?.price?.id ?? null

  // Buscar el plan por stripePriceId o mantener el actual
  const plan = stripePriceId
    ? await db.plan.findFirst({
        where: { id: sub.planId }, // Mantener el plan actual, se actualizará si hay cambio
      })
    : null

  // Mapear estado de Stripe a nuestro estado
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "inactive",
    trialing: "trial",
    paused: "inactive",
    incomplete: "inactive",
    incomplete_expired: "inactive",
  }

  const newStatus = statusMap[subscription.status] ?? "inactive"

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      status: newStatus,
      stripePriceId,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: (subscription as any).current_period_start
        ? new Date((subscription as any).current_period_start * 1000)
        : undefined,
      currentPeriodEnd: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : undefined,
      ...(plan ? { planId: plan.id } : {}),
    },
  })

  await logStripeActivity(
    sub.clientId,
    "subscription_updated",
    "subscription",
    sub.id,
    `Suscripción actualizada: estado=${subscription.status}`
  )
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId },
  })

  if (!sub) {
    console.error("invoice.paid: suscripción no encontrada")
    return
  }

  // Reactivar si estaba bloqueada por pago fallido
  const client = await db.client.findUnique({
    where: { id: sub.clientId },
  })

  if (client && client.accountStatus === "payment_failed") {
    await db.client.update({
      where: { id: sub.clientId },
      data: { accountStatus: "active" },
    })

    await logStripeActivity(
      sub.clientId,
      "client_reactivated",
      "client",
      sub.clientId,
      `Cliente reactivado tras pago exitoso de factura`
    )
  }

  // Actualizar estado de suscripción
  await db.subscription.update({
    where: { id: sub.id },
    data: { status: "active" },
  })

  await logStripeActivity(
    sub.clientId,
    "invoice_paid",
    "subscription",
    sub.id,
    `Factura pagada: ${invoice.id}`
  )
}

// ─── Utilidad para log de actividad ────────────────────────────────────────────

async function logStripeActivity(
  clientId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  try {
    // Buscar el userId del owner del cliente
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { ownerUserId: true },
    })

    if (!client) return

    await db.activityLog.create({
      data: {
        userId: client.ownerUserId,
        action,
        entityType,
        entityId: entityId ?? null,
        // Store details in a separate log or metadata field if needed
      },
    })

    if (details) {
      console.log(`[Stripe Activity] ${action}: ${details}`)
    }
  } catch (error) {
    console.error("Error registrando actividad de Stripe:", error)
  }
}

// ─── Verificar webhook signature ───────────────────────────────────────────────

export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event | null {
  const stripe = getStripe()
  if (!stripe) return null

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || webhookSecret.includes("placeholder")) {
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET no configurado")
    return null
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return event
  } catch (err) {
    console.error("Error verificando firma de webhook:", err)
    return null
  }
}
