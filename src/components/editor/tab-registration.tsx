"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  UserPlus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Loader2,
  Info,
  Lock,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface RegistrationField {
  id: string
  siteId: string
  fieldName: string
  isEnabled: boolean
  label: string | null
  message: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const AVAILABLE_FIELDS = [
  {
    fieldName: "first_name",
    defaultLabel: "Nombre",
    defaultIcon: "User",
    required: true,
  },
  {
    fieldName: "last_name",
    defaultLabel: "Apellido",
    defaultIcon: "User",
    required: false,
  },
  {
    fieldName: "email",
    defaultLabel: "Correo electrónico",
    defaultIcon: "Mail",
    required: false,
  },
  {
    fieldName: "phone",
    defaultLabel: "Teléfono",
    defaultIcon: "Phone",
    required: true,
  },
  {
    fieldName: "whatsapp",
    defaultLabel: "Tiene WhatsApp",
    defaultIcon: "MessageCircle",
    required: false,
  },
  {
    fieldName: "birthday",
    defaultLabel: "Fecha de nacimiento",
    defaultIcon: "Cake",
    required: false,
  },
  {
    fieldName: "gender",
    defaultLabel: "Género",
    defaultIcon: "Users",
    required: false,
  },
  {
    fieldName: "city",
    defaultLabel: "Ciudad",
    defaultIcon: "MapPin",
    required: false,
  },
  {
    fieldName: "postal_code",
    defaultLabel: "Código postal",
    defaultIcon: "Hash",
    required: false,
  },
] as const

interface TabRegistrationProps {
  siteId: string
}

export function TabRegistration({ siteId }: TabRegistrationProps) {
  const [fields, setFields] = React.useState<RegistrationField[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Fetch field configs on mount
  React.useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch(`/api/sites/${siteId}/registration-fields`)
        if (res.ok) {
          const data = await res.json()
          const configs: RegistrationField[] = data.configs ?? []

          // Ensure all available fields have a config entry
          const existingNames = new Set(configs.map((c) => c.fieldName))
          const missing = AVAILABLE_FIELDS.filter(
            (f) => !existingNames.has(f.fieldName)
          )

          const fullList = [
            ...configs,
            ...missing.map((f, idx) => ({
              id: `new-${f.fieldName}`,
              siteId,
              fieldName: f.fieldName,
              isEnabled: f.required,
              label: null,
              message: null,
              sortOrder: configs.length + idx,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          ]

          setFields(fullList)
        }
      } catch {
        toast.error("Error al cargar configuración de registro")
      } finally {
        setLoading(false)
      }
    }
    fetchFields()
  }, [siteId])

  const getFieldMeta = (fieldName: string) => {
    return AVAILABLE_FIELDS.find((f) => f.fieldName === fieldName)
  }

  const updateField = (
    fieldName: string,
    updates: Partial<RegistrationField>
  ) => {
    setFields((prev) =>
      prev.map((f) => (f.fieldName === fieldName ? { ...f, ...updates } : f))
    )
  }

  const moveField = (index: number, direction: "up" | "down") => {
    setFields((prev) => {
      const arr = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= arr.length) return prev
      ;[arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]]
      return arr.map((f, i) => ({ ...f, sortOrder: i }))
    })
  }

  const saveFields = React.useCallback(async () => {
    setSaving(true)
    try {
      const payload = fields.map((f) => ({
        fieldName: f.fieldName,
        isEnabled: f.isEnabled,
        label: f.label || undefined,
        message: f.message || undefined,
        sortOrder: f.sortOrder,
      }))

      const res = await fetch(`/api/sites/${siteId}/registration-fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: payload }),
      })

      if (res.ok) {
        const data = await res.json()
        setFields(data.configs)
        toast.success("Configuración de registro guardada")
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al guardar")
      }
    } catch {
      toast.error("Error al guardar configuración")
    } finally {
      setSaving(false)
    }
  }, [fields, siteId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando configuración de registro...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Required fields notice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4 text-[#D4A849]" />
            Campos requeridos
          </CardTitle>
          <CardDescription className="text-xs">
            Estos campos siempre se muestran y no pueden ser desactivados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FIELDS.filter((f) => f.required).map((f) => (
              <Badge
                key={f.fieldName}
                variant="outline"
                className="gap-1.5 bg-[#D4A849]/10 border-[#D4A849]/30 text-[#D4A849]"
              >
                <Lock className="size-3" />
                {f.defaultLabel}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field configuration list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-[#D4A849]" />
            Configuración de campos de registro
          </CardTitle>
          <CardDescription>
            Activa y configura los campos que los clientes deben completar al registrarse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {fields.map((field, index) => {
            const meta = getFieldMeta(field.fieldName)
            if (!meta) return null

            return (
              <div key={field.fieldName}>
                <div className="flex items-start gap-3 py-3">
                  {/* Drag handle / reorder */}
                  <div className="flex flex-col items-center gap-0.5 pt-0.5">
                    <GripVertical className="size-4 text-muted-foreground/40" />
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="p-0 text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-20"
                        disabled={index === 0}
                        onClick={() => moveField(index, "up")}
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="p-0 text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-20"
                        disabled={index === fields.length - 1}
                        onClick={() => moveField(index, "down")}
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Field info + toggle */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">
                          {meta.defaultLabel}
                        </Label>
                        {meta.required && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Requerido
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={field.isEnabled}
                        disabled={meta.required}
                        onCheckedChange={(checked) =>
                          updateField(field.fieldName, { isEnabled: checked })
                        }
                      />
                    </div>

                    {/* Expanded settings for enabled fields */}
                    {field.isEnabled && !meta.required && (
                      <div className="space-y-2 pl-0.5">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Etiqueta personalizada
                          </Label>
                          <Input
                            value={field.label || ""}
                            onChange={(e) =>
                              updateField(field.fieldName, {
                                label: e.target.value || null,
                              })
                            }
                            placeholder={`Predeterminado: ${meta.defaultLabel}`}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Texto de ayuda
                          </Label>
                          <Input
                            value={field.message || ""}
                            onChange={(e) =>
                              updateField(field.fieldName, {
                                message: e.target.value || null,
                              })
                            }
                            placeholder="Texto auxiliar que se muestra debajo del campo"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {field.isEnabled && meta.required && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="size-3" />
                        Campo obligatorio — siempre visible en el formulario
                      </p>
                    )}
                  </div>
                </div>
                {index < fields.length - 1 && <Separator />}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Guardando...
          </span>
        )}
        <Button
          onClick={saveFields}
          disabled={saving}
          className="gap-2"
          style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Guardar configuración
        </Button>
      </div>
    </div>
  )
}
