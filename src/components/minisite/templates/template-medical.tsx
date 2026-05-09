"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Globe,
  ExternalLink,
  ShoppingBag,
  Star,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Syringe,
  Microscope,
  Pill,
  ClipboardList,
  Eye,
  Smile,
  Brain,
  Bone,
  Baby,
  Scissors,
  Sparkles,
  Clock,
  Utensils,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Heart,
  Activity,
} from "lucide-react"
import { CartProvider, useCart } from "../cart-provider"
import { FloatingWhatsApp } from "../floating-whatsapp"
import { CartDrawer } from "../cart-drawer"
import { trackWhatsAppClick, trackLinkClick } from "@/lib/analytics"
import { useTranslations, useLocale } from "@/i18n/provider"
import { LanguageToggle } from "@/components/ui/language-toggle"

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Color Palette ──────────────────────────────────────────────────────────────
// These are defaults; site.accentColor overrides the accent colors when provided

const COLORS = {
  white: "#FFFFFF",
  lightBlue: "#4A90D9",
  strongBlue: "#1E3A5F",
  navy: "#0D2137",
  lightGray: "#F5F7FA",
  mediumGray: "#E8ECF1",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  accentSoft: "#EBF3FC",
  borderLight: "#D1D9E6",
}

// Helper to get the effective accent color from site or fallback
function getAccent(site: any): string {
  return site.accentColor || COLORS.lightBlue
}


// ─── Service Icon Mapping ───────────────────────────────────────────────────────

const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  heart_pulse: HeartPulse,
  shield_check: ShieldCheck,
  syringe: Syringe,
  microscope: Microscope,
  pill: Pill,
  clipboard_list: ClipboardList,
  eye: Eye,
  tooth: Smile,
  brain: Brain,
  bone: Bone,
  baby: Baby,
  scissors: Scissors,
  sparkles: Sparkles,
  clock: Clock,
  heart: Heart,
  activity: Activity,
  utensils: Utensils,
  book_open: BookOpen,
  graduation_cap: GraduationCap,
  flask: FlaskConical,
}

