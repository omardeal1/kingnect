"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  CalendarDays,
  MessageSquareQuote,
  Sparkles,
  Tag,
  MapPin,
  Settings,
  Phone,
  ChevronRight as ArrowRight,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Globe,
  MoreHorizontal,
  Music,
  ShoppingBag,
} from "lucide-react"
import { CartProvider, useCart } from "../cart-provider"
import { FloatingWhatsApp } from "../floating-whatsapp"
import { CartDrawer } from "../cart-drawer"
import { useTranslations, useLocale } from "@/i18n/provider"
import { trackLinkClick, trackWhatsAppClick } from "@/lib/analytics"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PremiumTemplateProps {
  site: any
}

interface SlideData {
  id: string
  imageUrl?: string | null
  title?: string | null
  subtitle?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  enabled: boolean
}

interface SocialLinkData {
  id: string
  type: string
  label?: string | null
  url: string
  enabled: boolean
}

interface ContactButtonData {
  id: string
  type: string
  label?: string | null
  value: string
  enabled: boolean
}

// ─── Premium Color Palette ──────────────────────────────────────────────────────

const PREMIUM_COLORS = {
  carbon: "#1A1A1A",
  darkGreen: "#2D2D2D",
  gold: "#D4A849",
  beige: "#F5F0E8",
  graphite: "#3A3A3A",
  offWhite: "#FAFAF8",
  glassBg: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
  glassHover: "rgba(255, 255, 255, 0.14)",
}

// ─── Social Icon Map ────────────────────────────────────────────────────────────

const SOCIAL_ICON_MAP: Record<string, { icon: React.ElementType; name: { en: string; es: string } }> = {
  whatsapp: { icon: MessageCircle, name: { en: "WhatsApp", es: "WhatsApp" } },
  facebook: { icon: Facebook, name: { en: "Facebook", es: "Facebook" } },
  instagram: { icon: Instagram, name: { en: "Instagram", es: "Instagram" } },
  tiktok: { icon: Music, name: { en: "TikTok", es: "TikTok" } },
  youtube: { icon: Youtube, name: { en: "YouTube", es: "YouTube" } },
  maps: { icon: MapPin, name: { en: "Maps", es: "Mapas" } },
  email: { icon: Mail, name: { en: "Email", es: "Correo" } },
  phone: { icon: Phone, name: { en: "Phone", es: "Tel\u00e9fono" } },
  website: { icon: Globe, name: { en: "Website", es: "Sitio web" } },
  more: { icon: MoreHorizontal, name: { en: "More", es: "M\u00e1s" } },
}

// ─── Language Toggle (Premium Minimal Style) ────────────────────────────────────

function PremiumLangToggle() {
  const { locale, setLocale } = useLocale()

  const handleToggle = () => {
    setLocale(locale === "es" ? "en" : "es")
  }

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
      aria-label="Switch language"
    >
      <span className={locale === "en" ? "text-white" : "text-white/50"}>EN</span>
      <span className="text-white/30">|</span>
      <span className={locale === "es" ? "text-white" : "text-white/50"}>ES</span>
    </button>
  )
}

// ─── Premium Header ─────────────────────────────────────────────────────────────

