// ─── QAIROSS — Storage Upload ─────────────────────────────────────────────────
// Abstracción de upload que soporta Supabase Storage (producción)
// y fallback a filesystem local (desarrollo)

import { randomUUID } from "crypto"
import path from "path"
import { writeFile, mkdir } from "fs/promises"
import { getSupabaseServerClient } from "@/lib/supabase"

const UPLOADS_BUCKET = "uploads"

/**
 * Verifica si Supabase Storage está configurado correctamente
 * Requiere que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * estén definidas y no sean placeholders
 */
export function isSupabaseStorageConfigured(): boolean {
  return getSupabaseServerClient() !== null
}

/**
 * Sube un archivo al storage configurado (Supabase o local)
 *
 * - Si Supabase está configurado: sube al bucket "uploads" y devuelve URL pública
 * - Si no: fallback a filesystem local en public/uploads/
 *
 * @param file - Archivo a subir (File object)
 * @param folder - Subcarpeta opcional dentro del bucket (ej: "avatars", "gallery")
 * @returns Objeto con la URL pública del archivo subido
 */
export async function uploadToStorage(
  file: File,
  folder?: string
): Promise<{ url: string }> {
  // Obtener extensión del archivo original
  const ext = path.extname(file.name).toLowerCase()
  const filename = `${randomUUID()}${ext}`

  // Ruta dentro del bucket (con subcarpeta opcional)
  const storagePath = folder ? `${folder}/${filename}` : filename

  const supabase = getSupabaseServerClient()

  if (supabase) {
    // ── Supabase Storage ─────────────────────────────────────────────
    const bytes = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Error subiendo a Supabase Storage:", error)
      throw new Error(`Error al subir archivo a Supabase: ${error.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(UPLOADS_BUCKET)
      .getPublicUrl(storagePath)

    return { url: urlData.publicUrl }
  }

  // ── Fallback: Filesystem local ─────────────────────────────────────
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder ?? "")
  await mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const localUrl = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`

  return { url: localUrl }
}
