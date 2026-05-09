"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, LayoutTemplate } from "lucide-react"
import { SITE_TEMPLATES, type SiteTemplate } from "@/lib/template-constants"
import { useEditorStore } from "@/lib/editor-store"
import { cn } from "@/lib/utils"

export function TemplateSelector() {
  const { site, updateSite } = useEditorStore()
  const currentTemplate = (site?.siteTemplate || "classic") as SiteTemplate

  const handleSelect = (templateId: SiteTemplate) => {
    updateSite({ siteTemplate: templateId })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutTemplate className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Selecciona tu Plantilla</h3>
          <p className="text-sm text-muted-foreground">
            Elige el diseño que mejor represente tu negocio. Puedes cambiarlo en cualquier momento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SITE_TEMPLATES.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300",
              currentTemplate === template.id
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-transparent hover:border-muted-foreground/20"
            )}
            onClick={() => handleSelect(template.id)}
          >
            {/* Selected indicator */}
            {currentTemplate === template.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}

            {/* Preview */}
            <div
              className="h-48 relative overflow-hidden"
              style={{ backgroundColor: template.previewColors.background }}
            >
              {/* Mock layout preview */}
              <div className="p-4 h-full flex flex-col">
                {/* Header mock */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: template.previewColors.primary }}
                  />
                  <div className="flex-1">
                    <div
                      className="h-2 w-20 rounded"
                      style={{ backgroundColor: template.previewColors.primary, opacity: 0.7 }}
                    />
                  </div>
                </div>

                {/* Slider mock */}
                <div
                  className="h-16 rounded-lg mb-3 flex items-center justify-center"
                  style={{ backgroundColor: template.previewColors.secondary, opacity: 0.3 }}
                >
                  <span className="text-[8px]" style={{ color: template.previewColors.primary }}>
                    Slider
                  </span>
                </div>

                {/* Content mock */}
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded"
                      style={{
                        backgroundColor: template.previewColors.accent,
                        opacity: 0.15 + (i % 3) * 0.1,
                        height: template.id === "medical" ? "100%" : "auto",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom bar mock for medical template */}
              {template.id === "medical" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-around px-4"
                  style={{ backgroundColor: template.previewColors.primary }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: "white", opacity: 0.5 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 bg-card">
              <h4 className="font-semibold text-sm">{template.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {template.description.es}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
