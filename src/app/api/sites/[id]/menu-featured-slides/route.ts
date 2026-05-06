import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { verifySiteOwnership } from "@/lib/api-helpers"

// ─── GET: Fetch all featured slides for a site ──────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifySiteOwnership(session.user.id, siteId)

    const slides = await db.menuFeaturedSlide.findMany({
      where: { miniSiteId: siteId },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ slides })
  } catch (error: any) {
    console.error("[Featured Slides] GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ─── POST: Create a new featured slide ──────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifySiteOwnership(session.user.id, siteId)

    const body = await request.json()
    const { imageUrl, title, sortOrder, enabled } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
    }

    // Max 5 slides
    const count = await db.menuFeaturedSlide.count({
      where: { miniSiteId: siteId },
    })
    if (count >= 5) {
      return NextResponse.json(
        { error: "Máximo 5 fotos destacadas permitidas" },
        { status: 400 }
      )
    }

    const slide = await db.menuFeaturedSlide.create({
      data: {
        miniSiteId: siteId,
        imageUrl,
        title: title || null,
        sortOrder: sortOrder ?? count,
        enabled: enabled ?? true,
      },
    })

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error: any) {
    console.error("[Featured Slides] POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ─── PUT: Update a featured slide ───────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifySiteOwnership(session.user.id, siteId)

    const body = await request.json()
    const { slideId, ...fields } = body

    if (!slideId) {
      return NextResponse.json({ error: "slideId is required" }, { status: 400 })
    }

    const slide = await db.menuFeaturedSlide.update({
      where: { id: slideId, miniSiteId: siteId },
      data: {
        ...(fields.imageUrl !== undefined && { imageUrl: fields.imageUrl }),
        ...(fields.title !== undefined && { title: fields.title }),
        ...(fields.sortOrder !== undefined && { sortOrder: fields.sortOrder }),
        ...(fields.enabled !== undefined && { enabled: fields.enabled }),
      },
    })

    return NextResponse.json({ slide })
  } catch (error: any) {
    console.error("[Featured Slides] PUT error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ─── DELETE: Remove a featured slide ────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifySiteOwnership(session.user.id, siteId)

    const { searchParams } = new URL(request.url)
    const slideId = searchParams.get("slideId")

    if (!slideId) {
      return NextResponse.json({ error: "slideId is required" }, { status: 400 })
    }

    await db.menuFeaturedSlide.delete({
      where: { id: slideId, miniSiteId: siteId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Featured Slides] DELETE error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
