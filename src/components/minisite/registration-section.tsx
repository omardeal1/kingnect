"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserPlus,
  Loader2,
  Check,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  Hash,
  MessageCircle,
  QrCode,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export interface RegistrationFieldConfigData {
  id: string
  fieldName: string
  isEnabled: boolean
  label: string | null
  message: string | null
  sortOrder: number
}

interface RegistrationSectionProps {
  siteId: string
  fields: RegistrationFieldConfigData[]
  accentColor: string
  textColor: string
  cardColor: string
  onSuccess?: (customer: {
    id: string
    qrCheckinCode: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }) => void
}

const FIELD_META: Record<
  string,
  { icon: React.ElementType; type: "text" | "email" | "tel" | "date" | "select" | "checkbox"; placeholder: string; options?: string[] }
> = {
  first_name: {
    icon: User,
    type: "text",
    placeholder: "Tu nombre",
  },
  last_name: {
    icon: User,
    type: "text",
    placeholder: "Tu apellido",
  },
  email: {
    icon: Mail,
    type: "email",
    placeholder: "correo@ejemplo.com",
  },
  phone: {
    icon: Phone,
    type: "tel",
    placeholder: "+1 555 123 4567",
  },
  whatsapp: {
    icon: MessageCircle,
    type: "checkbox",
    placeholder: "¿Es tu número de WhatsApp?",
  },
  birthday: {
    icon: Calendar,
    type: "date",
    placeholder: "",
  },
  gender: {
    icon: User,
    type: "select",
    placeholder: "Selecciona...",
    options: ["masculino", "femenino", "prefiero no decir"],
  },
  city: {
    icon: MapPin,
    type: "text",
    placeholder: "Tu ciudad",
  },
  postal_code: {
    icon: Hash,
    type: "text",
    placeholder: "Código postal",
  },
}

