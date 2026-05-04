"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { trackWhatsAppClick } from "@/lib/analytics"

interface FloatingWhatsAppProps {
  phoneNumber: string
  siteId: string
}

export function FloatingWhatsApp({ phoneNumber, siteId }: FloatingWhatsAppProps) {
  if (!phoneNumber) return null

  const handleClick = () => {
    trackWhatsAppClick(siteId, phoneNumber).catch(() => {})
  }

  return (
    <AnimatePresence>
      <motion.a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </motion.a>
    </AnimatePresence>
  )
}
