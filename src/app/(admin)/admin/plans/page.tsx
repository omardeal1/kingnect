"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  Save,
  X,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  UtensilsCrossed,
  Camera,
  Briefcase,
  MessageSquareQuote,
  Image,
  Link2,
  MapPin,
  Share2,
  MessageCircle,
  ShoppingCart,
  Settings2,
  Tag,
  CalendarDays,
  Heart,
  UserPlus,
  Globe,
  EyeOff,
  Search,
  GitBranch,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  type FeatureKey,
  FEATURE_DEFINITIONS,
  getFeaturesByCategory,
  parsePlanFeatures,
  CATEGORY_LABELS,
  CORE_FEATURES,
} from "@/lib/plan-features"

// Icon map for feature toggles
const FEATURE_ICONS: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Camera,
  Briefcase,
  MessageSquareQuote,
  Image,
  Link2,
  MapPin,
  Share2,
  MessageCircle,
  ShoppingCart,
  Settings2,
  Tag,
  CalendarDays,
  Heart,
  UserPlus,
  Globe,
  EyeOff,
  Search,
  GitBranch,
  Users,
  Sparkles,
  BarChart3,
}

interface PlanData {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  billingInterval: string
  trialDays: number
  isActive: boolean
  sortOrder: number
  features: string
  limits: string
  maxProducts: number
  maxBranches: number
  maxMenuItems: number
  aiDailyLimit: number
  _count: { subscriptions: number }
}

interface PlanForm {
  name: string
  slug: string
  price: number
  currency: string
  billingInterval: string
  trialDays: number
  isActive: boolean
  sortOrder: number
  features: Record<FeatureKey, boolean>
  limits: Record<string, number>
  maxProducts: number
  maxBranches: number
  maxMenuItems: number
  aiDailyLimit: number
}

function getDefaultFeatures(): Record<FeatureKey, boolean> {
  const defaults: Record<string, boolean> = {}
  for (const f of FEATURE_DEFINITIONS) {
    defaults[f.key] = true
  }
  return defaults as Record<FeatureKey, boolean>
}

