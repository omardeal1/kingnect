"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
  Type,
  Subtitles,
  MousePointerClick,
  ToggleLeft,
  Pencil,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type SlideData } from "@/lib/editor-store"
import { ImageEditor } from "@/components/editor/image-editor"

interface TabSlidesProps {
  siteId: string
}

const MAX_SLIDES = 5

export function TabSlides({ siteId }: TabSlidesProps) {
  const site = useEditorStore((s) => s.site)
  const addSlide = useEditorStore((s) => s.addSlide)
  const updateSlide = useEditorStore((s) => s.updateSlide)
  const removeSlide = useEditorStore((s) => s.removeSlide)

  const [uploadingSlideId, setUploadingSlideId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [imageEditorOpen, setImageEditorOpen] = React.useState(false)
  const [editingSlideId, setEditingSlideId] = React.useState<string | null>(null)

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

  const handleImageUpload = async (slideId: string, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo no puede superar 2MB")
      return
    }
    setUploadingSlideId(slideId)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Error al subir imagen")
      const data = await res.json()
      updateSlide(slideId, { imageUrl: data.url })
      // Also persist to backend
      await fetch(`/api/sites/${siteId}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, imageUrl: data.url }),
      })
      toast.success("Imagen del slide actualizada")
    } catch {
      toast.error("Error al subir la imagen")
    } finally {
      setUploadingSlideId(null)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const slide = slides[index]
    const prevSlide = slides[index - 1]
    updateSlide(slide.id, { sortOrder: prevSlide.sortOrder })
    updateSlide(prevSlide.id, { sortOrder: slide.sortOrder })
    // Persist both
    fetch(`/api/sites/${siteId}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId: slide.id, sortOrder: prevSlide.sortOrder }),
    })
    fetch(`/api/sites/${siteId}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId: prevSlide.id, sortOrder: slide.sortOrder }),
    })
  }

  const handleMoveDown = (index: number) => {
    if (index >= slides.length - 1) return
    const slide = slides[index]
    const nextSlide = slides[index + 1]
    updateSlide(slide.id, { sortOrder: nextSlide.sortOrder })
    updateSlide(nextSlide.id, { sortOrder: slide.sortOrder })
    fetch(`/api/sites/${siteId}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId: slide.id, sortOrder: nextSlide.sortOrder }),
    })
    fetch(`/api/sites/${siteId}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId: nextSlide.id, sortOrder: slide.sortOrder }),
    })
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

          {slides.map((slide, idx) => (
            <Card key={slide.id} className="overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header: number + toggle + reorder + delete */}
                <div className="flex items-center gap-2">
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
                      className="size-7"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === slides.length - 1}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
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
                  <div className="flex items-start gap-3">
                    {slide.imageUrl ? (
                      <div className="relative size-20 rounded-md border overflow-hidden shrink-0 group/img">
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          onClick={() => handleOpenImageEditor(slide.id)}
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-[#D4A849] text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-[#C49A3D]"
                        >
                          <Pencil className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="size-20 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center shrink-0">
                        <ImageIcon className="size-6 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingSlideId === slide.id}
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) handleImageUpload(slide.id, file)
                          }
                          input.click()
                        }}
                      >
                        {uploadingSlideId === slide.id ? (
                          <Loader2 className="size-4 animate-spin mr-1" />
                        ) : (
                          <Upload className="size-4 mr-1" />
                        )}
                        {uploadingSlideId === slide.id ? "Subiendo..." : "Subir"}
                      </Button>
                      {slide.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive text-xs"
                          onClick={() =>
                            handleUpdateSlide(slide.id, { imageUrl: null })
                          }
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
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
              </div>
            </Card>
          ))}

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