function getServiceIcon(name: string): React.ElementType {
  const lowerName = name.toLowerCase()
  for (const [key, icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lowerName.includes(key.replace("_", ""))) return icon
  }
  // Common keyword matching
  if (/dental|dentist|diente|tooth/i.test(lowerName)) return Smile
  if (/cardio|heart|corazon/i.test(lowerName)) return HeartPulse
  if (/pediatr|nino|child|baby/i.test(lowerName)) return Baby
  if (/derma|skin|piel/i.test(lowerName)) return Sparkles
  if (/lab|analisis|blood/i.test(lowerName)) return FlaskConical
  if (/eye|vista|vision|oftalmo/i.test(lowerName)) return Eye
  if (/brain|neuro|cerebro/i.test(lowerName)) return Brain
  if (/bone|hueso|ortop/i.test(lowerName)) return Bone
  if (/general|consulta|check/i.test(lowerName)) return Stethoscope
  if (/urgencia|emergency/i.test(lowerName)) return Activity
  if (/vacuna|injection/i.test(lowerName)) return Syringe
  if (/cirugia|surgery/i.test(lowerName)) return Scissors
  if (/estetica|beauty|cosmetic/i.test(lowerName)) return Sparkles
  return Briefcase
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface MedicalTemplateProps {
  site: any
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function CartBadge({ siteId }: { siteId: string }) {
  const { itemCount, setOpen } = useCart()
  if (itemCount === 0) return null
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      style={{ backgroundColor: COLORS.lightBlue }}
      aria-label={`Ver carrito (${itemCount} productos)`}
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </motion.button>
  )
}

// ─── Header Section ─────────────────────────────────────────────────────────────

function MedicalHeader({
  site,
}: {
  site: MedicalTemplateProps["site"]
}) {
  const { t } = useTranslations("minisite")
  const { locale } = useLocale()
  const bgImage =
    site.slides?.find((s: any) => s.enabled && s.imageUrl)?.imageUrl

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden"
    >
      {/* Background image or gradient */}
      {bgImage ? (
        <div className="relative h-56 sm:h-64">
          <Image
            src={bgImage}
            alt={site.businessName || "Medical"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>
      ) : (
        <div
          className="h-56 sm:h-64"
          style={{
            background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.strongBlue} 50%, ${COLORS.lightBlue} 100%)`,
          }}
        />
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {/* Language toggle */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
            <LanguageToggle variant="minimal" />
          </div>
        </div>

        {/* Logo */}
        {site.logoUrl && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 mb-3"
          >
            <Image
              src={site.logoUrl}
              alt={site.businessName || ""}
              fill
              className="object-cover"
              sizes="96px"
            />
          </motion.div>
        )}

        {/* Business Name */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-white leading-tight"
        >
          {site.businessName}
        </motion.h1>

        {/* Tagline / Description */}
        {site.tagline && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-sm sm:text-base text-white/80 mt-2 max-w-xs"
          >
            {site.tagline}
          </motion.p>
        )}

        {site.description && !site.tagline && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-sm sm:text-base text-white/80 mt-2 max-w-xs line-clamp-2"
          >
            {site.description}
          </motion.p>
        )}
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
            fill={COLORS.white}
          />
        </svg>
      </div>
    </motion.header>
  )
}

// ─── Slider Section ─────────────────────────────────────────────────────────────

function MedicalSlider({
  slides,
  siteId,
  accent,
}: {
  slides: any[]
  siteId: string
  accent: string
}) {
  const { t } = useTranslations("minisite")
  const enabledSlides = slides.filter((s: any) => s.enabled && s.imageUrl)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: enabledSlides.length > 1, align: "start" },
    [
      Autoplay({
        delay: 4500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  if (enabledSlides.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="px-4 pt-6 pb-2"
    >
      <div
        ref={emblaRef}
        className="overflow-hidden rounded-2xl shadow-md"
        style={{ maxHeight: "220px" }}
      >
        <div className="flex">
          {enabledSlides.map((slide: any) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={slide.imageUrl!}
                  alt={slide.title || "Slide"}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Slide content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  {slide.title && (
                    <h3 className="text-base sm:text-lg font-bold leading-tight">
                      {slide.title}
                    </h3>
                  )}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm opacity-90 mt-0.5 line-clamp-2">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.buttonLabel && slide.buttonUrl && (
                    <a
                      href={slide.buttonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackLinkClick(
                          siteId,
                          "slide_button",
                          slide.buttonUrl
                        )
                      }
                      className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-transform hover:scale-105"
                      style={{ backgroundColor: accent }}
                    >
                      {slide.buttonLabel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {enabledSlides.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
            style={{
              backgroundColor: canScrollPrev
                ? accent
                : COLORS.mediumGray,
              color: "#fff",
            }}
            aria-label={t("slides.previous")}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {enabledSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === selectedIndex ? "18px" : "6px",
                  height: "6px",
                  backgroundColor:
                    idx === selectedIndex
                      ? accent
                      : COLORS.borderLight,
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
            style={{
              backgroundColor: canScrollNext
                ? COLORS.lightBlue
                : COLORS.mediumGray,
              color: "#fff",
            }}
            aria-label={t("slides.next")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.section>
  )
}

// ─── Services Grid ──────────────────────────────────────────────────────────────

function MedicalServicesGrid({
  services,
  slug,
}: {
  services: any[]
  slug: string
}) {
  const { t } = useTranslations("minisite")
  const router = useRouter()
  const enabledServices = services.filter((s: any) => s.enabled)

  if (enabledServices.length === 0) return null

  const handleServiceClick = () => {
    router.push(`/${slug}/servicios`)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="px-4 py-6"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xl sm:text-2xl font-bold"
          style={{ color: COLORS.strongBlue }}
        >
          {t("medical.ourServices")}
        </h2>
        <button
          onClick={handleServiceClick}
          className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{ color: COLORS.lightBlue, backgroundColor: COLORS.accentSoft }}
        >
          {t("medical.viewAll")}
        </button>
      </div>

      {/* Services scrollable grid */}
      <div className="relative">
        <div
          className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {enabledServices.map((service: any, idx: number) => {
            const Icon = getServiceIcon(service.name)
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={handleServiceClick}
                className="flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-95"
                style={{
                  backgroundColor: COLORS.white,
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
                  border: `1px solid ${COLORS.borderLight}`,
                }}
              >
                {service.imageUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: COLORS.accentSoft }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: COLORS.lightBlue }}
                    />
                  </div>
                )}
                <h3
                  className="text-xs font-semibold text-center leading-tight line-clamp-2"
                  style={{ color: COLORS.textPrimary }}
                >
                  {service.name}
                </h3>
                {service.price && (
                  <span
                    className="text-[10px] font-bold mt-1"
                    style={{ color: COLORS.lightBlue }}
                  >
                    {service.price}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Scroll hint */}
        {enabledServices.length > 9 && (
          <p
            className="text-center text-xs mt-3 opacity-60"
            style={{ color: COLORS.textSecondary }}
          >
            {t("medical.scrollForMore")}
          </p>
        )}
      </div>
    </motion.section>
  )
}

// ─── Menu Preview Section ───────────────────────────────────────────────────────

function MedicalMenuPreview({
  categories,
  slug,
}: {
  categories: any[]
  slug: string
}) {
  const { t } = useTranslations("minisite")
  const router = useRouter()
  const enabledCategories = categories.filter(
    (c: any) => c.enabled && c.menuItems?.some((i: any) => i.enabled)
  )

  if (enabledCategories.length === 0) return null

  const handleMenuClick = () => {
    router.push(`/${slug}/menu`)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="px-4 py-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xl sm:text-2xl font-bold"
          style={{ color: COLORS.strongBlue }}
        >
          {t("medical.menu")}
        </h2>
        <button
          onClick={handleMenuClick}
          className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{ color: COLORS.lightBlue, backgroundColor: COLORS.accentSoft }}
        >
          {t("medical.viewAll")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {enabledCategories.slice(0, 6).map((category: any, idx: number) => {
          const itemCount = category.menuItems?.filter(
            (i: any) => i.enabled
          ).length
          const firstImage = category.menuItems?.find(
            (i: any) => i.enabled && i.imageUrl
          )?.imageUrl

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={handleMenuClick}
              className="relative overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                boxShadow:
                  "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
                border: `1px solid ${COLORS.borderLight}`,
              }}
            >
              {firstImage && (
                <div className="relative h-24 w-full">
                  <Image
                    src={firstImage}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-sm font-bold leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              )}
              {!firstImage && (
                <div
                  className="flex flex-col items-center justify-center h-24 p-3"
                  style={{ backgroundColor: COLORS.accentSoft }}
                >
                  <BookOpen
                    className="w-6 h-6 mb-1.5"
                    style={{ color: COLORS.lightBlue }}
                  />
                  <h3
                    className="text-sm font-bold text-center leading-tight"
                    style={{ color: COLORS.strongBlue }}
                  >
                    {category.name}
                  </h3>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

// ─── Fixed Bottom Bar ───────────────────────────────────────────────────────────

function MedicalBottomBar({
  contactButtons,
  socialLinks,
  locations,
  siteId,
  site,
}: {
  contactButtons: any[]
  socialLinks: any[]
  locations: any[]
  siteId: string
  site: any
}) {
  const { t } = useTranslations("minisite")

  // Build bar items from all sources
  const barItems: Array<{
    id: string
    type: string
    label: string
    icon: React.ElementType
    action: () => void
  }> = []

  // Contact buttons
  const enabledContacts = contactButtons.filter((b: any) => b.enabled)
  for (const btn of enabledContacts) {
    const type = btn.type as string
    const label =
      btn.label ||
      (type === "whatsapp"
        ? "WhatsApp"
        : type === "call"
          ? t("medical.callNow")
          : type === "maps"
            ? t("medical.getDirections")
            : type === "email"
              ? "Email"
              : type)

    if (type === "whatsapp") {
      barItems.push({
        id: btn.id,
        type,
        label: label.length > 10 ? "WhatsApp" : label,
        icon: MessageCircle,
        action: () => {
          trackWhatsAppClick(siteId, btn.value)
          window.open(`https://wa.me/${btn.value}`, "_blank")
        },
      })
    } else if (type === "call") {
      barItems.push({
        id: btn.id,
        type,
        label: label.length > 10 ? t("medical.callNow") : label,
        icon: Phone,
        action: () => {
          trackLinkClick(siteId, "call", `tel:${btn.value}`)
          window.open(`tel:${btn.value}`, "_self")
        },
      })
    } else if (type === "maps") {
      barItems.push({
        id: btn.id,
        type,
        label: label.length > 10 ? t("medical.getDirections") : label,
        icon: MapPin,
        action: () => {
          trackLinkClick(siteId, "maps", btn.value)
          window.open(btn.value, "_blank")
        },
      })
    } else if (type === "email") {
      barItems.push({
        id: btn.id,
        type,
        label: label.length > 10 ? "Email" : label,
        icon: Mail,
        action: () => {
          trackLinkClick(siteId, "email", `mailto:${btn.value}`)
          window.open(`mailto:${btn.value}`, "_self")
        },
      })
    }
  }

  // Social links
  const enabledSocials = socialLinks.filter((l: any) => l.enabled)
  for (const link of enabledSocials) {
    const type = link.type as string
    const label = link.label || type
    const iconMap: Record<string, React.ElementType> = {
      facebook: Facebook,
      instagram: Instagram,
      website: Globe,
    }
    const Icon = iconMap[type] || Globe
    barItems.push({
      id: link.id,
      type,
      label: label.length > 10 ? type : label,
      icon: Icon,
      action: () => {
        trackLinkClick(siteId, `social_${type}`, link.url)
        window.open(link.url, "_blank")
      },
    })
  }

  // Location links
  const enabledLocations = locations?.filter((l: any) => l.enabled) || []
  for (const loc of enabledLocations) {
    if (loc.mapsUrl) {
      barItems.push({
        id: `loc-${loc.id || loc.name}`,
        type: "location",
        label: loc.name?.length > 10 ? t("medical.getDirections") : loc.name || t("medical.getDirections"),
        icon: MapPin,
        action: () => {
          trackLinkClick(siteId, "location", loc.mapsUrl)
          window.open(loc.mapsUrl, "_blank")
        },
      })
    }
  }

  if (barItems.length === 0) return null
  const barColor = getAccent(site)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: barColor,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* Safe area spacer for iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center overflow-x-auto px-2 py-2 gap-1"
          style={{ scrollbarWidth: "none" }}
        >
          {barItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.93 }}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[64px] flex-shrink-0 transition-colors hover:bg-white/10"
            >
              <item.icon className="w-5 h-5 text-white" />
              <span className="text-[10px] font-medium text-white/90 leading-tight text-center line-clamp-1 max-w-[60px]">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Content ───────────────────────────────────────────────────────────────

