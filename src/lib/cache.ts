// ─── Simple In-Memory Cache ─────────────────────────────────────────────────
// Provides TTL-based caching for frequently accessed data (menus, site configs).
// Suitable for single-instance deployments; use Redis for multi-instance.

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private defaultTTL: number

  constructor(defaultTTLMs: number = 60_000) {
    this.defaultTTL = defaultTTLMs
    // Periodic cleanup every 5 minutes
    if (typeof globalThis !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60_000)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL
    this.store.set(key, { value, expiresAt: Date.now() + ttl })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  invalidate(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  size(): number {
    return this.store.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }
}

// ─── Singleton instances ────────────────────────────────────────────────────

/** Cache for site menu/catalog data (30s TTL) */
export const menuCache = new MemoryCache(30_000)

/** Cache for site public data (60s TTL) */
export const siteCache = new MemoryCache(60_000)

/** Cache for modifier groups (30s TTL) */
export const modifierCache = new MemoryCache(30_000)

/** Cache for platform settings (5min TTL) */
export const platformCache = new MemoryCache(5 * 60_000)

/** Cache for analytics/aggregation (2min TTL) */
export const analyticsCache = new MemoryCache(2 * 60_000)

/** General purpose cache with 1min default TTL */
export const cache = new MemoryCache(60_000)
