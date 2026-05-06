"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "@/i18n/provider"

interface ServiceData {
  id: string
  name: string
  description?: string | null
  price?: string | null
  imageUrl?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  enabled: boolean
}

interface ServicesSectionProps {
  services: ServiceData[]
  accentColor: string
  textColor: string
  cardColor: string
}

export function ServicesSection({
  services,
  accentColor,
  textColor,
  cardColor,
}: ServicesSectionProps) {
  const { t } = useTranslations("minisite")
  const enabledServices = services.filter((s) => s.enabled)

  if (enabledServices.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6"
    >
      <h2
        className="text-xl font-bold text-center mb-6"
        style={{ color: textColor }}
      >
        {t("services.title")}
      </h2>

      <div className="flex flex-col gap-4">
        {enabledServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: cardColor }}
          >
            {service.imageUrl && (
              <div className="relative w-full aspect-video">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 640px"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="font-bold text-base"
                  style={{ color: textColor }}
                >
                  {service.name}
                </h3>
                {service.price && (
                  <span
                    className="font-bold text-sm flex-shrink-0"
                    style={{ color: accentColor }}
                  >
                    {service.price}
                  </span>
                )}
              </div>
              {service.description && (
                <p
                  className="text-sm mt-2 opacity-70 leading-relaxed"
                  style={{ color: textColor }}
                >
                  {service.description}
                </p>
              )}
              {service.buttonLabel && service.buttonUrl && (
                <a
                  href={service.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
                >
                  {service.buttonLabel}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
