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

interface BusinessCategory {
  icon: LucideIcon
  name: string
  description: string
}

const CATEGORIES: BusinessCategory[] = [
  {
    icon: UtensilsCrossed,
    name: "Restaurante",
    description:
      "Menú digital con fotos y precios. QR en las mesas para ver la carta al instante.",
  },
  {
    icon: Scissors,
    name: "Barbería",
    description:
      "Muestra tus cortes, agenda citas por WhatsApp y comparte tu ubicación.",
  },
  {
    icon: Stethoscope,
    name: "Clínica",
    description:
      "Lista de servicios, horarios y botón de cita directa. Profesional y confiable.",
  },
  {
    icon: Truck,
    name: "Food truck",
    description:
      "Ubicación en tiempo real, menú del día y pedidos por WhatsApp.",
  },
  {
    icon: Wrench,
    name: "Taller",
    description:
      "Catálogo de servicios, precios referenciales y contacto directo por WhatsApp.",
  },
  {
    icon: ShoppingBag,
    name: "Tienda",
    description:
      "Vitrina de productos, categorías y botón de pedido. Tu tienda online en minutos.",
  },
  {
    icon: Megaphone,
    name: "Agencia",
    description:
      "Portafolio de servicios, casos de éxito y formas de contacto integradas.",
  },
  {
    icon: Church,
    name: "Iglesia",
    description:
      "Horarios de servicios, ubicación, redes sociales y eventos en un solo lugar.",
  },
]

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
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

export function BusinessExamples() {
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
            Para todos
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Para todo tipo de negocios
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sea cual sea tu negocio, Kingnect se adapta a tus necesidades
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
              key={cat.name}
              variants={cardVariants}
              className="group cursor-pointer rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-gold/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                <cat.icon className="size-6 text-gold" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {cat.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
