// ─── Plan Features & Toggles ──────────────────────────────────────────────────
// Central definition of all feature toggles available in plans.
// Used by the admin plans page, editor, public site, and API routes.

/**
 * Master list of all feature toggles with their metadata.
 * Each feature maps to a specific section/module in the platform.
 */
export interface FeatureDefinition {
  key: FeatureKey
  label: string
  description: string
  icon: string // Lucide icon name for reference
  category: "content" | "commerce" | "engagement" | "branding" | "advanced"
  /** Which editor tab this feature controls (if any) */
  editorTab?: string
  /** Which public site section this feature controls (if any) */
  siteSection?: string
}

export type FeatureKey =
  // Content
  | "menu"
  | "gallery"
  | "services"
  | "testimonials"
  | "slides"
  | "customLinks"
  | "locations"
  | "socialLinks"
  // Commerce
  | "whatsapp"
  | "orders"
  | "modifiers"
  | "promotions"
  // Engagement
  | "reservations"
  | "loyalty"
  | "registration"
  // Branding
  | "customDomain"
  | "removeBranding"
  | "seo"
  // Advanced
  | "branches"
  | "employees"
  | "aiAssistant"
  | "analytics"

/**
 * Complete feature definitions with metadata.
 */
export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // ── Content ─────────────────────────────────────────────────────
  {
    key: "menu",
    label: "Menú Digital",
    description: "Menú digital completo con categorías, productos, precios y pedidos online",
    icon: "UtensilsCrossed",
    category: "content",
    editorTab: "menu",
    siteSection: "menu",
  },
  {
    key: "gallery",
    label: "Galería",
    description: "Galería de fotos para mostrar imágenes del negocio",
    icon: "Camera",
    category: "content",
    editorTab: "gallery",
    siteSection: "gallery",
  },
  {
    key: "services",
    label: "Servicios",
    description: "Sección de servicios con descripción, precio y botón de acción",
    icon: "Briefcase",
    category: "content",
    editorTab: "services",
    siteSection: "services",
  },
  {
    key: "testimonials",
    label: "Testimonios",
    description: "Sección de reseñas y testimonios de clientes",
    icon: "MessageSquareQuote",
    category: "content",
    editorTab: "testimonials",
    siteSection: "testimonials",
  },
  {
    key: "slides",
    label: "Carrusel",
    description: "Carrusel de imágenes destacadas en la parte superior del sitio",
    icon: "Image",
    category: "content",
    editorTab: "slides",
    siteSection: "slides",
  },
  {
    key: "customLinks",
    label: "Links Personalizados",
    description: "Enlaces personalizados a sitios externos, formularios o recursos",
    icon: "Link2",
    category: "content",
    editorTab: "links",
    siteSection: "customLinks",
  },
  {
    key: "locations",
    label: "Ubicaciones",
    description: "Directorio de ubicaciones con mapa y horarios",
    icon: "MapPin",
    category: "content",
    editorTab: "location",
    siteSection: "locations",
  },
  {
    key: "socialLinks",
    label: "Redes Sociales",
    description: "Botones de enlace a redes sociales (Facebook, Instagram, TikTok, etc.)",
    icon: "Share2",
    category: "content",
    editorTab: "social",
    siteSection: "socialLinks",
  },

  // ── Commerce ────────────────────────────────────────────────────
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Botón flotante de WhatsApp y enlace directo en la sección de contacto",
    icon: "MessageCircle",
    category: "commerce",
    siteSection: "whatsapp",
  },
  {
    key: "orders",
    label: "Pedidos Online",
    description: "Sistema de carrito y pedidos online con notificación por WhatsApp",
    icon: "ShoppingCart",
    category: "commerce",
    siteSection: "orders",
  },
  {
    key: "modifiers",
    label: "Modificadores",
    description: "Modificadores de producto (tamaño, extras, ingredientes) para el menú",
    icon: "Settings2",
    category: "commerce",
    editorTab: "modifiers",
  },
  {
    key: "promotions",
    label: "Promociones",
    description: "Badges de productos (Nuevo, Popular, Agotado) y destacados del menú",
    icon: "Tag",
    category: "commerce",
    editorTab: "menu",
  },

  // ── Engagement ──────────────────────────────────────────────────
  {
    key: "reservations",
    label: "Reservaciones",
    description: "Sistema de reservas con selector de fecha, hora y capacidad",
    icon: "CalendarDays",
    category: "engagement",
    editorTab: "reservations",
    siteSection: "reservations",
  },
  {
    key: "loyalty",
    label: "Programa de Lealtad",
    description: "Programa de puntos y recompensas para clientes frecuentes",
    icon: "Heart",
    category: "engagement",
    editorTab: "loyalty",
    siteSection: "loyalty",
  },
  {
    key: "registration",
    label: "Registro de Clientes",
    description: "Formulario de registro de clientes con campos personalizados",
    icon: "UserPlus",
    category: "engagement",
    editorTab: "registration",
    siteSection: "registration",
  },

  // ── Branding ────────────────────────────────────────────────────
  {
    key: "customDomain",
    label: "Dominio Personalizado",
    description: "Permitir usar un dominio propio para el sitio web",
    icon: "Globe",
    category: "branding",
  },
  {
    key: "removeBranding",
    label: "Quitar Marca QAIROSS",
    description: "Eliminar la marca QAIROSS del pie de página del sitio",
    icon: "EyeOff",
    category: "branding",
  },
  {
    key: "seo",
    label: "SEO Avanzado",
    description: "Campos de meta título y meta descripción para posicionamiento",
    icon: "Search",
    category: "branding",
    editorTab: "seo",
  },

  // ── Advanced ────────────────────────────────────────────────────
  {
    key: "branches",
    label: "Sucursales",
    description: "Gestión de múltiples sucursales con temas independientes",
    icon: "GitBranch",
    category: "advanced",
    editorTab: "branches",
    siteSection: "branches",
  },
  {
    key: "employees",
    label: "Empleados",
    description: "Gestión de empleados con roles y permisos por sucursal",
    icon: "Users",
    category: "advanced",
    editorTab: "employees",
  },
  {
    key: "aiAssistant",
    label: "Asistente IA",
    description: "Asistente de inteligencia artificial para generar contenido del menú",
    icon: "Sparkles",
    category: "advanced",
  },
  {
    key: "analytics",
    label: "Estadísticas",
    description: "Panel de estadísticas con métricas de visitas, clics y pedidos",
    icon: "BarChart3",
    category: "advanced",
  },
]

