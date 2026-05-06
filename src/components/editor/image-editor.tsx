"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Upload,
  Crop,
  RotateCw,
  RotateCcw,
  SlidersHorizontal,
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  Pencil,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  FlipHorizontal2,
  FlipVertical2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────

type AspectRatioOption =
  | "free"
  | "square"
  | "landscape"
  | "portrait"
  | { width: number; height: number }

interface ImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageUrl?: string | null
  onSave: (imageUrl: string) => void
  aspectRatio?: AspectRatioOption
  maxSize?: number // in KB, default 2000
  title?: string
}

interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

interface Filters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
}

const DEFAULT_FILTERS: Filters = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
}

type EditorTab = "crop" | "filters" | "resize"

// ─── Helper ────────────────────────────────────────────────────────────

function getAspectValue(option: AspectRatioOption): number | null {
  if (option === "free") return null
  if (option === "square") return 1
  if (option === "landscape") return 16 / 9
  if (option === "portrait") return 9 / 16
  if (typeof option === "object") return option.width / option.height
  return null
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

// ─── Component ─────────────────────────────────────────────────────────

export function ImageEditor({
  open,
  onOpenChange,
  currentImageUrl,
  onSave,
  aspectRatio = "free",
  maxSize = 2000,
  title = "Editor de imagen",
}: ImageEditorProps) {
  // ─── State ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<EditorTab>("crop")
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [naturalWidth, setNaturalWidth] = React.useState(0)
  const [naturalHeight, setNaturalHeight] = React.useState(0)
  const [rotation, setRotation] = React.useState(0)
  const [flipH, setFlipH] = React.useState(false)
  const [flipV, setFlipV] = React.useState(false)
  const [filters, setFilters] = React.useState<Filters>({ ...DEFAULT_FILTERS })
  const [crop, setCrop] = React.useState<CropRect | null>(null)
  const [resizeW, setResizeW] = React.useState(0)
  const [resizeH, setResizeH] = React.useState(0)
  const [lockAspect, setLockAspect] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)

  // Canvas refs
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const isDraggingCrop = React.useRef(false)
  const dragStart = React.useRef({ x: 0, y: 0 })
  const cropStart = React.useRef<CropRect | null>(null)
  const activeHandle = React.useRef<string | null>(null)

  // Display scale: how the image fits inside the canvas area
  const [displayScale, setDisplayScale] = React.useState(1)

  const lockedAspect = React.useMemo(() => {
    if (lockAspect && naturalWidth > 0 && naturalHeight > 0) {
      return naturalWidth / naturalHeight
    }
    return null
  }, [lockAspect, naturalWidth, naturalHeight])

  // ─── Load image ─────────────────────────────────────────────────────
  const loadImage = React.useCallback(
    (src: string) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setNaturalWidth(img.naturalWidth)
        setNaturalHeight(img.naturalHeight)
        setResizeW(img.naturalWidth)
        setResizeH(img.naturalHeight)
        setImageSrc(src)
        setRotation(0)
        setFlipH(false)
        setFlipV(false)
        setFilters({ ...DEFAULT_FILTERS })
        setCrop(null)
        setActiveTab("crop")
      }
      img.onerror = () => {
        toast.error("Error al cargar la imagen")
      }
      img.src = src
    },
    []
  )

  // When dialog opens with a URL, load it
  React.useEffect(() => {
    if (open && currentImageUrl) {
      loadImage(currentImageUrl)
    } else if (open && !currentImageUrl) {
      // Fresh editor – reset everything
      setImageSrc(null)
      setNaturalWidth(0)
      setNaturalHeight(0)
      setResizeW(0)
      setResizeH(0)
      setRotation(0)
      setFlipH(false)
      setFlipV(false)
      setFilters({ ...DEFAULT_FILTERS })
      setCrop(null)
      setActiveTab("crop")
    }
  }, [open, currentImageUrl, loadImage])

  // ─── Canvas drawing ─────────────────────────────────────────────────
  const getEffectiveSize = React.useCallback(() => {
    if (rotation % 180 !== 0) {
      return { width: naturalHeight, height: naturalWidth }
    }
    return { width: naturalWidth, height: naturalHeight }
  }, [naturalWidth, naturalHeight, rotation])

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const container = containerRef.current
    if (!container) return

    const containerW = container.clientWidth
    const containerH = container.clientHeight
    const effective = getEffectiveSize()

    const scale = Math.min(
      containerW / effective.width,
      containerH / effective.height,
      1
    )
    setDisplayScale(scale)

    const drawW = effective.width * scale
    const drawH = effective.height * scale
    const offsetX = (containerW - drawW) / 2
    const offsetY = (containerH - drawH) / 2

    canvas.width = containerW
    canvas.height = containerH

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, containerW, containerH)

    // Build filter string
    const filterStr = [
      `brightness(${filters.brightness})`,
      `contrast(${filters.contrast})`,
      `saturate(${filters.saturation})`,
      `blur(${filters.blur}px)`,
    ].join(" ")
    ctx.filter = filterStr

    ctx.save()
    ctx.translate(containerW / 2, containerH / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(img, (-naturalWidth * scale) / 2, (-naturalHeight * scale) / 2, naturalWidth * scale, naturalHeight * scale)
    ctx.restore()
    ctx.filter = "none"

    // Draw crop overlay
    if (crop && activeTab === "crop") {
      // Darken outside crop area
      ctx.fillStyle = "rgba(0,0,0,0.55)"
      ctx.fillRect(0, 0, containerW, offsetY) // top
      ctx.fillRect(0, offsetY + crop.height, containerW, containerH - offsetY - crop.height) // bottom
      ctx.fillRect(0, offsetY, offsetX, crop.height) // left
      ctx.fillRect(offsetX + crop.width, offsetY, containerW - offsetX - crop.width, crop.height) // right

      // Crop border
      ctx.strokeStyle = "#D4A849"
      ctx.lineWidth = 2
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height)

      // Grid rule of thirds
      ctx.strokeStyle = "rgba(212,168,73,0.4)"
      ctx.lineWidth = 1
      for (let i = 1; i <= 2; i++) {
        // Vertical
        const vx = crop.x + (crop.width / 3) * i
        ctx.beginPath()
        ctx.moveTo(vx, crop.y)
        ctx.lineTo(vx, crop.y + crop.height)
        ctx.stroke()
        // Horizontal
        const hy = crop.y + (crop.height / 3) * i
        ctx.beginPath()
        ctx.moveTo(crop.x, hy)
        ctx.lineTo(crop.x + crop.width, hy)
        ctx.stroke()
      }

      // Corner handles
      const handleSize = 8
      ctx.fillStyle = "#D4A849"
      const corners = [
        { x: crop.x - handleSize / 2, y: crop.y - handleSize / 2 },
        { x: crop.x + crop.width - handleSize / 2, y: crop.y - handleSize / 2 },
        { x: crop.x - handleSize / 2, y: crop.y + crop.height - handleSize / 2 },
        { x: crop.x + crop.width - handleSize / 2, y: crop.y + crop.height - handleSize / 2 },
      ]
      corners.forEach((c) => {
        ctx.fillRect(c.x, c.y, handleSize, handleSize)
      })
    }
  }, [imageSrc, filters, rotation, flipH, flipV, crop, activeTab, getEffectiveSize, naturalWidth, naturalHeight])

  // Redraw on any change
  React.useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Resize observer
  React.useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      drawCanvas()
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [drawCanvas])

  // Initialize crop when switching to crop tab
  React.useEffect(() => {
    if (activeTab === "crop" && imageSrc && canvasRef.current && containerRef.current) {
      const container = containerRef.current
      const effective = getEffectiveSize()
      const scale = Math.min(container.clientWidth / effective.width, container.clientHeight / effective.height, 1)
      const drawW = effective.width * scale
      const drawH = effective.height * scale
      const offsetX = (container.clientWidth - drawW) / 2
      const offsetY = (container.clientHeight - drawH) / 2
      const margin = 0.1
      setCrop({
        x: offsetX + drawW * margin,
        y: offsetY + drawH * margin,
        width: drawW * (1 - 2 * margin),
        height: drawH * (1 - 2 * margin),
      })
    }
  }, [activeTab, imageSrc, getEffectiveSize, naturalWidth, naturalHeight])

  // ─── File upload / drag-drop ────────────────────────────────────────
  const handleFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo debe ser una imagen")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === "string") {
          loadImage(result)
        }
      }
      reader.readAsDataURL(file)
    },
    [loadImage]
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  // ─── Crop mouse handlers ────────────────────────────────────────────
  const getCropFromMouse = React.useCallback(
    (clientX: number, clientY: number, initial: CropRect): CropRect => {
      const canvas = canvasRef.current
      if (!canvas) return initial
      const rect = canvas.getBoundingClientRect()
      const mx = clientX - rect.left
      const my = clientY - rect.top
      const container = containerRef.current
      if (!container) return initial

      const effective = getEffectiveSize()
      const scale = Math.min(container.clientWidth / effective.width, container.clientHeight / effective.height, 1)
      const drawW = effective.width * scale
      const drawH = effective.height * scale
      const offsetX = (container.clientWidth - drawW) / 2
      const offsetY = (container.clientHeight - drawH) / 2

      const dx = mx - dragStart.current.x
      const dy = my - dragStart.current.y
      const start = cropStart.current!
      let newCrop = { ...start }

      if (activeHandle.current === "move") {
        newCrop.x = clamp(start.x + dx, offsetX, offsetX + drawW - start.width)
        newCrop.y = clamp(start.y + dy, offsetY, offsetY + drawH - start.height)
      } else if (activeHandle.current === "se") {
        newCrop.width = clamp(start.width + dx, 30, offsetX + drawW - newCrop.x)
        newCrop.height = clamp(start.height + dy, 30, offsetY + drawH - newCrop.y)
      } else if (activeHandle.current === "sw") {
        const newW = clamp(start.width - dx, 30, start.x + start.width - offsetX)
        newCrop.x = start.x + start.width - newW
        newCrop.width = newW
        newCrop.height = clamp(start.height + dy, 30, offsetY + drawH - newCrop.y)
      } else if (activeHandle.current === "ne") {
        newCrop.width = clamp(start.width + dx, 30, offsetX + drawW - newCrop.x)
        const newH = clamp(start.height - dy, 30, start.y + start.height - offsetY)
        newCrop.y = start.y + start.height - newH
        newCrop.height = newH
      } else if (activeHandle.current === "nw") {
        const newW = clamp(start.width - dx, 30, start.x + start.width - offsetX)
        newCrop.x = start.x + start.width - newW
        newCrop.width = newW
        const newH = clamp(start.height - dy, 30, start.y + start.height - offsetY)
        newCrop.y = start.y + start.height - newH
        newCrop.height = newH
      } else if (activeHandle.current === "new") {
        // Drag to create new crop
        const aspectVal = getAspectValue(aspectRatio)
        let w = mx - dragStart.current.x
        let h = my - dragStart.current.y
        if (aspectVal) {
          h = w / aspectVal
        }
        if (w < 0) {
          newCrop.x = mx
          newCrop.width = -w
        } else {
          newCrop.x = dragStart.current.x
          newCrop.width = w
        }
        if (h < 0) {
          newCrop.y = my
          newCrop.height = -h
        } else {
          newCrop.y = dragStart.current.y
          newCrop.height = h
        }
        newCrop.width = Math.max(30, newCrop.width)
        newCrop.height = Math.max(30, newCrop.height)
      }

      // Apply aspect ratio constraint to handles
      if (activeHandle.current !== "move" && activeHandle.current !== "new") {
        const aspectVal = getAspectValue(aspectRatio)
        if (aspectVal) {
          if (["se", "ne", "sw", "nw"].includes(activeHandle.current!)) {
            newCrop.height = newCrop.width / aspectVal
          }
        }
      }

      return newCrop
    },
    [activeTab, getEffectiveSize, aspectRatio]
  )

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (activeTab !== "crop" || !crop) return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const handleSize = 12

      const handlePositions: Record<string, { x: number; y: number; cursor: string }> = {
        nw: { x: crop.x, y: crop.y, cursor: "nw-resize" },
        ne: { x: crop.x + crop.width, y: crop.y, cursor: "ne-resize" },
        sw: { x: crop.x, y: crop.y + crop.height, cursor: "sw-resize" },
        se: { x: crop.x + crop.width, y: crop.y + crop.height, cursor: "se-resize" },
      }

      // Check if clicking a handle
      for (const [name, pos] of Object.entries(handlePositions)) {
        if (Math.abs(mx - pos.x) < handleSize && Math.abs(my - pos.y) < handleSize) {
          activeHandle.current = name
          isDraggingCrop.current = true
          dragStart.current = { x: e.clientX, y: e.clientY }
          cropStart.current = { ...crop }
          e.preventDefault()
          return
        }
      }

      // Check if clicking inside crop area (move)
      if (
        mx >= crop.x &&
        mx <= crop.x + crop.width &&
        my >= crop.y &&
        my <= crop.y + crop.height
      ) {
        activeHandle.current = "move"
        isDraggingCrop.current = true
        dragStart.current = { x: e.clientX, y: e.clientY }
        cropStart.current = { ...crop }
        e.preventDefault()
        return
      }

      // Clicking outside crop – create new crop
      activeHandle.current = "new"
      isDraggingCrop.current = true
      dragStart.current = { x: mx, y: my }
      cropStart.current = { ...crop }
      e.preventDefault()
    },
    [activeTab, crop]
  )

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingCrop.current || !cropStart.current) return
      const newCrop = getCropFromMouse(e.clientX, e.clientY, cropStart.current)
      setCrop(newCrop)
    },
    [getCropFromMouse]
  )

  const handleMouseUp = React.useCallback(() => {
    isDraggingCrop.current = false
    activeHandle.current = null
    cropStart.current = null
  }, [])

  // ─── Apply aspect ratio preset to existing crop ─────────────────────
  const handleAspectRatioChange = React.useCallback(
    (val: string) => {
      if (val === "free") return
      if (!crop || !containerRef.current) return
      const container = containerRef.current
      const effective = getEffectiveSize()
      const scale = Math.min(container.clientWidth / effective.width, container.clientHeight / effective.height, 1)
      const drawW = effective.width * scale
      const drawH = effective.height * scale
      const offsetX = (container.clientWidth - drawW) / 2
      const offsetY = (container.clientHeight - drawH) / 2

      let ratioVal: number | null = null
      if (val === "1:1") ratioVal = 1
      else if (val === "4:3") ratioVal = 4 / 3
      else if (val === "16:9") ratioVal = 16 / 9
      else if (val === "3:4") ratioVal = 3 / 4
      else if (val === "9:16") ratioVal = 9 / 16

      if (!ratioVal) return

      // Adjust crop to match the selected aspect ratio
      let newW = crop.width
      let newH = newW / ratioVal
      if (newH > drawH * 0.9) {
        newH = drawH * 0.9
        newW = newH * ratioVal
      }
      if (newW > drawW * 0.9) {
        newW = drawW * 0.9
        newH = newW / ratioVal
      }
      const cx = crop.x + crop.width / 2
      const cy = crop.y + crop.height / 2
      setCrop({
        x: clamp(cx - newW / 2, offsetX, offsetX + drawW - newW),
        y: clamp(cy - newH / 2, offsetY, offsetY + drawH - newH),
        width: newW,
        height: newH,
      })
    },
    [crop, getEffectiveSize]
  )

  // ─── Rotate ─────────────────────────────────────────────────────────
  const handleRotate = React.useCallback((dir: "cw" | "ccw") => {
    setRotation((r) => (dir === "cw" ? (r + 90) % 360 : (r + 270) % 360))
  }, [])

  // ─── Resize inputs ──────────────────────────────────────────────────
  const handleResizeW = React.useCallback(
    (val: string) => {
      const w = parseInt(val) || 0
      setResizeW(w)
      if (lockedAspect && w > 0) {
        setResizeH(Math.round(w / lockedAspect))
      }
    },
    [lockedAspect]
  )

  const handleResizeH = React.useCallback(
    (val: string) => {
      const h = parseInt(val) || 0
      setResizeH(h)
      if (lockedAspect && h > 0) {
        setResizeW(Math.round(h * lockedAspect))
      }
    },
    [lockedAspect]
  )

  // ─── Save / export ──────────────────────────────────────────────────
  const handleSave = React.useCallback(async () => {
    const img = imageRef.current
    if (!img) return

    setSaving(true)
    try {
      const offscreen = document.createElement("canvas")
      const ctx = offscreen.getContext("2d")
      if (!ctx) throw new Error("No canvas context")

      // Determine output dimensions (resize)
      let outW = resizeW || naturalWidth
      let outH = resizeH || naturalHeight
      if (rotation % 180 !== 0) {
        ;[outW, outH] = [outH, outW]
      }

      // Crop calculations (relative to original image)
      let cropX = 0
      let cropY = 0
      let cropW = naturalWidth
      let cropH = naturalHeight

      if (crop && activeTab === "crop" && displayScale > 0) {
        const container = containerRef.current
        if (container) {
          const effective = getEffectiveSize()
          const scale = displayScale
          const offsetX = (container.clientWidth - effective.width * scale) / 2
          const offsetY = (container.clientHeight - effective.height * scale) / 2

          // Convert canvas crop to original image coordinates
          const origImgW = naturalWidth
          const origImgH = naturalHeight

          if (rotation % 180 !== 0) {
            // Rotated 90 or 270
            cropX = (crop.y - offsetY) / scale
            cropY = (crop.x - offsetX) / scale
            cropW = crop.height / scale
            cropH = crop.width / scale
          } else {
            cropX = (crop.x - offsetX) / scale
            cropY = (crop.y - offsetY) / scale
            cropW = crop.width / scale
            cropH = crop.height / scale
          }
        }
      }

      // Set output size
      offscreen.width = Math.max(1, Math.round(outW))
      offscreen.height = Math.max(1, Math.round(outH))

      // Apply filters
      const filterStr = [
        `brightness(${filters.brightness})`,
        `contrast(${filters.contrast})`,
        `saturate(${filters.saturation})`,
        `blur(${filters.blur * (outW / (cropW || naturalWidth))}px)`,
      ].join(" ")
      ctx.filter = filterStr

      // Draw with rotation and flip
      ctx.save()
      ctx.translate(outW / 2, outH / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

      // Draw the cropped portion scaled to output size
      ctx.drawImage(
        img,
        Math.max(0, cropX),
        Math.max(0, cropY),
        Math.max(1, cropW),
        Math.max(1, cropH),
        -outW / 2,
        -outH / 2,
        outW,
        outH
      )
      ctx.restore()

      // Export
      const blob = await new Promise<Blob>((resolve, reject) => {
        offscreen.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error("Failed to create blob"))
          },
          "image/jpeg",
          0.85
        )
      })

      // Check size
      if (blob.size > maxSize * 1024) {
        toast.error(`La imagen supera el límite de ${maxSize}KB`)
        setSaving(false)
        return
      }

      // Upload
      const formData = new FormData()
      formData.append("file", blob, "edited-image.jpg")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()

      onSave(data.url)
      toast.success("Imagen guardada")
      onOpenChange(false)
    } catch {
      toast.error("Error al guardar la imagen")
    } finally {
      setSaving(false)
    }
  }, [
    activeTab,
    crop,
    displayScale,
    filters,
    flipH,
    flipV,
    getEffectiveSize,
    maxSize,
    naturalHeight,
    naturalWidth,
    onOpenChange,
    onSave,
    resizeH,
    resizeW,
    rotation,
  ])

  // ─── Has changes check ──────────────────────────────────────────────
  const hasChanges = React.useMemo(() => {
    if (!imageSrc) return false
    return (
      rotation !== 0 ||
      flipH ||
      flipV ||
      filters.brightness !== 1 ||
      filters.contrast !== 1 ||
      filters.saturation !== 1 ||
      filters.blur !== 0 ||
      resizeW !== naturalWidth ||
      resizeH !== naturalHeight ||
      crop !== null
    )
  }, [imageSrc, rotation, flipH, flipV, filters, resizeW, resizeH, naturalWidth, naturalHeight, crop])

  // ─── Reset ──────────────────────────────────────────────────────────
  const handleReset = React.useCallback(() => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setFilters({ ...DEFAULT_FILTERS })
    if (naturalWidth > 0) {
      setResizeW(naturalWidth)
      setResizeH(naturalHeight)
    }
    setCrop(null)
    // Re-init crop will happen via the effect
    setActiveTab("crop")
  }, [naturalWidth, naturalHeight])

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-[#D4A849]" />
            {title}
          </DialogTitle>
          <DialogDescription>Recorta, ajusta y aplica filtros a tu imagen</DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        {imageSrc && (
          <div className="flex items-center gap-1 px-4 pb-2 border-b overflow-x-auto">
            {(
              [
                { id: "crop" as const, icon: Crop, label: "Recortar" },
                { id: "filters" as const, icon: SlidersHorizontal, label: "Filtros" },
                { id: "resize" as const, icon: ZoomIn, label: "Redimensionar" },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "gap-1.5 text-xs shrink-0",
                  activeTab === tab.id && "bg-[#D4A849] hover:bg-[#C49A3D] text-white"
                )}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </Button>
            ))}

            <div className="w-px h-5 bg-border mx-1 shrink-0" />

            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => handleRotate("ccw")}
              title="Rotar 90° antihorario"
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => handleRotate("cw")}
              title="Rotar 90° horario"
            >
              <RotateCw className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-7 shrink-0", flipH && "bg-muted")}
              onClick={() => setFlipH((v) => !v)}
              title="Voltear horizontal"
            >
              <FlipHorizontal2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-7 shrink-0", flipV && "bg-muted")}
              onClick={() => setFlipV((v) => !v)}
              title="Voltear vertical"
            >
              <FlipVertical2 className="size-3.5" />
            </Button>
          </div>
        )}

        {/* Canvas / Upload area */}
        <div className="flex-1 min-h-0 relative">
          {!imageSrc ? (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-3 m-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                dragOver
                  ? "border-[#D4A849] bg-[#D4A849]/10"
                  : "border-muted-foreground/25 hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Arrastra una imagen aquí</p>
                <p className="text-xs text-muted-foreground mt-1">
                  o haz clic para seleccionar
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="absolute inset-0 bg-muted/30 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas ref={canvasRef} className="block" />
            </div>
          )}
        </div>

        {/* Controls panel */}
        {imageSrc && (
          <div className="border-t px-6 py-4 space-y-4 max-h-[280px] overflow-y-auto">
            {/* Crop controls */}
            {activeTab === "crop" && (
              <div className="space-y-3">
                <Label className="text-xs font-medium">Proporción del recorte</Label>
                <Select
                  defaultValue={
                    aspectRatio === "square"
                      ? "1:1"
                      : aspectRatio === "landscape"
                        ? "16:9"
                        : aspectRatio === "portrait"
                          ? "9:16"
                          : typeof aspectRatio === "object"
                            ? `${aspectRatio.width}:${aspectRatio.height}`
                            : "free"
                  }
                  onValueChange={(val) => {
                    handleAspectRatioChange(val)
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Libre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Libre</SelectItem>
                    <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
                    <SelectItem value="4:3">4:3 (Paisaje)</SelectItem>
                    <SelectItem value="16:9">16:9 (Panorámico)</SelectItem>
                    <SelectItem value="3:4">3:4 (Retrato)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Arrastra las esquinas para ajustar el recorte. Haz clic fuera para crear uno nuevo.
                </p>
              </div>
            )}

            {/* Filter controls */}
            {activeTab === "filters" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Brillo</Label>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {filters.brightness.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[filters.brightness * 100]}
                    min={50}
                    max={200}
                    step={1}
                    onValueChange={([v]) =>
                      setFilters((f) => ({ ...f, brightness: v / 100 }))
                    }
                    className="[&_[data-slot=slider-range]]:bg-[#D4A849]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Contraste</Label>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {filters.contrast.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[filters.contrast * 100]}
                    min={50}
                    max={200}
                    step={1}
                    onValueChange={([v]) =>
                      setFilters((f) => ({ ...f, contrast: v / 100 }))
                    }
                    className="[&_[data-slot=slider-range]]:bg-[#D4A849]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Saturación</Label>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {filters.saturation.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[filters.saturation * 100]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([v]) =>
                      setFilters((f) => ({ ...f, saturation: v / 100 }))
                    }
                    className="[&_[data-slot=slider-range]]:bg-[#D4A849]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Desenfoque</Label>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {filters.blur.toFixed(1)}px
                    </span>
                  </div>
                  <Slider
                    value={[filters.blur * 10]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={([v]) =>
                      setFilters((f) => ({ ...f, blur: v / 10 }))
                    }
                    className="[&_[data-slot=slider-range]]:bg-[#D4A849]"
                  />
                </div>
              </div>
            )}

            {/* Resize controls */}
            {activeTab === "resize" && (
              <div className="space-y-3">
                <Label className="text-xs font-medium">Dimensiones (px)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Ancho</Label>
                    <Input
                      type="number"
                      value={resizeW || ""}
                      onChange={(e) => handleResizeW(e.target.value)}
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7",
                        lockAspect
                          ? "text-[#D4A849] bg-[#D4A849]/10"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setLockAspect((v) => !v)}
                      title={
                        lockAspect
                          ? "Desbloquear proporción"
                          : "Bloquear proporción"
                      }
                    >
                      {lockAspect ? (
                        <Lock className="size-3.5" />
                      ) : (
                        <Unlock className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Alto</Label>
                    <Input
                      type="number"
                      value={resizeH || ""}
                      onChange={(e) => handleResizeH(e.target.value)}
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Original: {naturalWidth} × {naturalHeight}px
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 pb-5 pt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs"
          >
            <Upload className="size-3.5" />
            Subir imagen
          </Button>
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs"
            >
              <X className="size-3.5" />
              Restablecer
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!imageSrc || saving}
            className="gap-1.5 text-xs bg-[#D4A849] hover:bg-[#C49A3D] text-white"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Guardar
          </Button>
        </DialogFooter>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
