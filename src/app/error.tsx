"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-muted-foreground max-w-md">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <Button onClick={reset} className="bg-[#D4A849] hover:bg-[#C49A3D] text-white">
        Intentar de nuevo
      </Button>
    </div>
  )
}
