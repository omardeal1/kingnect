"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Navigation } from "lucide-react"

interface LocationData {
  id: string
  name: string
  address?: string | null
  mapsUrl?: string | null
  hours?: string | null
  enabled: boolean
}

interface LocationsSectionProps {
  locations: LocationData[]
  accentColor: string
  textColor: string
  cardColor: string
}

export function LocationsSection({
  locations,
  accentColor,
  textColor,
  cardColor,
}: LocationsSectionProps) {
  const enabledLocations = locations.filter((l) => l.enabled)

  if (enabledLocations.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="px-4 py-6"
    >
      <h2
        className="text-xl font-bold text-center mb-6"
        style={{ color: textColor }}
      >
        Ubicaciones
      </h2>

      <div className="flex flex-col gap-4">
        {enabledLocations.map((loc, idx) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: cardColor }}
          >
            <h3
              className="font-bold text-base mb-3"
              style={{ color: textColor }}
            >
              {loc.name}
            </h3>
            {loc.address && (
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                <p className="text-sm opacity-80" style={{ color: textColor }}>
                  {loc.address}
                </p>
              </div>
            )}
            {loc.hours && (
              <div className="flex items-start gap-2 mb-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                <p className="text-sm opacity-80" style={{ color: textColor }}>
                  {loc.hours}
                </p>
              </div>
            )}
            {loc.mapsUrl && (
              <a
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
              >
                <Navigation className="w-3.5 h-3.5" />
                Ver en mapa
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
