"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Camera,
  Upload,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type GalleryImageData } from "@/lib/editor-store"

interface TabGaleriaProps {
  siteId: string
}

export function TabGaleria({ siteId }: TabGaleriaProps) {
  const {
    site,
    addGalleryImage,
    updateGalleryImage,
    removeGalleryImage,
  } = useEditorStore()

  const images = site?.galleryImages ?? []
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // ─── Upload + create ────────────────────────────────────────────────
  const handleAddImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error()
      const { url } = await uploadRes.json()

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const optimistic: GalleryImageData = {
        id: tempId,
        imageUrl: url,
        caption: null,
        enabled: true,
        sortOrder: images.length,
      }
      addGalleryImage(optimistic)

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
      toast.error("Error al subir imagen")
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

  // ─── Reorder ────────────────────────────────────────────────────────
  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (!site) return
    const list = [...images]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]

    // Update sort orders
    list.forEach((img, i) => {
      updateGalleryImage(img.id, { sortOrder: i })
    })

    try {
      await Promise.all(
        list.map((img) =>
          fetch(`/api/sites/${siteId}/gallery`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId: img.id, sortOrder: list.indexOf(img) }),
          })
        )
      )
    } catch {
      toast.error("Error al reordenar")
    }
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
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleAddImage(file)
              e.target.value = ""
            }}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white"
          >
            <Plus className="size-3.5" />
            Agregar imagen
          </Button>
        </div>
      </div>

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <Card key={img.id} className="overflow-hidden group">
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
                    disabled={index === 0}
                    onClick={() => handleReorder(index, "up")}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    disabled={index === images.length - 1}
                    onClick={() => handleReorder(index, "down")}
                  >
                    <ArrowDown className="size-3.5" />
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
          ))}
        </div>
      )}

      {/* Upload area at bottom for easy drag-like usage */}
      {images.length > 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Haz clic para subir más imágenes</p>
        </div>
      )}
    </div>
  )
}
