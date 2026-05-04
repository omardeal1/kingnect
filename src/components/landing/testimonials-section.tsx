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

interface Testimonial {
  name: string
  business: string
  quote: string
  stars: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "María García",
    business: "Restaurante La Casa",
    quote:
      "Desde que puse el QR en las mesas, mis clientes consultan el menú desde su celular. ¡Los pedidos por WhatsApp se duplicaron!",
    stars: 5,
  },
  {
    name: "Carlos López",
    business: "Barbería Elite",
    quote:
      "Mi Kinec se ve increíble. Los clientes me encuentran por el QR de mis tarjetas y agendan cita por WhatsApp directamente.",
    stars: 5,
  },
  {
    name: "Ana Martínez",
    business: "Clínica Dental Sonrisa",
    quote:
      "Profesional y fácil de usar. Mis pacientes pueden ver mis servicios y agendar desde su celular. El panel es muy intuitivo.",
    stars: 5,
  },
  {
    name: "Roberto Sánchez",
    business: "Food Truck El Sabor",
    quote:
      "Comparto mi ubicación en tiempo real y el menú del día desde mi Kinec. ¡Mis seguidores siempre saben dónde estoy!",
    stars: 4,
  },
  {
    name: "Laura Torres",
    business: "Boutique Elegante",
    quote:
      "Antes no tenía presencia digital. Ahora mis clientes ven mis productos nuevos y me escriben por WhatsApp para comprar.",
    stars: 5,
  },
  {
    name: "Diego Ramírez",
    business: "Taller Mecánico DR",
    quote:
      "Mis clientes ven la lista de servicios y precios. Me ahorra mucho tiempo responder las mismas preguntas una y otra vez.",
    stars: 5,
  },
]

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
            Testimonios
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Negocios reales que ya usan Kingnect para crecer
          </p>
        </motion.div>

        {/* Mobile: Carousel */}
        <div className="mt-14 md:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {TESTIMONIALS.map((t) => (
                <CarouselItem key={t.name} className="pl-4">
                  <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < t.stars
                              ? "fill-gold text-gold"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.business}
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
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < t.stars
                        ? "fill-gold text-gold"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.business}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
