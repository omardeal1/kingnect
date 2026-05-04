"use client"

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
import { ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MiniSitePageProps {
  site: any
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
  } = site

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

        {/* Slides */}
        <SlidesSection
          slides={site.slides || []}
          accentColor={accentColor}
          textColor={textColor}
        />

        {/* Contact buttons */}
        <ContactButtons
          buttons={site.contactButtons || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
          slug={slug}
          whatsappNumber={whatsappNumber}
          siteId={id}
        />

        {/* Social links */}
        <SocialLinks
          links={site.socialLinks || []}
          accentColor={accentColor}
          textColor={textColor}
          siteId={id}
        />

        {/* Menu */}
        <MenuSection
          categories={site.menuCategories || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />

        {/* Gallery */}
        <GallerySection
          images={site.galleryImages || []}
          accentColor={accentColor}
          textColor={textColor}
        />

        {/* Services */}
        <ServicesSection
          services={site.services || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />

        {/* Testimonials */}
        <TestimonialsSection
          testimonials={site.testimonials || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />

        {/* Locations */}
        <LocationsSection
          locations={site.locations || []}
          accentColor={accentColor}
          textColor={textColor}
          cardColor={cardColor}
        />

        {/* Custom links */}
        <CustomLinksSection
          links={site.customLinks || []}
          accentColor={accentColor}
          textColor={textColor}
          siteId={id}
        />

        {/* QR section */}
        <QrSection
          slug={slug}
          accentColor={accentColor}
          textColor={textColor}
          whatsappNumber={whatsappNumber}
          siteId={id}
        />

        {/* Footer */}
        <SiteFooter showKingBrand={showKingBrand} textColor={textColor} />
      </div>

      {/* Floating WhatsApp */}
      {whatsappNumber && <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={id as string} />}

      {/* Cart badge */}
      <CartBadge accentColor={accentColor} />

      {/* Cart drawer */}
      <CartDrawer
        accentColor={accentColor}
        textColor={textColor}
        cardColor={cardColor}
        whatsappNumber={whatsappNumber}
        miniSiteId={id}
        slug={slug}
      />
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
