import sharp from "sharp";                              // ✅ server-only
import { getPreset, formatFileSize } from "@/lib/image-utils"; // ✅ sin sharp
import { validateImageUpload } from "@/lib/security";
import { uploadToStorage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const presetName = (formData.get("preset") as string) || "medium";

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validación
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Archivo too large: ${formatFileSize(file.size)}` },
        { status: 400 }
      );
    }

    if (validateImageUpload) {
      await validateImageUpload(file);
    }

    // Procesar con sharp (server-side)
    const buffer = Buffer.from(await file.arrayBuffer());
    const preset = getPreset(presetName);

    const processedBuffer = await sharp(buffer)
      .resize(preset.width, preset.height, {
        fit: preset.fit,
        withoutEnlargement: true,
      })
      [preset.format]({ quality: preset.quality })
      .toBuffer();

    // Obtener metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Subir a storage
    const finalName = `processed-${Date.now()}-${file.name.replace(/\.[^.]+$/, `.${preset.format}`)}`;
    const { url } = await uploadToStorage(processedBuffer, finalName, preset.format);

    return NextResponse.json({
      url,
      key,
      width: metadata.width,
      height: metadata.height,
      size: processedBuffer.length,
      sizeFormatted: formatFileSize(processedBuffer.length),
      format: preset.format,
      preset: presetName,
      success: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
