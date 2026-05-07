"use client"; // ✅ Es client component, PERO ya no importa sharp

import { processImage } from "@/lib/image-processing";
// ANTES probablemente tenías algo como:
// import sharp from "sharp";  ← ❌ BORRAR ESTO
// import { resizeImage } from "@/lib/image-processing"; ← si usaba sharp internamente

export function ImageUploadZone() {
  const handleImageSelect = async (file: File) => {
    // ✅ Ahora llama a la API route vía fetch, sharp corre en el servidor
    const result = await processImage({ file, width: 800, height: 600 });

    // result.dataUrl contiene la imagen procesada en base64
    console.log("Image processed, size:", result.size);
  };

  return (
    <div>
      {/* tu UI de upload existente */}
    </div>
  );
}
