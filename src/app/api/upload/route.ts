import sharp from "sharp";
import { getPreset, formatFileSize } from "@/lib/image-utils";
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

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Procesar con sharp (server-side)
    const buffer = Buffer.from(await file.arrayBuffer());
    const preset = getPreset(presetName);

    const processedBuffer = await sharp(buffer)
      .resize(preset.width, preset.height, {
        fit: preset.fit,
        withoutEnlargement: true,
      })
      .preset.format]({ quality: preset.quality })
      .toBuffer();

    // Obtener metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Crear un File object desde el buffer procesado
    const processedFile = new File(
      [new Uint8Array(processedBuffer)],
      `processed-${Date.now()}.${preset.format}`,
      { type: `image/${preset.format}` }
    );

    // Subir a storage — recibe (File, folder?)
    const { url } = await uploadToStorage(processedFile, "processed");

    return NextResponse.json({
      url,
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
