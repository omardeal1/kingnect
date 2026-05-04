"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Globe,
  MapPinned,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEditorStore, type LocationData } from "@/lib/editor-store"

interface TabUbicacionesProps {
  siteId: string
}

export function TabUbicaciones({ siteId }: TabUbicacionesProps) {
  const site = useEditorStore((s) => s.site)
  const addLocation = useEditorStore((s) => s.addLocation)
  const updateLocation = useEditorStore((s) => s.updateLocation)
  const removeLocation = useEditorStore((s) => s.removeLocation)

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [addingNew, setAddingNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Edit form state
  const [formName, setFormName] = React.useState("")
  const [formAddress, setFormAddress] = React.useState("")
  const [formMapsUrl, setFormMapsUrl] = React.useState("")
  const [formHours, setFormHours] = React.useState("")
  const [formEnabled, setFormEnabled] = React.useState(true)

  if (!site) return null

  const locations = site.locations ?? []

  const startEdit = (loc: LocationData) => {
    setEditingId(loc.id)
    setAddingNew(false)
    setFormName(loc.name)
    setFormAddress(loc.address ?? "")
    setFormMapsUrl(loc.mapsUrl ?? "")
    setFormHours(loc.hours ?? "")
    setFormEnabled(loc.enabled)
  }

  const startAdd = () => {
    setAddingNew(true)
    setEditingId(null)
    setFormName("")
    setFormAddress("")
    setFormMapsUrl("")
    setFormHours("")
    setFormEnabled(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAddingNew(false)
  }

  const handleAdd = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          address: formAddress || null,
          mapsUrl: formMapsUrl || null,
          hours: formHours || null,
          enabled: formEnabled,
          sortOrder: locations.length,
        }),
      })
      if (!res.ok) throw new Error("Error al crear ubicación")
      const data = await res.json()
      addLocation({
        id: data.location.id,
        name: data.location.name,
        address: data.location.address,
        mapsUrl: data.location.mapsUrl,
        hours: data.location.hours,
        enabled: data.location.enabled,
        sortOrder: data.location.sortOrder,
      })
      toast.success("Ubicación agregada correctamente")
      setAddingNew(false)
    } catch {
      toast.error("Error al agregar ubicación")
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editingId) return
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/locations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: editingId,
          name: formName,
          address: formAddress || null,
          mapsUrl: formMapsUrl || null,
          hours: formHours || null,
          enabled: formEnabled,
        }),
      })
      if (!res.ok) throw new Error("Error al guardar ubicación")
      updateLocation(editingId, {
        name: formName,
        address: formAddress || null,
        mapsUrl: formMapsUrl || null,
        hours: formHours || null,
        enabled: formEnabled,
      })
      toast.success("Ubicación actualizada")
      setEditingId(null)
    } catch {
      toast.error("Error al guardar ubicación")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (locId: string) => {
    try {
      const res = await fetch(
        `/api/sites/${siteId}/locations?locationId=${locId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Error al eliminar")
      removeLocation(locId)
      toast.success("Ubicación eliminada")
      if (editingId === locId) setEditingId(null)
    } catch {
      toast.error("Error al eliminar ubicación")
    }
  }

  const handleToggleEnabled = async (loc: LocationData) => {
    const newEnabled = !loc.enabled
    updateLocation(loc.id, { enabled: newEnabled })
    try {
      await fetch(`/api/sites/${siteId}/locations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: loc.id, enabled: newEnabled }),
      })
    } catch {
      toast.error("Error al actualizar ubicación")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4 text-[#D4A849]" />
            Ubicaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {locations.length === 0 && !addingNew && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay ubicaciones configuradas
            </p>
          )}

          {/* Location cards */}
          {locations.map((loc) => (
            <div key={loc.id}>
              {editingId === loc.id ? (
                /* Edit form */
                <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
                  <div className="space-y-2">
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nombre de la ubicación"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <MapPinned className="size-3" /> Dirección
                    </Label>
                    <Input
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Calle, número, ciudad..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Globe className="size-3" /> Link Google Maps
                    </Label>
                    <Input
                      value={formMapsUrl}
                      onChange={(e) => setFormMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Clock className="size-3" /> Horarios
                    </Label>
                    <Textarea
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                      placeholder="Lun-Vie: 9am-6pm&#10;Sáb: 10am-2pm"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formEnabled}
                      onCheckedChange={setFormEnabled}
                    />
                    <Label className="text-xs">
                      {formEnabled ? "Activada" : "Desactivada"}
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin mr-1" />
                      ) : (
                        <Check className="size-4 mr-1" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      <X className="size-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display card */
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="size-4 text-[#D4A849] shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {loc.name}
                      </span>
                      {!loc.enabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Desactivada
                        </span>
                      )}
                    </div>
                    {loc.address && (
                      <p className="text-xs text-muted-foreground ml-6">
                        {loc.address}
                      </p>
                    )}
                    {loc.hours && (
                      <p className="text-xs text-muted-foreground ml-6 flex items-center gap-1">
                        <Clock className="size-3" />
                        {loc.hours}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={loc.enabled}
                      onCheckedChange={() => handleToggleEnabled(loc)}
                      className="scale-75"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => startEdit(loc)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => handleDelete(loc.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add new form */}
          {addingNew && (
            <div className="space-y-3 rounded-lg border-2 border-dashed border-[#D4A849]/30 p-4 bg-[#D4A849]/5">
              <p className="text-sm font-medium text-[#D4A849]">
                Nueva ubicación
              </p>
              <div className="space-y-2">
                <Label className="text-xs">Nombre</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre de la ubicación"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <MapPinned className="size-3" /> Dirección
                </Label>
                <Input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Calle, número, ciudad..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Globe className="size-3" /> Link Google Maps
                </Label>
                <Input
                  value={formMapsUrl}
                  onChange={(e) => setFormMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Clock className="size-3" /> Horarios
                </Label>
                <Textarea
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  placeholder="Lun-Vie: 9am-6pm&#10;Sáb: 10am-2pm"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formEnabled}
                  onCheckedChange={setFormEnabled}
                />
                <Label className="text-xs">
                  {formEnabled ? "Activada" : "Desactivada"}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={saving}>
                  {saving ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : (
                    <Check className="size-4 mr-1" />
                  )}
                  Agregar
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="size-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Add button */}
          {!addingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={startAdd}
              className="w-full"
            >
              <Plus className="size-4 mr-2" />
              Agregar ubicación
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
