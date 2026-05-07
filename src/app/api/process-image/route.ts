import sharp from "sharp";
import { getPreset, formatFileSize } from "@/lib/image-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const width = parseInt(formData.get("width") as string) || 800;
    const height = parseInt(formData.get("height") as string) || 600;
    const presetName = (formData.get("preset") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let resizeWidth = width;
    let resizeHeight = height;
    let fit: sharp.FitEnum["inside"] = "inside";
    let quality = 80;
    let format: "jpeg" | "png" | "webp" = "jpeg";

    if (presetName) {
      const preset = getPreset(presetName);
      resizeWidth = preset.width;
      resizeHeight = preset.height;
      fit = preset.fit as sharp.FitEnum["inside"];
      quality = preset.quality;
      format = preset.format;
    }

    const processedBuffer = await sharp(buffer)
      .resize(resizeWidth, resizeHeight, {
        fit,
        withoutEnlargement: true,
      })
      [format]({ quality })
      .toBuffer();

    const base64 = processedBuffer.toString("base64");
    const dataUrl = `data:image/${format};base64,${base64}`;

    return NextResponse.json({
      dataUrl,
      size: processedBuffer.length,
      sizeFormatted: formatFileSize(processedBuffer.length),
      success: true,
    });
  } catch (error) {
    console.error("Process image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process image" },
      { status: 500 }
    );
  }
}
