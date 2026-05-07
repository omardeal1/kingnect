"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface AIChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function AIChatButton({ onClick, isOpen }: AIChatButtonProps) {
  const [hasPulsed, setHasPulsed] = useState(false)

  const handleClick = () => {
    if (!hasPulsed) setHasPulsed(true)
    onClick()
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
        style={{
          background: "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
        }}
        aria-label={isOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
      >
        {/* Glow effect */}
        <span
          className="absolute inset-0 rounded-full opacity-30 blur-md group-hover:opacity-50 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
          }}
        />

        {/* Pulse ring (only before first click) */}
        {!hasPulsed && !isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ background: "#D4A849" }}
          />
        )}

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 0 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <Sparkles className="w-7 h-7 text-white" />
          )}
        </motion.div>

        {/* Tooltip (desktop only) */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-xs font-medium text-foreground shadow-md border border-border whitespace-nowrap pointer-events-none hidden lg:block"
          >
            Asistente IA QAIROSS
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-800 border-r border-b border-border rotate-[-45deg]" />
          </motion.div>
        )}
      </motion.button>
    </AnimatePresence>
  )
}
