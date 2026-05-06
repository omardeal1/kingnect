"use client"

import { useMemo } from "react"
import { Check, Star, MessageCircle, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "@/i18n/provider"
import type {
  LandingSection,
  HeroContent,
  BenefitsContent,
  HowItWorksContent,
  OrdersContent,
  PricingContent,
  TestimonialsContent,
  FAQContent,
  CTAContent,
  FooterContent,
} from "@/lib/landing-content"

// ─── Preview Panel Props ────────────────────────────────────────────────────────

interface PreviewPanelProps {
  sections: LandingSection[]
  fullPreview?: boolean
}

// ─── Main Preview Panel ────────────────────────────────────────────────────────

export function PreviewPanel({ sections, fullPreview = false }: PreviewPanelProps) {
  const { t } = useTranslations("admin.landingEditor")

  const activeSections = useMemo(
    () => sections.filter((s) => s.isActive),
    [sections]
  )

  const content = useMemo(() => {
    const map: Record<string, LandingSection> = {}
    for (const s of activeSections) {
      map[s.sectionKey] = s
    }
    return map
  }, [activeSections])

  if (fullPreview) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl">
          {activeSections.map((section) => (
            <PreviewSection key={section.sectionKey} section={section} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("preview")}</h3>
        <Badge variant="outline" className="text-xs">
          {activeSections.length} {t("activeSections")}
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)] rounded-lg border bg-background">
        <div className="p-4 space-y-1">
          {activeSections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("noActiveSections")}
            </p>
          )}
          {activeSections.map((section) => (
            <PreviewSection key={section.sectionKey} section={section} mini />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Section Router ─────────────────────────────────────────────────────────────

function PreviewSection({ section, mini = false }: { section: LandingSection; mini?: boolean }) {
  switch (section.sectionKey) {
    case "hero":
      return <PreviewHero section={section} mini={mini} />
    case "benefits":
      return <PreviewBenefits section={section} mini={mini} />
    case "howItWorks":
      return <PreviewHowItWorks section={section} mini={mini} />
    case "orders":
      return <PreviewOrders section={section} mini={mini} />
    case "pricing":
      return <PreviewPricing section={section} mini={mini} />
    case "testimonials":
      return <PreviewTestimonials section={section} mini={mini} />
    case "faq":
      return <PreviewFAQ section={section} mini={mini} />
    case "cta":
      return <PreviewCTA section={section} mini={mini} />
    case "footer":
      return <PreviewFooter section={section} mini={mini} />
    default:
      return null
  }
}

// ─── Badge Helper ───────────────────────────────────────────────────────────────

function SectionBadge({ label, mini }: { label: string; mini: boolean }) {
  if (mini) {
    return (
      <span className="mb-2 inline-block rounded-full border border-[#D4A849]/30 bg-[#D4A849]/10 px-2 py-0.5 text-[10px] font-medium text-[#D4A849]">
        {label}
      </span>
    )
  }
  return (
    <span className="mb-3 inline-block rounded-full border border-[#D4A849]/30 bg-[#D4A849]/10 px-4 py-1.5 text-sm font-medium text-[#D4A849]">
      {label}
    </span>
  )
}

// ─── Hero Preview ──────────────────────────────────────────────────────────────

function PreviewHero({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as HeroContent
  return (
    <div className={`${mini ? "p-3 border rounded-lg" : "py-16"}`}>
      {!mini && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-[#D4A849]/5 blur-3xl" />
        </div>
      )}
      <div className="relative">
        {c.badge && <SectionBadge label={c.badge} mini={mini} />}
        <h1 className={`font-bold text-foreground ${mini ? "text-base" : "text-3xl sm:text-5xl"}`}>
          {c.title1}{" "}
          <span className="bg-gradient-to-r from-[#D4A849] to-[#C49A3E] bg-clip-text text-transparent">
            {c.titleHighlight}
          </span>{" "}
          {c.title2}
        </h1>
        <p className={`mt-2 text-muted-foreground ${mini ? "text-xs" : "text-lg mt-4"}`}>
          {c.description}
        </p>
        <div className={`flex gap-2 mt-3 ${mini ? "" : "mt-6"}`}>
          <span className="inline-block rounded-lg bg-[#D4A849] px-3 py-1 text-xs font-medium text-black">
            {c.cta}
          </span>
          <span className="inline-block rounded-lg border px-3 py-1 text-xs font-medium">
            {c.secondaryCta}
          </span>
        </div>
        {c.stats && (
          <p className={`text-muted-foreground mt-2 ${mini ? "text-[10px]" : "text-sm mt-3"}`}>
            {c.stats}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Benefits Preview ──────────────────────────────────────────────────────────

function PreviewBenefits({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as BenefitsContent
  const items = c.items ?? []
  return (
    <div className={`${mini ? "p-3 border rounded-lg" : "py-16"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      {section.subtitle && (
        <p className={`text-muted-foreground ${mini ? "text-xs" : "text-base mt-1"}`}>{section.subtitle}</p>
      )}
      <div className={`grid gap-2 mt-3 ${mini ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4 mt-6"}`}>
        {items.map((item, i) => (
          <div key={i} className={`rounded-lg border bg-card p-${mini ? "2" : "4"} shadow-sm`}>
            <div className={`flex items-center justify-center rounded-lg bg-[#D4A849]/10 ${mini ? "h-6 w-6" : "h-10 w-10"}`}>
              <span className="text-[#D4A849] text-xs">✦</span>
            </div>
            <h3 className={`font-semibold text-foreground mt-${mini ? "1" : "2"} ${mini ? "text-[10px]" : "text-sm"}`}>
              {item.title}
            </h3>
            <p className={`text-muted-foreground mt-0.5 leading-relaxed ${mini ? "text-[9px] line-clamp-2" : "text-xs"}`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── How It Works Preview ──────────────────────────────────────────────────────

function PreviewHowItWorks({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as HowItWorksContent
  const steps = c.steps ?? []
  return (
    <div className={`${mini ? "p-3 border rounded-lg bg-muted/30" : "py-16 bg-muted/40"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      <div className={`space-y-2 mt-3`}>
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4A849]/10 text-[10px] font-bold text-[#D4A849]">
              {i + 1}
            </div>
            <div>
              <p className={`font-semibold text-foreground ${mini ? "text-[10px]" : "text-sm"}`}>{step.title}</p>
              <p className={`text-muted-foreground ${mini ? "text-[9px]" : "text-xs"}`}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Orders Preview ────────────────────────────────────────────────────────────

function PreviewOrders({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as OrdersContent
  const features = c.features ?? []
  return (
    <div className={`${mini ? "p-3 border rounded-lg bg-muted/30" : "py-16 bg-muted/40"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      <div className={`grid gap-3 mt-3 ${mini ? "grid-cols-1" : "grid-cols-2 mt-6"}`}>
        {features.map((feature, i) => (
          <div
            key={i}
            className={`rounded-lg border p-${mini ? "2" : "5"} ${feature.highlighted ? "border-[#D4A849]/30" : ""}`}
          >
            <div className={`flex items-center justify-center rounded-lg ${feature.highlighted ? "bg-[#D4A849]/10" : "bg-green-500/10"} ${mini ? "h-6 w-6" : "h-12 w-12"}`}>
              {feature.highlighted ? (
                <ClipboardList className={`text-[#D4A849] ${mini ? "w-3 h-3" : "w-6 h-6"}`} />
              ) : (
                <MessageCircle className="text-green-600 w-6 h-6" />
              )}
            </div>
            <h3 className={`font-semibold text-foreground mt-${mini ? "1" : "3"} ${mini ? "text-[10px]" : "text-lg"}`}>
              {feature.title}
            </h3>
            <p className={`text-muted-foreground mt-1 ${mini ? "text-[9px] line-clamp-2" : "text-sm"}`}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pricing Preview ────────────────────────────────────────────────────────────

function PreviewPricing({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as PricingContent
  return (
    <div className={`${mini ? "p-3 border rounded-lg" : "py-16"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      {section.subtitle && (
        <p className={`text-muted-foreground ${mini ? "text-xs" : "text-base mt-1"}`}>{section.subtitle}</p>
      )}
      <div className={`flex flex-wrap gap-2 mt-3`}>
        {Object.entries(c).map(([key, val]) => (
          <Badge key={key} variant="outline" className="text-xs">
            <span className="text-muted-foreground mr-1">{key}:</span>
            <span className="font-medium">{val}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}

// ─── Testimonials Preview ──────────────────────────────────────────────────────

function PreviewTestimonials({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as TestimonialsContent
  const items = c.items ?? []
  return (
    <div className={`${mini ? "p-3 border rounded-lg bg-muted/30" : "py-16 bg-muted/40"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      <div className={`grid gap-2 mt-3 ${mini ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 mt-6"}`}>
        {items.slice(0, mini ? 2 : 6).map((item, i) => (
          <div key={i} className="rounded-lg border bg-card p-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s < item.rating ? "fill-[#D4A849] text-[#D4A849]" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <p className={`text-foreground mt-2 ${mini ? "text-[10px] line-clamp-3" : "text-sm"}`}>
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4A849]/10 text-xs font-bold text-[#D4A849]">
                {item.name?.[0]}
              </div>
              <div>
                <p className={`font-semibold text-foreground ${mini ? "text-[10px]" : "text-xs"}`}>{item.name}</p>
                <p className={`text-muted-foreground ${mini ? "text-[9px]" : "text-[10px]"}`}>{item.business}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FAQ Preview ───────────────────────────────────────────────────────────────

function PreviewFAQ({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as FAQContent
  const items = c.items ?? []
  return (
    <div className={`${mini ? "p-3 border rounded-lg" : "py-16"}`}>
      {section.title && <SectionBadge label={section.title} mini={mini} />}
      <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{section.title}</h2>
      <Accordion type="single" collapsible className="mt-3">
        {items.slice(0, mini ? 3 : items.length).map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className={`text-left font-medium text-foreground hover:no-underline ${mini ? "text-xs py-2" : "text-sm"}`}>
              {item.question}
            </AccordionTrigger>
            <AccordionContent className={`text-muted-foreground ${mini ? "text-[10px]" : "text-sm"}`}>
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// ─── CTA Preview ───────────────────────────────────────────────────────────────

function PreviewCTA({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as CTAContent
  return (
    <div className={`${mini ? "p-3 border rounded-lg" : "py-16 relative overflow-hidden"}`}>
      <div className={`rounded-lg bg-[#D4A849]/5 p-${mini ? "3" : "8"} text-center`}>
        <h2 className={`font-bold text-foreground ${mini ? "text-sm" : "text-2xl"}`}>{c.title}</h2>
        <p className={`text-muted-foreground mt-2 ${mini ? "text-xs" : "text-lg mt-4"}`}>{c.subtitle}</p>
        <span className="inline-block mt-3 rounded-lg bg-[#D4A849] px-4 py-1.5 text-xs font-semibold text-black">
          {c.button}
        </span>
        {c.stats && (
          <p className={`text-muted-foreground mt-2 ${mini ? "text-[10px]" : "text-sm mt-4"}`}>{c.stats}</p>
        )}
      </div>
    </div>
  )
}

// ─── Footer Preview ─────────────────────────────────────────────────────────────

function PreviewFooter({ section, mini }: { section: LandingSection; mini: boolean }) {
  const c = section.content as FooterContent
  return (
    <div className={`${mini ? "p-3 border rounded-lg bg-muted/30" : "py-12 border-t bg-muted/30"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-bold text-foreground ${mini ? "text-xs" : "text-lg"}`}>QAIROSS</p>
          {c.description && (
            <p className={`text-muted-foreground ${mini ? "text-[10px]" : "text-sm"}`}>{c.description}</p>
          )}
        </div>
        {c.copyright && (
          <p className={`text-muted-foreground ${mini ? "text-[9px]" : "text-xs"}`}>{c.copyright}</p>
        )}
      </div>
    </div>
  )
}
