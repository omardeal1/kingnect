"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
  MousePointerClick,
  Settings2,
  GitBranch,
  CalendarDays,
  Heart,
  UserPlus,
  Users,
  LayoutTemplate,
  GripVertical,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEditorStore, type EditorTab } from "@/lib/editor-store"
import { APP_URL } from "@/lib/constants"
import { type FeatureKey, FEATURE_DEFINITIONS, getEnabledEditorTabs } from "@/lib/plan-features"
import { EditorHeader } from "./editor-header"
import { PhonePreview } from "./phone-preview"
import { Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { TabBotones } from "./tab-botones"
import { TabModifiers } from "./tab-modifiers"
import { TabBranches } from "./tab-branches"
import { TabReservations } from "./tab-reservations"
import { TabLoyalty } from "./tab-loyalty"
import { TabRegistration } from "./tab-registration"
import { TabEmployees } from "./tab-employees"
import { TemplateSelector } from "./template-selector"

const ALL_TAB_ITEMS: { value: EditorTab; label: string; icon: React.ElementType }[] = [
  { value: "template", label: "Plantilla", icon: LayoutTemplate },
  { value: "info", label: "Datos", icon: FileText },
  { value: "appearance", label: "Diseño", icon: Palette },
  { value: "social", label: "Redes", icon: Share2 },
  { value: "contact", label: "Contacto", icon: Phone },
  { value: "buttons", label: "Botones", icon: MousePointerClick },
  { value: "modifiers", label: "Modificadores", icon: Settings2 },
  { value: "location", label: "Ubicaciones", icon: MapPin },
  { value: "slides", label: "Carrusel", icon: ImageIcon },
  { value: "menu", label: "Menú", icon: UtensilsCrossed },
  { value: "gallery", label: "Galería", icon: Camera },
  { value: "services", label: "Servicios", icon: Briefcase },
  { value: "testimonials", label: "Testimonios", icon: MessageSquareQuote },
  { value: "links", label: "Links", icon: Link2 },
  { value: "seo", label: "SEO", icon: Search },
  { value: "branches", label: "Sucursales", icon: GitBranch },
  { value: "reservations", label: "Reservas", icon: CalendarDays },
  { value: "loyalty", label: "Lealtad", icon: Heart },
  { value: "registration", label: "Registro", icon: UserPlus },
  { value: "employees", label: "Empleados", icon: Users },
]

function SortableTab({ value, children, className, isLocked = false }: {
  value: EditorTab
  children: React.ReactNode
  className?: string
  isLocked?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value, disabled: isLocked })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <TabsTrigger
        value={value}
        className={`
          flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md
          data-[state=active]:bg-background data-[state=active]:shadow-sm
          transition-all duration-150
          ${isDragging ? "shadow-lg ring-2 ring-primary/30 bg-primary/5 scale-105" : ""}
        `}
      >
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="size-3 text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors" />
        </div>
        {children}
      </TabsTrigger>
    </div>
  )
}

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
    planFeatures,
    setSite,
    setActiveTab,
    setHasUnsavedChanges,
    setShowMobilePreview,
    setIsLoading,
    setIsSaving,
    setSectionOrder,
    setPlanFeatures,
  } = useEditorStore()

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Compute which tabs are enabled by plan features
  const enabledTabs = React.useMemo(() => {
    if (!planFeatures) return null // null = not loaded yet, show all
    return new Set(getEnabledEditorTabs(planFeatures))
  }, [planFeatures])

  // Compute tab items in custom order (respecting saved sectionOrder + plan features)
  const tabItems = React.useMemo(() => {
    let items = ALL_TAB_ITEMS

    // Filter by plan features
    if (enabledTabs) {
      items = items.filter((tab) => enabledTabs.has(tab.value))
    }

    // Reorder by saved sectionOrder
    if (site?.sectionOrder && site.sectionOrder.length > 0) {
      const order = site.sectionOrder
      const ordered: typeof items = []
      const seen = new Set<string>()

      for (const key of order) {
        const item = items.find((t) => t.value === key)
        if (item && !seen.has(key)) {
          ordered.push(item)
          seen.add(key)
        }
      }

      for (const item of items) {
        if (!seen.has(item.value)) {
          ordered.push(item)
          seen.add(item.value)
        }
      }

      return ordered
    }

    return items
  }, [site?.sectionOrder, enabledTabs])

  // Fetch site data + plan features
  React.useEffect(() => {
    async function loadSite() {
      setIsLoading(true)
      try {
        const [siteRes, featuresRes] = await Promise.all([
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}/plan-features`),
        ])
        if (!siteRes.ok) throw new Error("Error al cargar sitio")
        const data = await siteRes.json()
        // Ensure sectionOrder is always an array
        if (data.site && !data.site.sectionOrder) {
          data.site.sectionOrder = []
        }
        setSite(data.site)

        // Load plan features
        if (featuresRes.ok) {
          const featuresData = await featuresRes.json()
          setPlanFeatures(featuresData.features)
        }
      } catch (err) {
        console.error(err)
        toast.error("Error al cargar los datos del sitio")
      } finally {
        setIsLoading(false)
      }
    }
    loadSite()
  }, [siteId, setSite, setIsLoading, setPlanFeatures])

  // Save section order to the database
  const saveSectionOrder = React.useCallback(
    async (order: string[]) => {
      try {
        const res = await fetch(`/api/sites/${siteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionOrder: JSON.stringify(order) }),
        })
        if (!res.ok) throw new Error("Error al guardar orden")
      } catch {
        // Silent fail for order saving
      }
    },
    [siteId]
  )

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
          buttonStyle: site.buttonStyle,
          siteTemplate: site.siteTemplate,
          metaTitle: site.metaTitle,
          metaDescription: site.metaDescription,
          sectionOrder: JSON.stringify(site.sectionOrder),
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
          buttonStyle: site.buttonStyle,
          siteTemplate: site.siteTemplate,
          metaTitle: site.metaTitle,
          metaDescription: site.metaDescription,
          sectionOrder: JSON.stringify(site.sectionOrder),
        }),
      })
      if (!res.ok) throw new Error("Error al publicar")
      setHasUnsavedChanges(false)
      toast.success("¡QAIROSS publicado exitosamente!")
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

  const handleRefreshPreview = React.useCallback(() => {
    setShowMobilePreview(false)
    setTimeout(() => {
      setShowMobilePreview(true)
      toast.success("Vista previa actualizada")
    }, 100)
  }, [setShowMobilePreview])

  const handleOpenMenu = React.useCallback(() => {
    setActiveTab("menu")
    const menuTab = document.querySelector('[value="menu"]')
    if (menuTab) {
      menuTab.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [setActiveTab])

  // dnd-kit drag end handler
  const handleTabDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const currentOrder: string[] = tabItems.map((t) => t.value)
      const oldIndex = currentOrder.indexOf(active.id as string)
      const newIndex = currentOrder.indexOf(over.id as string)
      if (oldIndex === -1 || newIndex === -1) return

      const newOrder = arrayMove(currentOrder, oldIndex, newIndex)
      setSectionOrder(newOrder as EditorTab[])
      saveSectionOrder(newOrder)
      toast.success("Orden de secciones actualizado")
    },
    [tabItems, setSectionOrder, saveSectionOrder]
  )

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
          <h1 className="text-lg font-bold truncate">Editar QAIROSS</h1>
          <p className="text-xs text-muted-foreground truncate">
            {site.businessName} · /{site.slug}
          </p>
        </div>
        <div className="hidden lg:block flex-1" />
        <EditorHeader
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
          onRefreshPreview={handleRefreshPreview}
          onOpenMenu={handleOpenMenu}
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
              <SortableContext items={tabItems.map((t) => t.value)} strategy={verticalListSortingStrategy}>
                <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
                  {tabItems.map((tab) => (
                    <SortableTab key={tab.value} value={tab.value}>
                      <tab.icon className="size-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </SortableTab>
                  ))}
              {/* Disabled tabs (locked by plan) */}
              {enabledTabs && ALL_TAB_ITEMS.filter((t) => !enabledTabs.has(t.value)).map((tab) => (
                <TooltipProvider key={`locked-${tab.value}`} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="
                        flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md
                        text-muted-foreground/40 cursor-not-allowed select-none
                      ">
                        <Lock className="size-3" />
                        <tab.icon className="size-3.5" />
                        <span className="hidden sm:inline line-through">{tab.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Funcion no disponible en tu plan actual</p>
                      <p className="text-xs text-muted-foreground mt-1">Actualiza tu plan para acceder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </TabsList>
              </SortableContext>
            </DndContext>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <TabsContent value="template" className="mt-0">
                    <TemplateSelector />
                  </TabsContent>
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
                  <TabsContent value="buttons" className="mt-0">
                    <TabBotones />
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
                  <TabsContent value="modifiers" className="mt-0">
                    <TabModifiers siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="branches" className="mt-0">
                    <TabBranches siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="reservations" className="mt-0">
                    <TabReservations siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="loyalty" className="mt-0">
                    <TabLoyalty siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="registration" className="mt-0">
                    <TabRegistration siteId={siteId} />
                  </TabsContent>
                  <TabsContent value="employees" className="mt-0">
                    <TabEmployees siteId={siteId} />
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
