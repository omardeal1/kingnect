"use client"

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
  onOrder?: () => void,
  onCopy?: () => void
) {
  const siteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`
  switch (type) {
    case "whatsapp":
      return () => window.open(`https://wa.me/${value}`, "_blank")
    case "call":
      return () => window.open(`tel:${value}`, "_self")
    case "sms":
      return () => window.open(`sms:${value}`, "_self")
    case "email":
      return () => window.open(`mailto:${value}`, "_self")
    case "maps":
      return () => window.open(value, "_blank")
    case "share":
      return () => {
        if (navigator.share) {
          navigator.share({ title: slug, url: siteUrl }).catch(() => {})
        } else {
          navigator.clipboard.writeText(siteUrl)
          toast.success("Link copiado al portapapeles")
        }
      }
    case "copy_link":
      return onCopy || (() => {
        navigator.clipboard.writeText(siteUrl)
        toast.success("Link copiado al portapapeles")
      })
    case "order":
      return onOrder || (() => {})
    default:
      return () => window.open(value, "_blank")
  }
}

export function ContactButtons({
  buttons,
  accentColor,
  textColor,
  cardColor,
  slug,
  whatsappNumber,
}: ContactButtonsProps) {
  const { setOpen } = useCart()
  const enabledButtons = buttons.filter((b) => b.enabled)

  if (enabledButtons.length === 0) return null

  const handleCopyLink = () => {
    const siteUrl = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(siteUrl)
    toast.success("Link copiado al portapapeles")
  }

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
            () => setOpen(true),
            handleCopyLink
          )

          return (
            <motion.button
              key={btn.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={action}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              style={{
                backgroundColor: accentColor,
                color: "#FFFFFF",
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}
