"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, MessageCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useEditorStore } from "@/lib/editor-store"
import { useTranslations } from "@/i18n/provider"
import { ButtonRenderer, type ButtonStyleType } from "@/components/minisite/button-styles/button-renderer"

const BUTTON_STYLES: { value: ButtonStyleType; nameKey: string; descKey: string }[] = [
  { value: "cylinder_pill", nameKey: "packages.cylinder_pill", descKey: "packages.cylinder_pill_desc" },
  { value: "square_soft", nameKey: "packages.square_soft", descKey: "packages.square_soft_desc" },
  { value: "icon_only", nameKey: "packages.icon_only", descKey: "packages.icon_only_desc" },
  { value: "glassmorphism", nameKey: "packages.glassmorphism", descKey: "packages.glassmorphism_desc" },
  { value: "outline_elegant", nameKey: "packages.outline_elegant", descKey: "packages.outline_elegant_desc" },
]

export function TabBotones() {
  const site = useEditorStore((s) => s.site)
  const updateSite = useEditorStore((s) => s.updateSite)
  const { t } = useTranslations("editor.buttons")

  const [saving, setSaving] = React.useState(false)

  if (!site) return null

  const currentStyle = (site as unknown as Record<string, unknown>).buttonStyle as ButtonStyleType || "cylinder_pill"

  const handleSelect = (style: ButtonStyleType) => {
    updateSite({ buttonStyle: style } as any)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      toast.success(t("save") || "Estilo guardado")
    } catch {
      toast.error("Error al guardar el estilo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUTTON_STYLES.map((style) => {
              const isActive = currentStyle === style.value
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => handleSelect(style.value)}
                  className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-[#D4A849] bg-[#D4A849]/5 shadow-sm"
                      : "border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20"
                  }`}
                >
                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D4A849] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* Name */}
                  <p className="font-medium text-sm mb-1">{t(style.nameKey)}</p>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-4">{t(style.descKey)}</p>

                  {/* Preview */}
                  <div className="bg-background/80 dark:bg-background/50 rounded-lg p-3 flex items-center justify-center">
                    {style.value === "icon_only" ? (
                      <div className="flex gap-2">
                        <ButtonRenderer
                          style={style.value}
                          icon={<MessageCircle className="w-4 h-4" />}
                          label="WhatsApp"
                          accentColor="#D4A849"
                        />
                        <ButtonRenderer
                          style={style.value}
                          icon={<MessageCircle className="w-4 h-4" />}
                          label="Llamar"
                          accentColor="#D4A849"
                        />
                        <ButtonRenderer
                          style={style.value}
                          icon={<MessageCircle className="w-4 h-4" />}
                          label="Email"
                          accentColor="#D4A849"
                        />
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        <ButtonRenderer
                          style={style.value}
                          icon={<MessageCircle className="w-4 h-4" />}
                          label="WhatsApp"
                          accentColor="#D4A849"
                        />
                        <ButtonRenderer
                          style={style.value}
                          icon={<MessageCircle className="w-4 h-4" />}
                          label="Llamar"
                          accentColor="#D4A849"
                        />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Preview label */}
          <div className="mt-4 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">{t("preview")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