export function RegistrationSection({
  siteId,
  fields,
  accentColor,
  textColor,
  cardColor,
  onSuccess,
}: RegistrationSectionProps) {
  // Always include phone field even if not in config
  const hasPhone = fields.some((f) => f.fieldName === "phone" && f.isEnabled) || true

  // Build the ordered list of enabled fields, always ensuring phone is first
  const sortedFields = React.useMemo(() => {
    const enabled = fields
      .filter((f) => f.isEnabled)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // Ensure phone is always present
    if (!enabled.some((f) => f.fieldName === "phone")) {
      enabled.unshift({
        id: "default-phone",
        fieldName: "phone",
        isEnabled: true,
        label: null,
        message: null,
        sortOrder: 0,
      })
    }

    // Move phone to position 0 if it isn't already
    const phoneIdx = enabled.findIndex((f) => f.fieldName === "phone")
    if (phoneIdx > 0) {
      const [phoneField] = enabled.splice(phoneIdx, 1)
      enabled.unshift(phoneField)
    }

    return enabled
  }, [fields])

  // Form state
  const [formData, setFormData] = React.useState<Record<string, string | boolean>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [registeredCustomer, setRegisteredCustomer] = React.useState<{
    id: string
    qrCheckinCode: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  } | null>(null)

  const getFieldLabel = (fieldName: string) => {
    const config = fields.find((f) => f.fieldName === fieldName)
    if (config?.label) return config.label
    return FIELD_META[fieldName]?.placeholder || fieldName
  }

  const getFieldMessage = (fieldName: string) => {
    const config = fields.find((f) => f.fieldName === fieldName)
    return config?.message || null
  }

  const updateField = (fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const getFieldValue = (fieldName: string): string | boolean => {
    return formData[fieldName] ?? ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phone = (getFieldValue("phone") as string)?.trim()
    if (!phone) {
      toast.error("El teléfono es requerido")
      return
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        phone,
        registrationMethod: "manual",
      }

      const firstName = (getFieldValue("first_name") as string)?.trim()
      const lastName = (getFieldValue("last_name") as string)?.trim()
      const email = (getFieldValue("email") as string)?.trim()
      const birthday = (getFieldValue("birthday") as string)?.trim()
      const gender = (getFieldValue("gender") as string)?.trim()
      const city = (getFieldValue("city") as string)?.trim()
      const postalCode = (getFieldValue("postal_code") as string)?.trim()
      const hasWhatsapp = getFieldValue("whatsapp") as boolean

      if (firstName) body.firstName = firstName
      if (lastName) body.lastName = lastName
      if (email) body.email = email
      if (birthday) body.birthday = birthday
      if (gender) body.gender = gender
      if (city) body.city = city
      if (postalCode) body.postalCode = postalCode
      if (hasWhatsapp) body.hasWhatsapp = true

      const res = await fetch(`/api/sites/${siteId}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        setRegisteredCustomer(data.customer)
        setSubmitted(true)
        onSuccess?.(data.customer)

        if (data.isNew) {
          toast.success("¡Registro exitoso!")
        } else {
          toast.info("Ya estabas registrado. ¡Bienvenido de vuelta!")
        }
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al registrarse")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({})
    setSubmitted(false)
    setRegisteredCustomer(null)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-6"
    >
      <Card
        className="overflow-hidden"
        style={{ backgroundColor: cardColor, color: textColor }}
      >
        <CardHeader className="pb-3">
          <CardTitle
            className="flex items-center gap-2 text-base"
            style={{ color: textColor }}
          >
            <UserPlus className="size-5" style={{ color: accentColor }} />
            Registro de cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {submitted && registeredCustomer ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Check className="size-8" style={{ color: accentColor }} />
                </motion.div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: textColor }}
                  >
                    ¡Registro exitoso,{" "}
                    {registeredCustomer.firstName || registeredCustomer.phone || "cliente"}!
                  </p>
                  {registeredCustomer.qrCheckinCode && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Tu código QR de check-in:
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                          border: `2px solid ${accentColor}40`,
                        }}
                      >
                        <QrCode className="size-5" />
                        {registeredCustomer.qrCheckinCode}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Preséntalo en el negocio para acumular visitas
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  className="mt-2"
                >
                  Registrar otra persona
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {sortedFields.map((fieldConfig) => {
                  const meta = FIELD_META[fieldConfig.fieldName]
                  if (!meta) return null

                  const label =
                    fieldConfig.label ||
                    getFieldLabel(fieldConfig.fieldName)
                  const helperMessage = getFieldMessage(fieldConfig.fieldName)
                  const isRequired = fieldConfig.fieldName === "phone" || fieldConfig.fieldName === "first_name"

                  if (meta.type === "checkbox") {
                    return (
                      <div
                        key={fieldConfig.fieldName}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`reg-${fieldConfig.fieldName}`}
                          checked={(getFieldValue(fieldConfig.fieldName) as boolean) || false}
                          onCheckedChange={(checked) =>
                            updateField(fieldConfig.fieldName, checked === true)
                          }
                          style={
                            (getFieldValue(fieldConfig.fieldName) as boolean) || false
                              ? { backgroundColor: accentColor, borderColor: accentColor }
                              : undefined
                          }
                        />
                        <label
                          htmlFor={`reg-${fieldConfig.fieldName}`}
                          className="text-sm cursor-pointer"
                          style={{ color: textColor }}
                        >
                          {label}
                        </label>
                        {helperMessage && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {helperMessage}
                          </span>
                        )}
                      </div>
                    )
                  }

                  if (meta.type === "select") {
                    const Icon = meta.icon
                    return (
                      <div key={fieldConfig.fieldName} className="space-y-1.5">
                        <Label
                          className="text-sm font-medium flex items-center gap-1.5"
                          style={{ color: textColor }}
                        >
                          <Icon className="size-3.5" style={{ color: accentColor }} />
                          {label}
                          {isRequired && (
                            <span className="text-destructive">*</span>
                          )}
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                          {(meta.options || []).map((opt) => (
                            <Button
                              key={opt}
                              type="button"
                              variant={
                                getFieldValue(fieldConfig.fieldName) === opt
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="text-xs h-8 capitalize"
                              style={
                                getFieldValue(fieldConfig.fieldName) === opt
                                  ? {
                                      backgroundColor: accentColor,
                                      borderColor: accentColor,
                                    }
                                  : {}
                              }
                              onClick={() =>
                                updateField(fieldConfig.fieldName, opt)
                              }
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                        {helperMessage && (
                          <p className="text-xs text-muted-foreground">{helperMessage}</p>
                        )}
                      </div>
                    )
                  }

                  const Icon = meta.icon
                  return (
                    <div key={fieldConfig.fieldName} className="space-y-1.5">
                      <Label
                        className="text-sm font-medium flex items-center gap-1.5"
                        style={{ color: textColor }}
                      >
                        <Icon className="size-3.5" style={{ color: accentColor }} />
                        {label}
                        {isRequired && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Input
                        type={meta.type}
                        value={(getFieldValue(fieldConfig.fieldName) as string) || ""}
                        onChange={(e) =>
                          updateField(fieldConfig.fieldName, e.target.value)
                        }
                        placeholder={meta.placeholder}
                        required={isRequired}
                      />
                      {helperMessage && (
                        <p className="text-xs text-muted-foreground">{helperMessage}</p>
                      )}
                    </div>
                  )
                })}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                    style={
                      !submitting
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : {}
                    }
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4 mr-2" />
                        Registrarme
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.section>
  )
}
