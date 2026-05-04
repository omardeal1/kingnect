"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  FileText,
  Palette,
  Share2,
  Phone,
  MapPin,
  Image as ImageIcon,
  UtensilsCrossed,
  Camera,
  Briefcase,
  MessageSquareQuote,
  Link2,
  Search,
  Eye,
  Smartphone,
  X,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEditorStore, type EditorTab } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"
import { EditorHeader } from "./editor-header"
import { PhonePreview } from "./phone-preview"
import { TabDatos } from "./tab-datos"
import { TabDiseno } from "./tab-diseno"
import { TabRedes } from "./tab-redes"
import { TabContacto } from "./tab-contacto"
import { TabUbicaciones } from "./tab-ubicaciones"
import { TabSlides } from "./tab-slides"
import { TabMenu } from "./tab-menu"
import { TabGaleria } from "./tab-galeria"
import { TabServicios } from "./tab-servicios"
import { TabTestimonios } from "./tab-testimonios"
import { TabLinks } from "./tab-links"
import { TabSeo } from "./tab-seo"

const TAB_ITEMS: { value: EditorTab; label: string; icon: React.ElementType }[] = [
  { value: "info", label: "Datos", icon: FileText },
  { value: "appearance", label: "Diseño", icon: Palette },
  { value: "social", label: "Redes", icon: Share2 },
  { value: "contact", label: "Contacto", icon: Phone },
  { value: "location", label: "Ubicaciones", icon: MapPin },
  { value: "slides", label: "Carrusel", icon: ImageIcon },
  { value: "menu", label: "Menú", icon: UtensilsCrossed },
  { value: "gallery", label: "Galería", icon: Camera },
  { value: "services", label: "Servicios", icon: Briefcase },
  { value: "testimonials", label: "Testimonios", icon: MessageSquareQuote },
  { value: "links", label: "Links", icon: Link2 },
  { value: "seo", label: "SEO", icon: Search },
]

interface EditorLayoutProps {
  siteId: string
}

export function EditorLayout({ siteId }: EditorLayoutProps) {
  const {
    site,
    isLoading,
    activeTab,
    hasUnsavedChanges,
    showMobilePreview,
    setSite,
    setActiveTab,
    setHasUnsavedChanges,
    setShowMobilePreview,
    setIsLoading,
    setIsSaving,
  } = useEditorStore()

  // Fetch site data
  React.useEffect(() => {
    async function loadSite() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/sites/${siteId}`)
        if (!res.ok) throw new Error("Error al cargar sitio")
        const data = await res.json()
        setSite(data.site)
      } catch (err) {
        console.error(err)
        toast.error("Error al cargar los datos del sitio")
      }
    }
    loadSite()
  }, [siteId, setSite, setIsLoading])

  const handleSaveDraft = React.useCallback(async () => {
    if (!site) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: site.businessName,
          tagline: site.tagline,
          description: site.description,
          logoUrl: site.logoUrl,
          faviconUrl: site.faviconUrl,
          backgroundType: site.backgroundType,
          backgroundColor: site.backgroundColor,
          backgroundGradient: site.backgroundGradient,
          backgroundImageUrl: site.backgroundImageUrl,
          cardColor: site.cardColor,
          textColor: site.textColor,
          accentColor: site.accentColor,
          themeMode: site.themeMode,
          isPublished: false,
          showKingBrand: site.showKingBrand,
          metaTitle: site.metaTitle,
          metaDescription: site.metaDescription,
        }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setHasUnsavedChanges(false)
      toast.success("Borrador guardado correctamente")
    } catch {
      toast.error("Error al guardar el borrador")
    } finally {
      setIsSaving(false)
    }
  }, [site, siteId, setIsSaving, setHasUnsavedChanges])

  const handlePublish = React.useCallback(async () => {
    if (!site) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: site.businessName,
          tagline: site.tagline,
          description: site.description,
          logoUrl: site.logoUrl,
          faviconUrl: site.faviconUrl,
          backgroundType: site.backgroundType,
          backgroundColor: site.backgroundColor,
          backgroundGradient: site.backgroundGradient,
          backgroundImageUrl: site.backgroundImageUrl,
          cardColor: site.cardColor,
          textColor: site.textColor,
          accentColor: site.accentColor,
          themeMode: site.themeMode,
          isPublished: true,
          isActive: true,
          showKingBrand: site.showKingBrand,
          metaTitle: site.metaTitle,
          metaDescription: site.metaDescription,
        }),
      })
      if (!res.ok) throw new Error("Error al publicar")
      setHasUnsavedChanges(false)
      toast.success("¡Kinec publicado exitosamente!")
    } catch {
      toast.error("Error al publicar el sitio")
    } finally {
      setIsSaving(false)
    }
  }, [site, siteId, setIsSaving, setHasUnsavedChanges])

  const handlePreview = React.useCallback(() => {
    if (site) {
      window.open(`${APP_URL}/${site.slug}`, "_blank")
    }
  }, [site])

  if (isLoading || !site) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">Editar Kinec</h1>
          <p className="text-xs text-muted-foreground truncate">
            {site.businessName} · /{site.slug}
          </p>
        </div>
        <div className="hidden lg:block flex-1" />
        <EditorHeader
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
        />
        {/* Mobile preview toggle */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
        >
          <Smartphone className="size-4" />
        </Button>
      </div>

      {/* Main content: tabs + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EditorTab)}>
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
              {TAB_ITEMS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                >
                  <tab.icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <TabsContent value="info" className="mt-0">
                    <TabDatos siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="appearance" className="mt-0">
                    <TabDiseno />
                  </TabsContent>
                  <TabsContent value="social" className="mt-0">
                    <TabRedes siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="contact" className="mt-0">
                    <TabContacto siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="location" className="mt-0">
                    <TabUbicaciones siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="slides" className="mt-0">
                    <TabSlides siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="menu" className="mt-0">
                    <TabMenu siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="gallery" className="mt-0">
                    <TabGaleria siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="services" className="mt-0">
                    <TabServicios siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="testimonials" className="mt-0">
                    <TabTestimonios siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="links" className="mt-0">
                    <TabLinks siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="seo" className="mt-0">
                    <TabSeo />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>

        {/* Right: Phone preview (desktop) */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="sticky top-24">
            <div className="text-center mb-3">
              <p className="text-xs font-medium text-muted-foreground">Vista previa en tiempo real</p>
            </div>
            <PhonePreview />
          </div>
        </div>
      </div>

      {/* Mobile preview overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 lg:hidden"
          >
            <div className="flex items-center justify-between w-full max-w-sm mb-4">
              <p className="text-sm font-medium">Vista previa</p>
              <Button variant="ghost" size="icon" onClick={() => setShowMobilePreview(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <PhonePreview />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
