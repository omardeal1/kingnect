// ─── KINGNECT — Sentry Client Configuration ─────────────────────────────────────
// Inicialización de Sentry para el navegador (cliente)
// Solo se inicializa si NEXT_PUBLIC_SENTRY_DSN está configurado

"use client"

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

let clientInitialized = false

/**
 * Inicializa Sentry en el navegador si el DSN está configurado
 */
function initSentryClient(): void {
  if (!SENTRY_DSN || SENTRY_DSN.trim() === "") {
    return
  }

  if (clientInitialized) {
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,

    // Tasa de muestreo de replays: solo capturar en errores (no sesiones completas)
    replaysSessionSampleRate: 0,

    // Siempre capturar replay cuando hay un error
    replaysOnErrorSampleRate: 1.0,

    // Entorno
    environment: process.env.NODE_ENV || "development",

    // Release version
    release: process.env.npm_package_version || "0.2.0",

    // Tasa de trazas en cliente (baja para controlar volumen)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Ignorar errores comunes del navegador que no son útiles
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      "CancelledError",
      "AbortError",
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
      // Extensiones del navegador
      "Non-Error promise rejection captured",
      "window.addEventListener",
    ],

    // Ignorar errores de extensiones del navegador
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  })

  clientInitialized = true
}

// Auto-inicializar cuando se importa este módulo
initSentryClient()
