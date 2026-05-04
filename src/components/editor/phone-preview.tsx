"use client"

import * as React from "react"
import { useEditorStore } from "@/lib/editor-store"
import { SOCIAL_TYPES, CONTACT_BUTTON_TYPES } from "@/lib/constants"
import {
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Globe,
} from "lucide-react"

export function PhonePreview() {
  const site = useEditorStore((s) => s.site)

  if (!site) return null

  const bgStyle: React.CSSProperties = {
    backgroundColor: site.backgroundColor,
    ...(site.backgroundType === "gradient" && site.backgroundGradient
      ? { backgroundImage: site.backgroundGradient }
      : {}),
    ...(site.backgroundType === "image" && site.backgroundImageUrl
      ? { backgroundImage: `url(${site.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {}),
  }

  const enabledSocials = site.socialLinks.filter((l) => l.enabled)
  const enabledContacts = site.contactButtons.filter((b) => b.enabled)
  const enabledLocations = site.locations.filter((l) => l.enabled)
  const enabledSlides = site.slides.filter((s) => s.enabled)
  const enabledCategories = site.menuCategories.filter((c) => c.enabled)
  const enabledGallery = site.galleryImages.filter((i) => i.enabled)
  const enabledServices = site.services.filter((s) => s.enabled)
  const enabledTestimonials = site.testimonials.filter((t) => t.enabled)
  const enabledLinks = site.customLinks.filter((l) => l.enabled)

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="relative w-[280px] rounded-[2.5rem] border-4 border-gray-800 dark:border-gray-600 bg-gray-800 dark:bg-gray-600 p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 dark:bg-gray-600 rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className="rounded-[2rem] overflow-y-auto overflow-x-hidden h-[520px]"
          style={bgStyle}
        >
          <div className="p-4 space-y-4" style={{ color: site.textColor }}>
            {/* Header area with logo and name */}
            <div className="text-center pt-6 space-y-2">
              {site.logoUrl && (
                <div className="mx-auto w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: site.accentColor }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

            {/* Contact buttons */}
            {enabledContacts.length > 0 && (
              <div className="space-y-1.5">
                {enabledContacts.slice(0, 4).map((btn) => {
                  const btnType = CONTACT_BUTTON_TYPES.find((t) => t.value === btn.type)
                  return (
                    <div
                      key={btn.id}
                      className="rounded-lg py-2 px-3 text-center text-[10px] font-medium"
                      style={{ backgroundColor: site.accentColor, color: "#fff" }}
                    >
                      {btnType?.label || btn.label || btn.type}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Slides indicator */}
            {enabledSlides.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Carrusel</p>
                {enabledSlides.slice(0, 2).map((slide) => (
                  <div key={slide.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: site.cardColor }}>
                    {slide.imageUrl ? (
                      <div className="h-16 bg-gray-200 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
            )}

            {/* Menu categories */}
            {enabledCategories.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Menú</p>
                {enabledCategories.slice(0, 3).map((cat) => (
                  <div key={cat.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
                    <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{cat.name}</p>
                    {cat.menuItems.filter((i) => i.enabled).slice(0, 2).map((item) => (
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
            )}

            {/* Services */}
            {enabledServices.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Servicios</p>
                {enabledServices.slice(0, 3).map((svc) => (
                  <div key={svc.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
                    <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{svc.name}</p>
                    {svc.price && (
                      <p className="text-[9px]" style={{ color: site.accentColor }}>{svc.price}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Gallery indicator */}
            {enabledGallery.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Galería</p>
                <div className="grid grid-cols-3 gap-1">
                  {enabledGallery.slice(0, 6).map((img) => (
                    <div key={img.id} className="aspect-square rounded overflow-hidden bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt={img.caption || ""} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {enabledTestimonials.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Testimonios</p>
                {enabledTestimonials.slice(0, 2).map((t) => (
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
            )}

            {/* Locations */}
            {enabledLocations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider opacity-50">Ubicaciones</p>
                {enabledLocations.slice(0, 2).map((loc) => (
                  <div key={loc.id} className="rounded-lg p-2" style={{ backgroundColor: site.cardColor }}>
                    <p className="text-[10px] font-semibold" style={{ color: site.textColor }}>{loc.name}</p>
                    {loc.address && (
                      <p className="text-[8px] opacity-60" style={{ color: site.textColor }}>{loc.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Custom links */}
            {enabledLinks.length > 0 && (
              <div className="space-y-1">
                {enabledLinks.slice(0, 3).map((link) => (
                  <div
                    key={link.id}
                    className="rounded-lg py-1.5 px-3 text-center text-[9px] font-medium"
                    style={{ backgroundColor: site.cardColor, color: site.textColor }}
                  >
                    {link.label}
                  </div>
                ))}
              </div>
            )}

            {/* Social links */}
            {enabledSocials.length > 0 && (
              <div className="flex justify-center gap-3 pt-1">
                {enabledSocials.slice(0, 5).map((link) => {
                  const socialType = SOCIAL_TYPES.find((t) => t.value === link.type)
                  const Icon = socialType?.icon || ExternalLink
                  return (
                    <Icon key={link.id} className="size-3.5 opacity-60" style={{ color: site.textColor }} />
                  )
                })}
              </div>
            )}

            {/* Kingnect branding */}
            {site.showKingBrand && (
              <p className="text-center text-[8px] opacity-30 pt-2" style={{ color: site.textColor }}>
                Hecho por Kingnect
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-center pt-1 pb-0.5">
          <div className="w-20 h-1 rounded-full bg-gray-600" />
        </div>
      </div>
    </div>
  )
}
