"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/provider"

export function CTASection() {
  const { t } = useTranslations("landing.cta")

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Gold gradient background */}
      <div className="absolute inset-0 gold-gradient opacity-10" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 size-[400px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 size-[400px] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-14 bg-gold px-10 text-base text-gold-foreground hover:bg-gold-hover"
              asChild
            >
              <Link href="/register">
                {t("button")}
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {t("stats")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
