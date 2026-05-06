"use client"

import { motion } from "framer-motion"
import {
  UserPlus,
  Image,
  ToggleRight,
  PackagePlus,
  Globe,
  Download,
  Printer,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "@/i18n/provider"

interface Step {
  number: number
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
}

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

export function HowItWorks() {
  const { t } = useTranslations("landing.howItWorks")

  const STEPS: Step[] = [
    {
      number: 1,
      icon: UserPlus,
      titleKey: "steps.register.title",
      descriptionKey: "steps.register.description",
    },
    {
      number: 2,
      icon: Image,
      titleKey: "steps.logo.title",
      descriptionKey: "steps.logo.description",
    },
    {
      number: 3,
      icon: ToggleRight,
      titleKey: "steps.networks.title",
      descriptionKey: "steps.networks.description",
    },
    {
      number: 4,
      icon: PackagePlus,
      titleKey: "steps.products.title",
      descriptionKey: "steps.products.description",
    },
    {
      number: 5,
      icon: Globe,
      titleKey: "steps.publish.title",
      descriptionKey: "steps.publish.description",
    },
    {
      number: 6,
      icon: Download,
      titleKey: "steps.downloadQr.title",
      descriptionKey: "steps.downloadQr.description",
    },
    {
      number: 7,
      icon: Printer,
      titleKey: "steps.print.title",
      descriptionKey: "steps.print.description",
    },
  ]

  return (
    <section id="como-funciona" className="bg-muted/40 py-20 sm:py-28">
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

        {/* Desktop: horizontal timeline */}
        <div className="mt-16 hidden lg:block">
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-10 left-0 right-0 h-0.5 bg-gold/20" />

            <div className="grid grid-cols-7 gap-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="flex flex-col items-center text-center"
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {/* Number badge */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-background bg-gold/10">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-gold">
                        {step.number}
                      </span>
                      <step.icon className="size-5 text-gold" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t(step.descriptionKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: vertical timeline */}
        <div className="mt-12 lg:hidden">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-gold/20 sm:left-10" />

            <div className="flex flex-col gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="relative flex items-start gap-5 pl-2 sm:pl-0"
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {/* Number badge */}
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-background bg-gold/10 sm:h-16 sm:w-16">
                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold text-gold">
                        {step.number}
                      </span>
                      <step.icon className="size-4 text-gold" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
