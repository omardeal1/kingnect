"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ChevronDown,
  GripVertical,
  Pencil,
  Sparkles,
  Lightbulb,
  ImageIcon,
  Palette,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorStore } from "@/lib/editor-store"
import { ImageEditor } from "@/components/editor/image-editor"
import { ImageUploadZone } from "@/components/editor/image-upload-zone"
import AiMenuModal from "@/components/editor/ai-menu-modal"
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

// ─── Types ──────────────────────────────────────────────────────────────────────

interface GeneratedMenu {
  welcomeMessage: string
  categories: {
    name: string
    items: { name: string; description: string; suggestedPrice: number }[]
  }[]
}

interface TabMenuProps {
  siteId: string
}

// ─── Sortable Components ─────────────────────────────────────────────────────

function SortableCategoryItem({
  id,
  headerChildren,
  contentChildren,
}: {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerChildren: (handleProps: { ref: (el: HTMLElement | null) => void; attributes: any; listeners: any }) => React.ReactNode
  contentChildren: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : "auto",
  }
  return (
    <AccordionItem
      value={id}
      className="border rounded-lg overflow-hidden"
      ref={setNodeRef}
      style={style}
    >
      <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/30 group">
        {headerChildren({ ref: setActivatorNodeRef, attributes, listeners })}
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {contentChildren}
      </AccordionContent>
    </AccordionItem>
  )
}

