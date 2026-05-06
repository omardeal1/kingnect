"use client"

import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useTranslations } from "@/i18n/provider"
import { LanguageToggle } from "@/components/ui/language-toggle"

interface SiteHeaderProps {
  businessName: string
  tagline?: string | null
  logoUrl?: string | null
  accentColor: string
  textColor: string
  showDarkToggle?: boolean
}

export function SiteHeader({
  businessName,
  tagline,
  logoUrl,
  accentColor,
  textColor,
  showDarkToggle,
}: SiteHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslations("minisite")

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-8 px-4"
    >
      <div className="flex items-center justify-center gap-3 relative">
        {logoUrl && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md flex-shrink-0" style={{ borderColor: accentColor }}>
            <Image
              src={logoUrl}
              alt={businessName}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: textColor }}
          >
            {businessName}
          </h1>
          {tagline && (
            <p
              className="text-sm sm:text-base mt-1 opacity-70"
              style={{ color: textColor }}
            >
              {tagline}
            </p>
          )}
        </div>
        <div className="absolute right-0 top-0 flex items-center gap-1">
          <LanguageToggle variant="minimal" />
          {showDarkToggle && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              aria-label={t("header.toggleTheme")}
            >
              <Sun className="w-5 h-5 hidden dark:block" style={{ color: textColor }} />
              <Moon className="w-5 h-5 block dark:hidden" style={{ color: textColor }} />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
