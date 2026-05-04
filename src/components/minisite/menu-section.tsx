"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useCart } from "./cart-provider"

interface MenuCategoryData {
  id: string
  name: string
  enabled: boolean
  sortOrder: number
  menuItems: MenuCategoryItemData[]
}

interface MenuCategoryItemData {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  isOrderable: boolean
  enabled: boolean
  sortOrder: number
}

interface MenuSectionProps {
  categories: MenuCategoryData[]
  accentColor: string
  textColor: string
  cardColor: string
}

export function MenuSection({
  categories,
  accentColor,
  textColor,
  cardColor,
}: MenuSectionProps) {
  const { addItem } = useCart()
  const enabledCategories = categories
    .filter((c) => c.enabled)
    .map((c) => ({
      ...c,
      menuItems: c.menuItems.filter((i) => i.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((c) => c.menuItems.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (enabledCategories.length === 0) return null

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
        Menú
      </h2>

      {enabledCategories.map((category) => (
        <div key={category.id} className="mb-8 last:mb-0">
          <h3
            className="text-lg font-semibold mb-4 pb-2 border-b"
            style={{ color: accentColor, borderColor: `${accentColor}30` }}
          >
            {category.name}
          </h3>
          <div className="flex flex-col gap-3">
            {category.menuItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-xl overflow-hidden shadow-sm"
                style={{ backgroundColor: cardColor }}
              >
                <div className="flex gap-3 p-3">
                  {item.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className="font-semibold text-sm sm:text-base leading-tight"
                        style={{ color: textColor }}
                      >
                        {item.name}
                      </h4>
                      {item.price != null && (
                        <span
                          className="font-bold text-sm flex-shrink-0"
                          style={{ color: accentColor }}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p
                        className="text-xs sm:text-sm mt-1 line-clamp-2 opacity-70"
                        style={{ color: textColor }}
                      >
                        {item.description}
                      </p>
                    )}
                    {item.isOrderable && (
                      <button
                        onClick={() =>
                          addItem({
                            menuItemId: item.id,
                            name: item.name,
                            price: item.price || 0,
                            quantity: 1,
                          })
                        }
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: accentColor, color: "#FFFFFF" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar al pedido
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.section>
  )
}