function SortableMenuItem({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 40 : "auto",
  }
  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-dashed">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-start gap-3">
            <div
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="shrink-0 pt-2 cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="size-3.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors" />
            </div>
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function TabMenu({ siteId }: TabMenuProps) {
  const {
    site,
    updateSite,
    addMenuCategory,
    updateMenuCategory,
    removeMenuCategory,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
  } = useEditorStore()

  const categories = site?.menuCategories ?? []
  const accentColor = site?.accentColor ?? "#D4A849"

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const [imageEditorOpen, setImageEditorOpen] = React.useState(false)
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const [aiModalOpen, setAiModalOpen] = React.useState(false)

  // IA states
  const [improvingDesc, setImprovingDesc] = React.useState<string | null>(null)
  const [suggestingPrice, setSuggestingPrice] = React.useState<string | null>(null)
  const [priceTooltip, setPriceTooltip] = React.useState<{ itemId: string; price: number; reasoning: string } | null>(null)

  // Featured slides
  const [featuredSlides, setFeaturedSlides] = React.useState<
    { id: string; imageUrl: string; title: string | null; enabled: boolean; sortOrder: number }[]
  >(site?.menuFeaturedSlides ?? [])
  const [slideEditingId, setSlideEditingId] = React.useState<string | null>(null)
  const [slideImageEditorOpen, setSlideImageEditorOpen] = React.useState(false)

  // ─── Load featured slides on mount ─────────────────────────────────
  React.useEffect(() => {
    if (!siteId) return
    fetch(`/api/sites/${siteId}/menu-featured-slides`)
      .then((r) => r.json())
      .then((data) => setFeaturedSlides(data.slides ?? []))
      .catch(() => {})
  }, [siteId])

  // ─── Category handlers ──────────────────────────────────────────────
  const handleAddCategory = async () => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimisticCat = {
      id: tempId,
      name: "Nueva categoría",
      enabled: true,
      sortOrder: categories.length,
      menuItems: [],
    }
    addMenuCategory(optimisticCat)

    try {
      const res = await fetch(`/api/sites/${siteId}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", name: "Nueva categoría", sortOrder: categories.length }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeMenuCategory(tempId)
      addMenuCategory(data.menuCategory)
      toast.success("Categoría agregada")
    } catch {
      removeMenuCategory(tempId)
      toast.error("Error al agregar categoría")
    }
  }

  const handleUpdateCategory = async (catId: string, fields: { name?: string; enabled?: boolean }) => {
    updateMenuCategory(catId, fields)
    try {
      await fetch(`/api/sites/${siteId}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", id: catId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar categoría")
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    removeMenuCategory(catId)
    try {
      await fetch(`/api/sites/${siteId}/menu`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", id: catId }),
      })
      toast.success("Categoría eliminada")
    } catch {
      toast.error("Error al eliminar categoría")
    }
  }

  // ─── Item handlers ──────────────────────────────────────────────────
  const handleAddItem = async (categoryId: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const cat = categories.find((c) => c.id === categoryId)
    const optimisticItem = {
      id: tempId,
      categoryId,
      name: "Nuevo producto",
      description: null,
      price: null,
      imageUrl: null,
      isOrderable: false,
      enabled: true,
      sortOrder: cat?.menuItems.length ?? 0,
      badge: null,
      specialInstructionsEnabled: true,
    }
    addMenuItem(categoryId, optimisticItem)

    try {
      const res = await fetch(`/api/sites/${siteId}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item",
          categoryId,
          name: "Nuevo producto",
          sortOrder: cat?.menuItems.length ?? 0,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeMenuItem(tempId)
      addMenuItem(categoryId, data.menuItem)
      toast.success("Producto agregado")
    } catch {
      removeMenuItem(tempId)
      toast.error("Error al agregar producto")
    }
  }

  const handleUpdateItem = async (itemId: string, fields: Record<string, unknown>) => {
    updateMenuItem(itemId, fields)
    try {
      await fetch(`/api/sites/${siteId}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "item", id: itemId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar producto")
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    removeMenuItem(itemId)
    try {
      await fetch(`/api/sites/${siteId}/menu`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "item", id: itemId }),
      })
      toast.success("Producto eliminado")
    } catch {
      toast.error("Error al eliminar producto")
    }
  }

  // ─── Image upload ───────────────────────────────────────────────────
  const handleItemImageUploaded = (itemId: string) => (url: string) => {
    handleUpdateItem(itemId, { imageUrl: url })
  }

  const editingItem = categories
    .flatMap((c) => c.menuItems)
    .find((item) => item.id === editingItemId)

  const handleEditImageSave = async (imageUrl: string) => {
    if (!editingItemId) return
    handleUpdateItem(editingItemId, { imageUrl })
    setImageEditorOpen(false)
    setEditingItemId(null)
  }

  const handleOpenImageEditor = (itemId: string) => {
    setEditingItemId(itemId)
    setImageEditorOpen(true)
  }

  // ─── AI: Improve Description ────────────────────────────────────────
  const handleImproveDescription = async (itemId: string, itemName: string) => {
    setImprovingDesc(itemId)
    try {
      const res = await fetch("/api/ai/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "improve_description", itemName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      handleUpdateItem(itemId, { description: data.description })
      toast.success("Descripción mejorada con IA")
    } catch (err: any) {
      toast.error(err.message || "Error al mejorar descripción")
    } finally {
      setImprovingDesc(null)
    }
  }

  // ─── AI: Suggest Price ──────────────────────────────────────────────
  const handleSuggestPrice = async (itemId: string, itemName: string) => {
    setSuggestingPrice(itemId)
    setPriceTooltip(null)
    try {
      const res = await fetch("/api/ai/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest_price", itemName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPriceTooltip({ itemId, price: data.suggestedPrice, reasoning: data.reasoning })
    } catch (err: any) {
      toast.error(err.message || "Error al sugerir precio")
    } finally {
      setSuggestingPrice(null)
    }
  }

  const acceptSuggestedPrice = (itemId: string, price: number) => {
    handleUpdateItem(itemId, { price })
    setPriceTooltip(null)
    toast.success("Precio sugerido aplicado")
  }

  // ─── AI: Suggest Badge ──────────────────────────────────────────────
  const handleSuggestBadge = async (itemId: string, itemName: string) => {
    try {
      const res = await fetch("/api/ai/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_badge_suggestion", itemName, salesCount: 0, isNew: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      handleUpdateItem(itemId, { badge: data.badge })
      if (data.badge) toast.success(`Badge sugerido: ${data.badge}`)
      else toast.info("La IA no sugiere badge para este producto")
    } catch (err: any) {
      toast.error(err.message || "Error al sugerir badge")
    }
  }

  // ─── AI: Accept Generated Menu ──────────────────────────────────────
  const handleAcceptGeneratedMenu = async (menu: GeneratedMenu) => {
    for (const category of menu.categories) {
      // Create category
      try {
        const catRes = await fetch(`/api/sites/${siteId}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "category", name: category.name, sortOrder: categories.length }),
        })
        if (!catRes.ok) continue
        const catData = await catRes.json()
        const catId = catData.menuCategory.id
        addMenuCategory(catData.menuCategory)

        // Create items
        for (const item of category.items) {
          try {
            const itemRes = await fetch(`/api/sites/${siteId}/menu`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "item",
                categoryId: catId,
                name: item.name,
                description: item.description,
                price: item.suggestedPrice,
                isOrderable: true,
                sortOrder: category.items.indexOf(item),
              }),
            })
            if (itemRes.ok) {
              const itemData = await itemRes.json()
              addMenuItem(catId, itemData.menuItem)
            }
          } catch {
            // Continue creating other items
          }
        }
      } catch {
        // Continue creating other categories
      }
    }
  }

  // ─── Menu Template ──────────────────────────────────────────────────
  const handleTemplateChange = async (template: string) => {
    updateSite({ menuTemplate: template })
    try {
      await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuTemplate: template }),
      })
      toast.success("Plantilla del menú actualizada")
    } catch {
      toast.error("Error al actualizar plantilla")
    }
  }

  // ─── Featured Slides ────────────────────────────────────────────────
  const handleAddSlide = async (imageUrl: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/menu-featured-slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error")
      }
      const data = await res.json()
      setFeaturedSlides((prev) => [...prev, data.slide])
      toast.success("Foto destacada agregada")
    } catch (err: any) {
      toast.error(err.message || "Error al agregar foto")
    }
  }

  const handleRemoveSlide = async (slideId: string) => {
    setFeaturedSlides((prev) => prev.filter((s) => s.id !== slideId))
    try {
      await fetch(`/api/sites/${siteId}/menu-featured-slides?slideId=${slideId}`, {
        method: "DELETE",
      })
      toast.success("Foto eliminada")
    } catch {
      toast.error("Error al eliminar foto")
    }
  }

  const handleToggleSlide = async (slideId: string, enabled: boolean) => {
    setFeaturedSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, enabled } : s))
    )
    try {
      await fetch(`/api/sites/${siteId}/menu-featured-slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, enabled }),
      })
    } catch {
      toast.error("Error al actualizar foto")
    }
  }

  const handleSlideImageSave = async (imageUrl: string) => {
    if (!slideEditingId) return
    // If adding new slide
    await handleAddSlide(imageUrl)
    setSlideImageEditorOpen(false)
    setSlideEditingId(null)
  }

  // ─── Drag & Drop Handlers ────────────────────────────────────────
  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(categories, oldIndex, newIndex)
    // Update store
    reordered.forEach((cat, i) => updateMenuCategory(cat.id, { sortOrder: i }))
    // Persist
    try {
      await Promise.all(
        reordered.map((cat) =>
          fetch(`/api/sites/${siteId}/menu`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "category", id: cat.id, sortOrder: reordered.indexOf(cat) }),
          })
        )
      )
      toast.success("Orden de categorías actualizado")
    } catch {
      toast.error("Error al reordenar categorías")
    }
  }

  const handleItemDragEnd = async (categoryId: string, event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return
    const oldIndex = category.menuItems.findIndex((i) => i.id === active.id)
    const newIndex = category.menuItems.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(category.menuItems, oldIndex, newIndex)
    // Update store
    reordered.forEach((item, i) => updateMenuItem(item.id, { sortOrder: i }))
    // Persist
    try {
      await Promise.all(
        reordered.map((item) =>
          fetch(`/api/sites/${siteId}/menu`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "item", id: item.id, sortOrder: reordered.indexOf(item) }),
          })
        )
      )
      toast.success("Orden de productos actualizado")
    } catch {
      toast.error("Error al reordenar productos")
    }
  }

  // ─── Badge options ──────────────────────────────────────────────────
  const badgeOptions = [
    { value: "", label: "Ninguno", color: "#9CA3AF" },
    { value: "Nuevo", label: "Nuevo", color: "#3B82F6" },
    { value: "Popular", label: "Popular", color: "#F59E0B" },
    { value: "Recomendado", label: "Recomendado", color: "#10B981" },
  ]

  if (!site) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ═══ AI Generate Menu Button ═══ */}
        <Card className="border-dashed overflow-hidden">
          <CardContent className="p-0">
            <button
              onClick={() => setAiModalOpen(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left group"
            >
              <div
                className="size-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Sparkles className="size-5" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  Generar menú con IA
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
                    style={{ backgroundColor: accentColor }}>
                    NEW
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Crea un menú completo con categorías, descripciones y precios en segundos
                </p>
              </div>
              <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </CardContent>
        </Card>

        {/* ═══ Menu Template ═══ */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Plantilla del menú</Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "dark_elegant", label: "Elegante Oscuro", bg: "#1a1a1a", text: "#fff", accent: "#D4A849" },
              { value: "fresh_modern", label: "Fresco Moderno", bg: "#ffffff", text: "#0A0A0A", accent: "#10B981" },
              { value: "warm_casual", label: "Cálido Casual", bg: "#FFF8F0", text: "#5C4033", accent: "#E07B39" },
            ].map((tpl) => (
              <button
                key={tpl.value}
                onClick={() => handleTemplateChange(tpl.value)}
                className={`relative rounded-lg p-3 border-2 transition-all text-center ${
                  site.menuTemplate === tpl.value
                    ? "border-current shadow-md scale-[1.02]"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                style={{
                  backgroundColor: tpl.bg,
                  color: tpl.text,
                  borderColor: site.menuTemplate === tpl.value ? tpl.accent : undefined,
                }}
              >
                <div
                  className="w-8 h-1 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: tpl.accent }}
                />
                <span className="text-[11px] font-semibold leading-tight block">
                  {tpl.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Featured Slides ═══ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Fotos destacadas del menú</Label>
              <span className="text-[10px] text-muted-foreground">
                ({featuredSlides.length}/5)
              </span>
            </div>
            {featuredSlides.length < 5 && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  setSlideEditingId("new")
                  setSlideImageEditorOpen(true)
                }}
              >
                <Plus className="size-3" />
                Agregar
              </Button>
            )}
          </div>

          {featuredSlides.length > 0 && (
            <div className="grid grid-cols-5 gap-1.5">
              {featuredSlides.map((slide) => (
                <div key={slide.id} className="relative group/slide">
                  <div className={`aspect-video rounded-md overflow-hidden border ${slide.enabled ? "border-muted" : "border-muted opacity-50"}`}>
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-opacity"
                  >
                    <span className="text-[10px]">✕</span>
                  </button>
                  <button
                    onClick={() => handleToggleSlide(slide.id, !slide.enabled)}
                    className="absolute bottom-0.5 right-0.5 text-[8px] px-1 rounded opacity-0 group-hover/slide:opacity-100 transition-opacity"
                    style={{ backgroundColor: slide.enabled ? "#10B981" : "#9CA3AF", color: "white" }}
                  >
                    {slide.enabled ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Divider ═══ */}
        <div className="border-t" />

        {/* ═══ Menu Categories & Items ═══ */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Menú / Catálogo</h3>
            <p className="text-xs text-muted-foreground">
              Organiza tus productos por categorías
            </p>
          </div>
          <Button size="sm" onClick={handleAddCategory} className="gap-1.5 text-white" style={{ backgroundColor: accentColor }}>
            <Plus className="size-3.5" />
            Agregar categoría
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <GripVertical className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Sin categorías</p>
              <p className="text-xs text-muted-foreground mt-1">
                Agrega categorías o usa la IA para generar tu menú
              </p>
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-2">
                {categories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    id={category.id}
                    headerChildren={({ ref, attributes, listeners }) => (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          ref={ref}
                          {...attributes}
                          {...listeners}
                          className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
                        >
                          <GripVertical className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                        </div>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        <Input
                          value={category.name}
                          onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 text-sm font-medium border-none bg-transparent shadow-none p-0 focus-visible:ring-0"
                        />
                        <div className="flex items-center gap-2 ml-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Label htmlFor={`cat-enabled-${category.id}`} className="text-xs text-muted-foreground cursor-pointer">
                            {category.enabled ? "Activo" : "Inactivo"}
                          </Label>
                          <Switch
                            id={`cat-enabled-${category.id}`}
                            checked={category.enabled}
                            onCheckedChange={(v) => handleUpdateCategory(category.id, { enabled: v })}
                            className="scale-75"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                    contentChildren={(
                      <div className="space-y-3">
                        {category.menuItems.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Sin productos en esta categoría
                          </p>
                        )}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleItemDragEnd(category.id, e)}>
                          <SortableContext items={category.menuItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                            {category.menuItems.map((item) => (
                              <SortableMenuItem key={item.id} id={item.id}>
                                {/* Item image */}
                                <div className="shrink-0 relative group/img">
                                  <ImageUploadZone
                                    onUpload={handleItemImageUploaded(item.id)}
                                    context="menuItem"
                                    folder="menu"
                                    variant="compact"
                                    currentImageUrl={item.imageUrl}
                                    recommendedSize="800 × 600 px"
                                  />
                                  {item.imageUrl && (
                                    <button
                                      onClick={() => handleOpenImageEditor(item.id)}
                                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                      style={{ backgroundColor: accentColor }}
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                  )}
                                </div>

                                {/* Item fields */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Nombre</Label>
                                      <Input
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                                        className="h-8 text-sm"
                                        placeholder="Nombre del producto"
                                      />
                                    </div>
                                    <div className="relative">
                                      <Label className="text-xs flex items-center gap-1">
                                        Precio
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={() => handleSuggestPrice(item.id, item.name)}
                                              disabled={suggestingPrice === item.id}
                                              className="inline-flex items-center text-[10px] px-1 py-0.5 rounded-full hover:bg-muted transition-colors"
                                              style={{ color: accentColor }}
                                            >
                                              {suggestingPrice === item.id ? (
                                                <span className="inline-block size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <Lightbulb className="size-3" />
                                              )}
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="max-w-[200px]">
                                            {suggestingPrice === item.id
                                              ? "Consultando IA..."
                                              : "Sugerir precio con IA"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </Label>
                                      <Input
                                        type="number"
                                        value={item.price ?? ""}
                                        onChange={(e) => handleUpdateItem(item.id, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="h-8 text-sm"
                                        placeholder="0.00"
                                        step="0.01"
                                      />
                                      {/* Price suggestion tooltip */}
                                      {priceTooltip && priceTooltip.itemId === item.id && (
                                        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg p-2.5 w-52 text-xs space-y-2">
                                          <p className="font-bold" style={{ color: accentColor }}>
                                            ${priceTooltip.price.toFixed(2)}
                                          </p>
                                          <p className="text-muted-foreground">{priceTooltip.reasoning}</p>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => acceptSuggestedPrice(item.id, priceTooltip.price)}
                                              className="flex-1 py-1 rounded text-[10px] font-semibold text-white"
                                              style={{ backgroundColor: accentColor }}
                                            >
                                              Aplicar
                                            </button>
                                            <button
                                              onClick={() => setPriceTooltip(null)}
                                              className="px-2 py-1 rounded text-[10px] bg-muted hover:bg-muted/80"
                                            >
                                              Cerrar
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description with AI button */}
                                  <div>
                                    <Label className="text-xs flex items-center gap-1">
                                      Descripción
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => handleImproveDescription(item.id, item.name)}
                                            disabled={improvingDesc === item.id}
                                            className="inline-flex items-center text-[10px] px-1 py-0.5 rounded-full hover:bg-muted transition-colors"
                                            style={{ color: accentColor }}
                                          >
                                            {improvingDesc === item.id ? (
                                              <span className="inline-block size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                              <Sparkles className="size-3" />
                                            )}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          {improvingDesc === item.id
                                            ? "Mejorando descripción..."
                                            : "Mejorar descripción con IA"}
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                    <Input
                                      value={item.description ?? ""}
                                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value || null })}
                                      className="h-8 text-sm"
                                      placeholder="Descripción breve del producto"
                                    />
                                  </div>

                                  {/* Badge selector */}
                                  <div>
                                    <Label className="text-xs flex items-center gap-1">
                                      Badge
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => handleSuggestBadge(item.id, item.name)}
                                            className="inline-flex items-center text-[10px] px-1 py-0.5 rounded-full hover:bg-muted transition-colors"
                                            style={{ color: accentColor }}
                                          >
                                            <Sparkles className="size-2.5" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Sugerir badge con IA</TooltipContent>
                                      </Tooltip>
                                    </Label>
                                    <div className="flex gap-1.5 mt-0.5">
                                      {badgeOptions.map((opt) => (
                                        <button
                                          key={opt.value}
                                          onClick={() => handleUpdateItem(item.id, { badge: opt.value || null })}
                                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                                            (item.badge || "") === opt.value
                                              ? "ring-2 ring-offset-1 scale-105"
                                              : "opacity-50 hover:opacity-80"
                                          }`}
                                          style={{
                                            backgroundColor: `${opt.color}20`,
                                            color: opt.color,
                                            ...(item.badge === opt.value ? { ringColor: opt.color } : {}),
                                          }}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Delete button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>

                                {/* Item toggles */}
                                <div className="w-full flex items-center gap-4 pl-[56px]">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id={`orderable-${item.id}`}
                                      checked={item.isOrderable}
                                      onCheckedChange={(v) => handleUpdateItem(item.id, { isOrderable: v })}
                                      className="scale-75"
                                    />
                                    <Label htmlFor={`orderable-${item.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                      Se puede pedir
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id={`item-enabled-${item.id}`}
                                      checked={item.enabled}
                                      onCheckedChange={(v) => handleUpdateItem(item.id, { enabled: v })}
                                      className="scale-75"
                                    />
                                    <Label htmlFor={`item-enabled-${item.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                      {item.enabled ? "Activo" : "Inactivo"}
                                    </Label>
                                  </div>
                                </div>
                              </SortableMenuItem>
                            ))}
                          </SortableContext>
                        </DndContext>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem(category.id)}
                          className="w-full gap-1.5 border-dashed"
                        >
                          <Plus className="size-3.5" />
                          Agregar producto
                        </Button>
                      </div>
                    )}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        )}

        {/* ═══ Image Editor Dialog (for items) ═══ */}
        <ImageEditor
          open={imageEditorOpen}
          onOpenChange={(open) => {
            setImageEditorOpen(open)
            if (!open) setEditingItemId(null)
          }}
          currentImageUrl={editingItem?.imageUrl}
          onSave={handleEditImageSave}
          title="Editar imagen del producto"
        />

        {/* ═══ Image Editor Dialog (for featured slides) ═══ */}
        <ImageEditor
          open={slideImageEditorOpen}
          onOpenChange={(open) => {
            setSlideImageEditorOpen(open)
            if (!open) setSlideEditingId(null)
          }}
          currentImageUrl={null}
          onSave={handleSlideImageSave}
          aspectRatio="landscape"
          title="Nueva foto destacada"
        />

        {/* ═══ AI Menu Modal ═══ */}
        <AiMenuModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          onAccept={handleAcceptGeneratedMenu}
          accentColor={accentColor}
        />
      </div>
    </TooltipProvider>
  )
}
