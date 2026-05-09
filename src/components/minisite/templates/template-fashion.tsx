"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  MapPin,
  CalendarCheck,
  Star,
  Image,
  LayoutGrid,
  Link2,
  Menu,
  Globe,
  Navigation,
  Facebook,
  Instagram,
  Youtube,
  Play,
} from "lucide-react"
import ImageNext from "next/image"
import { CartProvider, useCart } from "../cart-provider"
import { CartDrawer } from "../cart-drawer"
import { FloatingWhatsApp } from "../floating-whatsapp"
import { useTranslations, useLocale } from "@/i18n/provider"
import { locales } from "@/i18n/config"
import { trackLinkClick, trackWhatsAppClick } from "@/lib/analytics"

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ──────────────────────────────────────────────────────────────────────

interface FashionTemplateProps {
  site: any
}

interface ActionCard {
  key: string
  icon: React.ElementType
  labelEs: string
  labelEn: string
  href: string
  external?: boolean
}

// ─── Color Constants ────────────────────────────────────────────────────────────

const COLORS = {
  carbon: "#2C2C2C",
  darkGray: "#3D3D3D",
  gold: "#C9A96E",
  goldLight: "#C9A96E30",
  beige: "#F5F0E8",
  white: "#FFFFFF",
  textLight: "rgba(255,255,255,0.95)",
  textMuted: "rgba(255,255,255,0.6)",
}

// ─── Cart Badge ─────────────────────────────────────────────────────────────────

function CartBadge() {
  const { itemCount, setOpen } = useCart()
  if (itemCount === 0) return null
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-24 left-4 z-50 w-13 h-13 rounded-full text-white flex items-center justify-center shadow-lg"
      style={{ backgroundColor: COLORS.gold }}
      aria-label="Ver carrito"
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </motion.button>
  )
}

// ─── Main Content ───────────────────────────────────────────────────────────────

