// ─── KINGNECT — Global Error Boundary ───────────────────────────────────────────
// Captura todos los errores no manejados en la aplicación
// Envía el error a Sentry (si está configurado) y muestra una UI amigable

"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Enviar el error a Sentry si está configurado
    Sentry.captureException(error, {
      extra: {
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      },
    })

    // También loguear en consola para debugging
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertTriangle className="size-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Algo salió mal
          </h1>

          {/* Description */}
          <p className="mb-2 max-w-md text-muted-foreground">
            Ha ocurrido un error inesperado en la aplicación. Nuestro equipo ha sido notificado.
          </p>

          {/* Error digest for support reference */}
          {error.digest && (
            <p className="mb-6 text-xs text-muted-foreground/60">
              Ref: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4A849] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C49A3D] focus:outline-none focus:ring-2 focus:ring-[#D4A849] focus:ring-offset-2"
            >
              <RotateCcw className="size-4" />
              Intentar de nuevo
            </button>
            <button
              onClick={() => {
                window.location.href = "/"
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Home className="size-4" />
              Ir al inicio
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
