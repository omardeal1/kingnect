// =============================================
// Funciones PURAS — sin sharp, sin dependencias de Node.js
// Seguras para importar desde client Y server
// =============================================

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImagePreset {
  width: number;
  height: number;
  fit: "cover" | "contain" | "inside" | "outside";
  quality: number;
  format: "jpeg" | "png" | "webp";
}

export interface ProcessImageOptions {
  file: File;
  width?: number;
  height?: number;
}

export interface ProcessImageResult {
  dataUrl: string;
  size: number;
  success: boolean;
}

/** Presets de redimensionamiento */
export function getPreset(name: string): ImagePreset {
  const presets: Record<string, ImagePreset> = {
    thumbnail: { width: 150, height: 150, fit: "cover", quality: 70, format: "webp" },
    medium:    { width: 800, height: 600, fit: "inside", quality: 80, format: "jpeg" },
    large:     { width: 1920, height: 1080, fit: "inside", quality: 85, format: "jpeg" },
    avatar:    { width: 256, height: 256, fit: "cover", quality: 80, format: "webp" },
    hero:      { width: 2400, height: 800, fit: "cover", quality: 90, format: "jpeg" },
    og:        { width: 1200, height: 630, fit: "cover", quality: 85, format: "jpeg" },
  };

  return (
    presets[name] || { width: 800, height: 600, fit: "inside", quality: 80, format: "jpeg" }
  );
}

/** Formatea bytes a string legible */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${value} ${units[i]}`;
}

/** Valida que un archivo sea una imagen aceptable */
export function isValidImageType(file: File): boolean {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return allowed.includes(file.type);
}
