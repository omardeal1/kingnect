"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Building2,
  Quote,
  FileText,
  Upload,
  Link2,
  Globe,
  Eye,
  Crown,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"

interface TabDatosProps {
  siteId: string
}

export function TabDatos({ siteId }: TabDatosProps) {
  const site = useEditorStore((s) => s.site)
  const updateSite = useEditorStore((s) => s.updateSite)

  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false)
  const [slugChecking, setSlugChecking] = React.useState(false)
  const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(null)
  const slugTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  if (!site) return null

  const handleFileUpload = async (
    file: File,
    field: "logoUrl" | "faviconUrl",
    setUploading: (v: boolean) => void
  ) => {
    const maxMB = field === "logoUrl" ? 2 : 0.5
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`El archivo no puede superar ${maxMB}MB`)
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("preset", field === "logoUrl" ? "avatar" : "thumbnail")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Error al subir archivo")
      }
      const data = await res.json()
      if (data.url) {
        updateSite({ [field]: data.url })
        toast.success("Archivo subido correctamente")
      } else {
        throw new Error("No se recibió la URL del archivo")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  const checkSlugUnique = async (slug: string) => {
    if (!slug || slug === site.slug) {
      setSlugAvailable(null)
      return
    }
    setSlugChecking(true)
    try {
      const res = await fetch(`/api/sites/check-slug?slug=${encodeURIComponent(slug)}&exclude=${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setSlugAvailable(data.available)
      }
    } catch {
      setSlugAvailable(null)
    } finally {
      setSlugChecking(false)
    }
  }

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    updateSite({ slug: sanitized })
    setSlugAvailable(null)
    clearTimeout(slugTimeoutRef.current)
    slugTimeoutRef.current = setTimeout(() => checkSlugUnique(sanitized), 600)
  }

  return (
    <div className="space-y-6">
      {/* Información del negocio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4 text-[#D4A849]" />
            Información del Negocio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre del negocio</Label>
            <Input
              id="businessName"
              value={site.businessName}
              onChange={(e) => updateSite({ businessName: e.target.value })}
              placeholder="Mi Negocio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="flex items-center gap-1.5">
              <Quote className="size-3.5 text-muted-foreground" />
              Frase principal / Tagline
            </Label>
            <Input
              id="tagline"
              value={site.tagline ?? ""}
              onChange={(e) => updateSite({ tagline: e.target.value })}
              placeholder="Una frase que describa tu negocio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-muted-foreground" />
              Descripción
            </Label>
            <Textarea
              id="description"
              value={site.description ?? ""}
              onChange={(e) => updateSite({ description: e.target.value })}
              placeholder="Describe tu negocio, productos o servicios..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo y Favicon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-[#D4A849]" />
            Logo y Favicon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo del negocio</Label>
            <p className="text-xs text-muted-foreground">Recomendado: 500×500px, máximo 2MB</p>
            <div className="flex items-center gap-4">
              {site.logoUrl ? (
                <div className="relative size-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                    <img
                    src={site.logoUrl}
                    alt="Logo"
                    className="size-full object-contain"
                  />
                </div>
              ) : (
                <div className="size-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <ImageIcon className="size-6 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingLogo}
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "logoUrl", setUploadingLogo)
                    }
                    input.click()
                  }}
                >
                  {uploadingLogo ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="size-4 mr-2" />
                  )}
                  {uploadingLogo ? "Subiendo..." : "Subir logo"}
                </Button>
                {site.logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive"
                    onClick={() => updateSite({ logoUrl: null })}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <Label>Favicon</Label>
            <p className="text-xs text-muted-foreground">Recomendado: 64×64px, máximo 512KB</p>
            <div className="flex items-center gap-4">
              {site.faviconUrl ? (
                <div className="relative size-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                    <img
                    src={site.faviconUrl}
                    alt="Favicon"
                    className="size-full object-contain"
                  />
                </div>
              ) : (
                <div className="size-10 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Globe className="size-4 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingFavicon}
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "faviconUrl", setUploadingFavicon)
                    }
                    input.click()
                  }}
                >
                  {uploadingFavicon ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="size-4 mr-2" />
                  )}
                  {uploadingFavicon ? "Subiendo..." : "Subir favicon"}
                </Button>
                {site.faviconUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive"
                    onClick={() => updateSite({ faviconUrl: null })}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slug personalizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4 text-[#D4A849]" />
            Slug Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="slug">URL de tu QAIROSS</Label>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 h-9 text-sm text-muted-foreground">
                {APP_URL.replace("https://", "")}/
              </span>
              <Input
                id="slug"
                value={site.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="rounded-l-none"
                placeholder="mi-negocio"
              />
            </div>
          </div>
          {slugChecking && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Verificando disponibilidad...
            </p>
          )}
          {slugAvailable === true && (
            <p className="text-xs text-green-600 font-medium">✓ Slug disponible</p>
          )}
          {slugAvailable === false && (
            <p className="text-xs text-destructive font-medium">✗ Este slug ya está en uso</p>
          )}
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="size-4 text-[#D4A849]" />
            Visibilidad y Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Publicado</Label>
              <p className="text-xs text-muted-foreground">
                {site.isPublished
                  ? "Tu QAIROSS es visible públicamente"
                  : "Tu QAIROSS está en modo borrador"}
              </p>
            </div>
            <Switch
              checked={site.isPublished}
              onCheckedChange={(checked) => updateSite({ isPublished: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-1.5">
                <Crown className="size-3.5 text-[#D4A849]" />
                Mostrar &quot;Hecho por QAIROSS&quot;
              </Label>
              <p className="text-xs text-muted-foreground">
                Muestra la marca QAIROSS en tu QAIROSS
              </p>
            </div>
            <Switch
              checked={site.showKingBrand}
              onCheckedChange={(checked) => updateSite({ showKingBrand: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
