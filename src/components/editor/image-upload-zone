"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Upload,
  Loader2,
  X,
  ImageIcon,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IMAGE_PRESETS, type ImagePreset } from "@/lib/image-processing"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  metadata?: {
    width: number
    height: number
    format: string
    size: number
    originalSize: number
    compressionRatio: number
    sizeFormatted: string
    originalSizeFormatted: string
    savedFormatted: string
  }
}

type Variant = "full" | "compact" | "avatar" | "inline"

interface ImageUploadZoneProps {
  /** Called when upload completes successfully */
  onUpload: (url: string, metadata?: UploadResult["metadata"]) => void
  /** Upload context (gallery, menuItem, slide, testimonial, background, service, logo) */
  context?: keyof typeof IMAGE_PRESETS
  /** Visual variant */
  variant?: Variant
  /** Folder in storage bucket */
  folder?: string
  /** Max file size in MB (default: 10) */
  maxSizeMB?: number
  /** Current image URL (for preview) */
  currentImageUrl?: string | null
  /** Override aspect hint text */
  aspectHint?: string
  /** Accent color (default: #D4A849) */
  accentColor?: string
  /** Additional CSS classes */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ImageUploadZone({
  onUpload,
  context = "general",
  variant = "full",
  folder,
  maxSizeMB = 10,
  currentImageUrl,
  aspectHint,
  accentColor = "#D4A849",
  className,
  disabled = false,
}: ImageUploadZoneProps) {
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState<string>("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const preset = IMAGE_PRESETS[context] ?? IMAGE_PRESETS.general

  // Cleanup preview URLs
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // ─── Handle file selection / drop ─────────────────────────────────────
  const processFile = React.useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo debe ser una imagen (JPG, PNG, GIF, WebP)")
        return
      }

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        toast.error(`El archivo excede ${maxSizeMB}MB`)
        return
      }

      // Show preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Start upload
      setUploading(true)
      setUploadProgress("Procesando imagen...")

      try {
        const formData = new FormData()
        formData.append("file", file)
        if (folder) formData.append("folder", folder)
        if (context) formData.append("context", context)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Error al subir imagen")
        }

        const data: UploadResult = await res.json()

        // Success feedback with compression info
        if (data.metadata && data.metadata.compressionRatio > 0) {
          toast.success(
            `Imagen optimizada: ${data.metadata.sizeFormatted} ` +
            `(${data.metadata.savedFormatted} más pequeña)`,
            { description: `${data.metadata.width}×${data.metadata.height}px · WebP` }
          )
        } else {
          toast.success("Imagen subida correctamente")
        }

