"use client"

import * as React from "react"
import { useEditorStore } from "@/lib/editor-store"
import { TemplateRenderer } from "@/components/minisite/template-renderer"
import { SOCIAL_TYPES, CONTACT_BUTTON_TYPES } from "@/lib/constants"
import {
  Star,
  ExternalLink,
} from "lucide-react"
import { ButtonRenderer } from "@/components/minisite/button-styles/button-renderer"
import type { ButtonStyleType } from "@/components/minisite/button-styles/button-renderer"

// ─── Classic Preview (original phone-preview content) ────────────────────────────

function ClassicPreview({ site }: { site: any }) {
  const enabledSocials = site.socialLinks.filter((l: any) => l.enabled)
  const enabledContacts = site.contactButtons.filter((b: any) => b.enabled)
  const enabledLocations = site.locations.filter((l: any) => l.enabled)
  const enabledSlides = site.slides.filter((s: any) => s.enabled)
  const enabledCategories = site.menuCategories.filter((c: any) => c.enabled)
  const enabledGallery = site.galleryImages.filter((i: any) => i.enabled)
  const enabledServices = site.services.filter((s: any) => s.enabled)
  const enabledTestimonials = site.testimonials.filter((t: any) => t.enabled)
  const enabledLinks = site.customLinks.filter((l: any) => l.enabled)

  const buttonStyle = (site as Record<string, unknown>).buttonStyle as ButtonStyleType || "cylinder_pill"

  // ─── Section renderers for dynamic ordering (matching editor tab keys) ───
  const previewSectionRenderers: Record<string, () => React.ReactNode> = {
    slides: () =>
      enabledSlides.length > 0 ? (
        <div className="space-y-1.5" key="slides">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Carrusel</p>
          {enabledSlides.slice(0, 2).map((slide: any) => (
            <div key={slide.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: site.cardColor }}>
              {slide.imageUrl ? (
                <div className="h-16 bg-gray-200 relative">
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-12 flex items-center justify-center text-[9px] opacity-40">
                  Sin imagen
                </div>
              )}
              {slide.title && (
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-medium" style={{ color: site.textColor }}>{slide.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    contact: () =>
      enabledContacts.length > 0 ? (
        <div className="space-y-1.5" key="contact">
          {enabledContacts.slice(0, 4).map((btn: any) => {
            const btnType = CONTACT_BUTTON_TYPES.find((t) => t.value === btn.type)
            const label = btnType?.label || btn.label || btn.type
            return (
              <ButtonRenderer
                key={btn.id}
                style={buttonStyle}
                icon={<ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />}
                label={label}
                accentColor={site.accentColor}
                textColor="#FFFFFF"
                className="!py-1.5 !px-3 !text-[10px] !gap-1.5 !rounded-lg"
              />
            )
          })}
        </div>
      ) : null,

    social: () =>
      enabledSocials.length > 0 ? (
        <div className="space-y-1.5" key="social">
          {enabledSocials.slice(0, 4).map((link: any) => {
            const socialType = SOCIAL_TYPES.find((t) => t.value === link.type)
            const Icon = socialType?.icon || ExternalLink
            const label = link.label || link.type
            return (
              <ButtonRenderer
                key={link.id}
                style={buttonStyle}
                icon={<Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                label={label}
                accentColor={site.accentColor}
                textColor={site.textColor}
                className="!py-1.5 !px-3 !text-[10px] !gap-1.5 !rounded-lg"
              />
            )
          })}
        </div>
      ) : null,

    menu: () =>
      enabledCategories.length > 0 ? (
        <div className="space-y-1.5" key="menu">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Menú</p>
          {enabledCategories.slice(0, 3).map((cat: any) => (
            <div key={cat.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
              <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{cat.name}</p>
              {cat.menuItems.filter((i: any) => i.enabled).slice(0, 2).map((item: any) => (
                <div key={item.id} className="flex justify-between mt-0.5">
                  <span className="text-[9px]" style={{ color: site.textColor }}>{item.name}</span>
                  {item.price != null && (
                    <span className="text-[9px] font-medium" style={{ color: site.accentColor }}>${item.price}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null,

    gallery: () =>
      enabledGallery.length > 0 ? (
        <div className="space-y-1.5" key="gallery">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Galería</p>
          <div className="grid grid-cols-3 gap-1">
            {enabledGallery.slice(0, 6).map((img: any) => (
              <div key={img.id} className="aspect-square rounded overflow-hidden bg-gray-200">
                <img src={img.imageUrl} alt={img.caption || ""} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : null,

    services: () =>
      enabledServices.length > 0 ? (
        <div className="space-y-1.5" key="services">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Servicios</p>
          {enabledServices.slice(0, 3).map((svc: any) => (
            <div key={svc.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
              <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{svc.name}</p>
              {svc.price && (
                <p className="text-[9px]" style={{ color: site.accentColor }}>{svc.price}</p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    testimonials: () =>
      enabledTestimonials.length > 0 ? (
        <div className="space-y-1.5" key="testimonials">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Testimonios</p>
          {enabledTestimonials.slice(0, 2).map((t: any) => (
            <div key={t.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-semibold" style={{ color: site.textColor }}>{t.name}</span>
                <div className="flex">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-2 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-[8px] mt-0.5 opacity-70 leading-tight" style={{ color: site.textColor }}>
                &ldquo;{t.content.slice(0, 60)}{t.content.length > 60 ? "..." : ""}&rdquo;
              </p>
            </div>
          ))}
        </div>
      ) : null,

    location: () =>
      enabledLocations.length > 0 ? (
        <div className="space-y-1.5" key="location">
          <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Ubicaciones</p>
          {enabledLocations.slice(0, 2).map((loc: any) => (
            <div key={loc.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
              <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{loc.name}</p>
              {loc.address && (
                <p className="text-[8px] opacity-60" style={{ color: site.textColor }}>{loc.address}</p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    links: () =>
      enabledLinks.length > 0 ? (
        <div className="space-y-1" key="links">
          {enabledLinks.slice(0, 3).map((link: any) => (
            <div
              key={link.id}
              className="rounded-lg py-1.5 px-3 text-center text-[9px] font-medium"
              style={{ backgroundColor: site.cardColor, color: site.textColor }}
            >
              {link.label}
            </div>
          ))}
        </div>
      ) : null,
  }

  // Default order for preview sections
  const previewDefaultOrder = [
    "slides",
    "contact",
    "social",
    "menu",
    "gallery",
    "services",
    "testimonials",
    "location",
    "links",
  ]

  // Resolve section order for preview (same logic as minisite-page)
  const resolvedPreviewOrder = React.useMemo(() => {
    if (site.sectionOrder && site.sectionOrder.length > 0) {
      const order = site.sectionOrder
      const ordered: string[] = []
      const seen = new Set<string>()

      for (const key of order) {
        if (previewSectionRenderers[key] && !seen.has(key)) {
          ordered.push(key)
          seen.add(key)
        }
      }

      for (const key of previewDefaultOrder) {
        if (!seen.has(key)) {
          ordered.push(key)
          seen.add(key)
        }
      }

      return ordered
    }

    return previewDefaultOrder
  }, [site.sectionOrder])

  return (
    <div className="p-4 space-y-4" style={{ color: site.textColor }}>
      {/* Header area with logo and name */}
      <div className="text-center pt-6 space-y-2">
        {site.logoUrl && (
          <div className="mx-auto w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: site.accentColor }}>
            <img src={site.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
        <h2 className="font-bold text-base" style={{ color: site.textColor }}>
          {site.businessName || "Mi Negocio"}
        </h2>
        {site.tagline && (
          <p className="text-xs opacity-70" style={{ color: site.textColor }}>
            {site.tagline}
          </p>
        )}
        {site.description && (
          <p className="text-[10px] opacity-60 leading-tight" style={{ color: site.textColor }}>
            {site.description}
          </p>
        )}
      </div>

      {/* ─── Dynamic sections rendered in custom order ─── */}
      {resolvedPreviewOrder.map((key) => {
        const renderer = previewSectionRenderers[key]
        if (!renderer) return null
        return <React.Fragment key={key}>{renderer()}</React.Fragment>
      })}

      {/* QAIROSS branding */}
      {site.showKingBrand && (
        <p className="text-center text-[8px] opacity-30 pt-2" style={{ color: site.textColor }}>
          Hecho por QAIROSS
        </p>
      )}
    </div>
  )
}

// ─── Main PhonePreview Component ─────────────────────────────────────────────────

export function PhonePreview() {
  const site = useEditorStore((s) => s.site)

  if (!site) return null

  const template = site.siteTemplate || "classic"
  const isClassic = template === "classic"

  const bgStyle: React.CSSProperties = isClassic
    ? {
        backgroundColor: site.backgroundColor,
        ...(site.backgroundType === "gradient" && site.backgroundGradient
          ? { backgroundImage: site.backgroundGradient }
          : {}),
        ...(site.backgroundType === "image" && site.backgroundImageUrl
          ? { backgroundImage: `url(${site.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}),
      }
    : {}

  return (
    <div className="flex flex-col items-center">
      {/* Template label badge */}
      {!isClassic && (
        <div className="mb-2 px-3 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
          {template === "medical" ? "Servicios Profesionales" : template === "premium" ? "Premium Elegante" : "Moderno Urbano"}
        </div>
      )}

      {/* Phone frame */}
      <div className="relative w-[280px] rounded-[2.5rem] border-4 border-gray-800 dark:border-gray-600 bg-gray-800 dark:bg-gray-600 p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 dark:bg-gray-600 rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className="rounded-[2rem] overflow-y-auto overflow-x-hidden h-[520px]"
          style={bgStyle}
        >
          {isClassic ? (
            <ClassicPreview site={site} />
          ) : (
            /* For non-classic templates, render the actual template component
               inside the phone frame using CSS scale for proper fitting */
            <div
              className="origin-top-left"
              style={{
                width: "375px",
                transform: "scale(0.7)",
                height: `${520 / 0.7}px`,
                overflow: "hidden",
              }}
            >
              <TemplateRenderer site={site} />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex justify-center pt-1 pb-0.5">
          <div className="w-20 h-1 rounded-full bg-gray-600" />
        </div>
      </div>
    </div>
  )
}