/** Features that are ALWAYS enabled regardless of plan (core features) */
export const CORE_FEATURES: FeatureKey[] = [
  "menu",        // Core: menu is always available
  "socialLinks", // Core: social links always available
  "locations",   // Core: locations always available
  "whatsapp",    // Core: WhatsApp always available
  "slides",      // Core: carousel always available
]

/**
 * Get a feature definition by key
 */
export function getFeatureDefinition(key: FeatureKey): FeatureDefinition | undefined {
  return FEATURE_DEFINITIONS.find((f) => f.key === key)
}

/**
 * Get features grouped by category for UI display
 */
export function getFeaturesByCategory(): Record<string, FeatureDefinition[]> {
  const groups: Record<string, FeatureDefinition[]> = {}
  for (const feature of FEATURE_DEFINITIONS) {
    if (!groups[feature.category]) {
      groups[feature.category] = []
    }
    groups[feature.category].push(feature)
  }
  return groups
}

/**
 * Parse the features JSON from a plan and return a typed record.
 * Returns all features as true if the plan has no explicit features set (backwards compatibility).
 */
export function parsePlanFeatures(featuresJson: string | null | undefined): Record<FeatureKey, boolean> {
  const defaults: Record<string, boolean> = {}
  for (const f of FEATURE_DEFINITIONS) {
    defaults[f.key] = true // Default: all features enabled (backwards compatible)
  }

  if (!featuresJson) return defaults as Record<FeatureKey, boolean>

  try {
    const parsed = JSON.parse(featuresJson)
    return { ...defaults, ...parsed } as Record<FeatureKey, boolean>
  } catch {
    return defaults as Record<FeatureKey, boolean>
  }
}

/**
 * Check if a specific feature is enabled for a given site.
 * Looks up: site -> client -> subscription -> plan -> features
 */
export async function getSiteFeatures(siteId: string): Promise<Record<FeatureKey, boolean>> {
  const { db } = await import("@/lib/db")

  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: {
      clientId: true,
      client: {
        select: {
          subscription: {
            select: {
              plan: {
                select: { features: true },
              },
            },
          },
        },
      },
    },
  })

  if (!site?.client?.subscription?.plan) {
    // No plan = all features enabled (backwards compatible)
    const defaults: Record<string, boolean> = {}
    for (const f of FEATURE_DEFINITIONS) {
      defaults[f.key] = true
    }
    return defaults as Record<FeatureKey, boolean>
  }

  return parsePlanFeatures(site.client.subscription.plan.features)
}

/**
 * Check if a specific feature is enabled for a site.
 */
export async function isFeatureEnabled(siteId: string, featureKey: FeatureKey): Promise<boolean> {
  const features = await getSiteFeatures(siteId)
  return features[featureKey] ?? true
}

/**
 * Get editor tabs that should be visible based on plan features.
 * Returns the list of EditorTab values that are enabled.
 */
export function getEnabledEditorTabs(features: Record<FeatureKey, boolean>): string[] {
  const tabMap: Record<string, FeatureKey> = {}
  for (const def of FEATURE_DEFINITIONS) {
    if (def.editorTab) {
      tabMap[def.editorTab] = def.key
    }
  }

  // Tabs that don't map to any feature toggle (always shown)
  const alwaysTabs = ["template", "info", "appearance", "contact", "buttons"]

  const enabledTabs = new Set<string>(alwaysTabs)

  for (const [tab, featureKey] of Object.entries(tabMap)) {
    if (features[featureKey as FeatureKey]) {
      enabledTabs.add(tab)
    }
  }

  return Array.from(enabledTabs)
}

/**
 * Get the category labels in Spanish for UI display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  content: "Contenido",
  commerce: "Comercio",
  engagement: "Compromiso",
  branding: "Marca",
  advanced: "Avanzado",
}
