import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DEFAULT_SECTIONS, SECTION_ORDER } from "@/lib/landing-content"
import type { LandingSection } from "@/lib/landing-content"

// ─── GET: Fetch all global landing content sections ─────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Fetch all landing content where siteId is null (global landing)
    const records = await db.landingContent.findMany({
      where: { siteId: null },
      orderBy: { sortOrder: "asc" },
    })

    // Merge DB records with defaults for any missing sections
    const sections: LandingSection[] = SECTION_ORDER.map((key, index) => {
      const record = records.find((r) => r.sectionKey === key)
      if (record) {
        return {
          id: record.id,
          sectionKey: record.sectionKey,
          sectionType: record.sectionType as "json" | "image",
          title: record.title,
          subtitle: record.subtitle,
          content: JSON.parse(record.content || "{}"),
          images: JSON.parse(record.images || "[]"),
          isActive: record.isActive,
          sortOrder: record.sortOrder,
        }
      }

      // Return default for missing sections
      const def = DEFAULT_SECTIONS[key]
      return {
        ...def,
        sortOrder: index,
        isActive: true,
      }
    })

    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Admin landing-content GET error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// ─── PUT: Bulk save/update landing content sections (draft) ────────────────────

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { sections } = body as { sections: LandingSection[] }

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Secciones inválidas" },
        { status: 400 }
      )
    }

    // Upsert each section
    for (const section of sections) {
      const contentStr =
        typeof section.content === "string"
          ? section.content
          : JSON.stringify(section.content ?? {})
      const imagesStr =
        typeof section.images === "string"
          ? section.images
          : JSON.stringify(section.images ?? [])

      await db.landingContent.upsert({
        where: { sectionKey: section.sectionKey },
        update: {
          sectionType: section.sectionType,
          title: section.title ?? null,
          subtitle: section.subtitle ?? null,
          content: contentStr,
          images: imagesStr,
          isActive: section.isActive,
          sortOrder: section.sortOrder,
          siteId: null, // explicitly keep global
        },
        create: {
          sectionKey: section.sectionKey,
          sectionType: section.sectionType,
          title: section.title ?? null,
          subtitle: section.subtitle ?? null,
          content: contentStr,
          images: imagesStr,
          isActive: section.isActive,
          sortOrder: section.sortOrder,
        },
      })
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Landing content guardado (borrador)",
        entityType: "landing_content",
      },
    })

    return NextResponse.json({ success: true, message: "Borrador guardado" })
  } catch (error) {
    console.error("Admin landing-content PUT error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// ─── POST: Publish all sections (set isActive = true) ───────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { sections } = body as { sections: LandingSection[] }

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Secciones inválidas" },
        { status: 400 }
      )
    }

    // Save and activate all sections
    for (const section of sections) {
      const contentStr =
        typeof section.content === "string"
          ? section.content
          : JSON.stringify(section.content ?? {})
      const imagesStr =
        typeof section.images === "string"
          ? section.images
          : JSON.stringify(section.images ?? [])

      await db.landingContent.upsert({
        where: { sectionKey: section.sectionKey },
        update: {
          sectionType: section.sectionType,
          title: section.title ?? null,
          subtitle: section.subtitle ?? null,
          content: contentStr,
          images: imagesStr,
          isActive: true, // Always activate on publish
          sortOrder: section.sortOrder,
          siteId: null,
        },
        create: {
          sectionKey: section.sectionKey,
          sectionType: section.sectionType,
          title: section.title ?? null,
          subtitle: section.subtitle ?? null,
          content: contentStr,
          images: imagesStr,
          isActive: true,
          sortOrder: section.sortOrder,
        },
      })
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Landing content publicado",
        entityType: "landing_content",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Cambios publicados exitosamente",
    })
  } catch (error) {
    console.error("Admin landing-content POST error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
