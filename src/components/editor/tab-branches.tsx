"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  MapPin,
  Phone,
  Globe,
  Loader2,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useEditorStore, type BranchData } from "@/lib/editor-store"
import { useTranslations } from "@/i18n/provider"

interface TabBranchesProps {
  siteId: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function TabBranches({ siteId }: TabBranchesProps) {
  const site = useEditorStore((s) => s.site)
  const addBranch = useEditorStore((s) => s.addBranch)
  const updateBranch = useEditorStore((s) => s.updateBranch)
  const removeBranch = useEditorStore((s) => s.removeBranch)
  const { t } = useTranslations("branches")

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [addingNew, setAddingNew] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Form state
  const [formName, setFormName] = React.useState("")
  const [formSlug, setFormSlug] = React.useState("")
  const [formSlugEdited, setFormSlugEdited] = React.useState(false)
  const [formDescription, setFormDescription] = React.useState("")
  const [formPhone, setFormPhone] = React.useState("")
  const [formWhatsapp, setFormWhatsapp] = React.useState("")
  const [formEmail, setFormEmail] = React.useState("")
  const [formWebsite, setFormWebsite] = React.useState("")
  const [formState, setFormState] = React.useState("")
  const [formCity, setFormCity] = React.useState("")
  const [formAddress, setFormAddress] = React.useState("")
  const [formMapsUrl, setFormMapsUrl] = React.useState("")
  const [formCoverUrl, setFormCoverUrl] = React.useState("")
  const [formIsActive, setFormIsActive] = React.useState(true)
  const [formIsPublished, setFormIsPublished] = React.useState(false)

  const branches = site?.branches ?? []

  // Auto-slug from name when adding new
  React.useEffect(() => {
    if (addingNew && !formSlugEdited && formName.trim()) {
      setFormSlug(slugify(formName.trim()))
    }
  }, [formName, addingNew, formSlugEdited])

  if (!site) return null

  const resetForm = () => {
    setFormName("")
    setFormSlug("")
    setFormSlugEdited(false)
    setFormDescription("")
    setFormPhone("")
    setFormWhatsapp("")
    setFormEmail("")
    setFormWebsite("")
    setFormState("")
    setFormCity("")
    setFormAddress("")
    setFormMapsUrl("")
    setFormCoverUrl("")
    setFormIsActive(true)
    setFormIsPublished(false)
  }

  const startEdit = (branch: BranchData) => {
    setEditingId(branch.id)
    setAddingNew(false)
    setExpandedId(branch.id)
    setFormName(branch.name)
    setFormSlug(branch.slug)
    setFormSlugEdited(true)
    setFormDescription(branch.description ?? "")
    setFormPhone(branch.phone ?? "")
    setFormWhatsapp(branch.whatsapp ?? "")
    setFormEmail(branch.email ?? "")
    setFormWebsite(branch.website ?? "")
    setFormState(branch.state ?? "")
    setFormCity(branch.city ?? "")
    setFormAddress(branch.address ?? "")
    setFormMapsUrl(branch.mapsUrl ?? "")
    setFormCoverUrl(branch.coverUrl ?? "")
    setFormIsActive(branch.isActive)
    setFormIsPublished(branch.isPublished)
  }

  const startAdd = () => {
    setAddingNew(true)
    setEditingId(null)
    setExpandedId(null)
    resetForm()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setAddingNew(false)
    resetForm()
  }

  const getFormData = () => ({
    name: formName.trim(),
    slug: formSlug.trim(),
    description: formDescription.trim() || null,
    phone: formPhone.trim() || null,
    whatsapp: formWhatsapp.trim() || null,
    email: formEmail.trim() || null,
    website: formWebsite.trim() || null,
    state: formState.trim() || null,
    city: formCity.trim() || null,
    address: formAddress.trim() || null,
    mapsUrl: formMapsUrl.trim() || null,
    coverUrl: formCoverUrl.trim() || null,
    isActive: formIsActive,
    isPublished: formIsPublished,
  })

  const handleAdd = async () => {
    if (!formName.trim()) {
      toast.error(t("config.branchName") || "El nombre es obligatorio")
      return
    }
    if (!formSlug.trim()) {
      toast.error("El slug es obligatorio")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getFormData()),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al crear sucursal")
      }
      const data = await res.json()
      addBranch({
        ...data.branch,
        createdAt: new Date(data.branch.createdAt).toISOString(),
        updatedAt: new Date(data.branch.updatedAt).toISOString(),
        socialLinks: data.branch.socialLinks || "{}",
        themeOverrides: data.branch.themeOverrides || "{}",
        hours: data.branch.hours || "{}",
        buttonStyle: data.branch.buttonStyle || "cylinder_pill",
        modifiersEnabled: data.branch.modifiersEnabled || false,
        showQairossBrand: data.branch.showQairossBrand !== false,
        logoUrl: data.branch.logoUrl,
        latitude: data.branch.latitude,
        longitude: data.branch.longitude,
      })
      toast.success("Sucursal agregada correctamente")
      setAddingNew(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al agregar sucursal")
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editingId) return
    if (!formName.trim()) {
      toast.error(t("config.branchName") || "El nombre es obligatorio")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/branches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: editingId, ...getFormData() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar sucursal")
      }
      updateBranch(editingId, getFormData())
      toast.success("Sucursal actualizada correctamente")
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar sucursal")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (branchId: string) => {
    try {
      const res = await fetch(
        `/api/sites/${siteId}/branches?branchId=${branchId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Error al eliminar")
      removeBranch(branchId)
      toast.success("Sucursal eliminada correctamente")
      if (editingId === branchId) setEditingId(null)
      if (expandedId === branchId) setExpandedId(null)
    } catch {
      toast.error("Error al eliminar sucursal")
    }
  }

  const handleToggleActive = async (branch: BranchData) => {
    const newActive = !branch.isActive
    updateBranch(branch.id, { isActive: newActive })
    try {
      await fetch(`/api/sites/${siteId}/branches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: branch.id, isActive: newActive }),
      })
    } catch {
      toast.error("Error al actualizar sucursal")
      updateBranch(branch.id, { isActive: !newActive })
    }
  }

  const handleTogglePublished = async (branch: BranchData) => {
    const newPublished = !branch.isPublished
    updateBranch(branch.id, { isPublished: newPublished })
    try {
      await fetch(`/api/sites/${siteId}/branches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: branch.id, isPublished: newPublished }),
      })
    } catch {
      toast.error("Error al actualizar sucursal")
      updateBranch(branch.id, { isPublished: !newPublished })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-[#D4A849]" />
            {t("config.title") || "Sucursales"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {branches.length === 0 && !addingNew && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay sucursales configuradas. Agrega tu primera sucursal para
              que cada ubicación tenga su propia página.
            </p>
          )}

          {/* Branch cards */}
          {branches.map((branch) => (
            <div key={branch.id}>
              {editingId === branch.id ? (
                /* ─── Edit form ─── */
                <div className="space-y-3 rounded-lg border-2 border-[#D4A849]/30 p-4 bg-[#D4A849]/5">
                  <p className="text-sm font-medium text-[#D4A849]">
                    Editando: {branch.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.branchName") || "Nombre"} *
                      </Label>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nombre de la sucursal"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.slug") || "Slug (URL)"} *
                      </Label>
                      <Input
                        value={formSlug}
                        onChange={(e) => {
                          setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                          setFormSlugEdited(true)
                        }}
                        placeholder="sucursal-centro"
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Descripción</Label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Breve descripción de la sucursal..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Phone className="size-3" /> {t("config.phone") || "Teléfono"}
                      </Label>
                      <Input
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+52 555 123 4567"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.whatsapp") || "WhatsApp"}
                      </Label>
                      <Input
                        value={formWhatsapp}
                        onChange={(e) => setFormWhatsapp(e.target.value)}
                        placeholder="+52 555 123 4567"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Mail className="size-3" /> {t("config.email") || "Correo"}
                      </Label>
                      <Input
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="sucursal@email.com"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Globe className="size-3" /> {t("config.website") || "Sitio web"}
                      </Label>
                      <Input
                        value={formWebsite}
                        onChange={(e) => setFormWebsite(e.target.value)}
                        placeholder="https://www.ejemplo.com"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.state") || "Estado"}
                      </Label>
                      <Input
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        placeholder="Jalisco"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.city") || "Ciudad"}
                      </Label>
                      <Input
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Guadalajara"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <MapPin className="size-3" /> {t("config.address") || "Dirección"}
                    </Label>
                    <Input
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Av. Chapultepec 123, Col. Centro"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <MapPin className="size-3" /> Google Maps URL
                      </Label>
                      <Input
                        value={formMapsUrl}
                        onChange={(e) => setFormMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t("config.cover") || "Imagen de portada"} URL
                      </Label>
                      <Input
                        value={formCoverUrl}
                        onChange={(e) => setFormCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formIsActive}
                        onCheckedChange={setFormIsActive}
                      />
                      <Label className="text-xs">
                        {t("config.active") || "Activa"}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formIsPublished}
                        onCheckedChange={setFormIsPublished}
                      />
                      <Label className="text-xs">
                        {t("config.published") || "Publicada"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin mr-1" />
                      ) : (
                        <Check className="size-4 mr-1" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      <X className="size-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                /* ─── Display card ─── */
                <Collapsible
                  open={expandedId === branch.id}
                  onOpenChange={(open) =>
                    setExpandedId(open ? branch.id : null)
                  }
                >
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <GitBranch className="size-4 text-[#D4A849] shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {branch.name}
                        </span>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {branch.slug}
                        </code>
                      </div>
                      {(branch.city || branch.state) && (
                        <p className="text-xs text-muted-foreground ml-6">
                          <MapPin className="size-3 inline mr-1" />
                          {[branch.city, branch.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {branch.phone && (
                        <p className="text-xs text-muted-foreground ml-6">
                          <Phone className="size-3 inline mr-1" />
                          {branch.phone}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 ml-6 mt-1">
                        <Badge
                          variant={branch.isActive ? "default" : "secondary"}
                          className={`text-[10px] px-1.5 py-0 ${
                            branch.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {branch.isActive
                            ? (t("config.active") || "Activa")
                            : "Inactiva"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${
                            branch.isPublished
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {branch.isPublished
                            ? (t("config.published") || "Publicada")
                            : "Borrador"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          {expandedId === branch.id ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => startEdit(branch)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => handleDelete(branch.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <CollapsibleContent>
                    <div className="mt-2 ml-6 space-y-1 text-xs text-muted-foreground">
                      {branch.address && (
                        <p>
                          <MapPin className="size-3 inline mr-1" />
                          {branch.address}
                        </p>
                      )}
                      {branch.email && (
                        <p>
                          <Mail className="size-3 inline mr-1" />
                          {branch.email}
                        </p>
                      )}
                      {branch.website && (
                        <p>
                          <Globe className="size-3 inline mr-1" />
                          {branch.website}
                        </p>
                      )}
                      {branch.whatsapp && (
                        <p>
                          <Phone className="size-3 inline mr-1" />
                          WhatsApp: {branch.whatsapp}
                        </p>
                      )}
                      {branch.mapsUrl && (
                        <p className="truncate">
                          <ExternalLink className="size-3 inline mr-1" />
                          <a
                            href={branch.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#D4A849] hover:underline"
                          >
                            Ver en Google Maps
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Quick toggles */}
                    <div className="mt-3 ml-6 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={branch.isActive}
                          onCheckedChange={() => handleToggleActive(branch)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t("config.active") || "Activa"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={branch.isPublished}
                          onCheckedChange={() => handleTogglePublished(branch)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t("config.published") || "Publicada"}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ))}

          {/* ─── Add new form ─── */}
          {addingNew && (
            <div className="space-y-3 rounded-lg border-2 border-dashed border-[#D4A849]/30 p-4 bg-[#D4A849]/5">
              <p className="text-sm font-medium text-[#D4A849]">
                {t("config.addBranch") || "Nueva sucursal"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.branchName") || "Nombre"} *
                  </Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nombre de la sucursal"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.slug") || "Slug (URL)"} *
                  </Label>
                  <Input
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                      setFormSlugEdited(true)
                    }}
                    placeholder="sucursal-centro"
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descripción</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Breve descripción de la sucursal..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Phone className="size-3" /> {t("config.phone") || "Teléfono"}
                  </Label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+52 555 123 4567"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.whatsapp") || "WhatsApp"}
                  </Label>
                  <Input
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="+52 555 123 4567"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Mail className="size-3" /> {t("config.email") || "Correo"}
                  </Label>
                  <Input
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="sucursal@email.com"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Globe className="size-3" /> {t("config.website") || "Sitio web"}
                  </Label>
                  <Input
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://www.ejemplo.com"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.state") || "Estado"}
                  </Label>
                  <Input
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="Jalisco"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.city") || "Ciudad"}
                  </Label>
                  <Input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Guadalajara"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <MapPin className="size-3" /> {t("config.address") || "Dirección"}
                </Label>
                <Input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Av. Chapultepec 123, Col. Centro"
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <MapPin className="size-3" /> Google Maps URL
                  </Label>
                  <Input
                    value={formMapsUrl}
                    onChange={(e) => setFormMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {t("config.cover") || "Imagen de portada"} URL
                  </Label>
                  <Input
                    value={formCoverUrl}
                    onChange={(e) => setFormCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formIsActive}
                    onCheckedChange={setFormIsActive}
                  />
                  <Label className="text-xs">
                    {t("config.active") || "Activa"}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formIsPublished}
                    onCheckedChange={setFormIsPublished}
                  />
                  <Label className="text-xs">
                    {t("config.published") || "Publicada"}
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={saving}>
                  {saving ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : (
                    <Check className="size-4 mr-1" />
                  )}
                  {t("config.addBranch") || "Agregar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="size-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Add button */}
          {!addingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={startAdd}
              className="w-full"
            >
              <Plus className="size-4 mr-2" />
              {t("config.addBranch") || "Agregar sucursal"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
