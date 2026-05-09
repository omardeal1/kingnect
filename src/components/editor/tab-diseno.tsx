"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Palette,
  Paintbrush,
  Moon,
  Sun,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImageUploadZone } from "@/components/editor/image-upload-zone"
import { useEditorStore } from "@/lib/editor-store"
import {
  COLOR_PRESETS,
  BACKGROUND_TYPES,
  type ColorPreset,
} from "@/lib/constants"

export function TabDiseno() {
  const site = useEditorStore((s) => s.site)
  const updateSite = useEditorStore((s) => s.updateSite)

  if (!site) return null

  const isPresetActive = (preset: ColorPreset) =>
    preset.backgroundColor === site.backgroundColor &&
    preset.cardColor === site.cardColor &&
    preset.textColor === site.textColor &&
    preset.accentColor === site.accentColor

  const applyPreset = (preset: ColorPreset) => {
    updateSite({
      backgroundColor: preset.backgroundColor,
      cardColor: preset.cardColor,
      textColor: preset.textColor,
      accentColor: preset.accentColor,
    })
    toast.success(`Preset "${preset.name}" aplicado`)
  }

  const handleBgImageUploaded = (url: string) => {
    updateSite({ backgroundImageUrl: url })
    toast.success("Imagen de fondo subida correctamente")
  }

  return (
    <div className="space-y-6">
      {/* Color presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-[#D4A849]" />
            Presets de Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COLOR_PRESETS.map((preset) => {
              const active = isPresetActive(preset)
              return (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                    active
                      ? "border-[#D4A849] shadow-md bg-[#D4A849]/5"
                      : "border-transparent bg-muted/30 hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex gap-1">
                    <span
                      className="size-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: preset.backgroundColor }}
                    />
                    <span
                      className="size-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: preset.cardColor }}
                    />
                    <span
                      className="size-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {preset.name}
                  </span>
                  {active && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#D4A849] flex items-center justify-center">
                      <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="size-4 text-[#D4A849]" />
            Colores Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "backgroundColor" as const, label: "Fondo" },
              { key: "cardColor" as const, label: "Tarjetas" },
              { key: "textColor" as const, label: "Texto" },
              { key: "accentColor" as const, label: "Acento" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm">{label}</Label>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <span
                      className="block size-9 rounded-md border shadow-sm"
                      style={{ backgroundColor: site[key] }}
                    />
                    <input
                      type="color"
                      value={site[key]}
                      onChange={(e) => updateSite({ [key]: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer size-full"
                    />
                  </label>
                  <Input
                    value={site[key]}
                    onChange={(e) => updateSite({ [key]: e.target.value })}
                    className="h-9 font-mono text-xs flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Background type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Fondo del Sitio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={site.backgroundType}
            onValueChange={(value) => updateSite({ backgroundType: value })}
            className="grid grid-cols-3 gap-2"
          >
            {BACKGROUND_TYPES.map((bt) => (
              <label
                key={bt.value}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 cursor-pointer transition-all text-sm font-medium ${
                  site.backgroundType === bt.value
                    ? "border-[#D4A849] bg-[#D4A849]/5"
                    : "border-transparent bg-muted/30 hover:border-muted-foreground/20"
                }`}
              >
                <RadioGroupItem value={bt.value} className="sr-only" />
                {bt.label}
              </label>
            ))}
          </RadioGroup>

          {site.backgroundType === "gradient" && (
            <div className="space-y-2">
              <Label>CSS del degradado</Label>
              <Textarea
                value={site.backgroundGradient ?? ""}
                onChange={(e) => updateSite({ backgroundGradient: e.target.value })}
                placeholder="linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #16213E 100%)"
                rows={3}
                className="font-mono text-xs"
              />
              {site.backgroundGradient && (
                <div
                  className="h-12 rounded-md border"
                  style={{ background: site.backgroundGradient }}
                />
              )}
            </div>
          )}

          {site.backgroundType === "image" && (
            <div className="space-y-3">
              <Label>Imagen de fondo</Label>
              {site.backgroundImageUrl && (
                <div className="relative h-24 rounded-md border overflow-hidden">
                  <img
                    src={site.backgroundImageUrl}
                    alt="Fondo"
                    className="size-full object-cover"
                  />
                </div>
              )}
              <ImageUploadZone
                onUpload={handleBgImageUploaded}
                context="background"
                folder="backgrounds"
                variant="inline"
                currentImageUrl={site.backgroundImageUrl}
                recommendedSize="1920 × 1080 px"
              />
              {site.backgroundImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive text-xs"
                  onClick={() => updateSite({ backgroundImageUrl: null })}
                >
                  Eliminar imagen de fondo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-4 text-[#D4A849]" />
            Modo de Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-1.5">
                <Sun className="size-3.5" />
                Permitir modo oscuro
              </Label>
              <p className="text-xs text-muted-foreground">
                Los visitantes podrán alternar entre modo claro y oscuro
              </p>
            </div>
            <Switch
              checked={site.themeMode === "both"}
              onCheckedChange={(checked) =>
                updateSite({ themeMode: checked ? "both" : "light" })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