const emptyForm: PlanForm = {
  name: "",
  slug: "",
  price: 0,
  currency: "USD",
  billingInterval: "month",
  trialDays: 0,
  isActive: true,
  sortOrder: 0,
  features: getDefaultFeatures(),
  limits: {},
  maxProducts: -1,
  maxBranches: -1,
  maxMenuItems: -1,
  aiDailyLimit: 3,
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedFeatureCategory, setExpandedFeatureCategory] = useState<string | null>("content")
  const { t } = useTranslations("admin")

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      setPlans(data.plans ?? [])
    } catch {
      toast.error(t("plans.errors.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const startEdit = (plan: PlanData) => {
    setEditingId(plan.id)
    setIsCreating(false)
    setForm({
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      features: parsePlanFeatures(plan.features),
      limits: (() => {
        try { return JSON.parse(plan.limits) } catch { return {} }
      })(),
      maxProducts: plan.maxProducts ?? -1,
      maxBranches: plan.maxBranches ?? -1,
      maxMenuItems: plan.maxMenuItems ?? -1,
      aiDailyLimit: plan.aiDailyLimit ?? 3,
    })
  }

  const startCreate = () => {
    setIsCreating(true)
    setEditingId(null)
    setForm(emptyForm)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setForm(emptyForm)
  }

  const toggleFeature = (key: FeatureKey) => {
    if (CORE_FEATURES.includes(key)) {
      toast.info("Esta función es_core_ y no puede desactivarse")
      return
    }
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }))
  }

  const selectAllFeatures = (category: string, enabled: boolean) => {
    const categoryFeatures = FEATURE_DEFINITIONS.filter((f) => f.category === category)
    const newFeatures = { ...form.features }
    for (const f of categoryFeatures) {
      if (!CORE_FEATURES.includes(f.key)) {
        newFeatures[f.key] = enabled
      }
    }
    setForm((prev) => ({ ...prev, features: newFeatures }))
  }

  const savePlan = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        price: form.price,
        currency: form.currency,
        billingInterval: form.billingInterval,
        trialDays: form.trialDays,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        features: form.features,
        limits: form.limits,
        maxProducts: form.maxProducts,
        maxBranches: form.maxBranches,
        maxMenuItems: form.maxMenuItems,
        aiDailyLimit: form.aiDailyLimit,
        ...(isCreating ? {} : { planId: editingId }),
      }

      const res = await fetch("/api/admin/plans", {
        method: isCreating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(isCreating ? t("plans.toastSuccess.created") : t("plans.toastSuccess.updated"))
        cancelEdit()
        fetchPlans()
      } else {
        toast.error(data.error ?? t("plans.errors.saveFailed"))
      }
    } catch {
      toast.error(t("plans.errors.saveFailed"))
    } finally {
      setSaving(false)
    }
  }

  const deletePlan = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/plans?planId=${deleteId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(t("plans.toastSuccess.deleted"))
        setDeleteId(null)
        fetchPlans()
      } else {
        toast.error(data.error ?? t("plans.errors.deleteFailed"))
      }
    } catch {
      toast.error(t("plans.errors.deleteFailed"))
    }
  }

  // Count enabled features for display
  const getEnabledCount = (features: string): number => {
    const parsed = parsePlanFeatures(features)
    return Object.values(parsed).filter(Boolean).length
  }

  const getTotalFeatures = () => FEATURE_DEFINITIONS.length

  const featuresByCategory = getFeaturesByCategory()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("plans.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("plans.subtitle")}
          </p>
        </div>
        {!isCreating && !editingId && (
          <Button className="gold-gradient text-black font-semibold" onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t("plans.newPlan")}
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {isCreating ? t("plans.createPlan") : `${t("plans.editPlan")}: ${form.name}`}
                </CardTitle>
                <CardDescription>
                  Configura los detalles del plan y las funciones que incluye
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{t("plans.planName")}</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1"
                      placeholder="Pro"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      className="mt-1"
                      placeholder="pro"
                    />
                  </div>
                  <div>
                    <Label>{t("plans.price")}</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t("plans.currency")}</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => setForm({ ...form, currency: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("plans.billingCycle")}</Label>
                    <Select
                      value={form.billingInterval}
                      onValueChange={(v) => setForm({ ...form, billingInterval: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">{t("plans.monthly")}</SelectItem>
                        <SelectItem value="year">{t("plans.yearly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("plans.trialDays")}</Label>
                    <Input
                      type="number"
                      value={form.trialDays}
                      onChange={(e) => setForm({ ...form, trialDays: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t("plans.sortOrder")}</Label>
                    <Input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                    />
                    <Label>{t("plans.active")}</Label>
                  </div>
                </div>

                <Separator />

                {/* Feature Toggles */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Funciones del Plan</h3>
                      <Badge variant="secondary" className="text-xs">
                        {Object.values(form.features).filter(Boolean).length}/{getTotalFeatures()} activadas
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allOn = { ...form.features }
                          for (const f of FEATURE_DEFINITIONS) {
                            allOn[f.key] = true
                          }
                          setForm({ ...form, features: allOn })
                        }}
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Activar todo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allOff = { ...form.features }
                          for (const f of FEATURE_DEFINITIONS) {
                            if (!CORE_FEATURES.includes(f.key)) {
                              allOff[f.key] = false
                            }
                          }
                          setForm({ ...form, features: allOff })
                        }}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Solo esenciales
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(featuresByCategory).map(([category, features]) => {
                      const isExpanded = expandedFeatureCategory === category
                      const enabledCount = features.filter((f) => form.features[f.key]).length
                      const isCoreCategory = features.every((f) => CORE_FEATURES.includes(f.key))

                      return (
                        <div key={category} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedFeatureCategory(isExpanded ? null : category)}
                            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{CATEGORY_LABELS[category] || category}</span>
                              <Badge variant={enabledCount === features.length ? "default" : "secondary"} className="text-[10px]">
                                {enabledCount}/{features.length}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectAllFeatures(category, enabledCount !== features.length)
                                }}
                              >
                                {enabledCount === features.length ? "Desactivar" : "Activar"}
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 space-y-2">
                                  {features.map((feature) => {
                                    const isEnabled = form.features[feature.key]
                                    const isCore = CORE_FEATURES.includes(feature.key)
                                    const IconComp = FEATURE_ICONS[feature.icon] || Info

                                    return (
                                      <div
                                        key={feature.key}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                          isEnabled
                                            ? "border-primary/20 bg-primary/5"
                                            : "border-border bg-muted/20"
                                        } ${isCore ? "opacity-90" : ""}`}
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <div
                                            className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                                              isEnabled
                                                ? "bg-primary/10 text-primary"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                          >
                                            <IconComp className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium truncate">
                                                {feature.label}
                                              </span>
                                              {isCore && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                                        CORE
                                                      </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Función incluida en todos los planes</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {feature.description}
                                            </p>
                                          </div>
                                        </div>
                                        <Switch
                                          checked={isEnabled}
                                          onCheckedChange={() => toggleFeature(feature.key)}
                                          disabled={isCore}
                                          className="flex-shrink-0 ml-2"
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Limits */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">Límites del Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Máx. Categorías de Menú</Label>
                      <Input
                        type="number"
                        value={form.maxProducts}
                        onChange={(e) => setForm({ ...form, maxProducts: parseInt(e.target.value) || -1 })}
                        className="mt-1"
                        placeholder="-1 = sin límite"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">-1 = ilimitado</p>
                    </div>
                    <div>
                      <Label>Máx. Productos en Menú</Label>
                      <Input
                        type="number"
                        value={form.maxMenuItems}
                        onChange={(e) => setForm({ ...form, maxMenuItems: parseInt(e.target.value) || -1 })}
                        className="mt-1"
                        placeholder="-1 = sin límite"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">-1 = ilimitado</p>
                    </div>
                    <div>
                      <Label>Máx. Sucursales</Label>
                      <Input
                        type="number"
                        value={form.maxBranches}
                        onChange={(e) => setForm({ ...form, maxBranches: parseInt(e.target.value) || -1 })}
                        className="mt-1"
                        placeholder="-1 = sin límite"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">-1 = ilimitado</p>
                    </div>
                    <div>
                      <Label>Límite Diario de IA</Label>
                      <Input
                        type="number"
                        value={form.aiDailyLimit}
                        onChange={(e) => setForm({ ...form, aiDailyLimit: parseInt(e.target.value) || -1 })}
                        className="mt-1"
                        placeholder="-1 = sin límite"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">-1 = ilimitado</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="gold-gradient text-black font-semibold"
                    onClick={savePlan}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? t("plans.createButton") : t("plans.saveChanges")}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const enabledCount = getEnabledCount(plan.features)
          const totalFeatures = getTotalFeatures()

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`relative overflow-hidden ${!plan.isActive ? "opacity-60" : ""}`}>
                <div className="absolute top-0 right-0 w-20 h-20 -mr-4 -mt-4 rounded-full bg-primary/5" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <code className="text-xs text-muted-foreground">{plan.slug}</code>
                    </div>
                    <div className="flex items-center gap-1">
                      {plan.isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      /{plan.billingInterval === "month" ? t("plans.perMonth").slice(1) : t("plans.perYear").slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.currency} · {plan.trialDays} {t("plans.trialDaysLabel")}
                    </p>
                  </div>

                  {/* Feature count */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Funciones activas</span>
                      <span className="text-xs font-semibold">
                        {enabledCount}/{totalFeatures}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((enabledCount / totalFeatures) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick feature badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {parsePlanFeatures(plan.features).menu && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Menú
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).gallery && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Galería
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).reservations && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Reservas
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).branches && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Sucursales
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).loyalty && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Lealtad
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).orders && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Pedidos
                      </Badge>
                    )}
                    {parsePlanFeatures(plan.features).aiAssistant && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        IA
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {plan._count.subscriptions} {t("plans.subscriptions")}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startEdit(plan)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t("plans.editPlan")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(plan.id)}
                      disabled={plan._count.subscriptions > 0}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Empty state */}
      {plans.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No hay planes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crea tu primer plan para comenzar a gestionar suscripciones
          </p>
          <Button className="gold-gradient text-black font-semibold" onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t("plans.newPlan")}
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("plans.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("plans.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("plans.deleteConfirm").replace("?", "")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
