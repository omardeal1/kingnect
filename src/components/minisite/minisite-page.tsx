"use client"

import * as React from "react"
import { CartProvider, useCart } from "./cart-provider"
import { SiteHeader } from "./site-header"
import { ContactButtons } from "./contact-buttons"
import { SocialLinks } from "./social-links"
import { SlidesSection } from "./slides-section"
import { MenuSection } from "./menu-section"
import { GallerySection } from "./gallery-section"
import { ServicesSection } from "./services-section"
import { TestimonialsSection } from "./testimonials-section"
import { LocationsSection } from "./locations-section"
import { CustomLinksSection } from "./custom-links-section"
import { QrSection } from "./qr-section"
import { SiteFooter } from "./site-footer"
import { FloatingWhatsApp } from "./floating-whatsapp"
import { CartDrawer } from "./cart-drawer"
import { BranchSelector } from "./branch-selector"
import { ReservationSection } from "./reservation-section"
import { LoyaltySection } from "./loyalty-section"
import { RegistrationSection } from "./registration-section"
import { ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { type FeatureKey } from "@/lib/plan-features"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MiniSitePageProps {
  site: any & { planFeatures?: Record<FeatureKey, boolean> }
}

function CartBadge({ accentColor }: { accentColor: string }) {
  const { itemCount, setOpen } = useCart()
  if (itemCount === 0) return null
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={() => setOpen(true)}
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      style={{ backgroundColor: accentColor }}
      aria-label={`Ver carrito (${itemCount} productos)`}
    >
      <ShoppingBag className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </motion.button>
  )
}