        onUpload(data.url, data.metadata)
        setPreview(null)
      } catch (err: any) {
        toast.error(err.message || "Error al subir imagen")
        setPreview(null)
      } finally {
        setUploading(false)
        setUploadProgress("")
      }
    },
    [context, folder, maxSizeMB, onUpload]
  )

  // ─── Event handlers ────────────────────────────────────────────────────
  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      if (disabled || uploading) return
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile, disabled, uploading]
  )

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !uploading) setDragOver(true)
    },
    [disabled, uploading]
  )

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      e.target.value = ""
    },
    [processFile]
  )

  const clearPreview = React.useCallback(() => {
    setPreview(null)
  }, [])

  // ─── Render: Compact variant ──────────────────────────────────────────
  // Small upload button/placeholder — used in menu items, services, slides
  if (variant === "compact") {
    return (
      <>
        {preview ? (
          <div className="relative size-16 rounded-md overflow-hidden border border-[#D4A849]/30">
            <img
              src={preview}
              alt="Preview"
              className="size-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="size-5 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : currentImageUrl ? (
          <div className="relative group/img">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="size-16 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
            >
              <img
                src={currentImageUrl}
                alt="Imagen actual"
                className="size-full object-cover"
              />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                <Loader2 className="size-5 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="size-16 rounded-md border-2 border-dashed flex items-center justify-center hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
            style={{ borderColor: `${accentColor}50` }}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </>
    )
  }

  // ─── Render: Avatar variant ───────────────────────────────────────────
  // Circular upload zone — used for testimonial photos
  if (variant === "avatar") {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
        {preview ? (
          <div className="relative size-14 rounded-full overflow-hidden border-2 border-[#D4A849]/40">
            <img src={preview} alt="Preview" className="size-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="size-4 text-white animate-spin" />
              </div>
            )}
            <button
              onClick={clearPreview}
              className="absolute top-0 right-0 size-4 rounded-full bg-destructive text-white flex items-center justify-center"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ) : currentImageUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="size-14 rounded-full overflow-hidden border-2 hover:opacity-80 transition-opacity"
            style={{ borderColor: `${accentColor}50` }}
          >
            <img src={currentImageUrl} alt="Foto" className="size-full object-cover" />
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="size-14 rounded-full border-2 border-dashed flex items-center justify-center hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
            style={{ borderColor: `${accentColor}40` }}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
          </button>
        )}
        {/* Dimension tip */}
        <p className="text-[10px] text-muted-foreground text-center mt-1 leading-tight">
          {preset.recommended}
        </p>
      </div>
    )
  }

  // ─── Render: Inline variant ───────────────────────────────────────────
  // Horizontal upload bar — used for background images
  if (variant === "inline") {
    return (
      <>
        {preview && (
          <div className="relative rounded-md overflow-hidden border mb-2">
            <img src={preview} alt="Preview" className="w-full max-h-32 object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
              {uploading ? (
                <Loader2 className="size-5 text-white animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="size-5 text-green-400" />
                  <span className="text-white text-xs font-medium">Imagen lista</span>
                </>
              )}
            </div>
            {!uploading && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer",
            dragOver
              ? "border-[#D4A849] bg-[#D4A849]/10"
              : "border-muted-foreground/25 hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5",
            (disabled || uploading) && "opacity-50 pointer-events-none",
            className
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground shrink-0" />
          ) : (
            <Upload className="size-5 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {uploading ? uploadProgress : currentImageUrl ? "Cambiar imagen" : "Subir imagen"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Recomendado: {preset.recommended} · Máx. {maxSizeMB}MB
            </p>
          </div>
          {dragOver && (
            <span className="text-xs font-medium" style={{ color: accentColor }}>
              Soltar aquí
            </span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </>
    )
  }

  // ─── Render: Full variant (default) ───────────────────────────────────
  // Full drag-and-drop zone — used for gallery, empty states
  return (
    <>
      {/* Preview overlay */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden border mb-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="size-5 text-white animate-spin" />
                <span className="text-white text-xs font-medium">{uploadProgress}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5 text-green-400" />
                <span className="text-white text-xs font-medium">Imagen lista</span>
              </>
            )}
          </div>
          {!uploading && (
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 size-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer",
          dragOver
            ? "border-[#D4A849] bg-[#D4A849]/10 scale-[1.01]"
            : "border-muted-foreground/20 hover:border-[#D4A849]/40 hover:bg-[#D4A849]/5",
          (disabled || uploading) && "opacity-50 pointer-events-none",
          className
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          className="size-14 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" style={{ color: accentColor }} />
          ) : (
            <Upload className="size-6" style={{ color: accentColor }} />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium">
            {uploading
              ? uploadProgress
              : dragOver
                ? "Suelta la imagen aquí"
                : currentImageUrl
                  ? "Cambiar imagen"
                  : "Arrastra una imagen aquí"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            o haz clic para seleccionar
          </p>
        </div>

        {/* Recommendation badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Info className="size-3" />
          <span>
            Recomendado: {preset.recommended}
            {preset.minDimension && ` · Mín. ${preset.minDimension}px`}
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground/70">
          JPG, PNG, GIF, WebP · Máx. {maxSizeMB}MB · Se convierte a WebP automáticamente
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
    </>
  )
}