function PremiumHeader({
  businessName,
  tagline,
  logoUrl,
  backgroundImageUrl,
  accentColor,
}: {
  businessName: string
  tagline?: string | null
  logoUrl?: string | null
  backgroundImageUrl?: string | null
  accentColor: string
}) {
  const gold = accentColor || PREMIUM_COLORS.gold

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full min-h-[280px] sm:min-h-[320px] flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      {backgroundImageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${PREMIUM_COLORS.carbon} 0%, ${PREMIUM_COLORS.darkGreen} 50%, ${PREMIUM_COLORS.graphite} 100%)`,
          }}
        />
      )}

      {/* Decorative gold line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }}
      />

      {/* Language Toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <PremiumLangToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            {logoUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 mb-5 shadow-lg"
                style={{ borderColor: `${gold}80` }}
              >
                <Image
                  src={logoUrl}
                  alt={businessName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Decorative gold separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-12 h-[1px] mb-4"
              style={{ background: gold }}
            />

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {businessName}
            </h1>

            {tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-2 text-sm sm:text-base text-white/60 max-w-xs"
              >
                {tagline}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom fade into main content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </motion.header>
  )
}

// ─── Premium Horizontal Slider ──────────────────────────────────────────────────

function PremiumSlider({
  slides,
  accentColor,
  siteId,
}: {
  slides: SlideData[]
  accentColor: string
  siteId: string
}) {
  const enabledSlides = slides.filter((s) => s.enabled && s.imageUrl)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const gold = accentColor || PREMIUM_COLORS.gold
  const { t } = useTranslations("minisite")

  // Auto-play
  useEffect(() => {
    if (enabledSlides.length <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % enabledSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [enabledSlides.length])

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setDirection(index > current ? 1 : -1)
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 300)
    },
    [current, isTransitioning]
  )

  const next = useCallback(() => {
    if (isTransitioning) return
    setDirection(1)
    setIsTransitioning(true)
    setCurrent((prev) => (prev + 1) % enabledSlides.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [enabledSlides.length, isTransitioning])

  const prev = useCallback(() => {
    if (isTransitioning) return
    setDirection(-1)
    setIsTransitioning(true)
    setCurrent((prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [enabledSlides.length, isTransitioning])

  if (enabledSlides.length === 0) return null

  const slide = enabledSlides[current]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-4 pt-5 pb-2"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/5">
        <div className="relative aspect-[16/9] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 80 }}
              transition={{ duration: 0.3 }}
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
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {slide.title && (
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                    {slide.title}
                  </h3>
                )}
                {slide.subtitle && (
                  <p className="text-sm text-white/70 mt-1">{slide.subtitle}</p>
                )}
                {slide.buttonLabel && slide.buttonUrl && (
                  <a
                    href={slide.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackLinkClick(siteId, "slide_button", slide.buttonUrl!)}
                    className="inline-block mt-3 px-5 py-2 rounded-full text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: gold }}
                  >
                    {slide.buttonLabel}
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        {enabledSlides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all duration-300 border border-white/10"
              aria-label={t("slides.previous")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all duration-300 border border-white/10"
              aria-label={t("slides.next")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {enabledSlides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {enabledSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === current ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: idx === current ? gold : "rgba(255,255,255,0.4)",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}

// ─── Premium Menu Item Card ────────────────────────────────────────────────────

function PremiumMenuItemCard({
  icon: Icon,
  label,
  href,
  accentColor,
  index,
}: {
  icon: React.ElementType
  label: string
  href: string
  accentColor: string
  index: number
}) {
  const router = useRouter()
  const gold = accentColor || PREMIUM_COLORS.gold

  const handleClick = () => {
    router.push(href)
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 group text-left"
      style={{
        backgroundColor: PREMIUM_COLORS.glassBg,
        borderColor: PREMIUM_COLORS.glassBorder,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.backgroundColor = PREMIUM_COLORS.glassHover
        el.style.borderColor = `${gold}40`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.backgroundColor = PREMIUM_COLORS.glassBg
        el.style.borderColor = PREMIUM_COLORS.glassBorder
      }}
    >
      {/* Icon circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: `${gold}18`,
          border: `1px solid ${gold}30`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: gold }} />
      </div>

      {/* Label */}
      <span className="flex-1 text-sm font-medium text-white/90 tracking-wide">
        {label}
      </span>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-300" />
    </motion.button>
  )
}

// ─── Vertical Menu List ────────────────────────────────────────────────────────

function PremiumMenuList({
  site,
  slug,
  accentColor,
}: {
  site: any
  slug: string
  accentColor: string
}) {
  const { t } = useTranslations("minisite")
  const { locale } = useLocale()

  const menuItems = [
    {
      icon: UtensilsCrossed,
      labelEs: "Cat\u00e1logo",
      labelEn: "Catalog",
      href: `/${slug}/menu`,
      show: (site.menuCategories || []).filter((c: any) => c.enabled).length > 0,
    },
    {
      icon: CalendarDays,
      labelEs: "Reservaciones",
      labelEn: "Reservations",
      href: `/${slug}/reservaciones`,
      show: site.reservationConfig?.isEnabled === true,
    },
    {
      icon: MessageSquareQuote,
      labelEs: "Opiniones",
      labelEn: "Reviews",
      href: `/${slug}/opiniones`,
      show: (site.testimonials || []).length > 0,
    },
    {
      icon: Sparkles,
      labelEs: "Eventos",
      labelEn: "Events",
      href: `/${slug}/eventos`,
      show: (site.slides || []).filter((s: any) => s.enabled && s.imageUrl).length > 0,
    },
    {
      icon: Tag,
      labelEs: "Promociones",
      labelEn: "Promotions",
      href: `/${slug}/promociones`,
      show: (site.services || []).filter((s: any) => s.enabled).length > 0,
    },
    {
      icon: MapPin,
      labelEs: "Ubicaci\u00f3n",
      labelEn: "Location",
      href: `/${slug}/ubicacion`,
      show: (site.locations || []).length > 0,
    },
    {
      icon: Settings,
      labelEs: "Personalizar",
      labelEn: "Customize",
      href: `/${slug}/personalizar`,
      show: (site.customLinks || []).length > 0,
    },
    {
      icon: Phone,
      labelEs: "Contacto",
      labelEn: "Contact",
      href: `/${slug}/contacto`,
      show:
        (site.contactButtons || []).filter((b: any) => b.enabled).length > 0 ||
        (site.socialLinks || []).filter((l: any) => l.enabled).length > 0,
    },
  ]

  const visibleItems = menuItems.filter((item) => item.show)

  if (visibleItems.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="px-4 py-5"
    >
      <div className="flex flex-col gap-3">
        {visibleItems.map((item, idx) => (
          <PremiumMenuItemCard
            key={item.href}
            icon={item.icon}
            label={locale === "es" ? item.labelEs : item.labelEn}
            href={item.href}
            accentColor={accentColor}
            index={idx}
          />
        ))}
      </div>
    </motion.section>
  )
}

// ─── Horizontal Social/Contact Icon Bar ─────────────────────────────────────────

function PremiumSocialBar({
  socialLinks,
  contactButtons,
  accentColor,
  siteId,
  whatsappNumber,
}: {
  socialLinks: SocialLinkData[]
  contactButtons: ContactButtonData[]
  accentColor: string
  siteId: string
  whatsappNumber?: string | null
}) {
  const { locale } = useLocale()
  const gold = accentColor || PREMIUM_COLORS.gold

  // Build icon items from social links and contact buttons
  const iconItems: {
    key: string
    icon: React.ElementType
    label: string
    url: string
    type: string
  }[] = []

  // Add social links
  const enabledSocials = socialLinks.filter((l) => l.enabled)
  enabledSocials.forEach((link) => {
    const mapped = SOCIAL_ICON_MAP[link.type]
    if (mapped) {
      iconItems.push({
        key: link.id,
        icon: mapped.icon,
        label: link.label || mapped.name[locale as "en" | "es"],
        url: link.url,
        type: `social_${link.type}`,
      })
    }
  })

  // Add WhatsApp from contact buttons
  const whatsappBtn = contactButtons.find(
    (b) => b.type === "whatsapp" && b.enabled
  )
  if (whatsappBtn && !iconItems.some((i) => i.type === "social_whatsapp")) {
    iconItems.unshift({
      key: "whatsapp-cb",
      icon: MessageCircle,
      label: "WhatsApp",
      url: `https://wa.me/${whatsappBtn.value}`,
      type: "contact_whatsapp",
    })
  }

  // Add phone from contact buttons
  const phoneBtn = contactButtons.find((b) => b.type === "call" && b.enabled)
  if (phoneBtn && !iconItems.some((i) => i.type === "social_phone")) {
    iconItems.push({
      key: "phone-cb",
      icon: Phone,
      label: locale === "es" ? "Tel\u00e9fono" : "Phone",
      url: `tel:${phoneBtn.value}`,
      type: "contact_call",
    })
  }

  // Add email from contact buttons
  const emailBtn = contactButtons.find((b) => b.type === "email" && b.enabled)
  if (emailBtn && !iconItems.some((i) => i.type === "social_email")) {
    iconItems.push({
      key: "email-cb",
      icon: Mail,
      label: locale === "es" ? "Correo" : "Email",
      url: `mailto:${emailBtn.value}`,
      type: "contact_email",
    })
  }

  if (iconItems.length === 0) return null

  const handleClick = (url: string, type: string) => {
    if (type === "contact_whatsapp") {
      trackWhatsAppClick(siteId, whatsappNumber || "")
    } else {
      trackLinkClick(siteId, type, url)
    }
    window.open(url, "_blank")
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="py-6"
    >
      {/* Section label */}
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <span
          className="text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: `${gold}80` }}
        >
          {locale === "es" ? "S\u00edguenos" : "Follow Us"}
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>

      {/* Horizontally scrollable icon bar */}
      <div
        className="flex gap-4 px-6 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {iconItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * idx }}
              onClick={() => handleClick(item.url, item.type)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
              aria-label={item.label}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: `${gold}12`,
                  borderColor: `${gold}25`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = `${gold}25`
                  el.style.borderColor = `${gold}50`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = `${gold}12`
                  el.style.borderColor = `${gold}25`
                }}
              >
                <Icon className="w-5 h-5" style={{ color: gold }} />
              </div>
              <span className="text-[10px] text-white/50 font-medium group-hover:text-white/80 transition-colors duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}

