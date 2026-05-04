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

    // Kinecs stats
    const [activeSites, inactiveSites, draftSites, totalSites] = await Promise.all([
      db.miniSite.count({ where: { isActive: true, isPublished: true } }),
      db.miniSite.count({ where: { isActive: false } }),
      db.miniSite.count({ where: { isPublished: false, isActive: true } }),
      db.miniSite.count(),
    ])

    // Client stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [activeClients, blockedClients, trialClients, newClientsThisMonth, totalClients] =
      await Promise.all([
        db.client.count({ where: { accountStatus: "active" } }),
        db.client.count({ where: { accountStatus: "blocked" } }),
        db.client.count({
          where: {
            subscription: { status: "trial" },
          },
        }),
        db.client.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        db.client.count(),
      ])

    // MRR: sum of active subscription plan prices
    const activeSubscriptions = await db.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    })
    const mrr = activeSubscriptions.reduce((sum, sub) => sum + (sub.plan?.price ?? 0), 0)

    // Orders stats
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [ordersToday, ordersThisMonth, totalOrders] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: startOfDay } } }),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count(),
    ])

    // Revenue this month
    const ordersThisMonthData = await db.order.findMany({
      where: { createdAt: { gte: startOfMonth }, status: { not: "cancelled" } },
      select: { total: true },
    })
    const revenueThisMonth = ordersThisMonthData.reduce((sum, o) => sum + o.total, 0)

    // Last 5 activity logs
    const recentActivity = await db.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      sites: {
        active: activeSites,
        inactive: inactiveSites,
        draft: draftSites,
        total: totalSites,
      },
      clients: {
        active: activeClients,
        blocked: blockedClients,
        trial: trialClients,
        newThisMonth: newClientsThisMonth,
        total: totalClients,
      },
      revenue: {
        mrr,
        thisMonth: revenueThisMonth,
      },
      orders: {
        today: ordersToday,
        thisMonth: ordersThisMonth,
        total: totalOrders,
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        createdAt: log.createdAt.toISOString(),
        user: log.user
          ? { name: log.user.name, email: log.user.email }
          : null,
      })),
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
