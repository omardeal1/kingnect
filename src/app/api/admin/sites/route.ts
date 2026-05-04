import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (status === "active") {
      where.isActive = true
      where.isPublished = true
    } else if (status === "inactive") {
      where.isActive = false
    } else if (status === "published") {
      where.isPublished = true
    } else if (status === "draft") {
      where.isPublished = false
      where.isActive = true
    }

    const sites = await db.miniSite.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            businessName: true,
            accountStatus: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ sites })
  } catch (error) {
    console.error("Admin sites GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, slug, businessName } = body

    if (!clientId || !slug || !businessName) {
      return NextResponse.json(
        { error: "clientId, slug y businessName son requeridos" },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.miniSite.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "El slug ya está en uso" }, { status: 400 })
    }

    const site = await db.miniSite.create({
      data: {
        clientId,
        slug,
        businessName,
        isActive: true,
        isPublished: false,
      },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Mini web creada: ${businessName}`,
        entityType: "mini_site",
        entityId: site.id,
      },
    })

    return NextResponse.json({ site }, { status: 201 })
  } catch (error) {
    console.error("Admin sites POST error:", error)
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
    const { siteId, isActive, isPublished, slug } = body

    if (!siteId) {
      return NextResponse.json({ error: "siteId es requerido" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (isPublished !== undefined) updateData.isPublished = isPublished
    if (slug !== undefined) {
      // Check slug uniqueness
      const existing = await db.miniSite.findFirst({
        where: { slug, id: { not: siteId } },
      })
      if (existing) {
        return NextResponse.json({ error: "El slug ya está en uso" }, { status: 400 })
      }
      updateData.slug = slug
    }

    const site = await db.miniSite.update({
      where: { id: siteId },
      data: updateData,
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Mini web actualizada: ${Object.keys(updateData).join(", ")}`,
        entityType: "mini_site",
        entityId: siteId,
      },
    })

    return NextResponse.json({ site })
  } catch (error) {
    console.error("Admin sites PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
