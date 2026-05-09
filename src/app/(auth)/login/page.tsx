"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock } from "lucide-react"
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
import { useTranslations } from "@/i18n/provider"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslations("auth.login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error(t("errors.required"), { description: t("errors.emailRequired") })
      return
    }
    if (!password.trim()) {
      toast.error(t("errors.required"), { description: t("errors.passwordRequired") })
      return
    }
    if (password.length < 6) {
      toast.error(t("errors.invalidPassword"), { description: t("errors.passwordTooShort") })
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(t("errors.loginFailed"), {
          description: t("errors.invalidCredentials"),
        })
        return
      }

      if (result?.ok) {
        toast.success(t("success.welcome"), {
          description: t("success.loggedIn"),
        })

        // Fetch session to get role and mustChangePassword for redirect
        try {
          const res = await fetch("/api/auth/session")
          const session = await res.json()
          const role = session?.user?.role
          const mustChangePassword = session?.user?.mustChangePassword

          if (mustChangePassword) {
            router.push("/change-password")
          } else if (role === "super_admin") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
          router.refresh()
        } catch {
          // Fallback redirect
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch {
      toast.error(t("errors.connectionError"), {
        description: t("errors.connectionErrorDesc"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-gold/10 shadow-lg shadow-gold/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("loginButton")}</CardTitle>
          <CardDescription>
            {t("title")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gold hover:text-gold-dark transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="current-password"
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
                  {t("loggingIn")}
                </>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Separator className="bg-gold/10" />
          <p className="text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="text-gold hover:text-gold-dark font-medium transition-colors"
            >
              {t("createAccount")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
