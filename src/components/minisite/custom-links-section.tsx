"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

interface CustomLinkData {
  id: string
  label: string
  url: string
  enabled: boolean
}

interface CustomLinksSectionProps {
  links: CustomLinkData[]
  accentColor: string
  textColor: string
}

export function CustomLinksSection({ links, accentColor, textColor }: CustomLinksSectionProps) {
  const enabledLinks = links.filter((l) => l.enabled)

  if (enabledLinks.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-4"
    >
      <div className="flex flex-col gap-3">
        {enabledLinks.map((link, idx) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm border"
            style={{
              borderColor: `${accentColor}30`,
              color: accentColor,
              backgroundColor: `${accentColor}08`,
            }}
          >
            <span>{link.label}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-60" />
          </motion.a>
        ))}
      </div>
    </motion.section>
  )
}
