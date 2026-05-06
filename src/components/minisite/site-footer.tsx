"use client"

import { Crown } from "lucide-react"
import { useTranslations } from "@/i18n/provider"

interface SiteFooterProps {
  showKingBrand?: boolean
  textColor: string
}

export function SiteFooter({ showKingBrand, textColor }: SiteFooterProps) {
  const { t } = useTranslations("minisite")
  if (!showKingBrand) return null

  return (
    <footer
      className="text-center py-6 px-4 mt-4"
      style={{ color: `${textColor}60` }}
    >
      <div className="flex items-center justify-center gap-1.5 text-xs">
        <Crown className="w-3.5 h-3.5" />
        <span>{t("footer.madeWith")} </span>
        <a
          href="https://qaiross.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: textColor }}
        >
          QAIROSS
        </a>
      </div>
    </footer>
  )
}
