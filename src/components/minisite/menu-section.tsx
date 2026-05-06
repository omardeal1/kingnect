"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Sparkles, Search, X } from "lucide-react"
import Image from "next/image"
import { useCart } from "./cart-provider"
import { ModifierSelector } from "./modifier-selector"
import { useTranslations } from "@/i18n/provider"
import type { ModifierGroupData, SelectedModifier } from "@/lib/modifier-types"
import { itemHasModifiers, getModifierGroupsForProduct } from "@/lib/modifier-types"
import { generateCartItemId } from "./cart-provider"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface MenuCategoryItemData {
  id: string
  name: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  isOrderable: boolean
  enabled: boolean
  sortOrder: number
  badge?: string | null
}

interface MenuCategoryData {
  id: string
  name: string
  enabled: boolean
  sortOrder: number
  menuItems: MenuCategoryItemData[]
}

interface FeaturedSlideData {
  id: string
  imageUrl: string
  title: string | null
  enabled: boolean
  sortOrder: number
}

interface MenuSectionProps {
  categories: MenuCategoryData[]
  accentColor: string
  textColor: string
  cardColor: string
  modifierGroups?: ModifierGroupData[]
  siteId: string
  menuTemplate?: string
  featuredSlides?: FeaturedSlideData[]
}

// ─── Badge Config ───────────────────────────────────────────────────────────────

const badgeConfig: Record<string, { bg: string; text: string; label: string }> = {
  Nuevo: { bg: "#3B82F620", text: "#3B82F6", label: "Nuevo" },
  Popular: { bg: "#F59E0B20", text: "#F59E0B", label: "Popular" },
  Recomendado: { bg: "#10B98120", text: "#10B981", label: "Recomendado" },
}

// ─── Template Config ────────────────────────────────────────────────────────────

const templates = {
  dark_elegant: {
    cardBg: "#1a1a1a",
    cardText: "#ffffff",
    cardAccent: "#D4A849",
    cardBorder: "#D4A84940",
    catBorder: "#D4A84930",
    catText: "#D4A849",
    addBtnBg: "#D4A849",
    addBtnText: "#000000",
    priceColor: "#D4A849",
    descOpacity: 0.65,
  },
  fresh_modern: {
    cardBg: "#ffffff",
    cardText: "#0A0A0A",
    cardAccent: "#10B981",
    cardBorder: "#E5E7EB",
    catBorder: "#10B98130",
    catText: "#10B981",
    addBtnBg: "#10B981",
    addBtnText: "#ffffff",
    priceColor: "#10B981",
    descOpacity: 0.6,
  },
  warm_casual: {
    cardBg: "#FFF8F0",
    cardText: "#5C4033",
    cardAccent: "#E07B39",
    cardBorder: "#E07B3930",
    catBorder: "#E07B3930",
    catText: "#E07B39",
    addBtnBg: "#E07B39",
    addBtnText: "#ffffff",
    priceColor: "#E07B39",
    descOpacity: 0.65,
  },
} as const

// ─── Featured Slides Carousel ───────────────────────────────────────────────────

