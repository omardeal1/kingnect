"use client"

import { motion } from "framer-motion"
import {
  UtensilsCrossed,
  Scissors,
  Stethoscope,
  Truck,
  Wrench,
  ShoppingBag,
  Megaphone,
  Church,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "@/i18n/provider"

interface BusinessCategory {
  icon: LucideIcon
  nameKey: string
  descriptionKey: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
}

export function BusinessExamples() {
  const { t } = useTranslations("landing.businessExamples")

  const CATEGORIES: BusinessCategory[] = [
    {
      icon: UtensilsCrossed,
      nameKey: "categories.restaurant.name",
      descriptionKey: "categories.restaurant.description",
    },
    {
      icon: Scissors,
      nameKey: "categories.barbershop.name",
      descriptionKey: "categories.barbershop.description",
    },
    {
      icon: Stethoscope,
      nameKey: "categories.clinic.name",
      descriptionKey: "categories.clinic.description",
    },
    {
      icon: Truck,
      nameKey: "categories.foodTruck.name",
      descriptionKey: "categories.foodTruck.description",
    },
    {
      icon: Wrench,
      nameKey: "categories.workshop.name",
      descriptionKey: "categories.workshop.description",
    },
    {
      icon: ShoppingBag,
      nameKey: "categories.store.name",
      descriptionKey: "categories.store.description",
    },
    {
      icon: Megaphone,
      nameKey: "categories.agency.name",
      descriptionKey: "categories.agency.description",
    },
    {
      icon: Church,
      nameKey: "categories.church.name",
      descriptionKey: "categories.church.description",
    },
  ]

  return (
    <section className="py-20 sm:py-28">
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
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.nameKey}
              variants={cardVariants}
              className="group cursor-pointer rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-gold/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <cat.icon className="size-6 text-gold" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {t(cat.nameKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(cat.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
