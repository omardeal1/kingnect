import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const site = await db.miniSite.findUnique({
    where: { slug },
    select: {
      id: true,
      businessName: true,
      logoUrl: true,
      accentColor: true,
      isActive: true,
      isPublished: true,
    },
  })

  if (!site || !site.isActive || !site.isPublished) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const manifest = {
    name: site.businessName,
    short_name: site.businessName.slice(0, 12),
    description: `QAIROSS de ${site.businessName}`,
    start_url: `/${slug}`,
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: site.accentColor || "#D4A849",
    orientation: "portrait",
    icons: site.logoUrl
      ? [
          {
            src: site.logoUrl,
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: site.logoUrl,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ]
      : [],
  }

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
