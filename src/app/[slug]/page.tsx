import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { MiniSitePage } from "@/components/minisite/minisite-page"
import { BlockedScreen } from "@/components/minisite/blocked-screen"
import type { Metadata, Viewport } from "next"

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const site = await db.miniSite.findUnique({
    where: { slug },
    select: {
      businessName: true,
      tagline: true,
      metaTitle: true,
      metaDescription: true,
      logoUrl: true,
      accentColor: true,
    },
  })

  if (!site) {
    return { title: "Página no encontrada" }
  }

  const title = site.metaTitle || `${site.businessName} — Mini Web`
  const description = site.metaDescription || site.tagline || `Visita ${site.businessName}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://links.kingnect.app/${slug}`,
      siteName: site.businessName,
      type: "website",
      ...(site.logoUrl && { images: [{ url: site.logoUrl, alt: site.businessName }] }),
    },
  }
}

export async function generateViewport({ params }: SlugPageProps): Promise<Viewport> {
  const { slug } = await params
  const site = await db.miniSite.findUnique({
    where: { slug },
    select: { accentColor: true },
  })

  return {
    themeColor: site?.accentColor || "#D4A849",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params

  const site = await db.miniSite.findUnique({
    where: { slug },
    include: {
      client: {
        select: { whatsapp: true, accountStatus: true },
      },
      socialLinks: {
        orderBy: { sortOrder: "asc" },
      },
      contactButtons: {
        orderBy: { sortOrder: "asc" },
      },
      locations: {
        orderBy: { sortOrder: "asc" },
      },
      slides: {
        orderBy: { sortOrder: "asc" },
      },
      menuCategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItems: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      menuItems: {
        orderBy: { sortOrder: "asc" },
      },
      galleryImages: {
        orderBy: { sortOrder: "asc" },
      },
      services: {
        orderBy: { sortOrder: "asc" },
      },
      testimonials: {
        orderBy: { sortOrder: "asc" },
      },
      customLinks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!site) {
    notFound()
  }

  // Check if blocked/inactive
  if (!site.isActive || site.client?.accountStatus === "blocked") {
    return <BlockedScreen businessName={site.businessName} />
  }

  // Check if not published (show as blocked for now)
  if (!site.isPublished) {
    return <BlockedScreen businessName={site.businessName} />
  }

  // Serialize dates for client component
  const serializedSite = {
    ...site,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    menuCategories: site.menuCategories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      menuItems: cat.menuItems.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    })),
    menuItems: site.menuItems.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    socialLinks: site.socialLinks.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    contactButtons: site.contactButtons.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    locations: site.locations.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    slides: site.slides.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    galleryImages: site.galleryImages.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    })),
    services: site.services.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    testimonials: site.testimonials.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    customLinks: site.customLinks.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
  }

  // Track view analytics
  try {
    await db.analyticsEvent.create({
      data: {
        miniSiteId: site.id,
        eventType: "view",
        metadata: JSON.stringify({ slug }),
      },
    })
  } catch {
    // Silently fail analytics
  }

  return <MiniSitePage site={serializedSite} />
}
