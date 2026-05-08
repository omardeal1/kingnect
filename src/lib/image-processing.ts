// =============================================
// Client-safe — SIN sharp, solo fetch a la API
// =============================================

import type { ProcessImageOptions, ProcessImageResult } from "./image-utils";

// Re-exporta todo de image-utils para que los imports existentes sigan funcionando
export {
  getPreset,
  formatFileSize,
  isValidImageType,
  type ProcessedImage,
  type ImagePreset,
  type ProcessImageOptions,
  type ProcessImageResult,
} from "./image-utils";

/**
 * Procesa una imagen llamando a la API route del servidor.
 * Segura para usar en Client Components.
 */
export async function processImage({
  file,
  width = 800,
  height = 600,
  preset,
}: ProcessImageOptions & { preset?: string }): Promise<ProcessImageResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("width", width.toString());
  formData.append("height", height.toString());
  if (preset) formData.append("preset", preset);

  const response = await fetch("/api/process-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Image processing failed: ${response.statusText}`);
  }

  return response.json();
}
