"use client"

import { useState, React } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Lock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = React.use(searchParams)
  const token = params.token

  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Token requerido", {
        description: "No se encontró el token de recuperación en la URL.",
      })
      return
    }

    if (password.length < 6) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 6 caracteres.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden", {
        description: "Asegúrate de escribir la misma contraseña en ambos campos.",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error("Error", {
          description: result.error || "No se pudo restablecer la contraseña.",
        })
        return
      }

      setIsSuccess(true)
      toast.success("¡Contraseña actualizada!", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      })

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // No token in URL — show error state
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="border-gold/10 shadow-lg shadow-gold/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Enlace inválido</CardTitle>
            <CardDescription>
              No se encontró el token de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4 py-4"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">Token no encontrado</p>
                <p className="text-sm text-muted-foreground">
                  El enlace de recuperación no es válido o está incompleto.
                  Solicita un nuevo enlace para restablecer tu contraseña.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-gold/20 hover:bg-gold/5"
                asChild
              >
                <Link href="/forgot-password">
                  Solicitar nuevo enlace
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="border-gold/10 shadow-lg shadow-gold/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Contraseña actualizada</CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4 py-4"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">¡Todo listo!</p>
                <p className="text-sm text-muted-foreground">
                  Tu contraseña ha sido actualizada. Serás redirigido al inicio de sesión.
                </p>
              </div>
              <Button
                className="bg-gold hover:bg-gold-hover text-gold-foreground font-semibold shadow-md shadow-gold/20"
                asChild
              >
                <Link href="/login">
                  Ir a iniciar sesión
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default: reset password form
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-gold/10 shadow-lg shadow-gold/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-hover text-gold-foreground font-semibold shadow-md shadow-gold/20"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Separator className="bg-gold/10" />
          <Link
            href="/login"
            className="text-sm text-gold hover:text-gold-dark font-medium transition-colors inline-flex items-center gap-1"
          >
            Volver a iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
