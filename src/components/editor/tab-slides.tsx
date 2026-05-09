"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Type,
  Subtitles,
  MousePointerClick,
  ToggleLeft,
  Pencil,
} from "lucide-react"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type SlideData } from "@/lib/editor-store"
import { ImageEditor } from "@/components/editor/image-editor"
import { ImageUploadZone } from "@/components/editor/image-upload-zone"

interface TabSlidesProps {
  siteId: string
}

const MAX_SLIDES = 5

function SortableSlideCard({
  id,
  children,
}: {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (dragProps: { attributes: any; listeners: any; setActivatorNodeRef: (node: HTMLElement | null) => void }) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1, zIndex: isDragging ? 50 : "auto" }
  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden group/slide">
        <div className="p-4 space-y-3">
          {children({ attributes, listeners, setActivatorNodeRef })}
        </div>
      </Card>
    </div>
  )
}

export function TabSlides({ siteId }: TabSlidesProps) {
  const site = useEditorStore((s) => s.site)
  const addSlide = useEditorStore((s) => s.addSlide)
  const updateSlide = useEditorStore((s) => s.updateSlide)
  const removeSlide = useEditorStore((s) => s.removeSlide)

  const [saving, setSaving] = React.useState(false)
  const [imageEditorOpen, setImageEditorOpen] = React.useState(false)
  const [editingSlideId, setEditingSlideId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  if (!site) return null

  const slides = [...(site.slides ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)

  const editingSlide = slides.find((s) => s.id === editingSlideId)

  const handleEditImageSave = async (imageUrl: string) => {
    if (!editingSlideId) return
    handleUpdateSlide(editingSlideId, { imageUrl })
    setImageEditorOpen(false)
    setEditingSlideId(null)
  }

  const handleOpenImageEditor = (slideId: string) => {
    setEditingSlideId(slideId)
    setImageEditorOpen(true)
  }

  const handleAddSlide = async () => {
    if (slides.length >= MAX_SLIDES) {
      toast.error(`Máximo ${MAX_SLIDES} slides permitidos`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: null,
          subtitle: null,
          buttonLabel: null,
          buttonUrl: null,
          imageUrl: null,
          enabled: true,
          sortOrder: slides.length,
        }),
      })
      if (!res.ok) throw new Error("Error al crear slide")
      const data = await res.json()
      addSlide({
        id: data.slide.id,
        imageUrl: data.slide.imageUrl,
        title: data.slide.title,
        subtitle: data.slide.subtitle,
        buttonLabel: data.slide.buttonLabel,
        buttonUrl: data.slide.buttonUrl,
        enabled: data.slide.enabled,
        sortOrder: data.slide.sortOrder,
      })
      toast.success("Slide agregado")
    } catch {
      toast.error("Error al agregar slide")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSlide = async (
    slideId: string,
    fields: Partial<SlideData>
  ) => {
    updateSlide(slideId, fields)
    try {
      await fetch(`/api/sites/${siteId}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, ...fields }),
      })
    } catch {
      // Silent - store is primary
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    try {
      const res = await fetch(
        `/api/sites/${siteId}/slides?slideId=${slideId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Error al eliminar")
      removeSlide(slideId)
      toast.success("Slide eliminado")
    } catch {
      toast.error("Error al eliminar slide")
    }
  }

  const handleSlideImageUploaded = (slideId: string) => (url: string) => {
    updateSlide(slideId, { imageUrl: url })
    // Also persist to backend
    fetch(`/api/sites/${siteId}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId, imageUrl: url }),
    })
    toast.success("Imagen del slide actualizada")
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((s) => s.id === active.id)
    const newIndex = slides.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(slides, oldIndex, newIndex)
    // Update store optimistically
    reordered.forEach((s, i) => updateSlide(s.id, { sortOrder: i }))
    // Persist
    try {
      await Promise.all(
        reordered.map((s) =>
          fetch(`/api/sites/${siteId}/slides`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slideId: s.id, sortOrder: reordered.indexOf(s) }),
          })
        )
      )
      toast.success("Orden actualizado")
    } catch { toast.error("Error al reordenar") }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="size-4 text-[#D4A849]" />
              Slides / Carrusel
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {slides.length}/{MAX_SLIDES}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {slides.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay slides. Agrega uno para crear tu carrusel.
            </p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {slides.map((slide, idx) => (
            <SortableSlideCard key={slide.id} id={slide.id}>
              {({ attributes, listeners, setActivatorNodeRef }) => (
                <>
                {/* Header: number + toggle + reorder + delete */}
                <div className="flex items-center gap-2">
                  <div ref={setActivatorNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
                    <GripVertical className="size-4 text-muted-foreground/40 group-hover/slide:text-muted-foreground/70 transition-colors" />
                  </div>
                  <span className="flex items-center justify-center size-6 rounded-full bg-[#D4A849] text-white text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">
                    Slide {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-muted-foreground">Activo</Label>
                      <Switch
                        checked={slide.enabled}
                        onCheckedChange={(checked) =>
                          handleUpdateSlide(slide.id, { enabled: checked })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => handleDeleteSlide(slide.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <Label className="text-xs">Imagen</Label>
                  <p className="text-[10px] text-muted-foreground">Recomendado: 1920×1080px, máximo 5MB</p>
                  <div className="flex items-start gap-3">
                    <ImageUploadZone
                      onUpload={handleSlideImageUploaded(slide.id)}
                      context="slide"
                      folder="slides"
                      variant="compact"
                      currentImageUrl={slide.imageUrl}
                    />
                    {slide.imageUrl && (
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive text-xs"
                          onClick={() => handleUpdateSlide(slide.id, { imageUrl: null })}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Type className="size-3" /> Título
                    </Label>
                    <Input
                      value={slide.title ?? ""}
                      onChange={(e) =>
                        handleUpdateSlide(slide.id, { title: e.target.value || null })
                      }
                      placeholder="Título del slide"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Subtitles className="size-3" /> Subtítulo
                    </Label>
                    <Input
                      value={slide.subtitle ?? ""}
                      onChange={(e) =>
                        handleUpdateSlide(slide.id, {
                          subtitle: e.target.value || null,
                        })
                      }
                      placeholder="Subtítulo opcional"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Button label & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <MousePointerClick className="size-3" /> Texto del botón
                    </Label>
                    <Input
                      value={slide.buttonLabel ?? ""}
                      onChange={(e) =>
                        handleUpdateSlide(slide.id, {
                          buttonLabel: e.target.value || null,
                        })
                      }
                      placeholder="Ej: Ver más"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <ToggleLeft className="size-3" /> URL del botón
                    </Label>
                    <Input
                      value={slide.buttonUrl ?? ""}
                      onChange={(e) =>
                        handleUpdateSlide(slide.id, {
                          buttonUrl: e.target.value || null,
                        })
                      }
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                </>
              )}
            </SortableSlideCard>
          ))}
          </SortableContext>
          </DndContext>

          {/* Add slide button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSlide}
            disabled={saving || slides.length >= MAX_SLIDES}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Plus className="size-4 mr-2" />
            )}
            Agregar slide
          </Button>

          {slides.length >= MAX_SLIDES && (
            <p className="text-xs text-muted-foreground text-center">
              Has alcanzado el máximo de {MAX_SLIDES} slides
            </p>
          )}
        </CardContent>
      </Card>

      {/* Image Editor Dialog */}
      <ImageEditor
        open={imageEditorOpen}
        onOpenChange={(open) => {
          setImageEditorOpen(open)
          if (!open) setEditingSlideId(null)
        }}
        currentImageUrl={editingSlide?.imageUrl}
        onSave={handleEditImageSave}
        aspectRatio="landscape"
        title="Editar imagen del slide"
      />
    </div>
  )
}
