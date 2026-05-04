import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId es requerido" },
        { status: 400 }
      )
    }

    // Verify the site belongs to the authenticated user
    const site = await db.miniSite.findUnique({
      where: { id: siteId },
      select: { clientId: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Sitio no encontrado" },
        { status: 404 }
      )
    }

    const client = await db.client.findUnique({
      where: { ownerUserId: session.user.id },
      select: { id: true },
    })

    if (!client || (site.clientId !== client.id && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Calculate date range: last 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    // Fetch analytics events for the last 30 days
    const events = await db.analyticsEvent.findMany({
      where: {
        miniSiteId: siteId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
    })

    // Fetch orders for the last 30 days
    const orders = await db.order.findMany({
      where: {
        miniSiteId: siteId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
    })

    // Calculate totals
    const totalViews = events.filter((e) => e.eventType === "view").length
    const totalWhatsappClicks = events.filter(
      (e) => e.eventType === "click_whatsapp"
    ).length
    const totalOrders = orders.length

    // Build daily breakdown for the last 30 days
    const dailyBreakdown: {
      date: string
      views: number
      clicks: number
      orders: number
    }[] = []

    for (let i = 29; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      const dayStr = day.toISOString().split("T")[0] // YYYY-MM-DD

      const dayStart = new Date(dayStr + "T00:00:00.000Z")
      const dayEnd = new Date(dayStr + "T23:59:59.999Z")

      const dayViews = events.filter(
        (e) =>
          e.eventType === "view" &&
          e.createdAt >= dayStart &&
          e.createdAt <= dayEnd
      ).length

      const dayClicks = events.filter(
        (e) =>
          e.eventType === "click_whatsapp" &&
          e.createdAt >= dayStart &&
          e.createdAt <= dayEnd
      ).length

      const dayOrders = orders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt <= dayEnd
      ).length

      dailyBreakdown.push({
        date: dayStr,
        views: dayViews,
        clicks: dayClicks,
        orders: dayOrders,
      })
    }

    return NextResponse.json({
      totalViews,
      totalWhatsappClicks,
      totalOrders,
      dailyBreakdown,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Error al obtener analíticas" },
      { status: 500 }
    )
  }
}
