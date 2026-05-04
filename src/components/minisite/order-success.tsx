"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface OrderSuccessProps {
  orderNumber: string
  accentColor: string
  textColor: string
}

export function OrderSuccess({ orderNumber, accentColor, textColor }: OrderSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <CheckCircle2 className="w-8 h-8" style={{ color: accentColor }} />
      </motion.div>

      <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
        ¡Tu pedido ha sido confirmado!
      </h3>

      <div
        className="inline-block px-4 py-2 rounded-xl text-sm font-mono font-bold mb-3"
        style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
      >
        #{orderNumber}
      </div>

      <p className="text-sm opacity-70" style={{ color: textColor }}>
        Te contactaremos pronto para confirmar los detalles.
      </p>
    </motion.div>
  )
}
