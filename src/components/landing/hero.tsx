"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const phoneVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.5 },
  },
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Gold decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 size-[400px] rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-[300px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-20 sm:px-6 md:flex-row md:gap-16 md:py-28 lg:px-8 lg:py-36">
        {/* Text content */}
        <motion.div
          className="flex-1 text-center md:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
              Tu negocio digital comienza aquí
            </span>
          </motion.div>

          <motion.h1
            className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            Tu negocio en una{" "}
            <span className="gold-gradient-text">mini web profesional</span>{" "}
            con QR
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
            variants={itemVariants}
          >
            Todos los links, contactos y servicios de tu negocio en una sola
            página. Genera tu QR, imprímelo en tarjetas, carpas o banderas, y
            recibe más clientes.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start"
            variants={itemVariants}
          >
            <Button
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold-hover text-base px-8 h-12"
              asChild
            >
              <Link href="/register">
                Crear mi mini web
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 text-base px-8"
              asChild
            >
              <a href="#como-funciona">
                <Play className="mr-1 size-4" />
                Ver demo
              </a>
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-muted-foreground"
            variants={itemVariants}
          >
            Sin tarjeta de crédito · Listo en 5 minutos · Prueba gratis
          </motion.p>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          className="flex flex-1 items-center justify-center"
          variants={phoneVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            {/* Phone frame */}
            <div className="relative h-[580px] w-[290px] overflow-hidden rounded-[3rem] border-[6px] border-foreground/10 bg-background shadow-2xl sm:h-[620px] sm:w-[310px]">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground/10" />

              {/* Screen content */}
              <div className="flex h-full flex-col items-center bg-gradient-to-b from-background to-muted/30 pt-10 pb-6 px-4">
                {/* Avatar */}
                <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
                  <span className="text-2xl font-bold text-gold">K</span>
                </div>

                {/* Name */}
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  Mi Negocio
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  @minegocio
                </p>

                {/* Buttons */}
                <div className="mt-4 flex w-full flex-col gap-2 px-2">
                  <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                      <span className="text-xs">💬</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      WhatsApp
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-gold/10 px-3 py-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20">
                      <span className="text-xs">📍</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      Ubicación
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                      <span className="text-xs">📱</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      Instagram
                    </span>
                  </div>
                </div>

                {/* Services section */}
                <div className="mt-4 w-full px-2">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Servicios
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-card p-2">
                      <div className="h-8 w-full rounded bg-gold/10" />
                      <p className="mt-1.5 text-[10px] font-medium text-foreground">
                        Servicio 1
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-2">
                      <div className="h-8 w-full rounded bg-gold/10" />
                      <p className="mt-1.5 text-[10px] font-medium text-foreground">
                        Servicio 2
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating QR code */}
            <motion.div
              className="absolute -bottom-4 -right-8 flex h-20 w-20 items-center justify-center rounded-2xl border bg-background p-2 shadow-xl sm:h-24 sm:w-24"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-foreground/5">
                <div className="grid grid-cols-5 gap-[2px]">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`size-[3px] rounded-[1px] ${
                        Math.random() > 0.35 ? "bg-foreground" : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
