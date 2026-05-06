import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkBranchLimit } from "@/lib/product-limits"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyOwnership(siteId: string, userId: string) {
  const site = await db.miniSite.findUnique({
    where: { id: siteId },
    select: { clientId: true },
  })
  if (!site) return false
  const client = await db.client.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  })
  if (!client) return false
  return site.clientId === client.id
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ─── POST: Create Branch ──────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug: providedSlug } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre de la sucursal es obligatorio" },
        { status: 400 }
      )
    }

    // Check plan branch limit
    const limitCheck = await checkBranchLimit(siteId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message || "Has alcanzado el límite de sucursales en tu plan" },
        { status: 403 }
      )
    }

    // Generate slug from name if not provided
    let slug = providedSlug && typeof providedSlug === "string"
      ? providedSlug.trim().toLowerCase()
      : slugify(name.trim())

    // Validate slug format
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
      return NextResponse.json(
        { error: "El slug solo puede contener letras minúsculas, números y guiones" },
        { status: 400 }
      )
    }

    // Check slug uniqueness within site
    const existing = await db.branch.findUnique({
      where: { siteId_slug: { siteId, slug } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una sucursal con ese slug en este sitio" },
        { status: 409 }
      )
    }

    const branch = await db.branch.create({
      data: {
        siteId,
        slug,
        name: name.trim(),
        description: body.description?.trim() || null,
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        email: body.email?.trim() || null,
        website: body.website?.trim() || null,
        state: body.state?.trim() || null,
        city: body.city?.trim() || null,
        address: body.address?.trim() || null,
        mapsUrl: body.mapsUrl?.trim() || null,
        coverUrl: body.coverUrl?.trim() || null,
        logoUrl: body.logoUrl?.trim() || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isPublished: body.isPublished !== undefined ? body.isPublished : false,
        showQairossBrand: body.showQairossBrand !== undefined ? body.showQairossBrand : true,
        hours: body.hours || "{}",
        socialLinks: body.socialLinks || "{}",
        themeOverrides: body.themeOverrides || "{}",
        buttonStyle: body.buttonStyle || "cylinder_pill",
        metaTitle: body.metaTitle?.trim() || null,
        metaDescription: body.metaDescription?.trim() || null,
      },
    })

    return NextResponse.json({ branch }, { status: 201 })
  } catch (error) {
    console.error("Error creating branch:", error)
    return NextResponse.json(
      { error: "Error al crear sucursal" },
      { status: 500 }
    )
  }
}

// ─── GET: List Branches ────────────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const branches = await db.branch.findMany({
      where: { siteId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ branches })
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json(
      { error: "Error al obtener sucursales" },
      { status: 500 }
    )
  }
}

// ─── PUT: Update Branch ────────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { branchId, ...fields } = body

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId es requerido" },
        { status: 400 }
      )
    }

    // If slug is being changed, check uniqueness
    if (fields.slug && typeof fields.slug === "string") {
      fields.slug = fields.slug.trim().toLowerCase()
      if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(fields.slug)) {
        return NextResponse.json(
          { error: "El slug solo puede contener letras minúsculas, números y guiones" },
          { status: 400 }
        )
      }
      const existing = await db.branch.findFirst({
        where: { siteId, slug: fields.slug, id: { not: branchId } },
      })
      if (existing) {
        return NextResponse.json(
          { error: "Ya existe una sucursal con ese slug en este sitio" },
          { status: 409 }
        )
      }
    }

    // Trim string fields
    const stringFields = [
      "name", "description", "phone", "whatsapp", "email", "website",
      "state", "city", "address", "mapsUrl", "coverUrl", "logoUrl",
      "metaTitle", "metaDescription", "hours", "socialLinks", "themeOverrides",
      "buttonStyle",
    ] as const

    for (const key of stringFields) {
      if (fields[key] !== undefined && typeof fields[key] === "string") {
        fields[key] = fields[key].trim()
      }
    }

    const branch = await db.branch.update({
      where: { id: branchId },
      data: fields,
    })

    return NextResponse.json({ branch })
  } catch (error) {
    console.error("Error updating branch:", error)
    return NextResponse.json(
      { error: "Error al actualizar sucursal" },
      { status: 500 }
    )
  }
}

// ─── DELETE: Remove Branch ─────────────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: siteId } = await params
    if (!(await verifyOwnership(siteId, session.user.id))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId es requerido" },
        { status: 400 }
      )
    }

    await db.branch.delete({ where: { id: branchId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting branch:", error)
    return NextResponse.json(
      { error: "Error al eliminar sucursal" },
      { status: 500 }
    )
  }
}
