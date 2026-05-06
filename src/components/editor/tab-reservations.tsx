"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CalendarDays,
  Clock,
  Users,
  Check,
  Link2,
  Unlink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import {
  type ReservationConfigData,
} from "@/lib/editor-store"

interface TabReservationsProps {
  siteId: string
}

const RESERVATION_TYPES = [
  { value: "appointment", label: "Cita" },
  { value: "table", label: "Mesa" },
  { value: "space", label: "Espacio" },
  { value: "class", label: "Clase" },
  { value: "service", label: "Servicio" },
  { value: "custom", label: "Personalizado" },
] as const

const SLOT_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1.5 horas" },
  { value: 120, label: "2 horas" },
] as const

const DAYS_OF_WEEK = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
] as const

interface TimeSlot {
  start: string
  end: string
}

export function TabReservations({ siteId }: TabReservationsProps) {
  const [config, setConfig] = React.useState<ReservationConfigData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)

  // Local state for editing
  const [isEnabled, setIsEnabled] = React.useState(false)
  const [reservationType, setReservationType] = React.useState("appointment")
  const [customTypeLabel, setCustomTypeLabel] = React.useState("")
  const [slotDurationMinutes, setSlotDurationMinutes] = React.useState(30)
  const [maxCapacityPerSlot, setMaxCapacityPerSlot] = React.useState(1)
  const [minAdvanceHours, setMinAdvanceHours] = React.useState(1)
  const [maxAdvanceDays, setMaxAdvanceDays] = React.useState(30)
  const [autoApprove, setAutoApprove] = React.useState(true)
  const [confirmationMessage, setConfirmationMessage] = React.useState(
    "Tu reservación ha sido confirmada"
  )
  const [availableDays, setAvailableDays] = React.useState<number[]>([1, 2, 3, 4, 5])
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([])

  // Google Calendar state
  const [calendarConnected, setCalendarConnected] = React.useState(false)
  const [calendarId, setCalendarId] = React.useState<string | null>(null)

  // Fetch config on mount
  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/sites/${siteId}/reservations/config`)
        if (res.ok) {
          const data = await res.json()
          const c = data.config as ReservationConfigData
          setConfig(c)
          setIsEnabled(c.isEnabled)
          setReservationType(c.reservationType)
          setCustomTypeLabel(c.customTypeLabel || "")
          setSlotDurationMinutes(c.slotDurationMinutes)
          setMaxCapacityPerSlot(c.maxCapacityPerSlot)
          setMinAdvanceHours(c.minAdvanceHours)
          setMaxAdvanceDays(c.maxAdvanceDays)
          setAutoApprove(c.autoApprove)
          setConfirmationMessage(c.confirmationMessage)
          setAvailableDays(c.availableDays)
          setTimeSlots(c.timeSlots)
          setCalendarConnected(c.googleCalendarConnected)
          setCalendarId(c.googleCalendarId)
        }
      } catch {
        toast.error("Error al cargar configuración de reservas")
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [siteId])

  const saveConfig = React.useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/reservations/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          reservationType,
          customTypeLabel:
            reservationType === "custom" ? customTypeLabel : null,
          slotDurationMinutes,
          maxCapacityPerSlot,
          minAdvanceHours,
          maxAdvanceDays,
          autoApprove,
          confirmationMessage,
          availableDays,
          timeSlots,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        toast.success("Configuración de reservas guardada")
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
    reservationType,
    customTypeLabel,
    slotDurationMinutes,
    maxCapacityPerSlot,
    minAdvanceHours,
    maxAdvanceDays,
    autoApprove,
    confirmationMessage,
    availableDays,
    timeSlots,
  ])

  // Debounced save
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedSave = React.useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveConfig()
    }, 800)
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
    reservationType,
    customTypeLabel,
    slotDurationMinutes,
    maxCapacityPerSlot,
    minAdvanceHours,
    maxAdvanceDays,
    autoApprove,
    confirmationMessage,
    availableDays,
    timeSlots,
    loading,
    debouncedSave,
  ])

  // Time slot management
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "09:00", end: "10:00" }])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const updated = [...timeSlots]
    updated[index] = { ...updated[index], [field]: value }
    setTimeSlots(updated)
  }

  // Toggle day
  const toggleDay = (day: number) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // Google Calendar connect
  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch(
        `/api/google-calendar/connect?siteId=${siteId}`
      )
      if (res.ok) {
        const data = await res.json()
        window.open(data.url, "_blank")
        toast.info(
          "Se abrió una ventana para conectar con Google Calendar. Completa la autorización y recarga la página."
        )
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al conectar Google Calendar")
      }
    } catch {
      toast.error("Error al conectar Google Calendar")
    } finally {
      setConnecting(false)
    }
  }

  // Google Calendar disconnect
  const handleDisconnect = async () => {
    try {
      const res = await fetch(
        `/api/google-calendar/disconnect?siteId=${siteId}`,
        { method: "PUT" }
      )
      if (res.ok) {
        setCalendarConnected(false)
        setCalendarId(null)
        toast.success("Google Calendar desconectado")
      } else {
        toast.error("Error al desconectar Google Calendar")
      }
    } catch {
      toast.error("Error al desconectar Google Calendar")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando configuración de reservas...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Configuración ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-[#D4A849]" />
            Configuración de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Habilitar reservas</Label>
              <p className="text-xs text-muted-foreground">
                Activa el sistema de reservaciones para tu sitio
              </p>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {isEnabled && (
            <>
              <Separator />

              {/* Reservation Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tipo de reservación
                </Label>
                <Select
                  value={reservationType}
                  onValueChange={setReservationType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESERVATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Type Label */}
              {reservationType === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Nombre del tipo personalizado
                  </Label>
                  <Input
                    value={customTypeLabel}
                    onChange={(e) => setCustomTypeLabel(e.target.value)}
                    placeholder="Ej: Consulta, Reunión..."
                  />
                </div>
              )}

              <Separator />

              {/* Slot Duration */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Clock className="size-3.5" />
                  Duración del turno
                </Label>
                <Select
                  value={String(slotDurationMinutes)}
                  onValueChange={(v) => setSlotDurationMinutes(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Capacity */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Users className="size-3.5" />
                  Capacidad máxima por turno
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxCapacityPerSlot}
                  onChange={(e) =>
                    setMaxCapacityPerSlot(
                      Math.max(1, Math.min(100, Number(e.target.value)))
                    )
                  }
                />
              </div>

              {/* Advance settings row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Anticipación mínima (horas)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={720}
                    value={minAdvanceHours}
                    onChange={(e) =>
                      setMinAdvanceHours(
                        Math.max(0, Math.min(720, Number(e.target.value)))
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Anticipación máxima (días)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={maxAdvanceDays}
                    onChange={(e) =>
                      setMaxAdvanceDays(
                        Math.max(1, Math.min(365, Number(e.target.value)))
                      )
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Auto-approve */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Aprobar automáticamente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Las reservas se aprueban sin revisión manual
                  </p>
                </div>
                <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
              </div>

              {/* Confirmation message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Mensaje de confirmación
                </Label>
                <Textarea
                  value={confirmationMessage}
                  onChange={(e) => setConfirmationMessage(e.target.value)}
                  placeholder="Mensaje que verá el cliente al reservar"
                  rows={2}
                />
              </div>

              <Separator />

              {/* Available Days */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Días disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={
                        availableDays.includes(day.value) ? "default" : "outline"
                      }
                      size="sm"
                      className="w-12"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Horarios</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Agregar
                  </Button>
                </div>

                {timeSlots.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay horarios configurados. Agrega al menos uno.
                  </p>
                )}

                <div className="space-y-2">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateTimeSlot(idx, "start", e.target.value)
                        }
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateTimeSlot(idx, "end", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => removeTimeSlot(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Saving indicator */}
      {saving && isEnabled && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Guardando...
        </div>
      )}

      {/* ─── Google Calendar ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4 text-[#D4A849]" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection status */}
          <div className="flex items-center gap-3">
            <div
              className={`size-2.5 rounded-full ${
                calendarConnected ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
            />
            <span className="text-sm">
              {calendarConnected ? "Conectado" : "No conectado"}
            </span>
            {calendarConnected && (
              <Badge variant="outline" className="text-xs">
                Google Calendar
              </Badge>
            )}
          </div>

          {/* Calendar ID when connected */}
          {calendarConnected && calendarId && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Calendario conectado
              </p>
              <p className="text-sm font-medium mt-0.5">{calendarId}</p>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {calendarConnected
              ? "Las reservaciones se sincronizarán automáticamente con tu Google Calendar."
              : "Conecta tu Google Calendar para sincronizar las reservaciones automáticamente."}
          </p>

          {/* Action buttons */}
          {!calendarConnected ? (
            <Button
              variant="outline"
              onClick={handleConnect}
              disabled={connecting}
              className="gap-2"
            >
              {connecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              Conectar Google Calendar
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Unlink className="size-4" />
              Desconectar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
