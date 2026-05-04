"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Phone,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEditorStore, type ContactButtonData } from "@/lib/editor-store"
import { CONTACT_BUTTON_TYPES } from "@/lib/constants"

interface TabContactoProps {
  siteId: string
}

export function TabContacto({ siteId }: TabContactoProps) {
  const site = useEditorStore((s) => s.site)
  const addContactButton = useEditorStore((s) => s.addContactButton)
  const updateContactButton = useEditorStore((s) => s.updateContactButton)
  const removeContactButton = useEditorStore((s) => s.removeContactButton)
  const reorderContactButtons = useEditorStore((s) => s.reorderContactButtons)

  const [loading, setLoading] = React.useState(true)

  // Fetch contact buttons on mount
  React.useEffect(() => {
    async function fetchButtons() {
      try {
        const res = await fetch(`/api/sites/${siteId}/contact-buttons`)
        if (res.ok) {
          // Store already has data from site fetch
        }
      } catch {
        // Silent
      } finally {
        setLoading(false)
      }
    }
    fetchButtons()
  }, [siteId])

  if (!site) return null

  const contactButtons = site.contactButtons ?? []

  // Build map of existing buttons by type
  const buttonsByType = new Map<string, ContactButtonData>()
  contactButtons.forEach((b) => buttonsByType.set(b.type, b))

  const handleToggle = async (
    type: string,
    enabled: boolean,
    btnType: typeof CONTACT_BUTTON_TYPES[number]
  ) => {
    const existing = buttonsByType.get(type)
    if (enabled && !existing) {
      // Create new button
      const tempId = crypto.randomUUID()
      const newBtn: ContactButtonData = {
        id: tempId,
        type,
        label: btnType.label,
        value: "",
        enabled: true,
        sortOrder: contactButtons.length,
      }
      addContactButton(newBtn)
      try {
        const res = await fetch(`/api/sites/${siteId}/contact-buttons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, label: btnType.label, value: "", enabled: true, sortOrder: contactButtons.length }),
        })
        if (res.ok) {
          const data = await res.json()
          updateContactButton(tempId, { id: data.button.id })
        }
      } catch {
        toast.error("Error al crear botón de contacto")
      }
    } else if (existing) {
      updateContactButton(existing.id, { enabled })
      try {
        await fetch(`/api/sites/${siteId}/contact-buttons`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buttonId: existing.id, enabled }),
        })
      } catch {
        toast.error("Error al actualizar botón")
      }
    }
  }

  const handleValueChange = async (buttonId: string, value: string) => {
    updateContactButton(buttonId, { value })
    try {
      await fetch(`/api/sites/${siteId}/contact-buttons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttonId, value }),
      })
    } catch {
      // Silent - store is truth
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const ids = contactButtons.map((b) => b.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    reorderContactButtons(ids)
  }

  const handleMoveDown = (index: number) => {
    if (index >= contactButtons.length - 1) return
    const ids = contactButtons.map((b) => b.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    reorderContactButtons(ids)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando botones de contacto...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="size-4 text-[#D4A849]" />
            Botones de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {CONTACT_BUTTON_TYPES.map((btnType, idx) => {
            const existing = buttonsByType.get(btnType.value)
            const isEnabled = existing ? existing.enabled : false

            return (
              <React.Fragment key={btnType.value}>
                {idx > 0 && <Separator className="my-2" />}
                <div className="py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <btnType.icon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{btnType.label}</span>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle(btnType.value, checked, btnType)
                      }
                    />
                    {isEnabled && existing && (
                      <>
                        <div className="flex-1 flex items-center gap-1">
                          {btnType.prefix && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {btnType.prefix}
                            </span>
                          )}
                          <Input
                            value={existing.value}
                            onChange={(e) =>
                              handleValueChange(existing.id, e.target.value)
                            }
                            placeholder={btnType.placeholder}
                            className="h-8 text-sm"
                          />
                        </div>
                        {/* Reorder arrows */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              const realIdx = contactButtons.findIndex(
                                (b) => b.id === existing.id
                              )
                              if (realIdx > 0) handleMoveUp(realIdx)
                            }}
                            disabled={
                              contactButtons.findIndex(
                                (b) => b.id === existing.id
                              ) === 0
                            }
                          >
                            <ArrowUp className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              const realIdx = contactButtons.findIndex(
                                (b) => b.id === existing.id
                              )
                              if (realIdx < contactButtons.length - 1)
                                handleMoveDown(realIdx)
                            }}
                            disabled={
                              contactButtons.findIndex(
                                (b) => b.id === existing.id
                              ) ===
                              contactButtons.length - 1
                            }
                          >
                            <ArrowDown className="size-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </CardContent>
      </Card>

      {/* Active buttons summary */}
      {contactButtons.filter((b) => b.enabled).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Botones activos ({contactButtons.filter((b) => b.enabled).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {contactButtons
                .filter((b) => b.enabled)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((btn) => {
                  const btnType = CONTACT_BUTTON_TYPES.find(
                    (t) => t.value === btn.type
                  )
                  if (!btnType) return null
                  const Icon = btnType.icon
                  return (
                    <div
                      key={btn.id}
                      className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                    >
                      <Icon className="size-3" />
                      {btnType.label}
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
