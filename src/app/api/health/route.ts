// ─── KINGNECT — Health Check API ────────────────────────────────────────────────
// Endpoint público de salud para monitoreo de uptime (sin autenticación)
// Verifica: base de datos, Stripe, email (Resend), storage (Supabase)

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isSupabaseStorageConfigured } from "@/lib/storage"
import { isEmailConfigured } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET() {
  const startTime = Date.now()

  // ── Version from package.json ───────────────────────────────────────────
  const version = process.env.npm_package_version || "0.2.0"

  // ── Check database connectivity ─────────────────────────────────────────
  let dbStatus: "ok" | "error" = "ok"
  try {
    await db.$queryRaw`SELECT 1`
  } catch {
    dbStatus = "error"
  }

  // ── Check Stripe configuration ──────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ""
  const stripeConfigured =
    stripeKey.length > 0 &&
    !stripeKey.includes("placeholder")

  // ── Check email (Resend) configuration ──────────────────────────────────
  const emailConfigured = isEmailConfigured()

  // ── Check Supabase storage configuration ────────────────────────────────
  const storageConfigured = isSupabaseStorageConfigured()

  // ── Build response ──────────────────────────────────────────────────────
  const response = {
    status: dbStatus === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version,
    responseTime: `${Date.now() - startTime}ms`,
    services: {
      db: dbStatus,
      stripe: stripeConfigured ? ("configured" as const) : ("not_configured" as const),
      email: emailConfigured ? ("configured" as const) : ("not_configured" as const),
      storage: storageConfigured ? ("configured" as const) : ("not_configured" as const),
    },
  }

  // Return 503 if database is down (critical), otherwise 200
  const statusCode = dbStatus === "error" ? 503 : 200

  return NextResponse.json(response, { status: statusCode })
}
