"use client"

import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Share2, MessageCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import { trackEvent, trackQRScan, trackWhatsAppClick, trackLinkClick } from "@/lib/analytics"
import { useTranslations } from "@/i18n/provider"

interface QrSectionProps {
  slug: string
  accentColor: string
  textColor: string
  whatsappNumber?: string | null
  siteId: string
}

export function QrSection({ slug, accentColor, textColor, whatsappNumber, siteId }: QrSectionProps) {
  const { t } = useTranslations("minisite")
  const siteUrl = `${typeof window !== "undefined" ? window.location.origin : "https://links.qaiross.app"}/${slug}`

  const handleCopy = async () => {
    trackEvent(siteId, "click_link", { type: "copy_link" })
    try {
      await navigator.clipboard.writeText(siteUrl)
      toast.success(t("qr.copied"))
    } catch {
      toast.error(t("qr.copyError"))
    }
  }

  const handleShareWhatsApp = () => {
    trackWhatsAppClick(siteId, whatsappNumber || "")
    const msg = encodeURIComponent(`${t("qr.shareText")} ${siteUrl}`)
    window.open(
      whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${msg}`
        : `https://wa.me/?text=${msg}`,
      "_blank"
    )
  }

  const handleShareSMS = () => {
    trackLinkClick(siteId, "sms", siteUrl)
    window.open(`sms:?body=${encodeURIComponent(`${t("qr.shareText")} ${siteUrl}`)}`, "_self")
  }

  const handleShareEmail = () => {
    trackLinkClick(siteId, "email", siteUrl)
    window.open(
      `mailto:?subject=${encodeURIComponent(t("qr.emailSubject"))}&body=${encodeURIComponent(`${t("qr.shareText")} ${siteUrl}`)}`,
      "_self"
    )
  }

  const handleQRScan = () => {
    trackQRScan(siteId)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-8"
    >
      <h2
        className="text-xl font-bold text-center mb-6"
        style={{ color: textColor }}
      >
        {t("qr.title")}
      </h2>

      <div className="flex flex-col items-center gap-5">
        <div
          className="p-4 rounded-2xl bg-white shadow-md cursor-pointer"
          onClick={handleQRScan}
          title={t("qr.scanTitle")}
        >
          <QRCodeSVG
            value={siteUrl}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#0A0A0A"
            level="M"
            includeMargin={false}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full max-w-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 shadow-sm border"
            style={{ borderColor: `${accentColor}30`, color: accentColor, backgroundColor: `${accentColor}08` }}
          >
            <Copy className="w-3.5 h-3.5" />
            {t("qr.copyLink")}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 shadow-sm"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleShareSMS}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 shadow-sm border"
            style={{ borderColor: `${accentColor}30`, color: accentColor, backgroundColor: `${accentColor}08` }}
          >
            <Share2 className="w-3.5 h-3.5" />
            SMS
          </button>
          <button
            onClick={handleShareEmail}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 shadow-sm border"
            style={{ borderColor: `${accentColor}30`, color: accentColor, backgroundColor: `${accentColor}08` }}
          >
            <Mail className="w-3.5 h-3.5" />
            {t("qr.email")}
          </button>
        </div>
      </div>
    </motion.section>
  )
}
