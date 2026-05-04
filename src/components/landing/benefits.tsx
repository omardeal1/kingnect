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

interface Benefit {
  icon: LucideIcon
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: Link2,
    title: "Todos tus links en un lugar",
    description:
      "Reúne tus redes sociales, WhatsApp, ubicación y sitio web en un solo Kinec. Tus clientes encuentran todo al instante.",
  },
  {
    icon: QrCode,
    title: "QR listo para imprimir",
    description:
      "Genera tu código QR en PNG y SVG. Descárgalo y úsalo en cualquier material impreso sin perder calidad.",
  },
  {
    icon: CreditCard,
    title: "Para tarjetas, carpas y banderas",
    description:
      "Imprime tu QR en tarjetas de presentación, carpas publicitarias, banderas y flyers. Tu Kinec siempre accesible.",
  },
  {
    icon: Code,
    title: "Sin saber programar",
    description:
      "No necesitas conocimientos técnicos. Desde el panel editas todo de forma visual e intuitiva en minutos.",
  },
  {
    icon: Settings,
    title: "Edita desde tu panel",
    description:
      "Cambia textos, fotos, colores y botones cuando quieras. Los cambios se reflejan al instante en tu Kinec.",
  },
  {
    icon: Store,
    title: "Para negocios locales",
    description:
      "Diseñado especialmente para negocios locales que quieren tener presencia digital sin complicaciones ni costos altos.",
  },
  {
    icon: MessageCircle,
    title: "Más contactos por WhatsApp",
    description:
      "Un botón de WhatsApp directo en tu Kinec. Tus clientes te contactan con un solo toque desde su celular.",
  },
  {
    icon: ShoppingBag,
    title: "Muestra servicios y productos",
    description:
      "Agrega tu catálogo de productos o servicios con precios, fotos y descripciones. Todo organizado y profesional.",
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
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export function Benefits() {
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
            Beneficios
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Todo lo que tu negocio necesita
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Una solución completa para llevar tu negocio al mundo digital
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
              key={benefit.title}
              variants={cardVariants}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-gold/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <benefit.icon className="size-6 text-gold" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
