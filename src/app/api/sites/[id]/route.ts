import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { validateSlug, validateHexColor } from "@/lib/security"

function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const site = await db.miniSite.findUnique({
      where: { id },
      include: {
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
        branches: {
          orderBy: { name: "asc" },
        },
        reservationConfig: true,
        loyaltyConfig: true,
        registrationFieldConfigs: {
          orderBy: { sortOrder: "asc" },
        },
        menuFeaturedSlides: {
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
      },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    // Verify the user owns this site
    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (
      !client ||
      (site.clientId !== client.id && session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({
      site: {
        ...site,
        // Parse sectionOrder from JSON string to array
        sectionOrder: JSON.parse(site.sectionOrder || "[]"),
      },
    })
  } catch (error) {
    console.error("Error fetching site:", error)
    return NextResponse.json(
      { error: "Error al obtener sitio" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify the user owns this site
    const existingSite = await db.miniSite.findUnique({
      where: { id },
      select: { clientId: true, slug: true },
    })

    if (!existingSite) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (
      !client ||
      (existingSite.clientId !== client.id &&
        session.user.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    let {
      businessName,
      tagline,
      description,
      logoUrl,
      faviconUrl,
      backgroundType,
      backgroundColor,
      backgroundGradient,
      backgroundImageUrl,
      cardColor,
      textColor,
      accentColor,
      themeMode,
      isActive,
      isPublished,
      showKingBrand,
      metaTitle,
      metaDescription,
      slug,
      menuTemplate,
      buttonStyle,
      siteTemplate,
      sectionOrder,
    } = body

    // ─── Input Validation ──────────────────────────────────────────────────────

    // Validate businessName if provided
    if (businessName !== undefined) {
      if (typeof businessName !== "string" || businessName.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre del negocio no puede estar vacío" },
          { status: 400 }
        )
      }
      businessName = businessName.trim()
    }

    // Validate slug format if provided
    if (slug !== undefined) {
      if (typeof slug !== "string") {
        return NextResponse.json(
          { error: "El slug debe ser un texto válido" },
          { status: 400 }
        )
      }
      slug = slug.trim().toLowerCase()

      const slugValidation = validateSlug(slug)
      if (!slugValidation.valid) {
        return NextResponse.json({ error: slugValidation.error }, { status: 400 })
      }

      // Check slug uniqueness if being changed
      if (slug !== existingSite.slug) {
        const slugOwner = await db.miniSite.findUnique({
          where: { slug },
          select: { id: true },
        })
        if (slugOwner && slugOwner.id !== id) {
          return NextResponse.json(
            { error: "Este slug ya está en uso por otro sitio" },
            { status: 409 }
          )
        }
      }
    }

    // Validate color fields are valid hex if provided
    const colorFields = [
      { key: "backgroundColor", value: backgroundColor },
      { key: "cardColor", value: cardColor },
      { key: "textColor", value: textColor },
      { key: "accentColor", value: accentColor },
    ] as const

    for (const { key, value } of colorFields) {
      if (value !== undefined) {
        if (typeof value !== "string" || !validateHexColor(value)) {
          const fieldNames: Record<string, string> = {
            backgroundColor: "color de fondo",
            cardColor: "color de tarjeta",
            textColor: "color de texto",
            accentColor: "color de acento",
          }
          return NextResponse.json(
            { error: `El ${fieldNames[key]} debe ser un color hex válido (ej: #D4A849)` },
            { status: 400 }
          )
        }
      }
    }

    // Trim all string inputs
    if (tagline !== undefined && typeof tagline === "string") tagline = tagline.trim()
    if (description !== undefined && typeof description === "string") description = description.trim()
    if (logoUrl !== undefined && typeof logoUrl === "string") logoUrl = logoUrl.trim()
    if (faviconUrl !== undefined && typeof faviconUrl === "string") faviconUrl = faviconUrl.trim()
    if (backgroundImageUrl !== undefined && typeof backgroundImageUrl === "string") backgroundImageUrl = backgroundImageUrl.trim()
    if (backgroundGradient !== undefined && typeof backgroundGradient === "string") backgroundGradient = backgroundGradient.trim()
    if (metaTitle !== undefined && typeof metaTitle === "string") metaTitle = metaTitle.trim()
    if (metaDescription !== undefined && typeof metaDescription === "string") metaDescription = metaDescription.trim()

    // Validate themeMode if provided
    if (themeMode !== undefined) {
      const validModes = ["light", "dark", "both"]
      if (!validModes.includes(themeMode)) {
        return NextResponse.json(
          { error: "Modo de tema no válido. Valores permitidos: light, dark, both" },
          { status: 400 }
        )
      }
    }

    // Validate backgroundType if provided
    if (backgroundType !== undefined) {
      const validBgTypes = ["color", "gradient", "image"]
      if (!validBgTypes.includes(backgroundType)) {
        return NextResponse.json(
          { error: "Tipo de fondo no válido. Valores permitidos: color, gradient, image" },
          { status: 400 }
        )
      }
    }

    // Validate menuTemplate if provided
    if (menuTemplate !== undefined) {
      const validTemplates = ["dark_elegant", "fresh_modern", "warm_casual"]
      if (!validTemplates.includes(menuTemplate)) {
        return NextResponse.json(
          { error: "Plantilla de menú no válida. Valores permitidos: dark_elegant, fresh_modern, warm_casual" },
          { status: 400 }
        )
      }
    }

    // Validate siteTemplate if provided
    if (siteTemplate !== undefined) {
      const validSiteTemplates = ["classic", "medical", "premium", "fashion"]
      if (!validSiteTemplates.includes(siteTemplate)) {
        return NextResponse.json(
          { error: "Plantilla de sitio no válida. Valores permitidos: classic, medical, premium, fashion" },
          { status: 400 }
        )
      }
    }

    const updatedSite = await db.miniSite.update({
      where: { id },
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(slug !== undefined && { slug }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(faviconUrl !== undefined && { faviconUrl }),
        ...(backgroundType !== undefined && { backgroundType }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(backgroundGradient !== undefined && { backgroundGradient }),
        ...(backgroundImageUrl !== undefined && { backgroundImageUrl }),
        ...(cardColor !== undefined && { cardColor }),
        ...(textColor !== undefined && { textColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(themeMode !== undefined && { themeMode }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublished !== undefined && { isPublished }),
        ...(showKingBrand !== undefined && { showKingBrand }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(menuTemplate !== undefined && { menuTemplate }),
        ...(buttonStyle !== undefined && { buttonStyle }),
        ...(siteTemplate !== undefined && { siteTemplate }),
        ...(sectionOrder !== undefined && { sectionOrder: typeof sectionOrder === "string" ? sectionOrder : JSON.stringify(sectionOrder) }),
      },
    })

    return NextResponse.json({ site: updatedSite })
  } catch (error) {
    console.error("Error updating site:", error)
    return NextResponse.json(
      { error: "Error al actualizar sitio" },
      { status: 500 }
    )
  }
}
