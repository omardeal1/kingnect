import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import path from "path"
import { validateImageUpload } from "@/lib/security"
import { uploadToStorage } from "@/lib/storage"

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"])
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string | null) ?? undefined

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

    // Validate file size (max 2MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el límite de 2MB" },
        { status: 400 }
      )
    }

    // Use validateImageUpload from security lib as additional check
    const validation = validateImageUpload(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload via storage abstraction (Supabase or local fallback)
    const { url } = await uploadToStorage(file, folder)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error al subir archivo" },
      { status: 500 }
    )
  }
}
