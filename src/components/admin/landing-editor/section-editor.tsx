"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Star } from "lucide-react"
import { ImageUploader } from "./image-uploader"
import { useTranslations } from "@/i18n/provider"
import type {
  LandingSection,
  HeroContent,
  BenefitItem,
  StepItem,
  FAQItem,
  TestimonialItem,
  OrderFeatureItem,
  CTAContent,
  FooterContent,
  PricingContent,
  LandingImage,
} from "@/lib/landing-content"

// ─── Section Editor Props ───────────────────────────────────────────────────────

interface SectionEditorProps {
  section: LandingSection
  onChange: (updated: LandingSection) => void
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const { t } = useTranslations("admin.landingEditor")

  const updateContent = (partial: Record<string, unknown>) => {
    onChange({
      ...section,
      content: { ...section.content, ...partial },
    })
  }

  const updateField = (field: keyof LandingSection, value: unknown) => {
    onChange({ ...section, [field]: value })
  }

  return (
    <div className="space-y-4">
      {/* Section enable toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t(`sections.${section.sectionKey}`)}</h3>
        <div className="flex items-center gap-2">
          <Switch
            checked={section.isActive}
            onCheckedChange={(v) => updateField("isActive", v)}
          />
          <Label className="text-xs">
            {section.isActive ? t("active") : t("inactive")}
          </Label>
        </div>
      </div>

      {/* Title & Subtitle */}
      {(section.sectionKey !== "hero" && section.sectionKey !== "cta" && section.sectionKey !== "footer") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("sectionTitle")}</Label>
            <Input
              value={section.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t("sectionSubtitle")}</Label>
            <Input
              value={section.subtitle ?? ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Section-specific editors */}
      {section.sectionKey === "hero" && <HeroEditor content={section.content as HeroContent} onUpdate={updateContent} />}
      {section.sectionKey === "benefits" && <BenefitsEditor content={section.content} onUpdate={updateContent} />}
      {section.sectionKey === "howItWorks" && <HowItWorksEditor content={section.content} onUpdate={updateContent} />}
      {section.sectionKey === "orders" && <OrdersEditor content={section.content} onUpdate={updateContent} />}
      {section.sectionKey === "pricing" && <PricingEditor content={section.content as PricingContent} onUpdate={updateContent} />}
      {section.sectionKey === "testimonials" && <TestimonialsEditor content={section.content} onUpdate={updateContent} />}
      {section.sectionKey === "faq" && <FAQEditor content={section.content} onUpdate={updateContent} />}
      {section.sectionKey === "cta" && <CTAEditor content={section.content as CTAContent} onUpdate={updateContent} />}
      {section.sectionKey === "footer" && <FooterEditor content={section.content as FooterContent} onUpdate={updateContent} />}
    </div>
  )
}

// ─── Hero Editor ────────────────────────────────────────────────────────────────

