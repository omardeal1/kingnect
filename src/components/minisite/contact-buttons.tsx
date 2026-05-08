"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Share2,
  Link2,
  ShoppingBag,
} from "lucide-react"
import { CONTACT_BUTTON_TYPES } from "@/lib/constants"
import { useCart } from "./cart-provider"
import { toast } from "sonner"
import { trackWhatsAppClick, trackLinkClick, trackEvent } from "@/lib/analytics"
import { useTranslations } from "@/i18n/provider"
import { ButtonRenderer, type ButtonStyleType } from "./button-styles/button-renderer"

interface ContactButtonData {
  id: string
  type: string
  label?: string | null
  value: string
  enabled: boolean
}

interface ContactButtonsProps {
  buttons: ContactButtonData[]
  accentColor: string
  textColor: string
  cardColor: string
  slug: string
  whatsappNumber?: string | null
  siteId: string
  buttonStyle?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  call: Phone,
  sms: MessageCircle,
  email: Mail,
  maps: MapPin,
  share: Share2,
  copy_link: Link2,
  order: ShoppingBag,
}

function getButtonAction(
  type: string,
  value: string,
  slug: string,
  siteId: string,
  t: (key: string, params?: Record<string, string | number> | string) => string,
  onOrder?: () => void,
  onCopy?: () => void
) {
  const siteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`
  switch (type) {
    case "whatsapp":
      return () => {
        trackWhatsAppClick(siteId, value)
        window.open(`https://wa.me/${value}`, "_blank")
      }
    case "call":
      return () => {
        trackLinkClick(siteId, "call", `tel:${value}`)
        window.open(`tel:${value}`, "_self")
      }
    case "sms":
      return () => {
        trackLinkClick(siteId, "sms", `sms:${value}`)
        window.open(`sms:${value}`, "_self")
      }
    case "email":
      return () => {
        trackLinkClick(siteId, "email", `mailto:${value}`)
        window.open(`mailto:${value}`, "_self")
      }
    case "maps":
      return () => {
        trackLinkClick(siteId, "maps", value)
        window.open(value, "_blank")
      }
    case "share":
      return async () => {
        trackEvent(siteId, "click_link", { type: "share" })
        if (navigator.share) {
          navigator.share({ title: slug, url: siteUrl }).catch(() => {})
        } else {
          try {
            await navigator.clipboard.writeText(siteUrl)
            toast.success(t("qr.copied"))
          } catch {
            toast.error(t("qr.copyError"))
          }
        }
      }
    case "copy_link":
      return onCopy || (async () => {
        trackEvent(siteId, "click_link", { type: "copy_link" })
        try {
          await navigator.clipboard.writeText(siteUrl)
          toast.success(t("qr.copied"))
        } catch {
          toast.error(t("qr.copyError"))
        }
      })
    case "order":
      return onOrder || (() => {})
    default:
      return () => {
        trackLinkClick(siteId, type, value)
        window.open(value, "_blank")
      }
  }
}

export function ContactButtons({
  buttons,
  accentColor,
  textColor,
  cardColor,
  slug,
  whatsappNumber,
  siteId,
  buttonStyle = "cylinder_pill",
}: ContactButtonsProps) {
  const { setOpen } = useCart()
  const { t } = useTranslations("minisite")
  const enabledButtons = buttons.filter((b) => b.enabled)

  if (enabledButtons.length === 0) return null

  const handleCopyLink = async () => {
    const siteUrl = `${window.location.origin}/${slug}`
    trackEvent(siteId, "click_link", { type: "copy_link" })
    try {
      await navigator.clipboard.writeText(siteUrl)
      toast.success(t("qr.copied"))
    } catch {
      toast.error(t("qr.copyError"))
    }
  }

  const style = buttonStyle as ButtonStyleType

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="px-4 py-4"
    >
      <div className="flex flex-col gap-3">
        {enabledButtons.map((btn, idx) => {
          const typeInfo = CONTACT_BUTTON_TYPES.find((t) => t.value === btn.type)
          const Icon = ICON_MAP[btn.type] || MessageCircle
          const label = btn.label || typeInfo?.label || btn.type
          const action = getButtonAction(
            btn.type,
            btn.value,
            slug,
            siteId,
            t,
            () => {
              trackEvent(siteId, "click_link", { type: "order" })
              setOpen(true)
            },
            handleCopyLink
          )

          return (
            <motion.div
              key={btn.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <ButtonRenderer
                style={style}
                icon={<Icon className="w-5 h-5 flex-shrink-0" />}
                label={label}
                onClick={action}
                accentColor={accentColor}
                textColor={textColor}
              />
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
