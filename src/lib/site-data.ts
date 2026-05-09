import { db } from "@/lib/db"

// Fetches full site data for rendering, shared by all site pages
export async function getSiteData(slug: string) {
  const site = await db.miniSite.findUnique({
    where: { slug },
    include: {
      client: { select: { whatsapp: true, accountStatus: true } },
      socialLinks: { orderBy: { sortOrder: "asc" } },
      contactButtons: { orderBy: { sortOrder: "asc" } },
      locations: { orderBy: { sortOrder: "asc" } },
      slides: { orderBy: { sortOrder: "asc" } },
      menuCategories: {
        orderBy: { sortOrder: "asc" },
        include: { menuItems: { orderBy: { sortOrder: "asc" } } },
      },
      galleryImages: { orderBy: { sortOrder: "asc" } },
      services: { orderBy: { sortOrder: "asc" } },
      testimonials: { orderBy: { sortOrder: "asc" } },
      customLinks: { orderBy: { sortOrder: "asc" } },
      modifierGroups: {
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
      reservationConfig: true,
      loyaltyConfig: true,
      registrationFieldConfigs: { orderBy: { sortOrder: "asc" } },
      menuFeaturedSlides: { orderBy: { sortOrder: "asc" } },
    },
  })
  return site
}

// Serialize site data for client components (converts dates to strings)
export function serializeSite(site: any) {
  if (!site) return null
  return {
    ...site,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    menuCategories: (site.menuCategories || []).map((cat: any) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      menuItems: (cat.menuItems || []).map((item: any) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    })),
    socialLinks: (site.socialLinks || []).map((l: any) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    contactButtons: (site.contactButtons || []).map((b: any) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    locations: (site.locations || []).map((l: any) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    slides: (site.slides || []).map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    galleryImages: (site.galleryImages || []).map((g: any) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    })),
    services: (site.services || []).map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    testimonials: (site.testimonials || []).map((t: any) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    customLinks: (site.customLinks || []).map((l: any) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    modifierGroups: (site.modifierGroups || []).map((g: any) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      options: (g.options || []).map((o: any) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
    })),
    reservationConfig: site.reservationConfig
      ? {
          ...site.reservationConfig,
          createdAt: site.reservationConfig.createdAt.toISOString(),
          updatedAt: site.reservationConfig.updatedAt.toISOString(),
          availableDays: JSON.parse(site.reservationConfig.availableDays || "[]"),
          timeSlots: JSON.parse(site.reservationConfig.timeSlots || "[]"),
        }
      : null,
    loyaltyConfig: site.loyaltyConfig
      ? {
          ...site.loyaltyConfig,
          createdAt: site.loyaltyConfig.createdAt.toISOString(),
          updatedAt: site.loyaltyConfig.updatedAt.toISOString(),
        }
      : null,
    registrationFields: (site.registrationFieldConfigs || []).map((f: any) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
    menuFeaturedSlides: (site.menuFeaturedSlides || []).map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  }
}

// Check if site is accessible (active, published, not blocked)
export function isSiteAccessible(site: any): boolean {
  if (!site) return false
  if (!site.isActive) return false
  if (!site.isPublished) return false
  const blockedStatuses = ["blocked", "payment_failed", "cancelled", "trial_expired"]
  if (blockedStatuses.includes(site.client?.accountStatus)) return false
  return true
}

// Valid internal section names that map to sub-pages
export const VALID_SECTIONS = [
  "menu",
  "servicios",
  "galeria",
  "reservaciones",
  "opiniones",
  "ubicacion",
  "contacto",
  "promociones",
  "eventos",
  "links",
] as const

export type SectionName = (typeof VALID_SECTIONS)[number]

export function isSectionName(value: string): value is SectionName {
  return (VALID_SECTIONS as readonly string[]).includes(value)
}

// Human-readable section names for metadata
export const SECTION_LABELS: Record<string, string> = {
  menu: "Menú",
  servicios: "Servicios",
  galeria: "Galería",
  reservaciones: "Reservaciones",
  opiniones: "Opiniones",
  ubicacion: "Ubicación",
  contacto: "Contacto",
  promociones: "Promociones",
  eventos: "Eventos",
  links: "Más",
}
