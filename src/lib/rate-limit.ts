// ─── KINGNECT — Rate Limiter In-Memory ─────────────────────────────────────────
// Limitador de peticiones en memoria usando Map
// Sin dependencias externas (no Redis necesario)
// Limpieza periódica automática de entradas expiradas

interface RateLimitEntry {
  count: number
  resetAt: number // Timestamp cuando se resetea el contador
}

// Mapa de rate limits: key → RateLimitEntry
const rateLimitMap = new Map<string, RateLimitEntry>()

// Intervalo de limpieza: cada 5 minutos
const CLEANUP_INTERVAL = 5 * 60 * 1000

// Última limpieza
let lastCleanup = Date.now()

/**
 * Verifica si una petición está dentro del límite permitido
 * 
 * @param key - Identificador único (ej: IP, userId, combinación)
 * @param maxRequests - Número máximo de peticiones en la ventana
 * @param windowMs - Ventana de tiempo en milisegundos (default: 60000 = 1 minuto)
 * @returns true si la petición está permitida, false si excede el límite
 * 
 * @example
 * // Limitar a 5 pedidos por minuto por IP
 * const allowed = rateLimit(`order:${ip}`, 5, 60000)
 * if (!allowed) return errorResponse("Demasiadas peticiones", 429)
 */
export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  // Limpiar entradas expiradas periódicamente
  if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
    cleanup()
    lastCleanup = Date.now()
  }

  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Si no hay entrada o ya expiró, crear nueva
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    rateLimitMap.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt,
    }
  }

  // Incrementar contador
  entry.count++

  // Verificar límite
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Limpia todas las entradas expiradas del mapa
 */
function cleanup() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Resetea el rate limit para una clave específica
 * Útil para testing o para casos especiales
 */
export function resetRateLimit(key: string) {
  rateLimitMap.delete(key)
}

/**
 * Obtiene estadísticas actuales del rate limiter (para debugging/admin)
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitMap.size,
    entries: Array.from(rateLimitMap.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetAt: new Date(entry.resetAt).toISOString(),
      expired: Date.now() > entry.resetAt,
    })),
  }
}

// ─── Presets de Rate Limiting ──────────────────────────────────────────────────

/** Rate limit para creación de pedidos: 5 por minuto */
export function rateLimitOrders(ip: string) {
  return rateLimit(`order:${ip}`, 5, 60000)
}

/** Rate limit para registro: 3 por hora */
export function rateLimitRegister(ip: string) {
  return rateLimit(`register:${ip}`, 3, 3600000)
}

/** Rate limit para login: 5 por minuto */
export function rateLimitLogin(ip: string) {
  return rateLimit(`login:${ip}`, 5, 60000)
}

/** Rate limit para subida de archivos: 10 por minuto */
export function rateLimitUpload(userId: string) {
  return rateLimit(`upload:${userId}`, 10, 60000)
}

/** Rate limit para APIs generales: 30 por minuto */
export function rateLimitApi(userId: string) {
  return rateLimit(`api:${userId}`, 30, 60000)
}
