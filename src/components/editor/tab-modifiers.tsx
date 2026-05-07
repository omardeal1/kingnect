"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Copy,
  Settings2,
  Layers,
  DollarSign,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useTranslations,
} from "@/i18n/provider"
import type {
  ModifierGroupData,
  ModifierOptionData,
  SelectionType,
} from "@/lib/modifier-types"

// ─── Props ────────────────────────────────────────────────────────────────

interface TabModifiersProps {
  siteId: string
}

// ─── Component ────────────────────────────────────────────────────────────

export function TabModifiers({ siteId }: TabModifiersProps) {
  const { t } = useTranslations("editor.modifiers")

  const [groups, setGroups] = React.useState<ModifierGroupData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [savingGroupId, setSavingGroupId] = React.useState<string | null>(null)
  const [savingOptionId, setSavingOptionId] = React.useState<string | null>(null)
  const [duplicatingGroupId, setDuplicatingGroupId] = React.useState<string | null>(null)

  // Ref to keep a snapshot for rollback
  const groupsRef = React.useRef<ModifierGroupData[]>([])
  React.useEffect(() => {
    groupsRef.current = groups
  }, [groups])

  // ─── Fetch ────────────────────────────────────────────────────────────

  const fetchGroups = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setGroups(data.modifierGroups ?? [])
    } catch {
      toast.error(t("fetchError") || "Error al cargar modificadores")
    } finally {
      setIsLoading(false)
    }
  }, [siteId, t])

  React.useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // ─── Helpers ──────────────────────────────────────────────────────────

  const rollback = React.useCallback(() => {
    setGroups(groupsRef.current)
  }, [])

  const totalOptions = React.useMemo(
    () => groups.reduce((sum, g) => sum + g.options.length, 0),
    [groups]
  )

  const templateGroups = React.useMemo(
    () => groups.filter((g) => g.isTemplate),
    [groups]
  )

  const nonTemplateGroups = React.useMemo(
    () => groups.filter((g) => !g.isTemplate),
    [groups]
  )

  // ─── Add Group ────────────────────────────────────────────────────────

  const handleAddGroup = async () => {
    const tempId = `temp-group-${Date.now()}`
    const optimistic: ModifierGroupData = {
      id: tempId,
      siteId,
      productId: null,
      name: t("newGroupName") || "Nuevo grupo",
      selectionType: "single",
      isRequired: false,
      isActive: true,
      sortOrder: groups.length,
      isTemplate: false,
      options: [],
    }

    const previous = [...groups]
    setGroups((prev) => [...prev, optimistic])

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "group",
          name: optimistic.name,
          selectionType: optimistic.selectionType,
          isRequired: optimistic.isRequired,
          sortOrder: optimistic.sortOrder,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Replace temp with real
      setGroups((prev) =>
        prev.map((g) => (g.id === tempId ? data.modifierGroup : g))
      )
      toast.success(t("groupCreated") || "Grupo creado")
    } catch {
      setGroups(previous)
      toast.error(t("groupCreateError") || "Error al crear grupo")
    }
  }

  // ─── Update Group ─────────────────────────────────────────────────────

  const handleUpdateGroup = async (
    groupId: string,
    fields: Partial<ModifierGroupData>
  ) => {
    const previous = [...groups]
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...fields } : g))
    )

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", groupId, ...fields }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setGroups(previous)
      toast.error(t("groupUpdateError") || "Error al actualizar grupo")
    }
  }

  // ─── Delete Group ─────────────────────────────────────────────────────

  const handleDeleteGroup = async (groupId: string) => {
    const previous = [...groups]
    setGroups((prev) => prev.filter((g) => g.id !== groupId))

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", groupId }),
      })
      if (!res.ok) throw new Error()
      toast.success(t("groupDeleted") || "Grupo eliminado")
    } catch {
      setGroups(previous)
      toast.error(t("groupDeleteError") || "Error al eliminar grupo")
    }
  }

  // ─── Duplicate Group ──────────────────────────────────────────────────

  const handleDuplicateGroup = async (
    sourceGroupId: string,
    newName?: string
  ) => {
    const source = groups.find((g) => g.id === sourceGroupId)
    if (!source) return

    setDuplicatingGroupId(sourceGroupId)

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "duplicate_group",
          sourceGroupId,
          newName:
            newName || `${source.name} (${t("copy") || "copia"})`,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.modifierGroup) {
        setGroups((prev) => [...prev, data.modifierGroup])
      }
      toast.success(t("groupDuplicated") || "Grupo duplicado")
    } catch {
      toast.error(t("groupDuplicateError") || "Error al duplicar grupo")
    } finally {
      setDuplicatingGroupId(null)
    }
  }

  // ─── Add Option ───────────────────────────────────────────────────────

  const handleAddOption = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return

    const tempId = `temp-option-${Date.now()}`
    const optimistic: ModifierOptionData = {
      id: tempId,
      groupId,
      name: t("newOptionName") || "Nueva opción",
      extraCost: 0,
      hasExtraCost: false,
      isActive: true,
      sortOrder: group.options.length,
    }

    const previous = [...groups]
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: [...g.options, optimistic] }
          : g
      )
    )

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "option",
          groupId,
          name: optimistic.name,
          extraCost: optimistic.extraCost,
          hasExtraCost: optimistic.hasExtraCost,
          sortOrder: optimistic.sortOrder,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Replace temp with real option
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                options: g.options.map((o) =>
                  o.id === tempId ? data.modifierOption : o
                ),
              }
            : g
        )
      )
      toast.success(t("optionCreated") || "Opción creada")
    } catch {
      setGroups(previous)
      toast.error(t("optionCreateError") || "Error al crear opción")
    }
  }

  // ─── Update Option ────────────────────────────────────────────────────

  const handleUpdateOption = async (
    optionId: string,
    groupId: string,
    fields: Partial<ModifierOptionData>
  ) => {
    const previous = [...groups]
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, ...fields } : o
              ),
            }
          : g
      )
    )

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "option", optionId, ...fields }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setGroups(previous)
      toast.error(t("optionUpdateError") || "Error al actualizar opción")
    }
  }

  // ─── Delete Option ────────────────────────────────────────────────────

  const handleDeleteOption = async (optionId: string, groupId: string) => {
    const previous = [...groups]
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
          : g
      )
    )

    try {
      const res = await fetch(`/api/sites/${siteId}/modifiers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "option", optionId }),
      })
      if (!res.ok) throw new Error()
      toast.success(t("optionDeleted") || "Opción eliminada")
    } catch {
      setGroups(previous)
      toast.error(t("optionDeleteError") || "Error al eliminar opción")
    }
  }

  // ─── Selection type label ─────────────────────────────────────────────

  const selectionTypeLabel = (type: SelectionType) => {
    switch (type) {
      case "single":
        return t("selectionSingle") || "Única"
      case "multiple":
        return t("selectionMultiple") || "Múltiple"
      case "quantity":
        return t("selectionQuantity") || "Cantidad"
      default:
        return type
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="size-4" />
            {t("title") || "Modificadores"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("subtitle") || "Gestiona los grupos de modificadores para tus productos"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {groups.length} {t("groups") || "grupos"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalOptions} {t("options") || "opciones"}
          </Badge>
          <Button
            size="sm"
            onClick={handleAddGroup}
            className="gap-1.5 bg-[#D4A849] hover:bg-[#C49A3D] text-white"
          >
            <Plus className="size-3.5" />
            {t("addGroup") || "Agregar grupo"}
          </Button>
        </div>
      </div>

      {/* Templates Section */}
      {templateGroups.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="size-4 text-[#D4A849]" />
              {t("templates") || "Plantillas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              {t("templatesDesc") || "Usa estas plantillas como base para crear nuevos grupos rápidamente."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templateGroups.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tpl.options.length} {t("options") || "opciones"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    disabled={duplicatingGroupId === tpl.id}
                    onClick={() => handleDuplicateGroup(tpl.id)}
                  >
                    {duplicatingGroupId === tpl.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {t("useTemplate") || "Usar"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      {nonTemplateGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Settings2 className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {t("emptyTitle") || "Sin modificadores"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("emptyDesc") || "Agrega grupos de modificadores como \"Tamaño\", \"Extras\", etc."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {nonTemplateGroups.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="rounded-lg border bg-card px-0"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Group info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {group.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {selectionTypeLabel(group.selectionType)}
                      </Badge>
                      {group.isRequired && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-[#D4A849] text-white">
                          {t("required") || "Obligatorio"}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {group.options.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick actions (stop propagation so accordion doesn't toggle) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      id={`group-active-${group.id}`}
                      checked={group.isActive}
                      onCheckedChange={(v) => {
                        if (v === false) {
                          handleUpdateGroup(group.id, { isActive: false })
                        } else {
                          handleUpdateGroup(group.id, { isActive: true })
                        }
                      }}
                      className="scale-75"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateGroup(group.id)
                      }}
                      disabled={duplicatingGroupId === group.id}
                    >
                      {duplicatingGroupId === group.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id)
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                {/* Group Settings */}
                <div className="space-y-3 mb-4 p-3 rounded-lg bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("groupSettings") || "Configuración del grupo"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <Label className="text-xs">
                        {t("groupName") || "Nombre"}
                      </Label>
                      <Input
                        value={group.name}
                        onChange={(e) =>
                          handleUpdateGroup(group.id, { name: e.target.value })
                        }
                        className="h-8 text-sm"
                        placeholder={t("groupNamePlaceholder") || "Ej: Tamaño"}
                      />
                    </div>

                    {/* Selection type */}
                    <div>
                      <Label className="text-xs">
                        {t("selectionType") || "Tipo de selección"}
                      </Label>
                      <Select
                        value={group.selectionType}
                        onValueChange={(v) =>
                          handleUpdateGroup(group.id, {
                            selectionType: v as SelectionType,
                          })
                        }
                      >
                        <SelectTrigger size="sm" className="w-full h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">
                            {t("selectionSingle") || "Única"}
                          </SelectItem>
                          <SelectItem value="multiple">
                            {t("selectionMultiple") || "Múltiple"}
                          </SelectItem>
                          <SelectItem value="quantity">
                            {t("selectionQuantity") || "Cantidad"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Required */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`group-required-${group.id}`}
                        checked={group.isRequired}
                        onCheckedChange={(v) =>
                          handleUpdateGroup(group.id, { isRequired: v })
                        }
                      />
                      <Label
                        htmlFor={`group-required-${group.id}`}
                        className="text-xs cursor-pointer"
                      >
                        {t("required") || "Obligatorio"}
                      </Label>
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`group-active-inner-${group.id}`}
                        checked={group.isActive}
                        onCheckedChange={(v) =>
                          handleUpdateGroup(group.id, { isActive: v })
                        }
                      />
                      <Label
                        htmlFor={`group-active-inner-${group.id}`}
                        className="text-xs cursor-pointer"
                      >
                        {group.isActive
                          ? (t("active") || "Activo")
                          : (t("inactive") || "Inactivo")}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Options Header */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    <DollarSign className="size-3" />
                    {t("optionsLabel") || "Opciones"}
                    <span className="text-muted-foreground">
                      ({group.options.length})
                    </span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => handleAddOption(group.id)}
                  >
                    <Plus className="size-3" />
                    {t("addOption") || "Agregar opción"}
                  </Button>
                </div>

                {/* Options List */}
                {group.options.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("noOptions") || "Sin opciones. Agrega una opción arriba."}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {group.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
                      >
                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <Input
                            value={option.name}
                            onChange={(e) =>
                              handleUpdateOption(option.id, group.id, {
                                name: e.target.value,
                              })
                            }
                            className="h-7 text-sm border-0 shadow-none focus-visible:ring-1 p-0"
                            placeholder={
                              t("optionNamePlaceholder") || "Nombre de la opción"
                            }
                          />
                        </div>

                        {/* Extra cost */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Switch
                            id={`option-hasCost-${option.id}`}
                            checked={option.hasExtraCost}
                            onCheckedChange={(v) =>
                              handleUpdateOption(option.id, group.id, {
                                hasExtraCost: v,
                                extraCost: v ? option.extraCost : 0,
                              })
                            }
                            className="scale-75"
                          />
                          <Label
                            htmlFor={`option-hasCost-${option.id}`}
                            className="text-[10px] text-muted-foreground cursor-pointer hidden sm:block"
                          >
                            ${" "}
                          </Label>
                          {option.hasExtraCost && (
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={option.extraCost}
                              onChange={(e) =>
                                handleUpdateOption(option.id, group.id, {
                                  extraCost: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="h-7 w-20 text-sm text-right"
                              placeholder="0.00"
                            />
                          )}
                        </div>

                        {/* Active toggle */}
                        <Switch
                          id={`option-active-${option.id}`}
                          checked={option.isActive}
                          onCheckedChange={(v) =>
                            handleUpdateOption(option.id, group.id, {
                              isActive: v,
                            })
                          }
                          className="scale-75"
                        />

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() =>
                            handleDeleteOption(option.id, group.id)
                          }
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
