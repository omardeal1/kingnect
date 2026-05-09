import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSiteFeatures, FEATURE_DEFINITIONS } from "@/lib/plan-features"

/**
 * GET /api/sites/[id]/plan-features
 * Returns the feature flags for the current site based on its plan.
 * Used by the editor and public site to conditionally show/hide sections.
 */
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

    const features = await getSiteFeatures(id)

    return NextResponse.json({
      features,
      totalFeatures: FEATURE_DEFINITIONS.length,
      enabledCount: Object.values(features).filter(Boolean).length,
    })
  } catch (error) {
    console.error("Error fetching plan features:", error)
    return NextResponse.json(
      { error: "Error al obtener funciones del plan" },
      { status: 500 }
    )
  }
}
