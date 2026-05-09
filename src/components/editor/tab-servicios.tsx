"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Briefcase,
  GripVertical,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type ServiceData } from "@/lib/editor-store"
import { ImageUploadZone } from "@/components/editor/image-upload-zone"

// ─── Sortable wrapper ──────────────────────────────────────────────
function SortableServiceCard({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden group/svc">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <div
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="shrink-0 pt-1 cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="size-4 text-muted-foreground/40 group-hover/svc:text-muted-foreground/70 transition-colors" />
            </div>
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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

  // ─── Drag & Drop reorder ────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !site) return
    const oldIndex = services.findIndex((s) => s.id === active.id)
    const newIndex = services.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(services, oldIndex, newIndex)
    reordered.forEach((svc, i) => updateService(svc.id, { sortOrder: i }))
    try {
      await Promise.all(
        reordered.map((svc) =>
          fetch(`/api/sites/${siteId}/services`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId: svc.id, sortOrder: reordered.indexOf(svc) }),
          })
        )
      )
      toast.success("Orden actualizado")
    } catch {
      toast.error("Error al reordenar")
    }
  }

  // ─── Image upload callback ──────────────────────────────────────────
  const handleImageUploaded = (serviceId: string) => (url: string) => {
    handleUpdate(serviceId, { imageUrl: url })
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {services.map((svc) => (
                <SortableServiceCard key={svc.id} id={svc.id}>
                  {/* Image */}
                  <div className="shrink-0">
                    <p className="text-[10px] text-muted-foreground mb-1">Recomendado: 800×600px, máximo 3MB</p>
                    <ImageUploadZone
                      onUpload={handleImageUploaded(svc.id)}
                      context="service"
                      folder="services"
                      variant="compact"
                      currentImageUrl={svc.imageUrl}
                    />
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
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(svc.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
                </SortableServiceCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
