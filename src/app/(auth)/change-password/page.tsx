"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
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
import { signOut } from "next-auth/react"

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>}>
      <ChangePasswordContent />
    </Suspense>
  )
}

function ChangePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordRules = [
    { label: "Mínimo 8 caracteres", met: newPassword.length >= 8 },
    { label: "Al menos una letra mayúscula", met: /[A-Z]/.test(newPassword) },
    { label: "Al menos una letra minúscula", met: /[a-z]/.test(newPassword) },
    { label: "Al menos un número", met: /[0-9]/.test(newPassword) },
  ]

  const allRulesMet = passwordRules.every((r) => r.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword.trim()) {
      toast.error("Campo requerido", { description: "Ingresa tu contraseña actual" })
      return
    }
    if (!newPassword.trim()) {
      toast.error("Campo requerido", { description: "Ingresa tu nueva contraseña" })
      return
    }
    if (!allRulesMet) {
      toast.error("Contraseña débil", { description: "La nueva contraseña no cumple con los requisitos" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden", { description: "Confirma tu nueva contraseña correctamente" })
      return
    }
    if (currentPassword === newPassword) {
      toast.error("Contraseña igual", { description: "La nueva contraseña debe ser diferente a la actual" })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error("Error al cambiar contraseña", {
          description: data.error || "No se pudo actualizar la contraseña",
        })
        return
      }

      toast.success("Contraseña actualizada", {
        description: "Tu contraseña ha sido cambiada exitosamente",
      })

      // Sign in again with new password to refresh session
      const session = await fetch("/api/auth/session").then((r) => r.json())
      const email = session?.user?.email
      if (email) {
        const result = await signIn("credentials", {
          email,
          password: newPassword,
          redirect: false,
        })
        if (result?.ok) {
          router.push(callbackUrl)
          router.refresh()
          return
        }
      }

      // Fallback: redirect to login
      router.push("/login")
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo procesar la solicitud",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    // Allow skipping but show warning
    toast.info("Se requiere cambiar la contraseña", {
      description: "Por seguridad, debes cambiar tu contraseña antes de continuar",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-gold/10 shadow-lg shadow-gold/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
            <Lock className="size-7 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Cambiar contraseña</CardTitle>
          <CardDescription>
            Por seguridad, debes cambiar tu contraseña antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle2
                        className={`size-3.5 ${
                          rule.met
                            ? "text-green-500"
                            : "text-muted-foreground/40"
                        }`}
                      />
                      <span
                        className={
                          rule.met
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-9 pr-9 ${
                    confirmPassword.length > 0 && newPassword !== confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : confirmPassword.length > 0 && newPassword === confirmPassword
                        ? "border-green-500 focus-visible:ring-green-500"
                        : ""
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Las contraseñas coinciden
                </p>
              )}
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
                  Actualizando...
                </>
              ) : (
                "Guardar nueva contraseña"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
