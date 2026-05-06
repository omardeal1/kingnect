"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Heart,
  Gift,
  Award,
  Users,
  Phone,
  User,
  Mail,
  Loader2,
  QrCode,
  ArrowLeft,
  LogOut,
  TrendingUp,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoyaltyConfig {
  id: string
  isEnabled: boolean
  accumulationType: string
  targetValue: number
  rewardType: string
  rewardValue: number
  rewardLabel: string
  welcomeGiftEnabled: boolean
  welcomeGiftDescription: string | null
}

interface Customer {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  visitsCount: number
  totalPurchases: number
  currentProgress: number
  rewardsEarned: number
  rewardsRedeemed: number
  qrCheckinCode: string | null
  createdAt: string
}

interface Transaction {
  id: string
  type: string
  value: number
  description: string | null
  createdAt: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoyaltyPortalPage() {
  // Page state
  const [view, setView] = React.useState<"loading" | "identify" | "register" | "dashboard">("loading")
  const [config, setConfig] = React.useState<LoyaltyConfig | null>(null)
  const [customer, setCustomer] = React.useState<Customer | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [siteId, setSiteId] = React.useState<string>("")

  // Form states
  const [searchPhone, setSearchPhone] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const [registering, setRegistering] = React.useState(false)
  const [registerData, setRegisterData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  })

  // Action states
  const [redeeming, setRedeeming] = React.useState(false)

  const goldColor = "#D4A849"

  // Load config from the current slug
  React.useEffect(() => {
    async function loadConfig() {
      try {
        const pathname = window.location.pathname
        const slug = pathname.split("/")[1]

        // Fetch site data to get siteId and config
        const res = await fetch(`/api/sites/${slug}`)
        if (!res.ok) {
          setView("identify")
          return
        }

        // We need a public endpoint — use a simplified approach
        // The slug page already loads the config, so we'll fetch via a public endpoint
        // For now, try the loyalty config via site lookup
        const siteRes = await fetch(`/api/sites?slug=${slug}`)
        if (siteRes.ok) {
          const siteData = await siteRes.json()
          if (siteData.site?.id) {
            setSiteId(siteData.site.id)
            // Try to fetch loyalty config (might be public)
            const loyaltyRes = await fetch(`/api/sites/${siteData.site.id}/loyalty`)
            if (loyaltyRes.ok) {
              const loyaltyData = await loyaltyRes.json()
              if (loyaltyData.config?.isEnabled) {
                setConfig(loyaltyData.config)
                setView("identify")
                return
              }
            }
          }
        }

        // Fallback: show identify view (site might not have API access)
        setView("identify")
      } catch {
        setView("identify")
      }
    }
    loadConfig()
  }, [])

  // ─── Search customer by phone ───────────────────────────────────────────

  const handleSearch = async () => {
    if (!searchPhone.trim() || searchPhone.trim().length < 6) {
      toast.error("Ingresa un teléfono válido (mínimo 6 dígitos)")
      return
    }

    if (!siteId) {
      toast.error("Error: sitio no encontrado")
      return
    }

    setSearching(true)
    try {
      const res = await fetch(
        `/api/sites/${siteId}/loyalty/customers?search=${encodeURIComponent(searchPhone.trim())}`
      )
      if (res.ok) {
        const data = await res.json()
        const found = data.customers?.find(
          (c: Customer) => c.phone === searchPhone.trim()
        )
        if (found) {
          // Load full customer data
          const fullRes = await fetch(`/api/sites/${siteId}/loyalty/customers?search=${encodeURIComponent(found.id)}`)
          if (fullRes.ok) {
            const fullData = await fullRes.json()
            setCustomer(found)
            await loadTransactions(found.id)
            setView("dashboard")
          }
        } else {
          // Not found, show register form
          setRegisterData((prev) => ({ ...prev, phone: searchPhone.trim() }))
          setView("register")
        }
      } else {
        toast.error("Error al buscar cliente")
      }
    } catch {
      toast.error("Error al buscar cliente")
    } finally {
      setSearching(false)
    }
  }

