"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ChevronDown,
  Upload,
  GripVertical,
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
import { useEditorStore } from "@/lib/editor-store"

interface TabMenuProps {
  siteId: string
}

export function TabMenu({ siteId }: TabMenuProps) {
  const {
    site,
    addMenuCategory,
    updateMenuCategory,
    removeMenuCategory,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
  } = useEditorStore()

  const categories = site?.menuCategories ?? []

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

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
      // Replace temp with real
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
  const handleImageUpload = async (itemId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error()
      const { url } = await uploadRes.json()
      handleUpdateItem(itemId, { imageUrl: url })
    } catch {
      toast.error("Error al subir imagen")
    }
  }

  const triggerFileInput = (itemId: string) => {
    fileInputRefs.current[itemId]?.click()
  }

  if (!site) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Menú / Catálogo</h3>
          <p className="text-xs text-muted-foreground">
            Organiza tus productos por categorías
          </p>
        </div>
        <Button size="sm" onClick={handleAddCategory} className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white">
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
              Agrega categorías para organizar tu menú
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-2">
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-lg overflow-hidden"
            >
              {/* Category header */}
              <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/30 group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
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
              </AccordionTrigger>

              {/* Category content: menu items */}
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {category.menuItems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sin productos en esta categoría
                    </p>
                  )}
                  {category.menuItems.map((item) => (
                    <Card key={item.id} className="border-dashed">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start gap-3">
                          {/* Item image */}
                          <div className="shrink-0">
                            <input
                              ref={(el) => { fileInputRefs.current[item.id] = el }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(item.id, file)
                              }}
                            />
                            {item.imageUrl ? (
                              <button
                                onClick={() => triggerFileInput(item.id)}
                                className="size-16 rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                              >
<img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="size-full object-cover"
                                />
                              </button>
                            ) : (
                              <button
                                onClick={() => triggerFileInput(item.id)}
                                className="size-16 rounded-md border-2 border-dashed flex items-center justify-center hover:border-[#D4A849]/50 hover:bg-[#D4A849]/5 transition-colors"
                              >
                                <Upload className="size-4 text-muted-foreground" />
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
                              <div>
                                <Label className="text-xs">Precio</Label>
                                <Input
                                  type="number"
                                  value={item.price ?? ""}
                                  onChange={(e) => handleUpdateItem(item.id, { price: e.target.value ? parseFloat(e.target.value) : null })}
                                  className="h-8 text-sm"
                                  placeholder="0.00"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Descripción</Label>
                              <Input
                                value={item.description ?? ""}
                                onChange={(e) => handleUpdateItem(item.id, { description: e.target.value || null })}
                                className="h-8 text-sm"
                                placeholder="Descripción breve del producto"
                              />
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
                        </div>

                        {/* Item toggles */}
                        <div className="flex items-center gap-4 pl-[76px]">
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
                      </CardContent>
                    </Card>
                  ))}

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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
