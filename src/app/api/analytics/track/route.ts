import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

// ─── POST /api/analytics/track ─────────────────────────────────────────────────
// Public analytics event tracker
// No auth required — these are public page events
// Rate limited: max 30 events per minute per IP

const VALID_EVENT_TYPES = new Set([
  "view",
  "click_whatsapp",
  "click_link",
  "qr_scan",
  "order_created",
])

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 events per minute per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const rateResult = rateLimit(`analytics:${ip}`, 30, 60000)
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    // Parse body
    const body = await request.json()
    const { miniSiteId, eventType, metadata } = body

    // Validate required fields
    if (!miniSiteId || typeof miniSiteId !== "string") {
      return NextResponse.json(
        { error: "miniSiteId is required" },
        { status: 400 }
      )
    }

    if (!eventType || typeof eventType !== "string") {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      )
    }

    // Validate event type
    if (!VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${Array.from(VALID_EVENT_TYPES).join(", ")}` },
        { status: 400 }
      )
    }

    // Verify the mini site exists
    const site = await db.miniSite.findUnique({
      where: { id: miniSiteId },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      )
    }

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        miniSiteId,
        eventType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics Track Error]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
