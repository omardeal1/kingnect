"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  MessageSquareQuote,
  Upload,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEditorStore, type TestimonialData } from "@/lib/editor-store"

interface TabTestimoniosProps {
  siteId: string
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0 hover:scale-110 transition-transform"
        >
          <Star
            className={`size-5 ${
              star <= value
                ? "fill-[#D4A849] text-[#D4A849]"
                : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function TabTestimonios({ siteId }: TabTestimoniosProps) {
  const {
    site,
    addTestimonial,
    updateTestimonial,
    removeTestimonial,
  } = useEditorStore()

  const testimonials = site?.testimonials ?? []
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  // ─── Add ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: TestimonialData = {
      id: tempId,
      name: "Cliente",
      photoUrl: null,
      rating: 5,
      content: "",
      enabled: true,
      sortOrder: testimonials.length,
    }
    addTestimonial(optimistic)

    try {
      const res = await fetch(`/api/sites/${siteId}/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Cliente", rating: 5, content: "", sortOrder: testimonials.length }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeTestimonial(tempId)
      addTestimonial(data.testimonial)
      toast.success("Testimonio agregado")
    } catch {
      removeTestimonial(tempId)
      toast.error("Error al agregar testimonio")
    }
  }

  // ─── Update ─────────────────────────────────────────────────────────
  const handleUpdate = async (testimonialId: string, fields: Partial<TestimonialData>) => {
    updateTestimonial(testimonialId, fields)
    try {
      await fetch(`/api/sites/${siteId}/testimonials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonialId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar testimonio")
    }
  }

  // ─── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (testimonialId: string) => {
    removeTestimonial(testimonialId)
    try {
      await fetch(`/api/sites/${siteId}/testimonials?testimonialId=${testimonialId}`, { method: "DELETE" })
      toast.success("Testimonio eliminado")
    } catch {
      toast.error("Error al eliminar testimonio")
    }
  }

  // ─── Reorder ────────────────────────────────────────────────────────
  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (!site) return
    const list = [...testimonials]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    list.forEach((t, i) => {
      updateTestimonial(t.id, { sortOrder: i })
    })

    try {
      await Promise.all(
        list.map((t) =>
          fetch(`/api/sites/${siteId}/testimonials`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testimonialId: t.id, sortOrder: list.indexOf(t) }),
          })
        )
      )
    } catch {
      toast.error("Error al reordenar")
    }
  }

  // ─── Photo upload ───────────────────────────────────────────────────
  const handlePhotoUpload = async (testimonialId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error()
      const { url } = await uploadRes.json()
      handleUpdate(testimonialId, { photoUrl: url })
    } catch {
      toast.error("Error al subir foto")
    }
  }

  const triggerFileInput = (testimonialId: string) => {
    fileInputRefs.current[testimonialId]?.click()
  }

  if (!site) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Testimonios</h3>
          <p className="text-xs text-muted-foreground">
            Muestra lo que dicen tus clientes
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white">
          <Plus className="size-3.5" />
          Agregar testimonio
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageSquareQuote className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin testimonios</p>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega testimonios de tus clientes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t, index) => (
            <Card key={t.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="shrink-0">
                    <input
                      ref={(el) => { fileInputRefs.current[t.id] = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(t.id, file)
                      }}
                    />
                    {t.photoUrl ? (
                      <button
                        onClick={() => triggerFileInput(t.id)}
                        className="size-12 rounded-full overflow-hidden border-2 hover:opacity-80 transition-opacity"
                      >
<img
                          src={t.photoUrl}
                          alt={t.name}
                          className="size-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => triggerFileInput(t.id)}
                        className="size-12 rounded-full border-2 border-dashed flex items-center justify-center hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
                      >
                        <Upload className="size-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={t.name}
                          onChange={(e) => handleUpdate(t.id, { name: e.target.value })}
                          className="h-8 text-sm"
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Estrellas</Label>
                        <div className="h-8 flex items-center">
                          <StarRating
                            value={t.rating}
                            onChange={(v) => handleUpdate(t.id, { rating: v })}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Testimonio</Label>
                      <Textarea
                        value={t.content}
                        onChange={(e) => handleUpdate(t.id, { content: e.target.value })}
                        className="min-h-[60px] text-sm resize-none"
                        placeholder="Lo que dice tu cliente..."
                      />
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
                      disabled={index === testimonials.length - 1}
                      onClick={() => handleReorder(index, "down")}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <div className="w-px h-2" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Enabled toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`t-enabled-${t.id}`}
                    checked={t.enabled}
                    onCheckedChange={(v) => handleUpdate(t.id, { enabled: v })}
                    className="scale-75"
                  />
                  <Label htmlFor={`t-enabled-${t.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {t.enabled ? "Activo" : "Inactivo"}
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
