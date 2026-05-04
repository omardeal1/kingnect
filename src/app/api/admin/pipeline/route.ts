import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const PIPELINE_STATUSES = [
  "lead",
  "contacted",
  "in_design",
  "in_review",
  "approved",
  "published",
  "active",
  "blocked",
  "cancelled",
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const clients = await db.client.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
        subscription: {
          include: { plan: true },
        },
        miniSites: {
          select: { id: true, slug: true, businessName: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group by pipeline status
    const grouped: Record<string, typeof clients> = {}
    for (const status of PIPELINE_STATUSES) {
      grouped[status] = []
    }

    for (const client of clients) {
      const status = client.pipelineStatus
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(client)
    }

    return NextResponse.json({ pipeline: grouped, statuses: PIPELINE_STATUSES })
  } catch (error) {
    console.error("Admin pipeline GET error:", error)
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
    const { clientId, pipelineStatus } = body

    if (!clientId || !pipelineStatus) {
      return NextResponse.json({ error: "clientId y pipelineStatus son requeridos" }, { status: 400 })
    }

    if (!PIPELINE_STATUSES.includes(pipelineStatus)) {
      return NextResponse.json({ error: "Estado de pipeline inválido" }, { status: 400 })
    }

    const client = await db.client.update({
      where: { id: clientId },
      data: { pipelineStatus },
    })

    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: `Pipeline cambiado a: ${pipelineStatus}`,
        entityType: "client",
        entityId: clientId,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Admin pipeline PUT error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
