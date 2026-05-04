import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    return NextResponse.json({ site })
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
      select: { clientId: true },
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
    const {
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
    } = body

    const updatedSite = await db.miniSite.update({
      where: { id },
      data: {
        ...(businessName !== undefined && { businessName }),
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
