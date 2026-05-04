import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { error: "Error al obtener planes" },
      { status: 500 }
    )
  }
}
