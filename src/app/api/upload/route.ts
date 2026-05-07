import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import path from "path"
import { validateImageUpload } from "@/lib/security"
import { uploadToStorage } from "@/lib/storage"
import { processImage, getPreset, formatFileSize } from "@/lib/image-processing"

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"])
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB (we'll compress after upload)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string | null) ?? undefined
    const context = (formData.get("context") as string | null) ?? undefined
    // Allow overriding maxWidth/maxHeight via form data (optional, per-use-case)
    const maxWidth = formData.get("maxWidth") ? parseInt(formData.get("maxWidth") as string) : undefined
    const maxHeight = formData.get("maxHeight") ? parseInt(formData.get("maxHeight") as string) : undefined

    if (!file) {
      return NextResponse.json({ error: "No se envió archivo" }, { status: 400 })
    }

    // Validate MIME type — must start with "image/" and be in allowed set
    if (!file.type.startsWith("image/") || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP." },
        { status: 400 }
      )
    }

    // Validate file extension
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Extensión de archivo no permitida. Solo se permiten: .jpg, .jpeg, .png, .gif, .webp" },
        { status: 400 }
      )
    }

    // Explicitly block SVG uploads (XSS risk)
    if (ext === ".svg" || file.type === "image/svg+xml") {
      return NextResponse.json(
        { error: "Los archivos SVG no están permitidos por razones de seguridad." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB before compression)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo excede el límite de ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Use validateImageUpload from security lib as additional check
    const validation = validateImageUpload(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // ─── Process image: compress to WebP, resize ──────────────────────────
    const preset = getPreset(context)

    // Allow per-request override of dimensions
    const effectivePreset = {
      ...preset,
      ...(maxWidth ? { maxWidth } : {}),
      ...(maxHeight ? { maxHeight } : {}),
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    let processedImage

    try {
      processedImage = await processImage(fileBuffer, effectivePreset)
    } catch (err: any) {
      // If processing fails with dimension error, return helpful message
      if (err.message?.includes("muy pequeña") || err.message?.includes("small")) {
        return NextResponse.json({ error: err.message }, { status: 400 })
      }
      // If processing fails for other reasons (e.g., corrupt image), fall back to original
      console.warn("Image processing failed, uploading original:", err.message)
      processedImage = null
    }

    // Create the file to upload
    let uploadFile: File
    let processingInfo: {
      width: number
      height: number
      format: string
      size: number
      originalSize: number
      compressionRatio: number
    } | undefined

    if (processedImage) {
      // Upload processed WebP
      uploadFile = new File(
        [processedImage.buffer],
        `image.webp`,
        { type: "image/webp" }
      )
      processingInfo = {
        width: processedImage.width,
        height: processedImage.height,
        format: processedImage.format,
        size: processedImage.size,
        originalSize: processedImage.originalSize,
        compressionRatio: processedImage.compressionRatio,
      }
    } else {
      // Fallback: upload original file
      uploadFile = file
    }

    // Upload via storage abstraction (Supabase or local fallback)
    const { url } = await uploadToStorage(uploadFile, folder)

    return NextResponse.json({
      url,
      ...(processingInfo && {
        metadata: {
          ...processingInfo,
          sizeFormatted: formatFileSize(processingInfo.size),
          originalSizeFormatted: formatFileSize(processingInfo.originalSize),
          savedFormatted: `${processingInfo.compressionRatio}%`,
        },
      }),
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error al subir archivo" },
      { status: 500 }
    )
  }
}
