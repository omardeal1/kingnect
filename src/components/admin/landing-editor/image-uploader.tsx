"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/provider"

interface ImageUploaderProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
  onRemove?: () => void
  recommendedWidth?: number
  recommendedHeight?: number
  folder?: string
  compact?: boolean
}

export function ImageUploader({
  currentUrl,
  onUpload,
  onRemove,
  recommendedWidth,
  recommendedHeight,
  folder = "landing",
  compact = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslations("admin.landingEditor")

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        onUpload(data.url)
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  if (currentUrl) {
    return (
      <div className="space-y-2">
        <div className="relative group rounded-lg border overflow-hidden bg-muted/30">
          <img
            src={currentUrl}
            alt="Preview"
            className={`w-full object-cover ${compact ? "h-24" : "h-40"}`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3 h-3 mr-1" />
              {t("imageUpload")}
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
              >
                <X className="w-3 h-3 mr-1" />
                Quitar
              </Button>
            )}
          </div>
        </div>
        {recommendedWidth && recommendedHeight && (
          <p className="text-xs text-muted-foreground">
            {t("recommendedSize", {
              width: recommendedWidth,
              height: recommendedHeight,
            })}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={`
          flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4
          cursor-pointer transition-colors
          ${compact ? "h-24" : "h-40"}
          ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/40"
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {t("uploading") || "Subiendo..."}
            </p>
          </>
        ) : (
          <>
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              {t("imageUpload")}
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              JPG, PNG, WebP · Max 2MB
            </p>
          </>
        )}
      </div>
      {recommendedWidth && recommendedHeight && (
        <p className="text-xs text-muted-foreground">
          {t("recommendedSize", {
            width: recommendedWidth,
            height: recommendedHeight,
          })}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
