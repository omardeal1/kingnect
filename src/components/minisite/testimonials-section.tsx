"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface TestimonialData {
  id: string
  name: string
  photoUrl?: string | null
  rating: number
  content: string
  enabled: boolean
}

interface TestimonialsSectionProps {
  testimonials: TestimonialData[]
  accentColor: string
  textColor: string
  cardColor: string
}

export function TestimonialsSection({
  testimonials,
  accentColor,
  textColor,
  cardColor,
}: TestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const enabledTestimonials = testimonials.filter((t) => t.enabled)

  if (enabledTestimonials.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 280
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-bold"
          style={{ color: textColor }}
        >
          Testimonios
        </h2>
        {enabledTestimonials.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {enabledTestimonials.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="min-w-[260px] sm:min-w-[300px] snap-start rounded-2xl p-5 shadow-sm flex-shrink-0"
            style={{ backgroundColor: cardColor }}
          >
            <div className="flex items-center gap-3 mb-3">
              {t.photoUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={t.photoUrl}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: textColor }}
                >
                  {t.name}
                </p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5"
                      style={{
                        color: i < t.rating ? accentColor : `${accentColor}30`,
                        fill: i < t.rating ? accentColor : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed opacity-80"
              style={{ color: textColor }}
            >
              &ldquo;{t.content}&rdquo;
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
