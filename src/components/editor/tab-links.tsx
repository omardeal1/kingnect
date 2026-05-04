"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Link2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEditorStore, type CustomLinkData } from "@/lib/editor-store"

interface TabLinksProps {
  siteId: string
}

export function TabLinks({ siteId }: TabLinksProps) {
  const {
    site,
    addCustomLink,
    updateCustomLink,
    removeCustomLink,
  } = useEditorStore()

  const links = site?.customLinks ?? []

  // ─── Add ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimistic: CustomLinkData = {
      id: tempId,
      label: "Nuevo enlace",
      url: "",
      enabled: true,
      sortOrder: links.length,
    }
    addCustomLink(optimistic)

    try {
      const res = await fetch(`/api/sites/${siteId}/custom-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Nuevo enlace", url: "", sortOrder: links.length }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      removeCustomLink(tempId)
      addCustomLink(data.link)
      toast.success("Enlace agregado")
    } catch {
      removeCustomLink(tempId)
      toast.error("Error al agregar enlace")
    }
  }

  // ─── Update ─────────────────────────────────────────────────────────
  const handleUpdate = async (linkId: string, fields: Partial<CustomLinkData>) => {
    updateCustomLink(linkId, fields)
    try {
      await fetch(`/api/sites/${siteId}/custom-links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, ...fields }),
      })
    } catch {
      toast.error("Error al actualizar enlace")
    }
  }

  // ─── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (linkId: string) => {
    removeCustomLink(linkId)
    try {
      await fetch(`/api/sites/${siteId}/custom-links?linkId=${linkId}`, { method: "DELETE" })
      toast.success("Enlace eliminado")
    } catch {
      toast.error("Error al eliminar enlace")
    }
  }

  // ─── Reorder ────────────────────────────────────────────────────────
  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (!site) return
    const list = [...links]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    list.forEach((l, i) => {
      updateCustomLink(l.id, { sortOrder: i })
    })

    try {
      await Promise.all(
        list.map((l) =>
          fetch(`/api/sites/${siteId}/custom-links`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId: l.id, sortOrder: list.indexOf(l) }),
          })
        )
      )
    } catch {
      toast.error("Error al reordenar")
    }
  }

  if (!site) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Links Personalizados</h3>
          <p className="text-xs text-muted-foreground">
            Agrega enlaces personalizados a tu Kinec
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white">
          <Plus className="size-3.5" />
          Agregar link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Link2 className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sin enlaces</p>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega enlaces personalizados a tu Kinec
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <Card key={link.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Reorder */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, "up")}
                    >
                      <ArrowUp className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={index === links.length - 1}
                      onClick={() => handleReorder(index, "down")}
                    >
                      <ArrowDown className="size-3" />
                    </Button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Etiqueta</Label>
                      <Input
                        value={link.label}
                        onChange={(e) => handleUpdate(link.id, { label: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="Texto del enlace"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdate(link.id, { url: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Enabled + Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      id={`link-enabled-${link.id}`}
                      checked={link.enabled}
                      onCheckedChange={(v) => handleUpdate(link.id, { enabled: v })}
                      className="scale-75"
                    />
                    <Label htmlFor={`link-enabled-${link.id}`} className="text-xs text-muted-foreground cursor-pointer hidden sm:block">
                      {link.enabled ? "Activo" : "Inactivo"}
                    </Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
