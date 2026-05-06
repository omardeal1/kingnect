"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Heart,
  Gift,
  Users,
  Award,
  Loader2,
  Save,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TabLoyaltyProps {
  siteId: string
}

interface LoyaltyConfig {
  id: string
  siteId: string
  isEnabled: boolean
  accumulationType: string
  targetValue: number
  rewardType: string
  rewardValue: number
  rewardLabel: string
  welcomeGiftEnabled: boolean
  welcomeGiftDescription: string | null
}

const ACCUMULATION_TYPES = [
  { value: "visits", label: "Visitas" },
  { value: "amount", label: "Monto de compra" },
  { value: "both", label: "Ambos" },
] as const

const REWARD_TYPES = [
  { value: "discount", label: "Descuento" },
  { value: "free_product", label: "Producto gratis" },
  { value: "custom", label: "Personalizado" },
] as const

export function TabLoyalty({ siteId }: TabLoyaltyProps) {
  const [config, setConfig] = React.useState<LoyaltyConfig | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [customerCount, setCustomerCount] = React.useState(0)

  // Local form state
  const [isEnabled, setIsEnabled] = React.useState(false)
  const [accumulationType, setAccumulationType] = React.useState("visits")
  const [targetValue, setTargetValue] = React.useState(10)
  const [rewardType, setRewardType] = React.useState("discount")
  const [rewardValue, setRewardValue] = React.useState(0)
  const [rewardLabel, setRewardLabel] = React.useState("Recompensa")
  const [welcomeGiftEnabled, setWelcomeGiftEnabled] = React.useState(false)
  const [welcomeGiftDescription, setWelcomeGiftDescription] = React.useState("")

  // Fetch config on mount
  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/sites/${siteId}/loyalty`)
        if (res.ok) {
          const data = await res.json()
          const c = data.config as LoyaltyConfig
          setConfig(c)
          setIsEnabled(c.isEnabled)
          setAccumulationType(c.accumulationType)
          setTargetValue(c.targetValue)
          setRewardType(c.rewardType)
          setRewardValue(c.rewardValue)
          setRewardLabel(c.rewardLabel)
          setWelcomeGiftEnabled(c.welcomeGiftEnabled)
          setWelcomeGiftDescription(c.welcomeGiftDescription || "")
          setCustomerCount(data.customerCount || 0)
        }
      } catch {
        toast.error("Error al cargar configuración de lealtad")
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [siteId])

  const saveConfig = React.useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/loyalty`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          accumulationType,
          targetValue,
          rewardType,
          rewardValue,
          rewardLabel,
          welcomeGiftEnabled,
          welcomeGiftDescription: welcomeGiftEnabled ? welcomeGiftDescription : null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        toast.success("Configuración de lealtad guardada")
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al guardar")
      }
    } catch {
      toast.error("Error al guardar configuración")
    } finally {
      setSaving(false)
    }
  }, [
    siteId,
    isEnabled,
    accumulationType,
    targetValue,
    rewardType,
    rewardValue,
    rewardLabel,
    welcomeGiftEnabled,
    welcomeGiftDescription,
  ])

  // Debounced auto-save (1.5s)
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedSave = React.useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveConfig()
    }, 1500)
  }, [saveConfig])

  // Auto-save on change
  React.useEffect(() => {
    if (!loading) {
      debouncedSave()
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [
    isEnabled,
    accumulationType,
    targetValue,
    rewardType,
    rewardValue,
    rewardLabel,
    welcomeGiftEnabled,
    welcomeGiftDescription,
    loading,
    debouncedSave,
  ])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando configuración de lealtad...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Programa de Lealtad ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4 text-[#D4A849]" />
            Programa de Lealtad
          </CardTitle>
          <CardDescription>
            Configura tu programa de recompensas para fidelizar clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Activar programa</Label>
              <p className="text-xs text-muted-foreground">
                Habilita el sistema de lealtad para tu sitio
              </p>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {isEnabled && (
            <>
              <Separator />

              {/* Accumulation Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Award className="size-3.5" />
                  Tipo de acumulación
                </Label>
                <p className="text-xs text-muted-foreground">
                  ¿Cómo acumulan puntos tus clientes?
                </p>
                <Select
                  value={accumulationType}
                  onValueChange={setAccumulationType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCUMULATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Value */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {accumulationType === "visits"
                    ? "Visitas para recompensa"
                    : accumulationType === "amount"
                    ? "Monto objetivo ($)"
                    : "Objetivo (unidades)"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={targetValue}
                  onChange={(e) =>
                    setTargetValue(
                      Math.max(1, Math.min(1000, Number(e.target.value) || 1))
                    )
                  }
                  placeholder="Ej: 10"
                />
                <p className="text-xs text-muted-foreground">
                  {accumulationType === "visits"
                    ? `Después de ${targetValue} visitas, el cliente gana una recompensa`
                    : accumulationType === "amount"
                    ? `Después de acumular $${targetValue}, el cliente gana una recompensa`
                    : `Después de ${targetValue} acciones, el cliente gana una recompensa`}
                </p>
              </div>

              <Separator />

              {/* Reward Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Gift className="size-3.5" />
                  Tipo de recompensa
                </Label>
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reward Value */}
              {(rewardType === "discount" || rewardType === "custom") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {rewardType === "discount" ? "Porcentaje de descuento" : "Valor de la recompensa"}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={rewardType === "discount" ? 100 : 100000}
                      value={rewardValue}
                      onChange={(e) =>
                        setRewardValue(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      placeholder={rewardType === "discount" ? "Ej: 10" : "Ej: 50"}
                    />
                    {rewardType === "discount" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reward Label */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nombre de la recompensa</Label>
                <Input
                  value={rewardLabel}
                  onChange={(e) => setRewardLabel(e.target.value)}
                  placeholder="Ej: Café gratis, 10% de descuento..."
                />
              </div>

              <Separator />

              {/* Welcome Gift */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Gift className="size-3.5 text-[#D4A849]" />
                      Regalo de bienvenida
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Otorga una recompensa al registrarse
                    </p>
                  </div>
                  <Switch
                    checked={welcomeGiftEnabled}
                    onCheckedChange={setWelcomeGiftEnabled}
                  />
                </div>

                {welcomeGiftEnabled && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Descripción del regalo
                    </Label>
                    <Textarea
                      value={welcomeGiftDescription}
                      onChange={(e) => setWelcomeGiftDescription(e.target.value)}
                      placeholder="Describe qué recibirá el cliente al registrarse..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Clientes Registrados ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-[#D4A849]" />
            Clientes Registrados
          </CardTitle>
          <CardDescription>
            Gestión de clientes del programa de lealtad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{customerCount}</span>
              <span className="text-sm text-muted-foreground">clientes activos</span>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Programa activo" : "Programa inactivo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-semibold text-[#D4A849]">
                {config ? config.targetValue : 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {accumulationType === "visits" ? "Visitas objetivo" : "Objetivo"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-semibold text-[#D4A849]">
                {rewardType === "discount" && rewardValue > 0
                  ? `${rewardValue}%`
                  : rewardType === "free_product"
                  ? "Gratis"
                  : rewardLabel}
              </p>
              <p className="text-xs text-muted-foreground">Recompensa</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              // Navigate to dashboard customers management
              window.location.href = "/dashboard/clients"
            }}
          >
            <Users className="size-4" />
            Ver gestión de clientes
          </Button>
        </CardContent>
      </Card>

      {/* Saving indicator */}
      {saving && isEnabled && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Guardando configuración...
        </div>
      )}

      {!saving && isEnabled && (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <Save className="size-3" />
          Cambios guardados automáticamente
        </div>
      )}
    </div>
  )
}
