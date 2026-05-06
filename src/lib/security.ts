// ─── QAIROSS — Security Helpers ───────────────────────────────────────────────
// Funciones de seguridad reutilizables en todas las rutas API
// Validación de slugs, URLs, uploads, verificación de planes y logging

import { z } from "zod"
import { db } from "@/lib/db"
import { getPlanFeatures, getPlanLimits, type PlanFeatures, type PlanLimits } from "@/lib/permissions"

// ─── Validación de Slugs ───────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
const SLUG_BLACKLIST = new Set([
  "admin", "api", "dashboard", "login", "register", "forgot-password",
  "settings", "billing", "editor", "orders", "plans", "sites",
  "auth", "stripe", "webhook", "manifest", "sw", "offline",
  "robots", "sitemap", "favicon", "logo", "assets", "public",
  "_next", "static", "images", "uploads",
])

/**
 * Valida que un slug sea seguro para usar como URL de QAIROSS
 * - Solo alfanuméricos y guiones
 * - No puede empezar o terminar con guión
 * - Máximo 50 caracteres
 * - No puede ser una palabra reservada
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, error: "El slug es requerido" }
  }

  if (slug.length < 2) {
    return { valid: false, error: "El slug debe tener al menos 2 caracteres" }
  }

  if (slug.length > 50) {
    return { valid: false, error: "El slug no puede tener más de 50 caracteres" }
  }

  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, error: "El slug solo puede contener letras minúsculas, números y guiones" }
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    return { valid: false, error: "El slug no puede empezar o terminar con guión" }
  }

  if (slug.includes("--")) {
    return { valid: false, error: "El slug no puede contener guiones consecutivos" }
  }

  if (SLUG_BLACKLIST.has(slug)) {
    return { valid: false, error: "Este slug no está disponible (palabra reservada)" }
  }

  return { valid: true }
}

// ─── Validación de URLs ────────────────────────────────────────────────────────

const urlSchema = z.string().url("URL inválida").refine(
  (url) => {
    try {
      const parsed = new URL(url)
      // Solo permitir http y https
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  },
  { message: "Solo se permiten URLs HTTP/HTTPS" }
)

/**
 * Valida que una URL sea segura y bien formateada
 * Usa Zod para validación robusta
 */
export function sanitizeUrl(url: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: "La URL es requerida" }
  }

  const trimmed = url.trim()

  const result = urlSchema.safeParse(trimmed)
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message ?? "URL inválida" }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Valida múltiples URLs (para social links, custom links)
 */
export function sanitizeUrls(urls: string[]): { valid: boolean; errors: string[]; sanitized: string[] } {
  const errors: string[] = []
  const sanitized: string[] = []

  urls.forEach((url, index) => {
    const result = sanitizeUrl(url)
    if (result.valid && result.sanitized) {
      sanitized.push(result.sanitized)
    } else {
      errors.push(`URL ${index + 1}: ${result.error}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  }
}

// ─── Validación de Uploads de Imágenes ─────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * Valida un archivo de imagen subido
 * - Tipo MIME permitido
 * - Tamaño máximo 2MB
 */
export function validateImageUpload(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No se proporcionó archivo" }
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: JPEG, PNG, GIF, WebP`,
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de 2MB (actual: ${sizeMB}MB)`,
    }
  }

  return { valid: true }
}

/**
 * Valida un buffer de imagen (para cuando se recibe como buffer en vez de File)
 */
export function validateImageBuffer(
  buffer: Buffer,
  mimeType: string
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `Tipo MIME no permitido: ${mimeType}`,
    }
  }

  if (buffer.length > MAX_IMAGE_SIZE) {
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de 2MB (actual: ${sizeMB}MB)`,
    }
  }

  return { valid: true }
}

// ─── Verificación de Features del Plan ─────────────────────────────────────────

/**
 * Verifica si el plan del cliente permite usar una feature específica
 * 
 * @param planSlug - Slug del plan (trial, basico, pro, premium)
 * @param feature - Feature a verificar (key de PlanFeatures)
 * @returns true si el plan permite la feature
 * 
 * @example
 * if (!checkPlanFeature(planSlug, 'orders')) {
 *   return errorResponse("Tu plan no incluye pedidos en línea", 403)
 * }
 */
export function checkPlanFeature<K extends keyof PlanFeatures>(
  planSlug: string,
  feature: K
): boolean {
  const features = getPlanFeatures(planSlug)
  return features[feature] === true
}

/**
 * Verifica si el plan del cliente permite un límite específico
 * Retorna el límite del plan y si la cantidad actual lo excede
 */
export function checkPlanLimit<K extends keyof PlanLimits>(
  planSlug: string,
  limit: K,
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getPlanLimits(planSlug)
  const maxLimit = limits[limit]
  const remaining = Math.max(0, maxLimit - currentCount)

  return {
    allowed: currentCount < maxLimit,
    limit: maxLimit,
    remaining,
  }
}

/**
 * Obtiene el plan del cliente desde la base de datos
 * y verifica si permite una feature
 */
export async function checkClientPlanFeature(
  clientId: string,
  feature: keyof PlanFeatures
): Promise<{ allowed: boolean; planSlug: string; planName: string }> {
  const subscription = await db.subscription.findUnique({
    where: { clientId },
    include: { plan: true },
  })

  const planSlug = subscription?.plan?.slug ?? "trial"
  const planName = subscription?.plan?.name ?? "Trial"

  return {
    allowed: checkPlanFeature(planSlug, feature),
    planSlug,
    planName,
  }
}

// ─── Logging de Actividad ──────────────────────────────────────────────────────

/**
 * Registra una acción en el log de actividades
 * Reutilizable en todas las rutas API
 * 
 * @param userId - ID del usuario que realiza la acción
 * @param action - Tipo de acción (ej: "site_updated", "order_created")
 * @param entityType - Tipo de entidad (ej: "mini_site", "order", "client")
 * @param entityId - ID de la entidad afectada
 * @param metadata - Datos adicionales (opcional, JSON string)
 */
export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ?? null,
      },
    })
  } catch (error) {
    console.error("Error registrando actividad:", error)
    // No lanzar error para no interrumpir la operación principal
  }
}

// ─── Sanitización de Inputs ────────────────────────────────────────────────────

/**
 * Sanitiza un string para prevenir XSS básico
 * Escapa caracteres HTML peligrosos
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Valida que un color hex sea seguro
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color)
}

// ─── Constantes de Seguridad ───────────────────────────────────────────────────

export const SECURITY = {
  MAX_SLUG_LENGTH: 50,
  MAX_BUSINESS_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_URL_LENGTH: 2048,
  MAX_IMAGE_SIZE_MB: 2,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  RATE_LIMIT: {
    ORDERS_PER_MINUTE: 5,
    LOGIN_PER_MINUTE: 5,
    REGISTER_PER_HOUR: 3,
    UPLOAD_PER_MINUTE: 10,
    API_PER_MINUTE: 30,
  },
} as const