  // ─── Register customer ──────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!registerData.phone.trim() || registerData.phone.trim().length < 6) {
      toast.error("El teléfono es obligatorio")
      return
    }

    if (!siteId) {
      toast.error("Error: sitio no encontrado")
      return
    }

    setRegistering(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/loyalty/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer)
        if (config?.welcomeGiftEnabled) {
          toast.success("🎁 ¡Registro exitoso! Recibiste tu regalo de bienvenida")
        } else {
          toast.success("¡Registro exitoso! Bienvenido al programa de lealtad")
        }
        await loadTransactions(data.customer.id)
        setView("dashboard")
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al registrarse")
      }
    } catch {
      toast.error("Error al registrarse")
    } finally {
      setRegistering(false)
    }
  }

  // ─── Load transactions ──────────────────────────────────────────────────

  const loadTransactions = async (customerId: string) => {
    if (!siteId) return
    try {
      const res = await fetch(
        `/api/sites/${siteId}/loyalty/transactions?customerId=${customerId}&limit=10`
      )
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
      }
    } catch {
      // Silent fail
    }
  }

  // ─── Redeem reward ──────────────────────────────────────────────────────

  const handleRedeem = async () => {
    if (!customer || !siteId) return

    const available = customer.rewardsEarned - customer.rewardsRedeemed
    if (available <= 0) {
      toast.error("No tienes recompensas disponibles")
      return
    }

    setRedeeming(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/loyalty/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer)
        toast.success("🎉 ¡Recompensa canjeada exitosamente!")
        await loadTransactions(customer.id)
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al canjear")
      }
    } catch {
      toast.error("Error al canjear recompensa")
    } finally {
      setRedeeming(false)
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  const getRewardText = () => {
    if (!config) return ""
    switch (config.rewardType) {
      case "discount":
        return config.rewardValue > 0 ? `${config.rewardValue}% de descuento` : config.rewardLabel
      case "free_product":
        return "Producto gratis"
      case "custom":
        return config.rewardLabel
      default:
        return config.rewardLabel
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "check_in":
        return { label: "Check-in", icon: QrCode, color: "text-emerald-500" }
      case "visit":
        return { label: "Visita", icon: TrendingUp, color: "text-blue-500" }
      case "purchase":
        return { label: "Compra", icon: Star, color: "text-purple-500" }
      case "reward_earned":
        return { label: "Recompensa ganada", icon: Gift, color: "text-amber-500" }
      case "reward_redeemed":
        return { label: "Recompensa canjeada", icon: Award, color: "text-rose-500" }
      case "manual_adjustment":
        return { label: "Ajuste", icon: Clock, color: "text-gray-500" }
      default:
        return { label: type, icon: Clock, color: "text-gray-500" }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const progressPercent = customer && config
    ? Math.min(100, (customer.currentProgress / config.targetValue) * 100)
    : 0

  const availableRewards = customer
    ? customer.rewardsEarned - customer.rewardsRedeemed
    : 0

  // ─── Loading ────────────────────────────────────────────────────────────

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin mx-auto text-[#D4A849]" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // ─── Identify View ──────────────────────────────────────────────────────

  if (view === "identify") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="size-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${goldColor}20` }}>
              <Heart className="size-8" style={{ color: goldColor }} />
            </div>
            <h1 className="text-2xl font-bold">Programa de Lealtad</h1>
            <p className="text-muted-foreground mt-1">
              Acumula y gana recompensas
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <p className="text-sm font-medium">Ingresa tu teléfono</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Te buscaremos en nuestro sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="sr-only">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="55 1234 5678"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10 h-12 text-base"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full h-12 text-base font-semibold gap-2"
                  style={{ backgroundColor: goldColor, color: "#000" }}
                >
                  {searching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Buscar mi cuenta
                </Button>

                {/* Reward Info */}
                {config && (
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${goldColor}10` }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="size-4" style={{ color: goldColor }} />
                      <span className="text-sm font-medium">Gana {getRewardText()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      después de {config.accumulationType === "visits"
                        ? `${config.targetValue} visitas`
                        : config.accumulationType === "amount"
                        ? `$${config.targetValue} en compras`
                        : `${config.targetValue} puntos`}
                    </p>
                  </div>
                )}

                {/* Welcome Gift */}
                {config?.welcomeGiftEnabled && (
                  <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ backgroundColor: `${goldColor}15`, border: `1px solid ${goldColor}30` }}>
                    <Gift className="size-5 shrink-0 mt-0.5" style={{ color: goldColor }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: goldColor }}>
                        Regalo de bienvenida
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {config.welcomeGiftDescription || "Recibe una recompensa al registrarte"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── Register View ──────────────────────────────────────────────────────

  if (view === "register") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("identify")}
            className="mb-4 gap-1"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <div className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${goldColor}20` }}>
                    <Users className="size-7" style={{ color: goldColor }} />
                  </div>
                  <h2 className="text-xl font-bold">Regístrate</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crea tu cuenta y empieza a acumular
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={registerData.firstName}
                          onChange={(e) =>
                            setRegisterData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm">Apellido</Label>
                      <Input
                        id="lastName"
                        placeholder="García"
                        value={registerData.lastName}
                        onChange={(e) =>
                          setRegisterData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="regPhone" className="text-sm">
                      Teléfono <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        id="regPhone"
                        type="tel"
                        placeholder="55 1234 5678"
                        value={registerData.phone}
                        onChange={(e) =>
                          setRegisterData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="pl-9"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="regEmail" className="text-sm">Email (opcional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={registering || !registerData.phone.trim()}
                  className="w-full h-11 text-base font-semibold gap-2"
                  style={{ backgroundColor: goldColor, color: "#000" }}
                >
                  {registering ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4" />
                  )}
                  Crear cuenta
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── Dashboard View ─────────────────────────────────────────────────────

  if (view === "dashboard" && customer && config) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: goldColor }}>
                {customer.firstName?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-base font-bold">
                  ¡Hola, {customer.firstName || "Cliente"}!
                </h2>
                <p className="text-xs text-muted-foreground">
                  Miembro desde {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCustomer(null)
                setTransactions([])
                setSearchPhone("")
                setView("identify")
              }}
              title="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </Button>
          </motion.div>

          {/* QR Code Badge */}
          {customer.qrCheckinCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className="size-4" style={{ color: goldColor }} />
                    <span className="text-sm font-medium">Tu código de check-in</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xl font-mono font-bold tracking-widest"
                    style={{ backgroundColor: `${goldColor}15`, color: goldColor }}
                  >
                    {customer.qrCheckinCode}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Muestra este código al visitarnos
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold" style={{ color: goldColor }}>
                  {customer.visitsCount}
                </p>
                <p className="text-xs text-muted-foreground">Visitas</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold" style={{ color: goldColor }}>
                  {availableRewards}
                </p>
                <p className="text-xs text-muted-foreground">Premios</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold" style={{ color: goldColor }}>
                  {customer.rewardsRedeemed}
                </p>
                <p className="text-xs text-muted-foreground">Canjeados</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4" style={{ color: goldColor }} />
                    <span className="text-sm font-semibold">Progreso</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: goldColor }}>
                    {customer.currentProgress}/{config.targetValue}
                  </span>
                </div>

                <div className="h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: `${goldColor}20` }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: goldColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {progressPercent >= 100
                    ? "🎉 ¡Felicidades! Tienes una recompensa lista para canjear"
                    : `Te faltan ${config.targetValue - customer.currentProgress} para tu próxima recompensa`}
                </p>

                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Gift className="size-3.5" style={{ color: goldColor }} />
                  <span className="text-xs font-medium">{getRewardText()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Redeem Button */}
          {availableRewards > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <Button
                onClick={handleRedeem}
                disabled={redeeming}
                className="w-full h-12 text-base font-bold gap-2 shadow-lg"
                style={{ backgroundColor: goldColor, color: "#000" }}
              >
                {redeeming ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Award className="size-5" />
                )}
                Canjear recompensa ({availableRewards} disponible{availableRewards > 1 ? "s" : ""})
              </Button>
            </motion.div>
          )}

          <Separator className="my-6" />

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Historial reciente</h3>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aún no tienes actividad
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Visítanos para empezar a acumular
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {transactions.map((tx, index) => {
                    const { label, icon: Icon, color } = getTransactionLabel(tx.type)
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <div className="size-8 rounded-lg flex items-center justify-center bg-background">
                          <Icon className={`size-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.description || label}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDate(tx.createdAt)}
                        </span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3 px-4">
        <Heart className="size-12 mx-auto text-muted-foreground/30" />
        <h2 className="text-lg font-semibold">Programa no disponible</h2>
        <p className="text-sm text-muted-foreground">
          El programa de lealtad no está activo en este momento.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    </div>
  )
}

// Inline Search icon for the identify view
function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
