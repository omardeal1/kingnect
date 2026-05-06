"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Clock, Users, Check, Loader2, MessageSquare } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface TimeSlot {
  start: string
  end: string
}

interface ReservationConfigData {
  id: string
  siteId: string
  isEnabled: boolean
  reservationType: string
  customTypeLabel: string | null
  slotDurationMinutes: number
  maxCapacityPerSlot: number
  minAdvanceHours: number
  maxAdvanceDays: number
  autoApprove: boolean
  confirmationMessage: string
  googleCalendarConnected: boolean
  googleCalendarId: string | null
  availableDays: number[]
  timeSlots: TimeSlot[]
}

interface ReservationSectionProps {
  config: ReservationConfigData | null
  siteId: string
  accentColor: string
  textColor: string
  cardColor: string
  siteSlug: string
  whatsappNumber?: string
}

const RESERVATION_TYPE_LABELS: Record<string, string> = {
  appointment: "Cita",
  table: "Mesa",
  space: "Espacio",
  class: "Clase",
  service: "Servicio",
  custom: "Personalizado",
}

export function ReservationSection({
  config,
  siteId,
  accentColor,
  textColor,
  cardColor,
  siteSlug,
  whatsappNumber,
}: ReservationSectionProps) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = React.useState<string>("")
  const [partySize, setPartySize] = React.useState(1)
  const [customerName, setCustomerName] = React.useState("")
  const [customerEmail, setCustomerEmail] = React.useState("")
  const [customerPhone, setCustomerPhone] = React.useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = React.useState(false)
  const [notes, setNotes] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [slotCapacity, setSlotCapacity] = React.useState<Record<string, number>>({})

  const isEnabled = config?.isEnabled ?? false
  const typeLabel =
    config?.reservationType === "custom" && config?.customTypeLabel
      ? config.customTypeLabel
      : (config?.reservationType ? (RESERVATION_TYPE_LABELS[config.reservationType] || "Reservación") : "Reservación")

  // Date constraints
  const now = new Date()
  const minDate = addDays(now, Math.ceil((config?.minAdvanceHours ?? 1) / 24))
  const maxDate = addDays(now, config?.maxAdvanceDays ?? 30)

  // Filter available days of week
  const isDayAvailable = (day: Date) => {
    const dow = day.getDay()
    return (config?.availableDays ?? []).includes(dow)
  }

  // Available time slots as formatted strings
  const formattedSlots = (config?.timeSlots ?? []).map((s) => `${s.start} - ${s.end}`)

  // Fetch capacity for selected date
  React.useEffect(() => {
    if (!date || !isEnabled) {
      setSlotCapacity({})
      return
    }

    async function fetchCapacity() {
      try {
        const res = await fetch(
          `/api/sites/${siteId}/reservations?from=${format(date, "yyyy-MM-dd")}&to=${format(date, "yyyy-MM-dd")}&limit=100`
        )
        if (res.ok) {
          const data = await res.json()
          const reservations = data.reservations || []
          const counts: Record<string, number> = {}
          for (const r of reservations) {
            if (r.status === "pending" || r.status === "approved") {
              counts[r.timeSlot] = (counts[r.timeSlot] || 0) + r.partySize
            }
          }
          setSlotCapacity(counts)
        }
      } catch {
        // Silent
      }
    }
    fetchCapacity()
  }, [date, siteId, isEnabled])

  // Reset slot when date changes
  React.useEffect(() => {
    setSelectedSlot("")
  }, [date])

  const getAvailableCapacity = (slot: string) => {
    const used = slotCapacity[slot] || 0
    return Math.max(0, (config?.maxCapacityPerSlot ?? 1) - used)
  }

  const isSlotAvailable = (slot: string) => {
    return getAvailableCapacity(slot) >= 1
  }

  // Select first available slot
  React.useEffect(() => {
    if (!selectedSlot && formattedSlots.length > 0) {
      const available = formattedSlots.find(isSlotAvailable)
      if (available) setSelectedSlot(available)
    }
  }, [date, formattedSlots, selectedSlot, slotCapacity])

  const handleSubmit = async () => {
    if (!date || !selectedSlot || !customerName.trim()) {
      toast.error("Por favor completa la fecha, hora y nombre")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          customerPhone: customerPhone.trim() || null,
          customerWhatsapp,
          reservationDate: date.toISOString(),
          timeSlot: selectedSlot,
          partySize,
          notes: notes.trim() || null,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        // Optionally send WhatsApp message
        if (whatsappNumber) {
          const msg = encodeURIComponent(
            `¡Hola! He hecho una ${typeLabel.toLowerCase()} para ${format(date, "dd/MM/yyyy")} a las ${selectedSlot}.\n\nNombre: ${customerName.trim()}\nPersonas: ${partySize}${notes ? `\nNotas: ${notes.trim()}` : ""}`
          )
          const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${msg}`
          window.open(waUrl, "_blank")
        }
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al crear reservación")
      }
    } catch {
      toast.error("Error al crear reservación")
    } finally {
      setSubmitting(false)
    }
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
            <CalendarDays
              className="size-5"
              style={{ color: accentColor }}
            />
            Reservar {typeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-3"
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
                <p className="text-sm font-medium" style={{ color: textColor }}>
                  {config?.confirmationMessage ?? "Tu reservación ha sido confirmada"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false)
                    setDate(undefined)
                    setSelectedSlot("")
                    setCustomerName("")
                    setCustomerEmail("")
                    setCustomerPhone("")
                    setCustomerWhatsapp(false)
                    setNotes("")
                    setPartySize(1)
                  }}
                  className="mt-2"
                >
                  Hacer otra reservación
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Date picker */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: textColor }}>
                    <CalendarDays className="inline size-3.5 mr-1" />
                    Fecha
                  </Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day) =>
                      !isDayAvailable(day) ||
                      day < new Date(minDate.setHours(0, 0, 0, 0)) ||
                      day > maxDate
                    }
                    modifiers={{
                      available: (day) => isDayAvailable(day),
                    }}
                    modifiersClassNames={{
                      available: "font-bold",
                    }}
                    className="rounded-lg mx-auto"
                    locale={es}
                  />
                </div>

                {/* Time slots */}
                {date && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium" style={{ color: textColor }}>
                      <Clock className="inline size-3.5 mr-1" />
                      Horario
                    </Label>
                    {formattedSlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No hay horarios disponibles
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {formattedSlots.map((slot) => {
                          const available = isSlotAvailable(slot)
                          const remaining = getAvailableCapacity(slot)
                          return (
                            <Button
                              key={slot}
                              type="button"
                              variant={selectedSlot === slot ? "default" : "outline"}
                              disabled={!available}
                              className="justify-start text-xs h-9"
                              style={
                                selectedSlot === slot
                                  ? { backgroundColor: accentColor, borderColor: accentColor }
                                  : {}
                              }
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                              {!available ? (
                                <span className="ml-auto text-[10px]">Lleno</span>
                              ) : (
                                <span className="ml-auto text-[10px] opacity-60">
                                  {remaining} disp.
                                </span>
                              )}
                            </Button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Party size */}
                {date && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium" style={{ color: textColor }}>
                      <Users className="inline size-3.5 mr-1" />
                      Número de personas
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={partySize <= 1}
                        onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      >
                        −
                      </Button>
                      <span
                        className="w-10 text-center text-sm font-medium"
                        style={{ color: textColor }}
                      >
                        {partySize}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={
                          partySize >=
                          Math.min(
                            config?.maxCapacityPerSlot ?? 1,
                            getAvailableCapacity(selectedSlot)
                          )
                        }
                        onClick={() =>
                          setPartySize((p) =>
                            Math.min(
                              config?.maxCapacityPerSlot ?? 1,
                              getAvailableCapacity(selectedSlot),
                              p + 1
                            )
                          )
                        }
                      >
                        +
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        máx. {getAvailableCapacity(selectedSlot)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Customer info */}
                {date && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-medium"
                        style={{ color: textColor }}
                      >
                        Nombre *
                      </Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-sm font-medium"
                        style={{ color: textColor }}
                      >
                        Correo electrónico
                      </Label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-sm font-medium"
                        style={{ color: textColor }}
                      >
                        Teléfono
                      </Label>
                      <Input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="whatsapp-check"
                          checked={customerWhatsapp}
                          onCheckedChange={(checked) =>
                            setCustomerWhatsapp(checked === true)
                          }
                        />
                        <label
                          htmlFor="whatsapp-check"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Es número de WhatsApp
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="text-sm font-medium flex items-center gap-1"
                        style={{ color: textColor }}
                      >
                        <MessageSquare className="size-3.5" />
                        Notas (opcional)
                      </Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Algún comentario especial..."
                        rows={2}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                {date && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      className="w-full"
                      disabled={submitting || !customerName.trim()}
                      onClick={handleSubmit}
                      style={
                        !submitting
                          ? { backgroundColor: accentColor, borderColor: accentColor }
                          : {}
                      }
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <CalendarDays className="size-4 mr-2" />
                          Reservar {typeLabel}
                        </>
                      )}
                    </Button>
                    {!(config?.autoApprove ?? true) && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Tu reservación estará sujeta a confirmación
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.section>
  )
}
