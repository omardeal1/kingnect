"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  Save,
  Upload,
  Circle,
  GitCompareArrows,
  RefreshCw,
  PanelLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEditorStore } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"
import { toast } from "sonner"

interface EditorHeaderProps {
  onSaveDraft: () => void
  onPublish: () => void
  onPreview: () => void
  onRefreshPreview: () => void
  onOpenMenu: () => void
}

export function EditorHeader({ onSaveDraft, onPublish, onPreview, onRefreshPreview, onOpenMenu }: EditorHeaderProps) {
  const { site, hasUnsavedChanges, isSaving } = useEditorStore()
  const [showChangesDialog, setShowChangesDialog] = React.useState(false)

  // Track original site data for change comparison
  const originalSiteRef = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (site && !originalSiteRef.current) {
      originalSiteRef.current = JSON.stringify({
        businessName: site.businessName,
        tagline: site.tagline,
        description: site.description,
        logoUrl: site.logoUrl,
        faviconUrl: site.faviconUrl,
        backgroundType: site.backgroundType,
        backgroundColor: site.backgroundColor,
        backgroundGradient: site.backgroundGradient,
        backgroundImageUrl: site.backgroundImageUrl,
        cardColor: site.cardColor,
        textColor: site.textColor,
        accentColor: site.accentColor,
        themeMode: site.themeMode,
        showKingBrand: site.showKingBrand,
        buttonStyle: site.buttonStyle,
        menuTemplate: site.menuTemplate,
        siteTemplate: site.siteTemplate,
        metaTitle: site.metaTitle,
        metaDescription: site.metaDescription,
      })
    }
  }, [site])

  const getChangesList = (): { field: string; before: string; after: string }[] => {
    if (!site || !originalSiteRef.current) return []
    const original = JSON.parse(originalSiteRef.current)
    const fieldLabels: Record<string, string> = {
      businessName: "Nombre del negocio",
      tagline: "Eslogan",
      description: "Descripción",
      logoUrl: "Logo",
      faviconUrl: "Favicon",
      backgroundType: "Tipo de fondo",
      backgroundColor: "Color de fondo",
      backgroundGradient: "Degradado de fondo",
      backgroundImageUrl: "Imagen de fondo",
      cardColor: "Color de tarjeta",
      textColor: "Color de texto",
      accentColor: "Color de acento",
      themeMode: "Modo de tema",
      showKingBrand: "Mostrar marca Kingnect",
      buttonStyle: "Estilo de botones",
      menuTemplate: "Plantilla de menú",
      siteTemplate: "Plantilla del sitio",
      metaTitle: "Meta título",
      metaDescription: "Meta descripción",
    }
    const changes: { field: string; before: string; after: string }[] = []
    for (const key of Object.keys(original)) {
      const currentVal = JSON.stringify(site[key as keyof typeof site] ?? null)
      const originalVal = JSON.stringify(original[key] ?? null)
      if (currentVal !== originalVal) {
        const label = fieldLabels[key] || key
        const displayBefore = original[key] ?? "(vacío)"
        const displayAfter = String(site[key as keyof typeof site] ?? "(vacío)")
        changes.push({ field: label, before: String(displayBefore), after: displayAfter })
      }
    }
    return changes
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Unsaved changes indicator */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
              <Circle className="size-2 fill-current" />
              Sin guardar
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ver cambios button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const changes = getChangesList()
              if (changes.length === 0 && site) {
                toast.info("No hay cambios sin guardar")
                return
              }
              setShowChangesDialog(true)
            }}
            disabled={!site}
            className="gap-1.5"
          >
            <GitCompareArrows className="size-3.5" />
            <span className="hidden sm:inline">Ver cambios</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver resumen de cambios sin guardar</TooltipContent>
      </Tooltip>

      {/* Refrescar vista previa button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshPreview}
            disabled={!site}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">Refrescar vista previa</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Forzar actualización de la vista previa</TooltipContent>
      </Tooltip>

      {/* Abrir menú button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMenu}
            className="gap-1.5"
          >
            <PanelLeft className="size-3.5" />
            <span className="hidden sm:inline">Abrir menú</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ir a la sección del menú</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      {/* Preview button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">Vista previa</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Abrir QAIROSS en nueva pestaña</TooltipContent>
      </Tooltip>

      {/* Save draft button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={isSaving || !hasUnsavedChanges}
        className="gap-1.5"
      >
        <Save className="size-3.5" />
        <span className="hidden sm:inline">
          {isSaving ? "Actualizando..." : "Actualizar"}
        </span>
      </Button>

      {/* Publish button */}
      <Button
        size="sm"
        onClick={onPublish}
        disabled={isSaving}
        className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white"
      >
        <Upload className="size-3.5" />
        <span className="hidden sm:inline">
          {isSaving ? "Publicando..." : "Publicar"}
        </span>
      </Button>
      {/* Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambios sin guardar</DialogTitle>
          </DialogHeader>
          {(() => {
            const changes = getChangesList()
            return changes.length > 0 ? (
              <div className="space-y-3 mt-2">
                <p className="text-sm text-muted-foreground">
                  Se detectaron {changes.length} cambio{changes.length !== 1 ? "s" : ""}:
                </p>
                {changes.map((change, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1">
                    <p className="text-sm font-medium">{change.field}</p>
                    <p className="text-xs text-muted-foreground">
                      Antes: <span className="line-through">{change.before}</span>
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Después: {change.after}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No hay cambios pendientes.</p>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
