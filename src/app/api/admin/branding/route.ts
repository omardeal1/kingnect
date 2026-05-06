import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET: List all clients with their branding status
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const clients = await db.client.findMany({
      where,
      include: {
        miniSites: {
          select: { id: true, slug: true, showKingBrand: true },
        },
        subscription: {
          include: { plan: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const brandingData = clients.map((client) => {
      // Use the first mini-site's showKingBrand, or default to true if no sites
      const brandVisible = client.miniSites.length > 0
        ? client.miniSites.every((site) => site.showKingBrand)
        : true

      return {
        id: client.id,
        businessName: client.businessName,
        contactName: client.contactName,
        email: client.email,
        canControlBranding: client.canControlBranding,
        brandVisible,
        miniSiteCount: client.miniSites.length,
        plan: client.subscription?.plan?.name ?? null,
        planSlug: client.subscription?.plan?.slug ?? null,
        accountStatus: client.accountStatus,
      }
    })

    return NextResponse.json({ clients: brandingData })
  } catch (error) {
    console.error("Admin branding GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Update branding settings for a specific client
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, showBrand, canControlBranding } = body

    if (!clientId) {
      return NextResponse.json({ error: "clientId es requerido" }, { status: 400 })
    }

    if (typeof showBrand !== "boolean" && typeof canControlBranding !== "boolean") {
      return NextResponse.json(
        { error: "Se requiere showBrand o canControlBranding" },
        { status: 400 }
      )
    }

    // Build client update data
    const clientUpdateData: Record<string, unknown> = {}
    if (typeof canControlBranding === "boolean") {
      clientUpdateData.canControlBranding = canControlBranding
    }

    // Update client if needed
    if (Object.keys(clientUpdateData).length > 0) {
      await db.client.update({
        where: { id: clientId },
        data: clientUpdateData,
      })
    }

    // Update all mini-sites' showKingBrand if showBrand is provided
    if (typeof showBrand === "boolean") {
      await db.miniSite.updateMany({
        where: { clientId },
        data: { showKingBrand: showBrand },
      })
    }

    // Log activity
    const changes: string[] = []
    if (typeof showBrand === "boolean") {
      changes.push(showBrand ? "marca visible" : "marca oculta")
    }
    if (typeof canControlBranding === "boolean") {
      changes.push(canControlBranding ? "control de marca permitido" : "control de marca revocado")
    }

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Branding actualizado: ${changes.join(", ")}`,
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin branding PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Bulk branding action (show/hide all)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { showBrand } = body

    if (typeof showBrand !== "boolean") {
      return NextResponse.json({ error: "showBrand es requerido (boolean)" }, { status: 400 })
    }

    // Update ALL mini-sites
    const result = await db.miniSite.updateMany({
      data: { showKingBrand: showBrand },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Marca ${showBrand ? "visible" : "oculta"} para todos los clientes (${result.count} sitios)`,
        entityType: "platform",
      },
    })

    return NextResponse.json({ success: true, updatedCount: result.count })
  } catch (error) {
    console.error("Admin branding POST (bulk) error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
