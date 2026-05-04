"use client"

import { useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Copy, Share2, FileImage, FileCode } from "lucide-react"
import { toast } from "sonner"

interface QrDisplayProps {
  url: string
  size?: number
  logoUrl?: string
  showDownload?: boolean
  accentColor?: string
}

export function QrDisplay({
  url,
  size = 200,
  logoUrl,
  showDownload = true,
  accentColor = "#D4A849",
}: QrDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado al portapapeles")
    } catch {
      toast.error("No se pudo copiar el link")
    }
  }, [url])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Compartir", url })
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink()
    }
  }, [url, handleCopyLink])

  const handleDownloadPNG = useCallback(() => {
    const canvas = document.createElement("canvas")
    const canvasSize = size * 2 // Higher resolution
    canvas.width = canvasSize
    canvas.height = canvasSize

    const svgEl = svgRef.current
    if (!svgEl) return

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvasSize, canvasSize)
      URL.revokeObjectURL(svgUrl)

      const link = document.createElement("a")
      link.download = "qr-code.png"
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast.success("QR descargado como PNG")
    }
    img.src = svgUrl
  }, [size])

  const handleDownloadSVG = useCallback(() => {
    const svgEl = svgRef.current
    if (!svgEl) return

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.download = "qr-code.svg"
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    toast.success("QR descargado como SVG")
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="p-4 bg-white rounded-2xl shadow-md">
          <QRCodeSVG
            ref={svgRef}
            value={url}
            size={size}
            bgColor="#FFFFFF"
            fgColor="#0A0A0A"
            level="M"
            includeMargin={false}
          />
        </div>
        {logoUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-2 shadow-sm overflow-hidden">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {showDownload && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 border"
            style={{ borderColor: `${accentColor}30`, color: accentColor }}
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar link
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 border"
            style={{ borderColor: `${accentColor}30`, color: accentColor }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartir
          </button>
          <button
            onClick={handleDownloadPNG}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 border"
            style={{ borderColor: `${accentColor}30`, color: accentColor }}
          >
            <FileImage className="w-3.5 h-3.5" />
            PNG
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 border"
            style={{ borderColor: `${accentColor}30`, color: accentColor }}
          >
            <FileCode className="w-3.5 h-3.5" />
            SVG
          </button>
        </div>
      )}
    </div>
  )
}
