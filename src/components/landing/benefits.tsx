"use client"

import { motion } from "framer-motion"
import {
  Link2,
  QrCode,
  CreditCard,
  Code,
  Settings,
  Store,
  MessageCircle,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "@/i18n/provider"

interface Benefit {
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function Benefits() {
  const { t } = useTranslations("landing.benefits")

  const BENEFITS: Benefit[] = [
    {
      icon: Link2,
      titleKey: "items.links.title",
      descriptionKey: "items.links.description",
    },
    {
      icon: QrCode,
      titleKey: "items.qr.title",
      descriptionKey: "items.qr.description",
    },
    {
      icon: CreditCard,
      titleKey: "items.print.title",
      descriptionKey: "items.print.description",
    },
    {
      icon: Code,
      titleKey: "items.noCode.title",
      descriptionKey: "items.noCode.description",
    },
    {
      icon: Settings,
      titleKey: "items.dashboard.title",
      descriptionKey: "items.dashboard.description",
    },
    {
      icon: Store,
      titleKey: "items.local.title",
      descriptionKey: "items.local.description",
    },
    {
      icon: MessageCircle,
      titleKey: "items.whatsapp.title",
      descriptionKey: "items.whatsapp.description",
    },
    {
      icon: ShoppingBag,
      titleKey: "items.catalog.title",
      descriptionKey: "items.catalog.description",
    },
  ]

  return (
    <section id="beneficios" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
            {t("badge")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {BENEFITS.map((benefit) => (
            <motion.div
              key={benefit.titleKey}
              variants={cardVariants}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-gold/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <benefit.icon className="size-6 text-gold" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {t(benefit.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(benefit.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
