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

interface Step {
  number: number
  icon: LucideIcon
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: UserPlus,
    title: "Regístrate",
    description: "Crea tu cuenta gratis en menos de un minuto.",
  },
  {
    number: 2,
    icon: Image,
    title: "Sube tu logo y datos",
    description: "Agrega tu logo, nombre, descripción y colores de marca.",
  },
  {
    number: 3,
    icon: ToggleRight,
    title: "Activa tus redes y botones",
    description: "Conecta WhatsApp, Instagram, Facebook y más con un clic.",
  },
  {
    number: 4,
    icon: PackagePlus,
    title: "Agrega productos o menú",
    description: "Sube tu catálogo con fotos, precios y descripciones.",
  },
  {
    number: 5,
    icon: Globe,
    title: "Publica tu Kinec",
    description: "Un clic y tu Kinec está online para todo el mundo.",
  },
  {
    number: 6,
    icon: Download,
    title: "Descarga tu QR",
    description: "Obtén tu código QR en PNG y SVG para imprimir.",
  },
  {
    number: 7,
    icon: Printer,
    title: "Imprímelo en tarjetas, carpas o banderas",
    description: "Usa tu QR en cualquier material impreso y recibe clientes.",
  },
]

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

export function HowItWorks() {
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
            Paso a paso
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En solo 7 pasos tu Kinec estará lista para recibir clientes
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
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
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
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
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
