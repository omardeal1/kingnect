import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { MiniSitePage } from "@/components/minisite/minisite-page"
import { BlockedScreen } from "@/components/minisite/blocked-screen"
import type { Metadata, Viewport } from "next"

interface BranchPageProps {
  params: Promise<{ slug: string; branch: string }>
}

export async function generateMetadata({
  params,
}: BranchPageProps): Promise<Metadata> {
  const { slug, branch: branchSlug } = await params

  const branch = await db.branch.findFirst({
    where: {
      slug: branchSlug,
      site: { slug },
      isPublished: true,
      isActive: true,
    },
    select: {
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      logoUrl: true,
      coverUrl: true,
      site: {
        select: {
          accentColor: true,
          businessName: true,
          logoUrl: true,
        },
      },
    },
  })

  if (!branch) {
    return { title: "Página no encontrada" }
  }

  const title =
    branch.metaTitle ||
    `${branch.name} — ${branch.site.businessName} — QAIROSS`
  const description =
    branch.metaDescription ||
    branch.description ||
    `Visita ${branch.name} de ${branch.site.businessName}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://links.qaiross.app/${slug}/${branchSlug}`,
      siteName: branch.site.businessName,
      type: "website",
      images: [
        {
          url: branch.coverUrl || branch.logoUrl || branch.site.logoUrl || "",
          alt: branch.name,
        },
      ],
    },
  }
}

export async function generateViewport({
  params,
}: BranchPageProps): Promise<Viewport> {
  const { slug } = await params

  const site = await db.miniSite.findUnique({
    where: { slug },
    select: { accentColor: true },
  })

  // Allow branch-level theme overrides for theme color
  const branch = await db.branch.findFirst({
    where: {
      slug: (await params).branch,
      site: { slug },
      isPublished: true,
      isActive: true,
    },
    select: { themeOverrides: true },
  })

  let accentColor = site?.accentColor || "#D4A849"
  if (branch?.themeOverrides) {
    try {
      const overrides = JSON.parse(branch.themeOverrides)
      if (overrides.accentColor) {
        accentColor = overrides.accentColor
      }
    } catch {
      // ignore parse errors
    }
  }

  return {
    themeColor: accentColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { slug, branch: branchSlug } = await params

  const branch = await db.branch.findFirst({
    where: {
      slug: branchSlug,
      site: { slug },
      isPublished: true,
      isActive: true,
    },
    include: {
      site: {
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
          modifierGroups: {
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          reservationConfig: true,
        },
      },
    },
  })

  if (!branch) {
    notFound()
  }

  const site = branch.site

  // Check if the parent site is blocked/inactive
  if (
    !site.isActive ||
    site.client?.accountStatus === "blocked" ||
    site.client?.accountStatus === "payment_failed" ||
    site.client?.accountStatus === "cancelled" ||
    site.client?.accountStatus === "trial_expired"
  ) {
    return <BlockedScreen businessName={branch.name} />
  }

  if (!site.isPublished) {
    return <BlockedScreen businessName={branch.name} />
  }

  // ─── Parse branch theme overrides ─────────────────────────────────────────
  let themeOverrides: Record<string, unknown> = {}
  try {
    themeOverrides = JSON.parse(branch.themeOverrides || "{}")
  } catch {
    // ignore
  }

  // Build the site object, applying branch-level overrides
  const accentColor = (themeOverrides.accentColor as string) || site.accentColor
  const textColor = (themeOverrides.textColor as string) || site.textColor
  const cardColor = (themeOverrides.cardColor as string) || site.cardColor
  const backgroundColor =
    (themeOverrides.backgroundColor as string) || site.backgroundColor
  const backgroundType =
    (themeOverrides.backgroundType as string) || site.backgroundType
  const backgroundGradient =
    (themeOverrides.backgroundGradient as string) || site.backgroundGradient
  const backgroundImageUrl =
    (themeOverrides.backgroundImageUrl as string) || site.backgroundImageUrl
  const themeMode = (themeOverrides.themeMode as string) || site.themeMode
  const buttonStyle = branch.buttonStyle || site.buttonStyle

  // Override business name with branch name
  const businessName = branch.name
  const tagline = branch.description || site.tagline
  const logoUrl = branch.logoUrl || site.logoUrl

  // ─── Serialize dates ──────────────────────────────────────────────────────
  const serializedSite = {
    ...site,
    businessName,
    tagline,
    logoUrl,
    accentColor,
    textColor,
    cardColor,
    backgroundColor,
    backgroundType,
    backgroundGradient,
    backgroundImageUrl,
    themeMode,
    buttonStyle,
    showKingBrand: branch.showQairossBrand,
    // Override slug to include branch path
    slug: `${site.slug}/${branch.slug}`,
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
    modifierGroups: site.modifierGroups.map((g) => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
      options: g.options.map((o) => ({
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
        }
      : null,
  }

  // ─── Track view analytics ────────────────────────────────────────────────
  try {
    await db.analyticsEvent.create({
      data: {
        miniSiteId: site.id,
        eventType: "view",
        metadata: JSON.stringify({
          slug: `${site.slug}/${branch.slug}`,
          branchId: branch.id,
          branchName: branch.name,
        }),
      },
    })
  } catch {
    // Silently fail analytics
  }

  return <MiniSitePage site={serializedSite} />
}
