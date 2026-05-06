"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "@/i18n/provider"

interface SlideData {
  id: string
  imageUrl?: string | null
  title?: string | null
  subtitle?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  enabled: boolean
}

interface SlidesSectionProps {
  slides: SlideData[]
  accentColor: string
  textColor: string
}

export function SlidesSection({ slides, accentColor, textColor }: SlidesSectionProps) {
  const enabledSlides = slides.filter((s) => s.enabled && s.imageUrl)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const { t } = useTranslations("minisite")

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current]
  )

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % enabledSlides.length)
  }, [enabledSlides.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length)
  }, [enabledSlides.length])

  // Auto-play
  useEffect(() => {
    if (enabledSlides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, enabledSlides.length])

  if (enabledSlides.length === 0) return null

  const slide = enabledSlides[current]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-4"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/9]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.imageUrl!}
              alt={slide.title || "Slide"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
              priority={current === 0}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              {slide.title && (
                <h3 className="text-lg sm:text-xl font-bold leading-tight">
                  {slide.title}
                </h3>
              )}
              {slide.subtitle && (
                <p className="text-sm opacity-90 mt-1">{slide.subtitle}</p>
              )}
              {slide.buttonLabel && slide.buttonUrl && (
                <a
                  href={slide.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-5 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                  style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
                >
                  {slide.buttonLabel}
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {enabledSlides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
              aria-label={t("slides.previous")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
              aria-label={t("slides.next")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {enabledSlides.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {enabledSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: idx === current ? accentColor : `${accentColor}40`,
                transform: idx === current ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Ir a slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </motion.section>
  )
}
