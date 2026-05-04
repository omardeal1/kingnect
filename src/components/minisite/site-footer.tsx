"use client"

import { Crown } from "lucide-react"

interface SiteFooterProps {
  showKingBrand?: boolean
  textColor: string
}

export function SiteFooter({ showKingBrand, textColor }: SiteFooterProps) {
  if (!showKingBrand) return null

  return (
    <footer
      className="text-center py-6 px-4 mt-4"
      style={{ color: `${textColor}60` }}
    >
      <div className="flex items-center justify-center gap-1.5 text-xs">
        <Crown className="w-3.5 h-3.5" />
        <span>Hecho por </span>
        <a
          href="https://kingnect.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: textColor }}
        >
          Kingnect
        </a>
      </div>
    </footer>
  )
}