function HeroEditor({
  content,
  onUpdate,
}: {
  content: HeroContent
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("heroBadge")}</Label>
        <Input value={content.badge ?? ""} onChange={(e) => onUpdate({ badge: e.target.value })} className="mt-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>{t("heroTitle1")}</Label>
          <Input value={content.title1 ?? ""} onChange={(e) => onUpdate({ title1: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("heroHighlight")}</Label>
          <Input value={content.titleHighlight ?? ""} onChange={(e) => onUpdate({ titleHighlight: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("heroTitle2")}</Label>
          <Input value={content.title2 ?? ""} onChange={(e) => onUpdate({ title2: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>{t("heroDescription")}</Label>
        <Textarea value={content.description ?? ""} onChange={(e) => onUpdate({ description: e.target.value })} className="mt-1 min-h-[100px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("heroCta")}</Label>
          <Input value={content.cta ?? ""} onChange={(e) => onUpdate({ cta: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("heroSecondaryCta")}</Label>
          <Input value={content.secondaryCta ?? ""} onChange={(e) => onUpdate({ secondaryCta: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>{t("heroStats")}</Label>
        <Input value={content.stats ?? ""} onChange={(e) => onUpdate({ stats: e.target.value })} className="mt-1" />
      </div>
    </div>
  )
}

// ─── Benefits Editor ────────────────────────────────────────────────────────────

function BenefitsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")
  const items = (content.items as BenefitItem[]) ?? []

  const updateItem = (index: number, field: keyof BenefitItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate({ items: updated })
  }

  const addItem = () => {
    onUpdate({
      items: [...items, { key: `custom_${items.length}`, title: "", description: "" }],
    })
  }

  const removeItem = (index: number) => {
    onUpdate({ items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t("benefitItems")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-3 h-3 mr-1" />
          {t("addItem")}
        </Button>
      </div>

      {items.map((item, i) => (
        <Card key={i}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {t("benefit")} {i + 1}
                </CardTitle>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div>
              <Label className="text-xs">{t("itemTitle")}</Label>
              <Input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">{t("itemDescription")}</Label>
              <Textarea value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="mt-1 min-h-[60px] text-sm" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── How It Works Editor ───────────────────────────────────────────────────────

function HowItWorksEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")
  const steps = (content.steps as StepItem[]) ?? []

  const updateStep = (index: number, field: keyof StepItem, value: string) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate({ steps: updated })
  }

  const addStep = () => {
    onUpdate({
      steps: [...steps, { key: `step_${steps.length}`, title: "", description: "" }],
    })
  }

  const removeStep = (index: number) => {
    onUpdate({ steps: steps.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t("stepItems")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="w-3 h-3 mr-1" />
          {t("addStep")}
        </Button>
      </div>

      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-6">
            {i + 1}
          </div>
          <div className="flex-1 border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t("step")} {i + 1}</Label>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStep(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <Input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder={t("stepTitle")} className="h-9" />
            <Textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} placeholder={t("stepDescription")} className="min-h-[50px] text-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Orders Editor ─────────────────────────────────────────────────────────────

function OrdersEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")
  const features = (content.features as OrderFeatureItem[]) ?? []

  const updateFeature = (index: number, field: keyof OrderFeatureItem, value: unknown) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate({ features: updated })
  }

  const updateFeatureList = (index: number, list: string[]) => {
    const updated = [...features]
    updated[index] = { ...updated[index], features: list }
    onUpdate({ features: updated })
  }

  return (
    <div className="space-y-4">
      {features.map((feature, i) => (
        <Card key={i} className={feature.highlighted ? "border-primary/30" : ""}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t("orderFeature")} {i + 1}
                {feature.highlighted && (
                  <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    {t("highlighted")}
                  </Badge>
                )}
              </CardTitle>
              <Switch
                checked={feature.highlighted}
                onCheckedChange={(v) => updateFeature(i, "highlighted", v)}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div>
              <Label className="text-xs">{t("itemTitle")}</Label>
              <Input value={feature.title} onChange={(e) => updateFeature(i, "title", e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">{t("itemDescription")}</Label>
              <Textarea value={feature.description} onChange={(e) => updateFeature(i, "description", e.target.value)} className="mt-1 min-h-[60px] text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("features")}</Label>
              {(feature.features ?? []).map((feat, fi) => (
                <div key={fi} className="flex gap-2 mt-1">
                  <Input
                    value={feat}
                    onChange={(e) => {
                      const list = [...(feature.features ?? [])]
                      list[fi] = e.target.value
                      updateFeatureList(i, list)
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => {
                      const list = (feature.features ?? []).filter((_, idx) => idx !== fi)
                      updateFeatureList(i, list)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  updateFeatureList(i, [...(feature.features ?? []), ""])
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t("addFeature")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Pricing Editor ─────────────────────────────────────────────────────────────

function PricingEditor({
  content,
  onUpdate,
}: {
  content: PricingContent
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("pricingPopular")}</Label>
          <Input value={content.popular ?? ""} onChange={(e) => onUpdate({ popular: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("pricingPerMonth")}</Label>
          <Input value={content.perMonth ?? ""} onChange={(e) => onUpdate({ perMonth: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("pricingStartFree")}</Label>
          <Input value={content.startFree ?? ""} onChange={(e) => onUpdate({ startFree: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("pricingChoosePlan")}</Label>
          <Input value={content.choosePlan ?? ""} onChange={(e) => onUpdate({ choosePlan: e.target.value })} className="mt-1" />
        </div>
      </div>
    </div>
  )
}

// ─── Testimonials Editor ────────────────────────────────────────────────────────

function TestimonialsEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")
  const items = (content.items as TestimonialItem[]) ?? []

  const updateItem = (index: number, field: keyof TestimonialItem, value: unknown) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate({ items: updated })
  }

  const addItem = () => {
    onUpdate({
      items: [...items, { name: "", business: "", quote: "", rating: 5 }],
    })
  }

  const removeItem = (index: number) => {
    onUpdate({ items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t("testimonialItems")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-3 h-3 mr-1" />
          {t("addTestimonial")}
        </Button>
      </div>

      {items.map((item, i) => (
        <Card key={i}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t("testimonial")} {i + 1}
              </CardTitle>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(i)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("testimonialName")}</Label>
                <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">{t("testimonialBusiness")}</Label>
                <Input value={item.business} onChange={(e) => updateItem(i, "business", e.target.value)} className="mt-1 h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("testimonialQuote")}</Label>
              <Textarea value={item.quote} onChange={(e) => updateItem(i, "quote", e.target.value)} className="mt-1 min-h-[60px] text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("testimonialRating")}</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateItem(i, "rating", star + 1)}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star < item.rating
                          ? "fill-[#D4A849] text-[#D4A849]"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── FAQ Editor ──────────────────────────────────────────────────────────────────

function FAQEditor({
  content,
  onUpdate,
}: {
  content: Record<string, unknown>
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")
  const items = (content.items as FAQItem[]) ?? []

  const updateItem = (index: number, field: keyof FAQItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onUpdate({ items: updated })
  }

  const addItem = () => {
    onUpdate({
      items: [...items, { question: "", answer: "" }],
    })
  }

  const removeItem = (index: number) => {
    onUpdate({ items: items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t("faqItems")}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-3 h-3 mr-1" />
          {t("addFaq")}
        </Button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">{t("question")} {i + 1}</Label>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(i)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input value={item.question} onChange={(e) => updateItem(i, "question", e.target.value)} placeholder={t("questionPlaceholder")} className="h-9" />
          <Textarea value={item.answer} onChange={(e) => updateItem(i, "answer", e.target.value)} placeholder={t("answerPlaceholder")} className="min-h-[60px] text-sm" />
        </div>
      ))}
    </div>
  )
}

// ─── CTA Editor ─────────────────────────────────────────────────────────────────

function CTAEditor({
  content,
  onUpdate,
}: {
  content: CTAContent
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("ctaTitle")}</Label>
        <Input value={content.title ?? ""} onChange={(e) => onUpdate({ title: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label>{t("ctaSubtitle")}</Label>
        <Textarea value={content.subtitle ?? ""} onChange={(e) => onUpdate({ subtitle: e.target.value })} className="mt-1 min-h-[80px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("ctaButton")}</Label>
          <Input value={content.button ?? ""} onChange={(e) => onUpdate({ button: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t("ctaStats")}</Label>
          <Input value={content.stats ?? ""} onChange={(e) => onUpdate({ stats: e.target.value })} className="mt-1" />
        </div>
      </div>
    </div>
  )
}

// ─── Footer Editor ──────────────────────────────────────────────────────────────

function FooterEditor({
  content,
  onUpdate,
}: {
  content: FooterContent
  onUpdate: (partial: Record<string, unknown>) => void
}) {
  const { t } = useTranslations("admin.landingEditor")

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("footerDescription")}</Label>
        <Textarea value={content.description ?? ""} onChange={(e) => onUpdate({ description: e.target.value })} className="mt-1 min-h-[60px]" />
      </div>
      <div>
        <Label>{t("footerCopyright")}</Label>
        <Input value={content.copyright ?? ""} onChange={(e) => onUpdate({ copyright: e.target.value })} className="mt-1" />
      </div>
    </div>
  )
}
