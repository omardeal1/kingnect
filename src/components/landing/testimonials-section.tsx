"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { useTranslations } from "@/i18n/provider"

interface Testimonial {
  nameKey: string
  businessKey: string
  quoteKey: string
  stars: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function TestimonialsSection() {
  const { t } = useTranslations("landing.testimonials")

  const TESTIMONIALS: Testimonial[] = [
    {
      nameKey: "items.maria.name",
      businessKey: "items.maria.business",
      quoteKey: "items.maria.quote",
      stars: 5,
    },
    {
      nameKey: "items.carlos.name",
      businessKey: "items.carlos.business",
      quoteKey: "items.carlos.quote",
      stars: 5,
    },
    {
      nameKey: "items.ana.name",
      businessKey: "items.ana.business",
      quoteKey: "items.ana.quote",
      stars: 5,
    },
    {
      nameKey: "items.roberto.name",
      businessKey: "items.roberto.business",
      quoteKey: "items.roberto.quote",
      stars: 4,
    },
    {
      nameKey: "items.laura.name",
      businessKey: "items.laura.business",
      quoteKey: "items.laura.quote",
      stars: 5,
    },
    {
      nameKey: "items.diego.name",
      businessKey: "items.diego.business",
      quoteKey: "items.diego.quote",
      stars: 5,
    },
  ]

  return (
    <section className="bg-muted/40 py-20 sm:py-28">
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

        {/* Mobile: Carousel */}
        <div className="mt-14 md:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {TESTIMONIALS.map((testimonial) => (
                <CarouselItem key={testimonial.nameKey} className="pl-4">
                  <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < testimonial.stars
                              ? "fill-gold text-gold"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground">
                      &ldquo;{t(testimonial.quoteKey)}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                        {t(testimonial.nameKey)[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t(testimonial.nameKey)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(testimonial.businessKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-3" />
            <CarouselNext className="-right-3" />
          </Carousel>
        </div>

        {/* Desktop: Grid */}
        <motion.div
          className="mt-14 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.nameKey}
              variants={cardVariants}
              className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < testimonial.stars
                        ? "fill-gold text-gold"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                &ldquo;{t(testimonial.quoteKey)}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                  {t(testimonial.nameKey)[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t(testimonial.nameKey)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t(testimonial.businessKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