function FeaturedSlidesCarousel({
  slides,
  accentColor,
}: {
  slides: FeaturedSlideData[]
  accentColor: string
}) {
  const [current, setCurrent] = useState(0)
  const activeSlides = slides.filter((s) => s.enabled)

  useEffect(() => {
    if (activeSlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeSlides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [activeSlides.length])

  if (activeSlides.length === 0) return null

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-video w-full"
        >
          <Image
            src={activeSlides[current].imageUrl}
            alt={activeSlides[current].title || "Menu photo"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {activeSlides[current].title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <p className="text-white text-sm font-semibold">
                {activeSlides[current].title}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrent(idx)}
              className="size-1.5 rounded-full transition-all"
              style={{
                backgroundColor:
                  idx === current ? "#ffffff" : "#ffffff50",
                transform: idx === current ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function MenuSection({
  categories,
  accentColor,
  textColor,
  cardColor,
  modifierGroups = [],
  siteId,
  menuTemplate = "fresh_modern",
  featuredSlides = [],
}: MenuSectionProps) {
  const { addItem } = useCart()
  const { t } = useTranslations("minisite")
  const tpl = templates[menuTemplate as keyof typeof templates] || templates.fresh_modern

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Modifier selector state
  const [modifierOpen, setModifierOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string
    name: string
    price: number
    imageUrl?: string | null
  } | null>(null)
  const [productModifierGroups, setProductModifierGroups] = useState<ModifierGroupData[]>([])

  // Filter categories and items
  const enabledCategories = categories
    .filter((c) => c.enabled)
    .map((c) => ({
      ...c,
      menuItems: c.menuItems
        .filter((i) => {
          if (!i.enabled) return false
          if (!searchQuery.trim()) return true
          const q = searchQuery.toLowerCase()
          return (
            i.name.toLowerCase().includes(q) ||
            (i.description && i.description.toLowerCase().includes(q))
          )
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((c) => c.menuItems.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const activeSlides = featuredSlides.filter((s) => s.enabled)

  if (enabledCategories.length === 0 && activeSlides.length === 0) return null

  const handleAddClick = (item: MenuCategoryItemData) => {
    const hasMods = itemHasModifiers(item.id, modifierGroups)

    if (hasMods) {
      const groups = getModifierGroupsForProduct(item.id, modifierGroups)
      setSelectedProduct({
        id: item.id,
        name: item.name,
        price: item.price || 0,
        imageUrl: item.imageUrl,
      })
      setProductModifierGroups(groups)
      setModifierOpen(true)
    } else {
      addItem({
        menuItemId: item.id,
        cartItemId: generateCartItemId(item.id, []),
        name: item.name,
        price: item.price || 0,
        quantity: 1,
        modifiers: [],
      })
    }
  }

  const handleAddToCartWithModifiers = (modifiers: SelectedModifier[]) => {
    if (!selectedProduct) return
    addItem({
      menuItemId: selectedProduct.id,
      cartItemId: generateCartItemId(selectedProduct.id, modifiers),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      modifiers,
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
      <h2
        className="text-xl font-bold text-center mb-6"
        style={{ color: textColor }}
      >
        {t("menu.title")}
      </h2>

      {/* ─── Featured Slides Carousel ─────────────────────── */}
      <FeaturedSlidesCarousel slides={featuredSlides} accentColor={accentColor} />

      {/* ─── Search Bar ───────────────────────────────────── */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("menu.search", "Buscar en el menú...")}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm bg-muted/50 border border-border/50 focus:border-border focus:outline-none focus:ring-2 transition-all"
          style={{ "--ring-color": `${tpl.cardAccent}40` } as React.CSSProperties}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ─── No results ───────────────────────────────────── */}
      {searchQuery.trim() && enabledCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-sm text-muted-foreground">
            {t("menu.noResults", "No encontramos ese producto")} 🔍
          </p>
        </motion.div>
      )}

      {/* ─── Menu Categories ──────────────────────────────── */}
      {enabledCategories.map((category) => (
        <div key={category.id} className="mb-8 last:mb-0">
          <h3
            className="text-lg font-semibold mb-4 pb-2 border-b"
            style={{ color: tpl.catText, borderColor: tpl.catBorder }}
          >
            {category.name}
          </h3>
          <div className="flex flex-col gap-3">
            {category.menuItems.map((item, idx) => {
              const hasMods = itemHasModifiers(item.id, modifierGroups)
              const badge = item.badge ? badgeConfig[item.badge] : null

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-xl overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: tpl.cardBg,
                    border: `1px solid ${tpl.cardBorder}`,
                  }}
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
                      {/* Badge */}
                      {badge && (
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                          }}
                        >
                          {badge.label}
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="font-semibold text-sm sm:text-base leading-tight"
                          style={{ color: tpl.cardText }}
                        >
                          {item.name}
                        </h4>
                        {item.price != null && (
                          <span
                            className="font-bold text-sm flex-shrink-0"
                            style={{ color: tpl.priceColor }}
                          >
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className="text-xs sm:text-sm mt-1 line-clamp-2"
                          style={{ color: tpl.cardText, opacity: tpl.descOpacity }}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.isOrderable && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleAddClick(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: tpl.addBtnBg,
                              color: tpl.addBtnText,
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t("menu.addToOrder")}
                          </button>
                          {hasMods && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{
                                backgroundColor: `${tpl.cardAccent}15`,
                                color: tpl.cardAccent,
                              }}
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              {t("modifiers.customizable", "Personalizable")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Modifier selector sheet */}
      <ModifierSelector
        isOpen={modifierOpen}
        onClose={() => setModifierOpen(false)}
        product={selectedProduct}
        modifierGroups={productModifierGroups}
        accentColor={accentColor}
        textColor={textColor}
        cardColor={cardColor}
        onAddToCart={handleAddToCartWithModifiers}
      />
    </motion.section>
  )
}
