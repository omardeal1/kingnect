"use client"

import { motion } from "framer-motion"
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Globe,
  ExternalLink,
  MessageCircle,
} from "lucide-react"
import { trackLinkClick } from "@/lib/analytics"

interface SocialLinkData {
  id: string
  type: string
  label?: string | null
  url: string
  enabled: boolean
}

interface SocialLinksProps {
  links: SocialLinkData[]
  accentColor: string
  textColor: string
  siteId: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: MessageCircle,
  pinterest: ExternalLink,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  snapchat: MessageCircle,
  threads: MessageCircle,
  yelp: ExternalLink,
  google_reviews: ExternalLink,
  website: Globe,
  custom: ExternalLink,
}

export function SocialLinks({ links, accentColor, textColor, siteId }: SocialLinksProps) {
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
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {enabledLinks.map((link, idx) => {
          const Icon = ICON_MAP[link.type] || Globe
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-sm"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
              aria-label={link.label || link.type}
              onClick={() => {
                trackLinkClick(siteId, link.type, link.url).catch(() => {})
              }}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          )
        })}
      </div>
    </motion.section>
  )
}
