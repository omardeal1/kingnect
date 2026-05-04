"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Upload,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type ServiceData } from "@/lib/editor-store"

interface TabServiciosProps {
  siteId: string
}

export function TabServicios({ siteId }: TabServiciosProps) {
  const {
    site,
    addService,
    updateService,
    removeService,
  } = useEditorStore()

  const services = site?.services ?? []
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  // ─── Add ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: ServiceData = {
      id: tempId,
      name: "Nuevo servicio",
      description: null,
      price: null,
      imageUrl: null,
      buttonLabel: null,
      buttonUrl: null,
      enabled: true,
      sortOrder: services.length,
    }
    addService(optimistic)

    try {
      const res = await fetch(`/api/sites/${siteId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nuevo servicio", sortOrder: services.length }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeService(tempId)
      addService(data.service)
      toast.success("Servicio agregado")
    } catch {
      removeService(tempId)
      toast.error("Error al agregar servicio")
    }
  }

  // ─── Update ─────────────────────────────────────────────────────────
  const handleUpdate = async (serviceId: string, fields: Partial<ServiceData>) => {
    updateService(serviceId, fields)
    try {
      await fetch(`/api/sites/${siteId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar servicio")
    }
  }

  // ─── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (serviceId: string) => {
    removeService(serviceId)
    try {
      await fetch(`/api/sites/${siteId}/services?serviceId=${serviceId}`, { method: "DELETE" })
      toast.success("Servicio eliminado")
    } catch {
      toast.error("Error al eliminar servicio")
    }
  }

  // ─── Reorder ────────────────────────────────────────────────────────
  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (!site) return
    const list = [...services]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    list.forEach((svc, i) => {
      updateService(svc.id, { sortOrder: i })
    })

    try {
      await Promise.all(
        list.map((svc) =>
          fetch(`/api/sites/${siteId}/services`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId: svc.id, sortOrder: list.indexOf(svc) }),
          })
        )
      )
    } catch {
      toast.error("Error al reordenar")
    }
  }

  // ─── Image upload ───────────────────────────────────────────────────
  const handleImageUpload = async (serviceId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error()
      const { url } = await uploadRes.json()
      handleUpdate(serviceId, { imageUrl: url })
    } catch {
      toast.error("Error al subir imagen")
    }
  }

  const triggerFileInput = (serviceId: string) => {
    fileInputRefs.current[serviceId]?.click()
  }

  if (!site) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Servicios</h3>
          <p className="text-xs text-muted-foreground">
            Muestra los servicios que ofreces
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white">
          <Plus className="size-3.5" />
          Agregar servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Briefcase className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin servicios</p>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega los servicios que ofreces
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((svc, index) => (
            <Card key={svc.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <div className="shrink-0">
                    <input
                      ref={(el) => { fileInputRefs.current[svc.id] = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(svc.id, file)
                      }}
                    />
                    {svc.imageUrl ? (
                      <button
                        onClick={() => triggerFileInput(svc.id)}
                        className="size-20 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                      >
<img
                          src={svc.imageUrl}
                          alt={svc.name}
                          className="size-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => triggerFileInput(svc.id)}
                        className="size-20 rounded-md border-2 border-dashed flex items-center justify-center hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
                      >
                        <Upload className="size-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={svc.name}
                          onChange={(e) => handleUpdate(svc.id, { name: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="Nombre del servicio"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Precio</Label>
                        <Input
                          value={svc.price ?? ""}
                          onChange={(e) => handleUpdate(svc.id, { price: e.target.value || null })}
                          className="h-8 text-sm"
                          placeholder="$0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Input
                        value={svc.description ?? ""}
                        onChange={(e) => handleUpdate(svc.id, { description: e.target.value || null })}
                        className="h-8 text-sm"
                        placeholder="Describe tu servicio"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Botón etiqueta</Label>
                        <Input
                          value={svc.buttonLabel ?? ""}
                          onChange={(e) => handleUpdate(svc.id, { buttonLabel: e.target.value || null })}
                          className="h-8 text-sm"
                          placeholder="Ej: Reservar"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Botón URL</Label>
                        <Input
                          value={svc.buttonUrl ?? ""}
                          onChange={(e) => handleUpdate(svc.id, { buttonUrl: e.target.value || null })}
                          className="h-8 text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, "up")}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === services.length - 1}
                      onClick={() => handleReorder(index, "down")}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <div className="w-px h-2" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(svc.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Enabled toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`svc-enabled-${svc.id}`}
                    checked={svc.enabled}
                    onCheckedChange={(v) => handleUpdate(svc.id, { enabled: v })}
                    className="scale-75"
                  />
                  <Label htmlFor={`svc-enabled-${svc.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {svc.enabled ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
