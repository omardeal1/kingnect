"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEditorStore, type SocialLinkData } from "@/lib/editor-store"
import { SOCIAL_TYPES } from "@/lib/constants"

interface TabRedesProps {
  siteId: string
}

export function TabRedes({ siteId }: TabRedesProps) {
  const site = useEditorStore((s) => s.site)
  const addSocialLink = useEditorStore((s) => s.addSocialLink)
  const updateSocialLink = useEditorStore((s) => s.updateSocialLink)
  const removeSocialLink = useEditorStore((s) => s.removeSocialLink)
  const reorderSocialLinks = useEditorStore((s) => s.reorderSocialLinks)

  const [customLinks, setCustomLinks] = React.useState<SocialLinkData[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch social links on mount
  React.useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`/api/sites/${siteId}/social-links`)
        if (res.ok) {
          // The store already has them from the site data
        }
      } catch {
        // Silent fail - store data is primary source
      } finally {
        setLoading(false)
      }
    }
    fetchLinks()
  }, [siteId])

  if (!site) return null

  const socialLinks = site.socialLinks ?? []

  // Separate standard vs custom links
  const standardTypes = SOCIAL_TYPES.filter((st) => st.value !== "custom")
  const customTypeLinks = socialLinks.filter((l) => l.type === "custom")
  const standardLinksMap = new Map<string, SocialLinkData>()
  socialLinks.forEach((l) => {
    if (l.type !== "custom") standardLinksMap.set(l.type, l)
  })

  const handleToggleStandard = async (
    type: string,
    enabled: boolean,
    socialType: typeof SOCIAL_TYPES[number]
  ) => {
    const existing = standardLinksMap.get(type)
    if (enabled && !existing) {
      // Create new link
      const tempId = crypto.randomUUID()
      const newLink: SocialLinkData = {
        id: tempId,
        type,
        label: socialType.label,
        url: "",
        enabled: true,
        sortOrder: socialLinks.length,
      }
      addSocialLink(newLink)
      try {
        const res = await fetch(`/api/sites/${siteId}/social-links`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, label: socialType.label, url: "", enabled: true, sortOrder: socialLinks.length }),
        })
        if (res.ok) {
          const data = await res.json()
          // Replace temp with real
          updateSocialLink(tempId, { id: data.link.id })
        }
      } catch {
        toast.error("Error al crear enlace")
      }
    } else if (existing) {
      updateSocialLink(existing.id, { enabled })
      try {
        await fetch(`/api/sites/${siteId}/social-links`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkId: existing.id, enabled }),
        })
      } catch {
        toast.error("Error al actualizar enlace")
      }
    }
  }

  const handleUrlChange = async (linkId: string, url: string) => {
    updateSocialLink(linkId, { url })
    try {
      await fetch(`/api/sites/${siteId}/social-links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, url }),
      })
    } catch {
      // Silent fail - store is source of truth
    }
  }

  const handleAddCustom = async () => {
    const tempId = crypto.randomUUID()
    const newLink: SocialLinkData = {
      id: tempId,
      type: "custom",
      label: "",
      url: "",
      enabled: true,
      sortOrder: socialLinks.length,
    }
    addSocialLink(newLink)
    try {
      const res = await fetch(`/api/sites/${siteId}/social-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", label: "", url: "", enabled: true, sortOrder: socialLinks.length }),
      })
      if (res.ok) {
        const data = await res.json()
        updateSocialLink(tempId, { id: data.link.id })
        toast.success("Red personalizada agregada")
      }
    } catch {
      toast.error("Error al agregar red")
    }
  }

  const handleDeleteCustom = async (linkId: string) => {
    removeSocialLink(linkId)
    try {
      await fetch(`/api/sites/${siteId}/social-links?linkId=${linkId}`, {
        method: "DELETE",
      })
      toast.success("Red eliminada")
    } catch {
      toast.error("Error al eliminar red")
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const ids = socialLinks.map((l) => l.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    reorderSocialLinks(ids)
  }

  const handleMoveDown = (index: number) => {
    if (index >= socialLinks.length - 1) return
    const ids = socialLinks.map((l) => l.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    reorderSocialLinks(ids)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando redes sociales...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Standard social types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="size-4 text-[#D4A849]" />
            Redes Sociales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {standardTypes.map((socialType, idx) => {
            const existing = standardLinksMap.get(socialType.value)
            const isEnabled = existing ? existing.enabled : false

            return (
              <React.Fragment key={socialType.value}>
                {idx > 0 && <Separator className="my-2" />}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <socialType.icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{socialType.label}</span>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      handleToggleStandard(socialType.value, checked, socialType)
                    }
                  />
                  {isEnabled && existing && (
                    <Input
                      value={existing.url}
                      onChange={(e) => handleUrlChange(existing.id, e.target.value)}
                      placeholder={socialType.placeholder}
                      className="flex-1 h-8 text-sm"
                    />
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </CardContent>
      </Card>

      {/* Custom social links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="size-4 text-[#D4A849]" />
            Redes Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customTypeLinks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay redes personalizadas agregadas
            </p>
          )}
          {customTypeLinks.map((link, idx) => (
            <div
              key={link.id}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={link.label ?? ""}
                  onChange={(e) => updateSocialLink(link.id, { label: e.target.value })}
                  placeholder="Nombre de la red"
                  className="flex-1 h-8 text-sm"
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      const allLinks = socialLinks
                      const realIdx = allLinks.findIndex((l) => l.id === link.id)
                      if (realIdx > 0) handleMoveUp(realIdx)
                    }}
                    disabled={socialLinks.findIndex((l) => l.id === link.id) === 0}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      const realIdx = socialLinks.findIndex((l) => l.id === link.id)
                      if (realIdx < socialLinks.length - 1) handleMoveDown(realIdx)
                    }}
                    disabled={socialLinks.findIndex((l) => l.id === link.id) === socialLinks.length - 1}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={() => handleDeleteCustom(link.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground shrink-0">URL</Label>
                <Input
                  value={link.url}
                  onChange={(e) => handleUrlChange(link.id, e.target.value)}
                  placeholder="https://..."
                  className="flex-1 h-8 text-sm"
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCustom}
            className="w-full"
          >
            <Plus className="size-4 mr-2" />
            Agregar red personalizada
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
