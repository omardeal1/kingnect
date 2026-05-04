"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left gold circle */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
        {/* Bottom-right gold circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        {/* Subtle gold line top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        {/* Subtle gold line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        {/* Floating gold particles */}
        <motion.div
          className="absolute top-1/4 right-1/6 w-2 h-2 rounded-full bg-gold/20"
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/6 w-1.5 h-1.5 rounded-full bg-gold/15"
          animate={{ y: [0, 15, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-2/3 right-1/4 w-1 h-1 rounded-full bg-gold/25"
          animate={{ y: [0, -10, 0], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Theme toggle - top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-gold/10 transition-colors"
          aria-label="Cambiar tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gold" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gold" />
        </Button>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 flex items-center gap-2"
      >
        <Crown className="h-8 w-8 text-gold" />
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-foreground">King</span>
          <span className="text-gold">nect</span>
        </span>
      </motion.div>

      {/* Content container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-md relative z-10"
      >
        {children}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-muted-foreground relative z-10"
      >
        &copy; {new Date().getFullYear()} Kingnect por King Designs
      </motion.p>
    </div>
  )
}
