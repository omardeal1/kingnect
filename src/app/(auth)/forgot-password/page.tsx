"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const { t } = useTranslations("auth.forgotPassword")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error(t("errors.required"), { description: t("errors.emailRequired") })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const result = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast.success(t("toastSuccess.title"), {
          description: result.message || t("toastSuccess.desc"),
        })
      } else {
        toast.error(t("errors.requestFailed"), {
          description: result.error || t("errors.requestFailedDesc"),
        })
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
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
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
                <p className="font-medium text-foreground">{t("successTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("successDesc", { email })}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-gold/20 hover:bg-gold/5"
                asChild
              >
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("backToLogin")}
                </Link>
              </Button>
            </motion.div>
          ) : (
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
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-gold-foreground font-semibold shadow-md shadow-gold/20"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  t("sendButton")
                )}
              </Button>
            </form>
          )}
        </CardContent>
        {!isSuccess && (
          <CardFooter className="flex-col gap-3">
            <Separator className="bg-gold/10" />
            <Link
              href="/login"
              className="text-sm text-gold hover:text-gold-dark font-medium transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              {t("backToLogin")}
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
