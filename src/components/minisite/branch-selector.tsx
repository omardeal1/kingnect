"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface BranchData {
  id: string
  slug: string
  name: string
  description: string | null
  coverUrl: string | null
  phone: string | null
  whatsapp: string | null
  city: string | null
  state: string | null
  address: string | null
  isActive: boolean
  isPublished: boolean
}

interface BranchSelectorProps {
  branches: BranchData[]
  siteSlug: string
  accentColor?: string
  textColor?: string
  cardColor?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
}

export function BranchSelector({
  branches,
  siteSlug,
  accentColor = "#D4A849",
  textColor = "#0A0A0A",
  cardColor = "#FFFFFF",
}: BranchSelectorProps) {
  if (branches.length < 2) return null

  return (
    <section className="w-full px-4 py-6">
      <motion.div
        className="flex items-center gap-2 mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MapPin className="w-5 h-5" style={{ color: accentColor }} />
        <h2
          className="text-lg font-bold"
          style={{ color: textColor }}
        >
          Nuestras Sucursales
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {branches.map((branch) => (
          <motion.div key={branch.id} variants={cardVariants}>
            <Link
              href={`/${siteSlug}/${branch.slug}`}
              className="block group"
            >
              <div
                className="rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  backgroundColor: cardColor,
                  borderColor: `${accentColor}20`,
                }}
              >
                {/* Cover image */}
                <div className="relative h-32 w-full overflow-hidden">
                  {branch.coverUrl ? (
                    <img
                      src={branch.coverUrl}
                      alt={branch.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}15` }}
                    >
                      <MapPin
                        className="w-10 h-10"
                        style={{ color: `${accentColor}40` }}
                      />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                    }}
                  />
                  {/* Name overlay */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-white font-bold text-sm truncate drop-shadow-md">
                      {branch.name}
                    </h3>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-3 space-y-2">
                  {(branch.city || branch.state) && (
                    <p
                      className="text-xs flex items-center gap-1"
                      style={{ color: `${textColor}99` }}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {[branch.city, branch.state].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  )}

                  {branch.address && (
                    <p
                      className="text-xs truncate"
                      style={{ color: `${textColor}80` }}
                    >
                      {branch.address}
                    </p>
                  )}

                  {branch.phone && (
                    <p
                      className="text-xs flex items-center gap-1"
                      style={{ color: `${textColor}99` }}
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{branch.phone}</span>
                    </p>
                  )}

                  {/* CTA button */}
                  <div className="pt-1">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                      style={{ color: accentColor }}
                    >
                      Ver sucursal
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