function MedicalContent({ site }: MedicalTemplateProps) {
  const { t } = useTranslations("minisite")
  const {
    businessName,
    tagline,
    description,
    logoUrl,
    slug,
    id,
    slides,
    services,
    menuCategories,
    socialLinks,
    contactButtons,
    locations,
    accentColor,
    textColor,
    cardColor,
    backgroundColor,
  } = site

  const whatsappButton = contactButtons?.find(
    (b: any) => b.type === "whatsapp" && b.enabled
  )
  const whatsappNumber = whatsappButton?.value || site.client?.whatsapp

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.white }}
    >
      {/* Background image overlay */}
      {site.backgroundType === "image" && site.backgroundImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${site.backgroundImageUrl})` }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${COLORS.white}E6` }}
          />
        </div>
      )}

      {/* Header */}
      <MedicalHeader site={site} />

      {/* Main Content */}
      <div className="max-w-lg mx-auto" style={{ paddingBottom: "100px" }}>
        {/* Slider */}
        <MedicalSlider
          slides={slides || []}
          siteId={id}
          accent={getAccent(site)}
        />

        {/* Services Grid */}
        <MedicalServicesGrid
          services={services || []}
          slug={slug}
        />

        {/* Menu Preview */}
        <MedicalMenuPreview
          categories={menuCategories || []}
          slug={slug}
        />

        {/* About / Description Section */}
        {description && tagline && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-4 py-6"
          >
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: COLORS.lightGray,
                border: `1px solid ${COLORS.borderLight}`,
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                {description}
              </p>
            </div>
          </motion.section>
        )}

        {/* Trusted badge / trust indicators */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6"
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "Certified" },
              { icon: Star, label: "Trusted" },
              { icon: Clock, label: "24/7" },
            ].map(({ icon: Icon, label }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center justify-center py-3 rounded-xl"
                style={{ backgroundColor: COLORS.accentSoft }}
              >
                <Icon
                  className="w-5 h-5 mb-1"
                  style={{ color: COLORS.lightBlue }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: COLORS.strongBlue }}
                >
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer / Powered by */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="px-4 py-6 text-center"
        >
          {site.showKingBrand !== false && (
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>
              {t("footer.madeBy")}{" "}
              <span className="font-bold" style={{ color: COLORS.lightBlue }}>
                QAIROSS
              </span>
            </p>
          )}
        </motion.footer>
      </div>

      {/* Floating WhatsApp */}
      {whatsappNumber && (
        <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={id as string} />
      )}

      {/* Cart badge */}
      <CartBadge siteId={id} />

      {/* Cart drawer */}
      <CartDrawer
        accentColor={accentColor || COLORS.lightBlue}
        textColor={textColor || COLORS.textPrimary}
        cardColor={cardColor || COLORS.white}
        whatsappNumber={whatsappNumber}
        miniSiteId={id}
        slug={slug}
      />

      {/* Fixed Bottom Bar */}
      <MedicalBottomBar
        contactButtons={contactButtons || []}
        socialLinks={socialLinks || []}
        locations={locations || []}
        siteId={id}
        site={site}
      />
    </div>
  )
}

function MedicalContentWrapper({ site }: MedicalTemplateProps) {
  const { t } = useTranslations("minisite")
  return <MedicalContent site={site} />
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export function MedicalTemplate({ site }: MedicalTemplateProps) {
  return (
    <CartProvider>
      <MedicalContentWrapper site={site} />
    </CartProvider>
  )
}
