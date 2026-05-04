"use client"

import { motion } from "framer-motion"
import { MessageCircle, ClipboardList } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
}

export function OrdersSection() {
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
            Pedidos
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Recibe pedidos directamente
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dos formas de recibir pedidos según las necesidades de tu negocio
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* WhatsApp Mode */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-lg"
          >
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-green-500/5" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                <MessageCircle className="size-7 text-green-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Pedidos por WhatsApp
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Tus clientes arman su pedido desde tu Kinec y al confirmar
                se abre WhatsApp con el detalle completo. Tú recibes el
                mensaje y gestionas todo desde tu celular.
              </p>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-[10px] text-green-600">
                    ✓
                  </span>
                  Sin configuración extra
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-[10px] text-green-600">
                    ✓
                  </span>
                  Llega directo a tu WhatsApp
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-[10px] text-green-600">
                    ✓
                  </span>
                  Incluido en plan Pro
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Internal Panel Mode */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-8 shadow-sm transition-all hover:shadow-lg"
          >
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-gold/5" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
                <ClipboardList className="size-7 text-gold" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Panel interno de pedidos
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Los pedidos llegan directo a tu panel de Kingnect. Gestiona
                estados, notifica a tus clientes y lleva un registro completo
                de todas las órdenes recibidas.
              </p>
              <ul className="mt-5 space-y-2">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-[10px] text-gold">
                    ✓
                  </span>
                  Panel de administración
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-[10px] text-gold">
                    ✓
                  </span>
                  Estados y notificaciones
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-[10px] text-gold">
                    ✓
                  </span>
                  Incluido en plan Premium
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
