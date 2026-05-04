// ─── KINGNECT — Sentry Server Configuration ─────────────────────────────────────
// Inicialización de Sentry para el servidor (solo si DSN está configurado)
// ⚠️ Este archivo es SOLO para servidor — NO usar en el cliente

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

let sentryInitialized = false

/**
 * Inicializa Sentry en el servidor si el DSN está configurado
 */
export function initSentryServer(): void {
  if (!SENTRY_DSN || SENTRY_DSN.trim() === "") {
    return
  }

  if (sentryInitialized) {
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Tasa de muestreo de trazas (10% en producción para controlar costos)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Tasa de muestreo de replays (10% en producción)
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capturar replays solo en errores
    replaysOnErrorSampleRate: 1.0,

    // Entorno (dev, staging, production)
    environment: process.env.NODE_ENV || "development",

    // Release version
    release: process.env.npm_package_version || "0.2.0",

    // Ignorar errores comunes que no son útiles
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Network request failed",
      "CancelledError",
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],

    // No rastrear URLs de health check o assets estáticos
    beforeSendTransaction(event) {
      if (event.transaction?.includes("/api/health")) {
        return null
      }
      return event
    },
  })

  sentryInitialized = true
}

// Auto-inicializar cuando se importa este módulo
initSentryServer()

/**
 * Captura una excepción y la envía a Sentry
 * Si Sentry no está configurado, la loguea con el logger estructurado
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (sentryInitialized) {
    Sentry.captureException(error, {
      extra: context,
    })
  }

  // Siempre loguear localmente también
  if (error instanceof Error) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require("./logger")
    logger.error(error.message, context, error)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require("./logger")
    logger.error(String(error), context)
  }
}

/**
 * Captura un mensaje y lo envía a Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, unknown>): void {
  if (sentryInitialized) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    })
  }
}

/**
 * Verifica si Sentry está inicializado
 */
export function isSentryConfigured(): boolean {
  return sentryInitialized
}
