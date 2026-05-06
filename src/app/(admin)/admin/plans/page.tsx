"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
  features: string
  limits: string
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
  features: "{}",
  limits: "{}",
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { t } = useTranslations("admin")

  const fetchPlans = async () => {
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
  }

  useEffect(() => {
    fetchPlans()
  }, [])

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
      features: plan.features,
      limits: plan.limits,
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

  const savePlan = async () => {
    setSaving(true)
    try {
      let featuresObj = {}
      let limitsObj = {}
      try {
        featuresObj = JSON.parse(form.features)
      } catch {
        featuresObj = {}
      }
      try {
        limitsObj = JSON.parse(form.limits)
      } catch {
        limitsObj = {}
      }

      const payload = {
        ...form,
        features: featuresObj,
        limits: limitsObj,
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
      {(isCreating || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                {isCreating ? t("plans.createPlan") : `${t("plans.editPlan")}: ${form.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label>{t("plans.features")}</Label>
                <Textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="mt-1 font-mono text-xs min-h-[100px]"
                  placeholder='{"maxSites": 1, "customDomain": false}'
                />
              </div>

              <div>
                <Label>{t("plans.limits")}</Label>
                <Textarea
                  value={form.limits}
                  onChange={(e) => setForm({ ...form, limits: e.target.value })}
                  className="mt-1 font-mono text-xs min-h-[100px]"
                  placeholder='{"menuItems": 50, "galleryImages": 20}'
                />
              </div>

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

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
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
        ))}
      </div>

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
