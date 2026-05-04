"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Search,
  Globe,
  Info,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEditorStore } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"

const MAX_META_DESC = 160

export function TabSeo() {
  const { site, updateSite } = useEditorStore()

  const metaTitle = site?.metaTitle ?? ""
  const metaDescription = site?.metaDescription ?? ""
  const slug = site?.slug ?? ""

  // ─── Auto-save debounce ─────────────────────────────────────────────
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleUpdate = (fields: { metaTitle?: string; metaDescription?: string }) => {
    updateSite(fields)

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/sites/${site!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        })
        toast.success("SEO actualizado")
      } catch {
        toast.error("Error al guardar SEO")
      }
    }, 800)
  }

  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  if (!site) return null

  const charCount = metaDescription.length
  const isOverLimit = charCount > MAX_META_DESC

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">SEO Básico</h3>
        <p className="text-xs text-muted-foreground">
          Optimiza cómo aparece tu mini web en buscadores
        </p>
      </div>

      {/* Meta Title */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="size-4 text-[#D4A849]" />
            <Label className="text-sm font-medium">Meta Título</Label>
          </div>
          <Input
            value={metaTitle}
            onChange={(e) => handleUpdate({ metaTitle: e.target.value })}
            className="text-sm"
            placeholder="Título para buscadores (50-60 caracteres)"
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground">
            Se recomienda entre 50 y 60 caracteres. Actual: {metaTitle.length}
          </p>
        </CardContent>
      </Card>

      {/* Meta Description */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="size-4 text-[#D4A849]" />
            <Label className="text-sm font-medium">Meta Descripción</Label>
          </div>
          <Textarea
            value={metaDescription}
            onChange={(e) => {
              if (e.target.value.length <= MAX_META_DESC + 10) {
                handleUpdate({ metaDescription: e.target.value })
              }
            }}
            className="min-h-[80px] text-sm resize-none"
            placeholder="Descripción para buscadores (máximo 160 caracteres)"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Describe tu negocio en pocas palabras
            </p>
            <span className={`text-xs font-medium ${
              isOverLimit ? "text-destructive" : charCount > 140 ? "text-amber-500" : "text-muted-foreground"
            }`}>
              {charCount}/{MAX_META_DESC}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph note */}
      <Card className="border-[#D4A849]/20 bg-[#D4A849]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="size-4 text-[#D4A849] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Open Graph</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Open Graph se genera automáticamente a partir de los datos de tu mini web.
                El título, descripción e imagen se tomarán de la información que ya configuraste.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slug / URL display */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-[#D4A849]" />
            <Label className="text-sm font-medium">URL de tu mini web</Label>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border">
            <code className="text-sm font-mono text-foreground/80 truncate">
              {APP_URL}/{slug}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Esta es la URL pública de tu mini web. Se basa en el nombre de tu negocio.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
