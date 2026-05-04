"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  Save,
  Upload,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorStore } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"

interface EditorHeaderProps {
  onSaveDraft: () => void
  onPublish: () => void
  onPreview: () => void
}

export function EditorHeader({ onSaveDraft, onPublish, onPreview }: EditorHeaderProps) {
  const { site, hasUnsavedChanges, isSaving } = useEditorStore()

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
        <TooltipContent>Abrir Kinec en nueva pestaña</TooltipContent>
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
          {isSaving ? "Guardando..." : "Guardar borrador"}
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
    </div>
  )
}
