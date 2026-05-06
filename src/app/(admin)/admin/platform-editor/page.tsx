"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Sparkles,
  Gift,
  HelpCircle,
  MessageSquare,
  Footprints,
  Layout,
  Loader2,
  Save,
  Plus,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface PlatformSection {
  id?: string
  sectionKey: string
  title: string | null
  subtitle: string | null
  content: string | null
  imageUrl: string | null
  enabled: boolean
  sortOrder: number
}

export default function AdminPlatformEditorPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [sections, setSections] = useState<PlatformSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/platform")
      const data = await res.json()
      setSettings(data.settings ?? {})
      setSections(data.sections ?? [])
    } catch {
      toast.error("Error al cargar configuración")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateSection = (sectionKey: string, field: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === sectionKey ? { ...s, [field]: value } : s))
    )
  }

  const getSection = (key: string): PlatformSection | undefined => {
    return sections.find((s) => s.sectionKey === key)
  }

  const addFaqItem = () => {
    const faqSection = getSection("faq")
    if (!faqSection) {
      setSections((prev) => [
        ...prev,
        {
          sectionKey: "faq",
          title: "Preguntas Frecuentes",
          subtitle: null,
          content: JSON.stringify([
            { question: "Nueva pregunta", answer: "Nueva respuesta" },
          ]),
          imageUrl: null,
          enabled: true,
          sortOrder: 7,
        },
      ])
      return
    }

    try {
      const items = faqSection.content ? JSON.parse(faqSection.content) : []
      items.push({ question: "Nueva pregunta", answer: "Nueva respuesta" })
      updateSection("faq", "content", JSON.stringify(items))
    } catch {
      updateSection("faq", "content", JSON.stringify([{ question: "Nueva pregunta", answer: "Nueva respuesta" }]))
    }
  }

  const removeFaqItem = (index: number) => {
    const faqSection = getSection("faq")
    if (!faqSection) return
    try {
      const items = JSON.parse(faqSection.content ?? "[]")
      items.splice(index, 1)
      updateSection("faq", "content", JSON.stringify(items))
    } catch {
      // silent
    }
  }

  const updateFaqItem = (index: number, field: string, value: string) => {
    const faqSection = getSection("faq")
    if (!faqSection) return
    try {
      const items = JSON.parse(faqSection.content ?? "[]")
      items[index][field] = value
      updateSection("faq", "content", JSON.stringify(items))
    } catch {
      // silent
    }
  }

  const addTestimonial = () => {
    const section = getSection("testimonials")
    if (!section) {
      setSections((prev) => [
        ...prev,
        {
          sectionKey: "testimonials",
          title: "Testimonios",
          subtitle: null,
          content: JSON.stringify([{ name: "Nombre", content: "Testimonio", rating: 5 }]),
          imageUrl: null,
          enabled: true,
          sortOrder: 6,
        },
      ])
      return
    }
    try {
      const items = section.content ? JSON.parse(section.content) : []
      items.push({ name: "Nombre", content: "Testimonio", rating: 5 })
      updateSection("testimonials", "content", JSON.stringify(items))
    } catch {
      updateSection("testimonials", "content", JSON.stringify([{ name: "Nombre", content: "Testimonio", rating: 5 }]))
    }
  }

  const removeTestimonial = (index: number) => {
    const section = getSection("testimonials")
    if (!section) return
    try {
      const items = JSON.parse(section.content ?? "[]")
      items.splice(index, 1)
      updateSection("testimonials", "content", JSON.stringify(items))
    } catch {
      // silent
    }
  }

  const updateTestimonial = (index: number, field: string, value: unknown) => {
    const section = getSection("testimonials")
    if (!section) return
    try {
      const items = JSON.parse(section.content ?? "[]")
      items[index][field] = value
      updateSection("testimonials", "content", JSON.stringify(items))
    } catch {
      // silent
    }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, sections }),
      })
      if (res.ok) {
        toast.success("Configuración guardada")
        fetchData()
      } else {
        toast.error("Error al guardar")
      }
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const getFaqItems = (): Array<{ question: string; answer: string }> => {
    const section = getSection("faq")
    if (!section?.content) return []
    try {
      return JSON.parse(section.content)
    } catch {
      return []
    }
  }

  const getTestimonialItems = (): Array<{ name: string; content: string; rating: number }> => {
    const section = getSection("testimonials")
    if (!section?.content) return []
    try {
      return JSON.parse(section.content)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const heroSection = getSection("hero")
  const benefitsSection = getSection("benefits")
  const howItWorksSection = getSection("how_it_works")
  const faqSection = getSection("faq")
  const testimonialsSection = getSection("testimonials")
  const footerSection = getSection("footer")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Editor de Plataforma</h1>
          <p className="text-muted-foreground mt-1">
            Personaliza la landing page y mensajes del sistema
          </p>
        </div>
        <Button
          className="gold-gradient text-black font-semibold"
          onClick={saveAll}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Todo
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1">
            <Settings className="w-3 h-3" />
            General
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-1">
            <Gift className="w-3 h-3" />
            Beneficios
          </TabsTrigger>
          <TabsTrigger value="howitworks" className="gap-1">
            <Footprints className="w-3 h-3" />
            Cómo Funciona
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-1">
            <MessageSquare className="w-3 h-3" />
            Testimonios
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1">
            <HelpCircle className="w-3 h-3" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-1">
            <Layout className="w-3 h-3" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1">
            <MessageSquare className="w-3 h-3" />
            Mensajes
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la plataforma</Label>
                  <Input
                    value={settings.platform_name ?? ""}
                    onChange={(e) => updateSetting("platform_name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>URL base</Label>
                  <Input
                    value={settings.platform_url ?? ""}
                    onChange={(e) => updateSetting("platform_url", e.target.value)}
                    className="mt-1"
                    placeholder="https://qaiross.app"
                  />
                </div>
                <div>
                  <Label>Logo URL (claro)</Label>
                  <Input
                    value={settings.logo_light_url ?? ""}
                    onChange={(e) => updateSetting("logo_light_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Logo URL (oscuro)</Label>
                  <Input
                    value={settings.logo_dark_url ?? ""}
                    onChange={(e) => updateSetting("logo_dark_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Color primario</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={settings.primary_color ?? ""}
                      onChange={(e) => updateSetting("primary_color", e.target.value)}
                      placeholder="#D4A849"
                    />
                    <Input
                      type="color"
                      value={settings.primary_color ?? "#D4A849"}
                      onChange={(e) => updateSetting("primary_color", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email de soporte</Label>
                  <Input
                    value={settings.support_email ?? ""}
                    onChange={(e) => updateSetting("support_email", e.target.value)}
                    className="mt-1"
                    placeholder="soporte@qaiross.app"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Sección Hero
                <div className="flex items-center gap-2">
                  <Switch
                    checked={heroSection?.enabled ?? true}
                    onCheckedChange={(v) => updateSection("hero", "enabled", v)}
                  />
                  <Label className="text-xs">{heroSection?.enabled ? "Visible" : "Oculta"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={heroSection?.title ?? ""}
                  onChange={(e) => updateSection("hero", "title", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Textarea
                  value={heroSection?.subtitle ?? ""}
                  onChange={(e) => updateSection("hero", "subtitle", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Texto botón principal</Label>
                  <Input
                    value={settings.hero_button_text ?? ""}
                    onChange={(e) => updateSetting("hero_button_text", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Texto botón secundario</Label>
                  <Input
                    value={settings.hero_secondary_button_text ?? ""}
                    onChange={(e) => updateSetting("hero_secondary_button_text", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Sección Beneficios
                <div className="flex items-center gap-2">
                  <Switch
                    checked={benefitsSection?.enabled ?? true}
                    onCheckedChange={(v) => updateSection("benefits", "enabled", v)}
                  />
                  <Label className="text-xs">{benefitsSection?.enabled ? "Visible" : "Oculta"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={benefitsSection?.title ?? ""}
                  onChange={(e) => updateSection("benefits", "title", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={benefitsSection?.subtitle ?? ""}
                  onChange={(e) => updateSection("benefits", "subtitle", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contenido (JSON con beneficios)</Label>
                <Textarea
                  value={benefitsSection?.content ?? ""}
                  onChange={(e) => updateSection("benefits", "content", e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works Tab */}
        <TabsContent value="howitworks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Cómo Funciona
                <div className="flex items-center gap-2">
                  <Switch
                    checked={howItWorksSection?.enabled ?? true}
                    onCheckedChange={(v) => updateSection("how_it_works", "enabled", v)}
                  />
                  <Label className="text-xs">{howItWorksSection?.enabled ? "Visible" : "Oculta"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={howItWorksSection?.title ?? ""}
                  onChange={(e) => updateSection("how_it_works", "title", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={howItWorksSection?.subtitle ?? ""}
                  onChange={(e) => updateSection("how_it_works", "subtitle", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Pasos (JSON)</Label>
                <Textarea
                  value={howItWorksSection?.content ?? ""}
                  onChange={(e) => updateSection("how_it_works", "content", e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Testimonios
                <div className="flex items-center gap-2">
                  <Switch
                    checked={testimonialsSection?.enabled ?? true}
                    onCheckedChange={(v) => updateSection("testimonials", "enabled", v)}
                  />
                  <Label className="text-xs">{testimonialsSection?.enabled ? "Visible" : "Oculta"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título sección</Label>
                <Input
                  value={testimonialsSection?.title ?? ""}
                  onChange={(e) => updateSection("testimonials", "title", e.target.value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              {getTestimonialItems().map((t, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Testimonio {i + 1}</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeTestimonial(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={t.name}
                      onChange={(e) => updateTestimonial(i, "name", e.target.value)}
                      placeholder="Nombre"
                    />
                    <Input
                      type="number"
                      value={t.rating}
                      onChange={(e) => updateTestimonial(i, "rating", parseInt(e.target.value) || 5)}
                      placeholder="Rating"
                      min={1}
                      max={5}
                    />
                  </div>
                  <Textarea
                    value={t.content}
                    onChange={(e) => updateTestimonial(i, "content", e.target.value)}
                    placeholder="Testimonio"
                    className="min-h-[60px]"
                  />
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addTestimonial}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Testimonio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Preguntas Frecuentes
                <div className="flex items-center gap-2">
                  <Switch
                    checked={faqSection?.enabled ?? true}
                    onCheckedChange={(v) => updateSection("faq", "enabled", v)}
                  />
                  <Label className="text-xs">{faqSection?.enabled ? "Visible" : "Oculta"}</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título sección</Label>
                <Input
                  value={faqSection?.title ?? ""}
                  onChange={(e) => updateSection("faq", "title", e.target.value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              {getFaqItems().map((faq, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Pregunta {i + 1}</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeFaqItem(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                    placeholder="Pregunta"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                    placeholder="Respuesta"
                    className="min-h-[60px]"
                  />
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addFaqItem}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Pregunta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Footer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Texto legal</Label>
                <Textarea
                  value={footerSection?.content ?? ""}
                  onChange={(e) => updateSection("footer", "content", e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={settings.facebook_url ?? ""}
                    onChange={(e) => updateSetting("facebook_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={settings.instagram_url ?? ""}
                    onChange={(e) => updateSetting("instagram_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Twitter/X URL</Label>
                  <Input
                    value={settings.twitter_url ?? ""}
                    onChange={(e) => updateSetting("twitter_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>TikTok URL</Label>
                  <Input
                    value={settings.tiktok_url ?? ""}
                    onChange={(e) => updateSetting("tiktok_url", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensajes del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mensaje sitio bloqueado</Label>
                <Textarea
                  value={settings.blocked_site_message ?? ""}
                  onChange={(e) => updateSetting("blocked_site_message", e.target.value)}
                  className="mt-1"
                  placeholder="Tu cuenta está bloqueada..."
                />
              </div>
              <div>
                <Label>Mensaje trial expirado</Label>
                <Textarea
                  value={settings.trial_expired_message ?? ""}
                  onChange={(e) => updateSetting("trial_expired_message", e.target.value)}
                  className="mt-1"
                  placeholder="Tu período de prueba ha expirado..."
                />
              </div>
              <div>
                <Label>Mensaje de bienvenida (registro)</Label>
                <Textarea
                  value={settings.welcome_message ?? ""}
                  onChange={(e) => updateSetting("welcome_message", e.target.value)}
                  className="mt-1"
                  placeholder="¡Bienvenido a QAIROSS!..."
                />
              </div>
              <div>
                <Label>Email de bienvenida (asunto)</Label>
                <Input
                  value={settings.welcome_email_subject ?? ""}
                  onChange={(e) => updateSetting("welcome_email_subject", e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