// ─── Cart Badge ─────────────────────────────────────────────────────────────────

function PremiumCartBadge({ accentColor }: { accentColor: string }) {
  const { itemCount, setOpen } = useCart()
  const gold = accentColor || PREMIUM_COLORS.gold

  if (itemCount === 0) return null

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-white/10"
      style={{ backgroundColor: gold }}
      aria-label={`View cart (${itemCount} items)`}
    >
      <ShoppingBag className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </motion.button>
  )
}

// ─── Main Template Content ──────────────────────────────────────────────────────

function PremiumTemplateContent({ site }: PremiumTemplateProps) {
  const {
    accentColor,
    businessName,
    tagline,
    logoUrl,
    slug,
    id,
    backgroundImageUrl,
    textColor,
    cardColor,
  } = site

  const gold = accentColor || PREMIUM_COLORS.gold

  // WhatsApp number
  const whatsappButton = site.contactButtons?.find(
    (b: any) => b.type === "whatsapp" && b.enabled
  )
  const whatsappNumber = whatsappButton?.value || site.client?.whatsapp

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: PREMIUM_COLORS.carbon,
        color: "#FFFFFF",
      }}
    >
      {/* Subtle top radial gradient glow */}
      <div
        className="fixed top-0 left-0 right-0 h-96 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at top, ${PREMIUM_COLORS.darkGreen}50 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto pb-12">
        {/* 1. Header with background, logo, name, tagline, language toggle */}
        <PremiumHeader
          businessName={businessName}
          tagline={tagline}
          logoUrl={logoUrl}
          backgroundImageUrl={backgroundImageUrl}
          accentColor={gold}
        />

        {/* 2. Main horizontal slider */}
        <PremiumSlider
          slides={site.slides || []}
          accentColor={gold}
          siteId={id}
        />

        {/* 3. Vertical menu list (glassmorphism cards) */}
        <PremiumMenuList
          site={site}
          slug={slug}
          accentColor={gold}
        />

        {/* 4. Horizontal social/contact icon bar */}
        <PremiumSocialBar
          socialLinks={site.socialLinks || []}
          contactButtons={site.contactButtons || []}
          accentColor={gold}
          siteId={id}
          whatsappNumber={whatsappNumber}
        />

        {/* Footer */}
        {site.showKingBrand !== false && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-6 px-4"
          >
            <div
              className="h-[1px] mx-auto mb-5"
              style={{
                background: `linear-gradient(90deg, transparent, ${gold}30, transparent)`,
              }}
            />
            <p className="text-[11px] tracking-widest uppercase" style={{ color: `${gold}50` }}>
              <span className="text-white/20">Powered by </span>
              <span style={{ color: `${gold}70` }}>QAIROSS</span>
            </p>
          </motion.footer>
        )}
      </div>

      {/* Floating WhatsApp */}
      {whatsappNumber && (
        <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={id} />
      )}

      {/* Cart badge */}
      <PremiumCartBadge accentColor={gold} />

      {/* Cart drawer */}
      <CartDrawer
        accentColor={gold}
        textColor={textColor || "#FFFFFF"}
        cardColor={cardColor || PREMIUM_COLORS.darkGreen}
        whatsappNumber={whatsappNumber}
        miniSiteId={id}
        slug={slug}
      />
    </div>
  )
}

// ─── Exported Template (wrapped in CartProvider) ────────────────────────────────

export function PremiumTemplate({ site }: PremiumTemplateProps) {
  return (
    <CartProvider>
      <PremiumTemplateContent site={site} />
    </CartProvider>
  )
}
