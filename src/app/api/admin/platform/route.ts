import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Get all platform settings
    const settings = await db.platformSetting.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.type === "json" ? s.value : s.value
    }

    // Get all platform sections
    const sections = await db.platformSection.findMany({
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ settings: settingsMap, sections })
  } catch (error) {
    console.error("Admin platform GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { settings, sections } = body

    // Update settings
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        const existing = await db.platformSetting.findUnique({ where: { key } })
        if (existing) {
          await db.platformSetting.update({
            where: { key },
            data: {
              value: String(value),
              updatedBy: session.user.email,
            },
          })
        } else {
          await db.platformSetting.create({
            data: {
              key,
              value: String(value),
              type: "text",
              updatedBy: session.user.email,
            },
          })
        }
      }
    }

    // Update sections
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        if (section.id) {
          await db.platformSection.update({
            where: { id: section.id },
            data: {
              title: section.title,
              subtitle: section.subtitle,
              content: section.content,
              imageUrl: section.imageUrl,
              enabled: section.enabled,
              sortOrder: section.sortOrder,
            },
          })
        } else if (section.sectionKey) {
          await db.platformSection.upsert({
            where: { sectionKey: section.sectionKey },
            update: {
              title: section.title,
              subtitle: section.subtitle,
              content: section.content,
              imageUrl: section.imageUrl,
              enabled: section.enabled,
              sortOrder: section.sortOrder,
            },
            create: {
              sectionKey: section.sectionKey,
              title: section.title,
              subtitle: section.subtitle,
              content: section.content,
              imageUrl: section.imageUrl,
              enabled: section.enabled ?? true,
              sortOrder: section.sortOrder ?? 0,
            },
          })
        }
      }
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Configuración de plataforma actualizada",
        entityType: "platform",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin platform PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
