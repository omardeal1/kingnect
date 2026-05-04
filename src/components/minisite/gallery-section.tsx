"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"

interface GalleryImageData {
  id: string
  imageUrl: string
  caption?: string | null
  enabled: boolean
}

interface GallerySectionProps {
  images: GalleryImageData[]
  accentColor: string
  textColor: string
}

export function GallerySection({ images, accentColor, textColor }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImageData | null>(null)
  const enabledImages = images.filter((i) => i.enabled)

  if (enabledImages.length === 0) return null

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
        Galería
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {enabledImages.map((img, idx) => (
          <motion.button
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => setSelectedImage(img)}
            className="relative aspect-square rounded-xl overflow-hidden shadow-sm group"
          >
            <Image
              src={img.imageUrl}
              alt={img.caption || "Galería"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-xs truncate">{img.caption}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.caption || "Galería"}
                  fill
                  className="object-contain bg-black"
                  sizes="512px"
                />
              </div>
              {selectedImage.caption && (
                <p className="text-white text-center text-sm mt-3">
                  {selectedImage.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
