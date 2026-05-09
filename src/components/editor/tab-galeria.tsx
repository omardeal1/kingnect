"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  GripVertical,
  Camera,
  Pencil,
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
import { useEditorStore, type GalleryImageData } from "@/lib/editor-store"
import { ImageEditor } from "@/components/editor/image-editor"
import { ImageUploadZone } from "@/components/editor/image-upload-zone"

interface TabGaleriaProps {
  siteId: string
}

function SortableGalleryItem({ id, children }: { id: string; children: React.ReactNode }) {
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
    <div ref={setNodeRef} style={style} className="relative">
      {children}
      {/* Drag handle - shown on hover */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 size-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none shadow-sm border"
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>
    </div>
  )
}

export function TabGaleria({ siteId }: TabGaleriaProps) {
  const {
    site,
    addGalleryImage,
    updateGalleryImage,
    removeGalleryImage,
  } = useEditorStore()

  const images = site?.galleryImages ?? []

  const [imageEditorOpen, setImageEditorOpen] = React.useState(false)
  const [editingImageId, setEditingImageId] = React.useState<string | null>(null)

  // ─── Upload callback (receives URL from ImageUploadZone) ───────────────
  const handleImageUploaded = async (url: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: GalleryImageData = {
      id: tempId,
      imageUrl: url,
      caption: null,
      enabled: true,
      sortOrder: images.length,
    }
    addGalleryImage(optimistic)

    try {
      const res = await fetch(`/api/sites/${siteId}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, sortOrder: images.length }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeGalleryImage(tempId)
      addGalleryImage(data.image)
      toast.success("Imagen agregada")
    } catch {
      removeGalleryImage(tempId)
      toast.error("Error al agregar imagen a la galería")
    }
  }

  // ─── Update ─────────────────────────────────────────────────────────
  const handleUpdate = async (imageId: string, fields: Partial<GalleryImageData>) => {
    updateGalleryImage(imageId, fields)
    try {
      await fetch(`/api/sites/${siteId}/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar imagen")
    }
  }

  // ─── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (imageId: string) => {
    removeGalleryImage(imageId)
    try {
      await fetch(`/api/sites/${siteId}/gallery?imageId=${imageId}`, { method: "DELETE" })
      toast.success("Imagen eliminada")
    } catch {
      toast.error("Error al eliminar imagen")
    }
  }

  // ─── Drag & Drop Reorder ──────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !site) return

    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(images, oldIndex, newIndex)

    // Update local state optimistically
    reordered.forEach((img, i) => {
      updateGalleryImage(img.id, { sortOrder: i })
    })

    // Persist to backend
    try {
      await Promise.all(
        reordered.map((img) =>
          fetch(`/api/sites/${siteId}/gallery`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId: img.id, sortOrder: reordered.indexOf(img) }),
          })
        )
      )
      toast.success("Orden actualizado")
    } catch {
      toast.error("Error al reordenar")
    }
  }

  const editingImage = images.find((img) => img.id === editingImageId)

  const handleEditImageSave = async (imageUrl: string) => {
    if (!editingImageId) return
    handleUpdate(editingImageId, { imageUrl })
    setImageEditorOpen(false)
    setEditingImageId(null)
  }

  const handleOpenImageEditor = (imageId: string) => {
    setEditingImageId(imageId)
    setImageEditorOpen(true)
  }

  if (!site) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Galería</h3>
          <p className="text-xs text-muted-foreground">
            Muestra fotos de tu negocio
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <ImageUploadZone
        onUpload={handleImageUploaded}
        context="gallery"
        folder="gallery"
        recommendedSize="800 × 800 px"
      />

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Camera className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin imágenes</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sube fotos para tu galería
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img) => (
                <SortableGalleryItem key={img.id} id={img.id}>
                  <Card className="overflow-hidden group">
                    <div className="relative aspect-square">
                      <img
                        src={img.imageUrl}
                        alt={img.caption || "Imagen de galería"}
                        className={`size-full object-cover ${!img.enabled ? "opacity-50" : ""}`}
                      />
                      {/* Overlay controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-7"
                          onClick={() => handleOpenImageEditor(img.id)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="size-7"
                          onClick={() => handleDelete(img.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      {/* Enabled/disabled indicator */}
                      {!img.enabled && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] bg-background/80 text-muted-foreground px-1.5 py-0.5 rounded">
                            Inactiva
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2 space-y-2">
                      <Input
                        value={img.caption ?? ""}
                        onChange={(e) => handleUpdate(img.id, { caption: e.target.value || null })}
                        className="h-7 text-xs"
                        placeholder="Descripción..."
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`gallery-enabled-${img.id}`}
                          checked={img.enabled}
                          onCheckedChange={(v) => handleUpdate(img.id, { enabled: v })}
                          className="scale-75"
                        />
                        <Label htmlFor={`gallery-enabled-${img.id}`} className="text-xs text-muted-foreground cursor-pointer">
                          {img.enabled ? "Activa" : "Inactiva"}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </SortableGalleryItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Image Editor Dialog */}
      <ImageEditor
        open={imageEditorOpen}
        onOpenChange={(open) => {
          setImageEditorOpen(open)
          if (!open) setEditingImageId(null)
        }}
        currentImageUrl={editingImage?.imageUrl}
        onSave={handleEditImageSave}
        title="Editar imagen de galería"
      />
    </div>
  )
}
