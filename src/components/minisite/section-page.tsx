"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { CartProvider } from "./cart-provider"
import { MenuSection } from "./menu-section"
import { ServicesSection } from "./services-section"
import { GallerySection } from "./gallery-section"
import { ReservationSection } from "./reservation-section"
import { TestimonialsSection } from "./testimonials-section"
import { LocationsSection } from "./locations-section"
import { SlidesSection } from "./slides-section"
import { CustomLinksSection } from "./custom-links-section"
import { ContactButtons } from "./contact-buttons"
import { SocialLinks } from "./social-links"
import { FloatingWhatsApp } from "./floating-whatsapp"
import { CartDrawer } from "./cart-drawer"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-provider"

const SECTION_TITLES: Record<string, { es: string; en: string }> = {
  menu: { es: "Menú", en: "Menu" },
  servicios: { es: "Servicios", en: "Services" },
  galeria: { es: "Galería", en: "Gallery" },
  reservaciones: { es: "Reservaciones", en: "Reservations" },
  opiniones: { es: "Opiniones", en: "Reviews" },
  ubicacion: { es: "Ubicación", en: "Location" },
  contacto: { es: "Contacto", en: "Contact" },
  promociones: { es: "Promociones", en: "Promotions" },
  eventos: { es: "Eventos", en: "Events" },
  links: { es: "Más", en: "More" },
}

interface SectionPageProps {
  site: any
  section: string
  slug: string
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

function SectionContent({ site, section, slug }: SectionPageProps) {
  const router = useRouter()
  const [locale, setLocale] = React.useState<"es" | "en">("es")

  React.useEffect(() => {
    const lang = navigator.language?.startsWith("es") ? "es" : "en"
    setLocale(lang)
  }, [])

  const title = SECTION_TITLES[section]?.[locale] || section
  const whatsappButton = site.contactButtons?.find(
    (b: any) => b.type === "whatsapp" && b.enabled
  )
  const whatsappNumber = whatsappButton?.value || site.client?.whatsapp

  const renderSection = () => {
    switch (section) {
      case "menu":
        return (
          <MenuSection
            categories={site.menuCategories || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
            cardColor={site.cardColor}
            modifierGroups={site.modifierGroups || []}
            siteId={site.id}
            menuTemplate={site.menuTemplate || "fresh_modern"}
            featuredSlides={site.menuFeaturedSlides || []}
          />
        )
      case "servicios":
        return (
          <ServicesSection
            services={site.services || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
            cardColor={site.cardColor}
          />
        )
      case "galeria":
        return (
          <GallerySection
            images={site.galleryImages || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
          />
        )
      case "reservaciones":
        if (!site.reservationConfig?.isEnabled) {
          return (
            <p className="text-center text-muted-foreground py-8">
              Las reservaciones no están disponibles en este momento.
            </p>
          )
        }
        return (
          <ReservationSection
            config={site.reservationConfig}
            siteId={site.id}
            siteSlug={slug}
            accentColor={site.accentColor}
            textColor={site.textColor}
            cardColor={site.cardColor}
            whatsappNumber={whatsappNumber}
          />
        )
      case "opiniones":
        return (
          <TestimonialsSection
            testimonials={site.testimonials || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
            cardColor={site.cardColor}
          />
        )
      case "ubicacion":
        return (
          <LocationsSection
            locations={site.locations || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
            cardColor={site.cardColor}
          />
        )
      case "contacto":
        return (
          <div className="space-y-4">
            <ContactButtons
              buttons={site.contactButtons || []}
              accentColor={site.accentColor}
              textColor={site.textColor}
              cardColor={site.cardColor}
              slug={slug}
              whatsappNumber={whatsappNumber}
              siteId={site.id}
              buttonStyle={site.buttonStyle || "cylinder_pill"}
            />
            <SocialLinks
              links={site.socialLinks || []}
              accentColor={site.accentColor}
              textColor={site.textColor}
              siteId={site.id}
              buttonStyle={site.buttonStyle || "cylinder_pill"}
            />
          </div>
        )
      case "promociones":
      case "eventos":
        return (
          <SlidesSection
            slides={site.slides || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
          />
        )
      case "links":
        return (
          <CustomLinksSection
            links={site.customLinks || []}
            accentColor={site.accentColor}
            textColor={site.textColor}
            siteId={site.id}
          />
        )
      default:
        return (
          <p className="text-center py-8 text-muted-foreground">
            Sección no encontrada
          </p>
        )
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: site.backgroundColor,
        backgroundImage:
          site.backgroundType === "gradient"
            ? site.backgroundGradient
            : undefined,
        color: site.textColor,
      }}
    >
      {/* Background image overlay */}
      {site.backgroundType === "image" && site.backgroundImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${site.backgroundImageUrl})` }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${site.backgroundColor}CC` }}
          />
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b"
        >
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {site.logoUrl && (
              <div
                className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0"
                style={{ borderColor: site.accentColor }}
              >
                <Image
                  src={site.logoUrl}
                  alt={site.businessName}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">{title}</h1>
              <p className="text-xs opacity-60 truncate">{site.businessName}</p>
            </div>
          </div>
        </motion.header>

        {/* Section Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          {renderSection()}
        </motion.div>
      </div>

      {/* Floating WhatsApp */}
      {whatsappNumber && (
        <FloatingWhatsApp phoneNumber={whatsappNumber} siteId={site.id} />
      )}

      {/* Cart badge */}
      <CartBadge accentColor={site.accentColor} />

      {/* Cart drawer */}
      <CartDrawer
        accentColor={site.accentColor}
        textColor={site.textColor}
        cardColor={site.cardColor}
        whatsappNumber={whatsappNumber}
        miniSiteId={site.id}
        slug={slug}
      />
    </div>
  )
}

export function SectionPage(props: SectionPageProps) {
  return (
    <CartProvider>
      <SectionContent {...props} />
    </CartProvider>
  )
}