function MiniSiteContent({ site }: MiniSitePageProps) {
  const {
    backgroundColor,
    backgroundType,
    backgroundGradient,
    backgroundImageUrl,
    cardColor,
    textColor,
    accentColor,
    themeMode,
    showKingBrand,
    businessName,
    tagline,
    logoUrl,
    slug,
    id,
    buttonStyle = "cylinder_pill",
    planFeatures,
  } = site

  // Helper to check if a feature is enabled (defaults to true for backwards compatibility)
  const isFeatureEnabled = (key: FeatureKey): boolean => {
    if (!planFeatures) return true
    return planFeatures[key] ?? true
  }

  // Background styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: backgroundType === "color" ? backgroundColor : undefined,
    backgroundImage:
      backgroundType === "gradient" ? backgroundGradient : undefined,
    color: textColor,
    minHeight: "100vh",
  }

  // WhatsApp number from contact buttons
  const whatsappButton = site.contactButtons?.find(
    (b: any) => b.type === "whatsapp" && b.enabled
  )
  const whatsappNumber = whatsappButton?.value || site.client?.whatsapp

  // ─── Section rendering functions keyed by editor tab name ───────────────
  // Each returns JSX or null if the section should be hidden.
  // These are used to render sections in the custom order saved by the editor.

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    slides: () =>
      isFeatureEnabled("slides") ? (
        <SlidesSection
          slides={site.slides || []}
          accentColor={accentColor}
          textColor={textColor}
        />
      ) : null,

    contact: () =>
      <ContactButtons
        buttons={site.contactButtons || []}
        accentColor={accentColor}
        textColor={textColor}
        cardColor={cardColor}
        slug={slug}
        whatsappNumber={whatsappNumber}
        siteId={id}
        buttonStyle={buttonStyle}
      />,

    social: () =>
      isFeatureEnabled("socialLinks") ? (
        <SocialLinks
          links={site.socialLinks || []}
          accentColor={accentColor}
          textColor={textColor}
          siteId={id}
          buttonStyle={buttonStyle}
        />
      ) : null,

    menu: () =>
      isFeatureEnabled("menu") ? (
        <MenuSection
          categories={site.menuCategories || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
          modifierGroups={isFeatureEnabled("modifiers") ? site.modifierGroups || [] : []}
          siteId={id}
          menuTemplate={(site as Record<string, unknown>).menuTemplate as string || "fresh_modern"}
          featuredSlides={(site as Record<string, unknown>).menuFeaturedSlides as Array<{id:string;imageUrl:string;title:string|null;enabled:boolean;sortOrder:number}> || []}
        />
      ) : null,

    gallery: () =>
      isFeatureEnabled("gallery") ? (
        <GallerySection
          images={site.galleryImages || []}
          accentColor={accentColor}
          textColor={textColor}
        />
      ) : null,

    services: () =>
      isFeatureEnabled("services") ? (
        <ServicesSection
          services={site.services || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    testimonials: () =>
      isFeatureEnabled("testimonials") ? (
        <TestimonialsSection
          testimonials={site.testimonials || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    location: () =>
      isFeatureEnabled("locations") ? (
        <LocationsSection
          locations={site.locations || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    branches: () =>
      isFeatureEnabled("branches") && site.branches && site.branches.filter(
        (b: any) => b.isActive && b.isPublished
      ).length >= 2 ? (
        <BranchSelector
          branches={site.branches}
          siteSlug={slug}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    reservations: () =>
      isFeatureEnabled("reservations") && site.reservationConfig?.isEnabled ? (
        <ReservationSection
          config={site.reservationConfig}
          siteId={id}
          siteSlug={slug}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
          whatsappNumber={whatsappNumber}
        />
      ) : null,

    loyalty: () =>
      isFeatureEnabled("loyalty") && site.loyaltyConfig?.isEnabled ? (
        <LoyaltySection
          config={site.loyaltyConfig}
          siteId={id}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    registration: () =>
      isFeatureEnabled("registration") && site.registrationFields && site.registrationFields.filter(
        (f: any) => f.isEnabled
      ).length > 0 ? (
        <RegistrationSection
          siteId={id}
          fields={site.registrationFields}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />
      ) : null,

    links: () =>
      isFeatureEnabled("customLinks") ? (
        <CustomLinksSection
          links={site.customLinks || []}
          accentColor={accentColor}
          textColor={textColor}
          siteId={id}
        />
      ) : null,
  }

  // Default section order (used when no custom order is saved)
  const defaultOrder = [
    "slides",
    "contact",
    "social",
    "menu",
    "gallery",
    "services",
    "testimonials",
    "location",
    "branches",
    "reservations",
    "loyalty",
    "registration",
    "links",
  ]

  // Resolve final section order: custom order takes precedence, fallback to default
  const resolvedOrder = React.useMemo(() => {
    if (site.sectionOrder && site.sectionOrder.length > 0) {
      const order = site.sectionOrder
      const ordered: string[] = []
      const seen = new Set<string>()

      // First, follow the custom order (only include keys that have a renderer)
      for (const key of order) {
        if (sectionRenderers[key] && !seen.has(key)) {
          ordered.push(key)
          seen.add(key)
        }
      }

      // Then append any remaining renderers not in the custom order
      for (const key of defaultOrder) {
        if (!seen.has(key)) {
          ordered.push(key)
          seen.add(key)
        }
      }

      return ordered
    }

    return defaultOrder
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.sectionOrder])

  return (
    <div style={containerStyle} className="relative">
      {/* Background image overlay */}
      {backgroundType === "image" && backgroundImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: `${backgroundColor}CC` }} />
        </div>
      )}

      <div className="max-w-lg mx-auto">
        <SiteHeader
          businessName={businessName}
          tagline={tagline}
          logoUrl={logoUrl}
          accentColor={accentColor}
          textColor={textColor}
          showDarkToggle={themeMode === "both"}
        />

        {/* ─── Dynamic sections rendered in custom order ─── */}
        {resolvedOrder.map((key) => {
          const renderer = sectionRenderers[key]
          if (!renderer) return null
          return <React.Fragment key={key}>{renderer()}</React.Fragment>
        })}

        {/* QR section — always in fixed position before footer */}
        <QrSection
          slug={slug}
          accentColor={accentColor}
          textColor={textColor}
          whatsappNumber={whatsappNumber}
          siteId={id}
        />

        {/* Footer — respect removeBranding feature */}
        {!isFeatureEnabled("removeBranding") ? (
          <SiteFooter showKingBrand={showKingBrand} textColor={textColor} />
        ) : (
          <SiteFooter showKingBrand={false} textColor={textColor} />
        )}
      </div>

      {/* Floating WhatsApp — only if feature enabled */}
      {isFeatureEnabled("whatsapp") && whatsappNumber && <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={id as string} />}

      {/* Cart badge — only if orders feature enabled */}
      {isFeatureEnabled("orders") && <CartBadge accentColor={accentColor} />}

      {/* Cart drawer — only if orders feature enabled */}
      {isFeatureEnabled("orders") && (
        <CartDrawer
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
          whatsappNumber={whatsappNumber}
          miniSiteId={id}
          slug={slug}
        />
      )}
    </div>
  )
}

export function MiniSitePage({ site }: MiniSitePageProps) {
  return (
    <CartProvider>
      <MiniSiteContent site={site} />
    </CartProvider>
  )
}
