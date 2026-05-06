import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const site = await db.miniSite.findUnique({
    where: { slug },
    select: { id: true, businessName: true, isActive: true, isPublished: true },
  })

  if (!site || !site.isActive || !site.isPublished) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const siteUrl = `https://links.qaiross.app/${slug}`

  try {
    // Generate QR code as SVG string
    const qrSvg = await QRCode.toString(siteUrl, {
      type: "svg",
      width: 300,
      margin: 2,
      color: {
        dark: "#0A0A0A",
        light: "#FFFFFF",
      },
    })

    // Wrap with business name
    const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="340" viewBox="0 0 300 340">
  <rect width="300" height="340" fill="white" rx="16"/>
  <g transform="translate(0, 0)">
    ${qrSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").replace(/width="\d+"/, 'width="300"').replace(/height="\d+"/, 'height="300"')}
  </g>
  <text x="150" y="328" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#0A0A0A">${site.businessName}</text>
</svg>`

    return new NextResponse(fullSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch {
    // Fallback: simple text SVG
    const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="white" rx="16"/>
  <text x="150" y="150" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#0A0A0A">${site.businessName}</text>
  <text x="150" y="175" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">${siteUrl}</text>
</svg>`

    return new NextResponse(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}
