// ─── QAIROSS — Image Processing Utility ─────────────────────────────────────────
// Server-side image processing using Sharp
// - Auto-convert to WebP for smaller file sizes
// - Smart resize based on context (gallery, menu, slides, etc.)
// - Dimension validation and quality optimization

import sharp from "sharp"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ImagePreset {
  maxWidth: number
  maxHeight: number
  minDimension?: number // minimum width OR height for quality
  quality: number       // WebP quality (1-100)
  label: string         // Human-readable name (Spanish)
  recommended: string   // Recommended dimensions string
  aspectHint?: string   // Aspect ratio hint
}

export interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number         // bytes
  originalSize: number // bytes
  compressionRatio: number
}

// ─── Context Presets ───────────────────────────────────────────────────────
// Each preset defines the optimal image processing for a specific use case.
// Images are resized to fit within maxWidth × maxHeight (maintaining aspect ratio)
// and converted to WebP format for optimal file size.

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  gallery: {
    maxWidth: 1200,
    maxHeight: 1200,
    minDimension: 400,
    quality: 82,
    label: "Galería",
    recommended: "1200 × 1200 px (1:1)",
    aspectHint: "square",
  },
  menuItem: {
    maxWidth: 800,
    maxHeight: 800,
    minDimension: 300,
    quality: 80,
    label: "Producto del menú",
    recommended: "800 × 800 px (1:1)",
    aspectHint: "square",
  },
  slide: {
    maxWidth: 1920,
    maxHeight: 1080,
    minDimension: 800,
    quality: 80,
    label: "Slide / Carrusel",
    recommended: "1920 × 1080 px (16:9)",
    aspectHint: "landscape",
  },
  featuredSlide: {
    maxWidth: 1200,
    maxHeight: 675,
    minDimension: 600,
    quality: 80,
    label: "Foto destacada",
    recommended: "1200 × 675 px (16:9)",
    aspectHint: "landscape",
  },
  testimonial: {
    maxWidth: 200,
    maxHeight: 200,
    minDimension: 80,
    quality: 78,
    label: "Foto de testimonio",
    recommended: "200 × 200 px (1:1)",
    aspectHint: "square",
  },
  background: {
    maxWidth: 1920,
    maxHeight: 1920,
    minDimension: 800,
    quality: 78,
    label: "Fondo de sitio",
    recommended: "1920 × 1080 px",
    aspectHint: "landscape",
  },
  service: {
    maxWidth: 800,
    maxHeight: 600,
    minDimension: 300,
    quality: 80,
    label: "Servicio",
    recommended: "800 × 600 px (4:3)",
    aspectHint: "landscape",
  },
  logo: {
    maxWidth: 400,
    maxHeight: 400,
    minDimension: 100,
    quality: 85,
    label: "Logo",
    recommended: "400 × 400 px (1:1)",
    aspectHint: "square",
  },
  general: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 80,
    label: "General",
    recommended: "1600 × 1600 px máx.",
  },
}

// ─── Processing Functions ──────────────────────────────────────────────────

/**
 * Process an image buffer using Sharp:
 * 1. Validates the image is readable
 * 2. Resizes to fit within maxWidth × maxHeight (maintains aspect ratio)
 * 3. Converts to WebP format
 * 4. Returns processed buffer with metadata
 *
 * @param input - The image buffer (from uploaded file)
 * @param preset - Image preset defining max dimensions and quality
 * @returns ProcessedImage with buffer, dimensions, and compression info
 */
export async function processImage(
  input: Buffer,
  preset: ImagePreset
): Promise<ProcessedImage> {
  // Validate image using sharp (will throw if not a valid image)
  const metadata = await sharp(input).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error("No se pudo leer las dimensiones de la imagen")
  }

  // Check minimum dimensions for quality
  if (preset.minDimension) {
    const smallest = Math.min(metadata.width, metadata.height)
    if (smallest < preset.minDimension) {
      throw new Error(
        `La imagen es muy pequeña (${metadata.width}×${metadata.height}px). ` +
        `Se recomienda al menos ${preset.minDimension}px en el lado más corto.`
      )
    }
  }

  // Determine if resize is needed
  const needsResize =
    metadata.width > preset.maxWidth ||
    metadata.height > preset.maxHeight

  // Build sharp pipeline
  let pipeline = sharp(input)

  if (needsResize) {
    pipeline = pipeline.resize(preset.maxWidth, preset.maxHeight, {
      fit: "inside",        // Fit within bounds, maintain aspect ratio
      withoutEnlargement: true, // Never upscale
    })
  }

  // Convert to WebP
  pipeline = pipeline.webp({
    quality: preset.quality,
    effort: 4,  // Compression effort (0-6, higher = slower but smaller)
    smartSubsample: true, // Better quality for photos
  })

  // Process
  const outputBuffer = await pipeline.toBuffer()
  const outputMetadata = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    width: outputMetadata.width ?? metadata.width,
    height: outputMetadata.height ?? metadata.height,
    format: "webp",
    size: outputBuffer.length,
    originalSize: input.length,
    compressionRatio: Math.round((1 - outputBuffer.length / input.length) * 100),
  }
}

/**
 * Validate image dimensions against a preset
 * Returns warnings but doesn't throw (non-blocking validation)
 */
export function validateDimensions(
  width: number,
  height: number,
  preset: ImagePreset
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  let valid = true

  if (preset.minDimension) {
    const smallest = Math.min(width, height)
    if (smallest < preset.minDimension) {
      warnings.push(
        `Resolución baja: ${width}×${height}px. ` +
        `Mínimo recomendado: ${preset.minDimension}px en el lado más corto.`
      )
      valid = false
    }
  }

  if (width > preset.maxWidth * 2 || height > preset.maxHeight * 2) {
    warnings.push(
      `La imagen (${width}×${height}px) es mucho más grande de lo necesario. ` +
      `Se redimensionará automáticamente a ${preset.maxWidth}×${preset.maxHeight}px máx.`
    )
  }

  return { valid, warnings }
}

/**
 * Get a preset by context name (with fallback to "general")
 */
export function getPreset(context?: string): ImagePreset {
  if (!context) return IMAGE_PRESETS.general
  return IMAGE_PRESETS[context] ?? IMAGE_PRESETS.general
}

/**
 * Format bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
