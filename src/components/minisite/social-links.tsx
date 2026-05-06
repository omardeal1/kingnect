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
import { ButtonRenderer, type ButtonStyleType } from "./button-styles/button-renderer"

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
  buttonStyle?: string
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

export function SocialLinks({ links, accentColor, textColor, siteId, buttonStyle = "cylinder_pill" }: SocialLinksProps) {
  const enabledLinks = links.filter((l) => l.enabled)

  if (enabledLinks.length === 0) return null

  const style = buttonStyle as ButtonStyleType

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-4"
    >
      <div className="flex flex-col gap-3">
        {enabledLinks.map((link, idx) => {
          const Icon = ICON_MAP[link.type] || Globe
          const label = link.label || link.type

          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <ButtonRenderer
                style={style}
                icon={<Icon className="w-5 h-5 flex-shrink-0" />}
                label={label}
                href={link.url}
                accentColor={accentColor}
                textColor={textColor}
                onClick={() => {
                  trackLinkClick(siteId, link.type, link.url)
                }}
              />
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
