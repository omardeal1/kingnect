"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  CreditCard,
  Check,
  Star,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Crown,
  Zap,
  Shield,
  Receipt,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PLAN_FEATURES } from "@/lib/constants"
import { useDashboardStore } from "@/lib/dashboard-store"
import { toast } from "sonner"

interface PlanData {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  billingInterval: string
  isActive: boolean
  features: string
  limits: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function BillingPage() {
  const dashboardData = useDashboardStore((s) => s.data)
  const { planName, planPrice, planSlug, isBlocked, periodEnd, clientId } = dashboardData

  const pEnd = periodEnd ? new Date(periodEnd) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 18)

  // Fetch plans with database IDs for Stripe checkout
  const { data: plansData } = useQuery<{ plans: PlanData[] }>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans")
      if (!res.ok) throw new Error("Error al cargar planes")
      return res.json()
    },
  })

  const plansById = React.useMemo(() => {
    const map: Record<string, string> = {}
    if (plansData?.plans) {
      for (const plan of plansData.plans) {
        map[plan.slug] = plan.id
      }
    }
    return map
  }, [plansData])

  // Loading states for Stripe actions
  const [portalLoading, setPortalLoading] = React.useState(false)
  const [checkoutLoading, setCheckoutLoading] = React.useState<string | null>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case "trial":
        return <Zap className="size-5" />
      case "basico":
        return <Star className="size-5" />
      case "pro":
        return <Crown className="size-5" />
      case "premium":
        return <Shield className="size-5" />
      default:
        return <Star className="size-5" />
    }
  }

  const handleOpenPortal = async () => {
    if (!clientId) {
      toast.error("No se pudo identificar tu cuenta")
      return
    }
    setPortalLoading(true)
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === "STRIPE_NOT_CONFIGURED") {
          toast.error("Los pagos en línea no están disponibles en este momento. Contacta al soporte.")
        } else {
          toast.error(data.error || "Error al abrir el portal de pagos")
        }
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleChangePlan = async (planSlug: string) => {
    if (planSlug === "trial") {
      toast.info("El plan Trial es gratuito y se asigna automáticamente.")
      return
    }
    if (!clientId) {
      toast.error("No se pudo identificar tu cuenta")
      return
    }
    const planId = plansById[planSlug]
    if (!planId) {
      toast.error("Plan no encontrado. Intenta recargar la página.")
      return
    }
    setCheckoutLoading(planSlug)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, clientId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === "STRIPE_NOT_CONFIGURED") {
          toast.error("Los pagos en línea no están disponibles en este momento. Contacta al soporte.")
        } else {
          toast.error(data.error || "Error al iniciar el proceso de pago")
        }
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Blocked Warning */}
      {isBlocked && (
        <motion.div variants={item}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">
                    Tu cuenta está pausada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu método de pago para reactivar tu suscripción
                  </p>
                </div>
                <Button
                  size="sm"
                  className="ml-auto shrink-0"
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  ) : null}
                  Reactivar ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Current Plan Card */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Plan actual
            </CardTitle>
            <CardDescription>Detalles de tu suscripción</CardDescription>
            <CardAction>
              <Badge variant="secondary">Activo</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  {getPlanIcon(planSlug)}
                </div>
                <div>
                  <p className="font-semibold">{planName}</p>
                  <p className="text-sm text-muted-foreground">
                    Vence el {formatDate(pEnd)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  ${planPrice}
                </span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={handleOpenPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5" />
                )}
                Gestionar suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={item}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Elige tu plan</h2>
          <p className="text-sm text-muted-foreground">
            Cambia de plan en cualquier momento
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_FEATURES.map((plan) => {
            const isCurrent = plan.slug === planSlug
            return (
              <motion.div key={plan.slug} variants={item}>
                <Card
                  className={`relative shadow-sm hover:shadow-md transition-shadow ${
                    isCurrent
                      ? "border-primary ring-2 ring-primary/20"
                      : plan.popular
                      ? "border-accent ring-2 ring-accent/20"
                      : ""
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-[10px]">Plan actual</Badge>
                    </div>
                  )}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-[10px] bg-accent text-accent-foreground">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.slug)}
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billingInterval === "month" ? "mes" : "año"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="size-3.5 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled
                      >
                        Plan actual
                      </Button>
                    ) : (
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className="w-full gap-1.5"
                        onClick={() => handleChangePlan(plan.slug)}
                        disabled={checkoutLoading === plan.slug}
                      >
                        {checkoutLoading === plan.slug ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : plan.price === 0 ? (
                          "Comenzar gratis"
                        ) : (
                          <>
                            Cambiar plan
                            <ArrowRight className="size-3.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4" />
              Historial de pagos
            </CardTitle>
            <CardDescription>
              Tus pagos y facturas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="size-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No hay pagos registrados
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Tus pagos aparecerán aquí una vez que se procesen
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