function FashionContent({ site }: FashionTemplateProps) {
  const router = useRouter()
  const { t } = useTranslations("minisite")
  const { locale, setLocale } = useLocale()

  const {
    slug,
    id,
    businessName,
    tagline,
    logoUrl,
    slides = [],
    socialLinks = [],
    contactButtons = [],
    menuCategories = [],
    services = [],
    reservationConfig,
    testimonials = [],
    locations = [],
    galleryImages = [],
    customLinks = [],
    client,
  } = site

  // WhatsApp number
  const whatsappButton = contactButtons.find(
    (b: any) => b.type === "whatsapp" && b.enabled
  )
  const whatsappNumber = whatsappButton?.value || client?.whatsapp

  // ─── Language Toggle ──────────────────────────────────────────────────────

  const toggleLocale = () => {
    const idx = locales.indexOf(locale)
    const next = locales[(idx + 1) % locales.length]
    setLocale(next)
  }

  // ─── Main Slider ──────────────────────────────────────────────────────────

  const enabledSlides = useMemo(
    () => slides.filter((s: any) => s.enabled && s.imageUrl),
    [slides]
  )
  const [slideIdx, setSlideIdx] = useState(0)
  const [slideDir, setSlideDir] = useState(0)
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const goSlide = useCallback(
    (i: number) => {
      setSlideDir(i > slideIdx ? 1 : -1)
      setSlideIdx(i)
    },
    [slideIdx]
  )
  const nextSlide = useCallback(() => {
    setSlideDir(1)
    setSlideIdx((p) => (p + 1) % enabledSlides.length)
  }, [enabledSlides.length])
  const prevSlide = useCallback(() => {
    setSlideDir(-1)
    setSlideIdx((p) => (p - 1 + enabledSlides.length) % enabledSlides.length)
  }, [enabledSlides.length])

  useEffect(() => {
    if (enabledSlides.length <= 1) return
    slideTimer.current = setInterval(nextSlide, 5000)
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current)
    }
  }, [nextSlide, enabledSlides.length])

  // ─── Action Cards ─────────────────────────────────────────────────────────

  const actionCards: ActionCard[] = useMemo(() => {
    const cards: ActionCard[] = []
    if (menuCategories.length > 0) {
      cards.push({
        key: "catalog",
        icon: Menu,
        labelEs: "Catálogo",
        labelEn: "Catalog",
        href: `/${slug}/menu`,
      })
    }
    if (services.length > 0) {
      cards.push({
        key: "services",
        icon: Sparkles,
        labelEs: "Servicios",
        labelEn: "Services",
        href: `/${slug}/servicios`,
      })
    }
    if (reservationConfig?.isEnabled) {
      cards.push({
        key: "reservations",
        icon: CalendarCheck,
        labelEs: "Reservaciones",
        labelEn: "Reservations",
        href: `/${slug}/reservaciones`,
      })
    }
    if (testimonials.length > 0) {
      cards.push({
        key: "testimonials",
        icon: Star,
        labelEs: "Opiniones",
        labelEn: "Reviews",
        href: `/${slug}/opiniones`,
      })
    }
    if (locations.length > 0) {
      const mapsUrl =
        locations[0]?.mapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locations[0]?.address || ""
        )}`
      cards.push({
        key: "location",
        icon: MapPin,
        labelEs: "Ubicación",
        labelEn: "Location",
        href: mapsUrl,
        external: true,
      })
    }
    if (enabledSlides.length > 0) {
      cards.push({
        key: "promos",
        icon: LayoutGrid,
        labelEs: "Promociones",
        labelEn: "Promotions",
        href: `/${slug}/promociones`,
      })
    }
    if (galleryImages.length > 0) {
      cards.push({
        key: "gallery",
        icon: Image,
        labelEs: "Galería",
        labelEn: "Gallery",
        href: `/${slug}/galeria`,
      })
    }
    if (customLinks.length > 0) {
      cards.push({
        key: "more",
        icon: Link2,
        labelEs: "Más",
        labelEn: "More",
        href: `/${slug}/links`,
      })
    }
    return cards
  }, [
    menuCategories.length,
    services.length,
    reservationConfig?.isEnabled,
    testimonials.length,
    locations,
    enabledSlides.length,
    galleryImages.length,
    customLinks.length,
    slug,
  ])

  // ─── Bottom Bar Icons ─────────────────────────────────────────────────────

  const bottomIcons = useMemo(() => {
    const icons: {
      key: string
      icon: React.ElementType
      labelEs: string
      labelEn: string
      url: string
    }[] = []

    // WhatsApp
    if (whatsappNumber) {
      icons.push({
        key: "whatsapp",
        icon: MessageCircle,
        labelEs: "WhatsApp",
        labelEn: "WhatsApp",
        url: `https://wa.me/${whatsappNumber}`,
      })
    }

    // Social links
    for (const link of socialLinks) {
      if (!link.enabled) continue
      switch (link.type) {
        case "facebook":
          icons.push({
            key: link.id,
            icon: Facebook,
            labelEs: link.label || "Facebook",
            labelEn: link.label || "Facebook",
            url: link.url,
          })
          break
        case "instagram":
          icons.push({
            key: link.id,
            icon: Instagram,
            labelEs: link.label || "Instagram",
            labelEn: link.label || "Instagram",
            url: link.url,
          })
          break
        case "youtube":
          icons.push({
            key: link.id,
            icon: Youtube,
            labelEs: link.label || "YouTube",
            labelEn: link.label || "YouTube",
            url: link.url,
          })
          break
        case "tiktok":
          icons.push({
            key: link.id,
            icon: Play,
            labelEs: link.label || "TikTok",
            labelEn: link.label || "TikTok",
            url: link.url,
          })
          break
        case "website":
          icons.push({
            key: link.id,
            icon: Globe,
            labelEs: link.label || "Web",
            labelEn: link.label || "Web",
            url: link.url,
          })
          break
        default:
          icons.push({
            key: link.id,
            icon: Globe,
            labelEs: link.label || link.type,
            labelEn: link.label || link.type,
            url: link.url,
          })
          break
      }
    }

    // Maps
    if (locations.length > 0) {
      const mapsUrl =
        locations[0]?.mapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locations[0]?.address || ""
        )}`
      icons.push({
        key: "maps",
        icon: Navigation,
        labelEs: "Mapa",
        labelEn: "Map",
        url: mapsUrl,
      })
    }

    return icons
  }, [whatsappNumber, socialLinks, locations])

  // ─── Infinite Loop Scroll Ref ─────────────────────────────────────────────

  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = cardsRef.current
    if (!container || actionCards.length <= 1) return

    let scrollPos = 0
    const speed = 0.5
    let animFrame: number
    let isPaused = false

    const handleMouseEnter = () => { isPaused = true }
    const handleMouseLeave = () => { isPaused = false }

    const step = () => {
      if (!isPaused) {
        scrollPos += speed
        const maxScroll = container.scrollWidth / 2
        if (scrollPos >= maxScroll) {
          scrollPos -= maxScroll
        }
        container.scrollLeft = scrollPos
      }
      animFrame = requestAnimationFrame(step)
    }

    container.addEventListener("mouseenter", handleMouseEnter)
    container.addEventListener("mouseleave", handleMouseLeave)
    animFrame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animFrame)
      container.removeEventListener("mouseenter", handleMouseEnter)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [actionCards.length])

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCardClick = (card: ActionCard) => {
    if (card.external) {
      trackLinkClick(id, card.key, card.href)
      window.open(card.href, "_blank")
    } else {
      router.push(card.href)
    }
  }

  const handleBottomIconClick = (url: string, key: string) => {
    if (key === "whatsapp" && whatsappNumber) {
      trackWhatsAppClick(id, whatsappNumber)
    } else {
      trackLinkClick(id, key, url)
    }
    window.open(url, "_blank")
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.carbon }}>
      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Background gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(44,44,44,0.3) 0%, rgba(44,44,44,0.85) 60%, #2C2C2C 100%)",
            zIndex: 1,
          }}
        />

        {/* Background image */}
        {logoUrl && (
          <div className="relative h-72 sm:h-80 w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${logoUrl})` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 -mt-36 sm:-mt-40 flex flex-col items-center px-6 pb-8">
          {/* Logo */}
          {logoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shadow-2xl mb-4"
              style={{ borderColor: COLORS.gold, backgroundColor: COLORS.darkGray }}
            >
              <ImageNext
                src={logoUrl}
                alt={businessName || "Logo"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: COLORS.textLight,
            }}
          >
            EN | ES
          </button>

          {/* Business Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-center tracking-tight"
            style={{ color: COLORS.white }}
          >
            {businessName}
          </motion.h1>

          {/* Tagline */}
          {tagline && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-2 text-sm sm:text-base text-center max-w-sm"
              style={{ color: COLORS.textMuted }}
            >
              {tagline}
            </motion.p>
          )}

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 w-16 h-[2px] origin-center"
            style={{ backgroundColor: COLORS.gold }}
          />
        </div>
      </motion.header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="pb-24">
        {/* ─── MAIN SLIDER ────────────────────────────────────────────── */}
        {enabledSlides.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-4 mb-6"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
              <AnimatePresence mode="wait" custom={slideDir}>
                <motion.div
                  key={enabledSlides[slideIdx]?.id}
                  custom={slideDir}
                  initial={{ opacity: 0, x: slideDir * 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideDir * 80 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <ImageNext
                    src={enabledSlides[slideIdx].imageUrl!}
                    alt={enabledSlides[slideIdx].title || "Slide"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 640px"
                    priority
                  />
                  {/* Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(0deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.1) 50%, transparent 100%)",
                    }}
                  />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    {enabledSlides[slideIdx].title && (
                      <h2
                        className="text-xl sm:text-2xl font-bold tracking-tight"
                        style={{ color: COLORS.white }}
                      >
                        {enabledSlides[slideIdx].title}
                      </h2>
                    )}
                    {enabledSlides[slideIdx].subtitle && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.gold }}
                      >
                        {enabledSlides[slideIdx].subtitle}
                      </p>
                    )}
                    {enabledSlides[slideIdx].buttonLabel && enabledSlides[slideIdx].buttonUrl && (
                      <a
                        href={enabledSlides[slideIdx].buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 px-5 py-2 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                        style={{
                          backgroundColor: COLORS.gold,
                          color: COLORS.carbon,
                        }}
                      >
                        {enabledSlides[slideIdx].buttonLabel}
                      </a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Arrows */}
              {enabledSlides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      backdropFilter: "blur(8px)",
                      color: COLORS.white,
                    }}
                    aria-label={t("slides.previous")}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      backdropFilter: "blur(8px)",
                      color: COLORS.white,
                    }}
                    aria-label={t("slides.next")}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Dots */}
            {enabledSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {enabledSlides.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => goSlide(idx)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: idx === slideIdx ? "24px" : "8px",
                      backgroundColor:
                        idx === slideIdx ? COLORS.gold : "rgba(255,255,255,0.2)",
                    }}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* ─── ACTION CARDS SLIDER ──────────────────────────────────────── */}
        {actionCards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2
              className="px-6 text-lg font-bold mb-4 tracking-tight"
              style={{ color: COLORS.gold }}
            >
              {locale === "es" ? "Explorar" : "Explore"}
            </h2>
            <div
              ref={cardsRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-6"
              style={{
                scrollBehavior: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Duplicate for infinite loop */}
              {[...actionCards, ...actionCards].map((card, idx) => {
                const Icon = card.icon
                return (
                  <motion.button
                    key={`${card.key}-${idx}`}
                    onClick={() => handleCardClick(card)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-shrink-0 w-40 sm:w-48 rounded-2xl overflow-hidden text-left transition-shadow hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.darkGray} 0%, ${COLORS.carbon} 100%)`,
                      border: `1px solid rgba(255,255,255,0.08)`,
                    }}
                  >
                    {/* Gold accent top line */}
                    <div
                      className="h-[3px] w-full"
                      style={{
                        background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold}60)`,
                      }}
                    />
                    <div className="p-5 flex flex-col items-center text-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: COLORS.goldLight,
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: COLORS.gold }}
                        />
                      </div>
                      <span
                        className="text-sm font-semibold tracking-wide"
                        style={{ color: COLORS.textLight }}
                      >
                        {locale === "es" ? card.labelEs : card.labelEn}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        )}

        {/* ─── FEATURED SECTION (if no slider, show a branded CTA) ───── */}
        {enabledSlides.length === 0 && actionCards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-6 mb-8"
          >
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${COLORS.darkGray} 0%, ${COLORS.carbon} 100%)`,
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ backgroundColor: COLORS.goldLight }}
              >
                <Sparkles className="w-7 h-7" style={{ color: COLORS.gold }} />
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: COLORS.white }}
              >
                {locale === "es" ? "Descubre nuestra colección" : "Discover our collection"}
              </h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>
                {locale === "es"
                  ? "Diseños exclusivos para un estilo único"
                  : "Exclusive designs for a unique style"}
              </p>
              {menuCategories.length > 0 && (
                <button
                  onClick={() => router.push(`/${slug}/menu`)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: COLORS.gold,
                    color: COLORS.carbon,
                  }}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {locale === "es" ? "Ver catálogo" : "View catalog"}
                </button>
              )}
            </div>
          </motion.section>
        )}
      </main>

      {/* ─── BOTTOM ICON BAR ────────────────────────────────────────────── */}
      {bottomIcons.length > 0 && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            backgroundColor: "rgba(20,20,20,0.95)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderTop: `1px solid rgba(255,255,255,0.06)`,
          }}
        >
          <div
            className="flex items-center justify-start gap-1 overflow-x-auto px-3 py-2.5 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {bottomIcons.map((item) => {
              const Icon = item.icon
              const label = locale === "es" ? item.labelEs : item.labelEn
              return (
                <button
                  key={item.key}
                  onClick={() => handleBottomIconClick(item.url, item.key)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all hover:scale-105 active:scale-95 min-w-[56px]"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: COLORS.white }} />
                  </div>
                  <span
                    className="text-[10px] font-medium truncate max-w-[64px]"
                    style={{ color: COLORS.textMuted }}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.nav>
      )}

      {/* ─── FLOATING WHATSAPP (only if no bottom bar) ──────────────────── */}
      {whatsappNumber && bottomIcons.length === 0 && (
        <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={id} />
      )}

      {/* ─── CART ──────────────────────────────────────────────────────── */}
      <CartBadge />
      <CartDrawer
        accentColor={COLORS.gold}
        textColor={COLORS.textLight}
        cardColor={COLORS.darkGray}
        whatsappNumber={whatsappNumber}
        miniSiteId={id}
        slug={slug}
      />
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export function FashionTemplate({ site }: FashionTemplateProps) {
  return (
    <CartProvider>
      <FashionContent site={site} />
    </CartProvider>
  )
}
