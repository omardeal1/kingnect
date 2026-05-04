"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Globe,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Edit,
  QrCode,
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  FileEdit,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface SiteData {
  id: string
  slug: string
  businessName: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  client: {
    id: string
    businessName: string
    accountStatus: string
    owner: { name: string | null; email: string | null }
  }
}

interface ClientOption {
  id: string
  businessName: string
  owner: { name: string | null; email: string | null }
}

export default function AdminSitesPage() {
  const [sites, setSites] = useState<SiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [slugEditOpen, setSlugEditOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null)
  const [newSlug, setNewSlug] = useState("")
  const [clients, setClients] = useState<ClientOption[]>([])
  const [createForm, setCreateForm] = useState({ clientId: "", slug: "", businessName: "" })

  const fetchSites = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      const res = await fetch(`/api/admin/sites?${params}`)
      const data = await res.json()
      setSites(data.sites ?? [])
    } catch {
      toast.error("Error al cargar Kinecs")
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients")
      const data = await res.json()
      setClients(
        (data.clients ?? []).map((c: { id: string; businessName: string; owner: { name: string | null; email: string | null } }) => ({
          id: c.id,
          businessName: c.businessName,
          owner: c.owner,
        }))
      )
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchSites()
    fetchClients()
  }, [filter])

  const toggleActive = async (siteId: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, isActive: !currentActive }),
      })
      if (res.ok) {
        toast.success(currentActive ? "Kinec desactivada" : "Kinec activada")
        fetchSites()
      }
    } catch {
      toast.error("Error al actualizar")
    }
  }

  const publishSite = async (siteId: string) => {
    try {
      const res = await fetch("/api/admin/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, isPublished: true }),
      })
      if (res.ok) {
        toast.success("Kinec publicada")
        fetchSites()
      }
    } catch {
      toast.error("Error al publicar")
    }
  }

  const changeSlug = async () => {
    if (!selectedSite || !newSlug.trim()) return
    try {
      const res = await fetch("/api/admin/sites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: selectedSite.id, slug: newSlug.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Slug actualizado")
        setSlugEditOpen(false)
        fetchSites()
      } else {
        toast.error(data.error ?? "Error al cambiar slug")
      }
    } catch {
      toast.error("Error al cambiar slug")
    }
  }

  const createSite = async () => {
    if (!createForm.clientId || !createForm.slug || !createForm.businessName) {
      toast.error("Completa todos los campos")
      return
    }
    try {
      const res = await fetch("/api/admin/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Kinec creada")
        setCreateOpen(false)
        setCreateForm({ clientId: "", slug: "", businessName: "" })
        fetchSites()
      } else {
        toast.error(data.error ?? "Error al crear Kinec")
      }
    } catch {
      toast.error("Error al crear Kinec")
    }
  }

  const downloadQR = (slug: string) => {
    const url = `${window.location.origin}/${slug}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    const a = document.createElement("a")
    a.href = qrUrl
    a.download = `qr-${slug}.png`
    a.target = "_blank"
    a.click()
  }

  const filteredSites = sites.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.businessName.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.client.businessName.toLowerCase().includes(q)
    )
  })

  const statusBadge = (site: SiteData) => {
    if (!site.isActive) return <Badge variant="destructive">Inactiva</Badge>
    if (!site.isPublished) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Borrador</Badge>
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Activa</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kinecs</h1>
          <p className="text-muted-foreground mt-1">
            Administra todas las Kinecs de la plataforma
          </p>
        </div>
        <Button className="gold-gradient text-black font-semibold" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Kinec
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por negocio, slug, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todas", icon: Globe },
                { value: "active", label: "Activas", icon: CheckCircle2 },
                { value: "inactive", label: "Inactivas", icon: XCircle },
                { value: "published", label: "Publicadas", icon: Eye },
                { value: "draft", label: "Borrador", icon: FileEdit },
              ].map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                >
                  <f.icon className="w-4 h-4 mr-1" />
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron Kinecs
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Negocio</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">
                        {site.businessName}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-accent px-1.5 py-0.5 rounded">
                          /{site.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {site.client.businessName}
                      </TableCell>
                      <TableCell>{statusBadge(site)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="Editar"
                          >
                            <a href={`/dashboard/sites/${site.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleActive(site.id, site.isActive)}
                            title={site.isActive ? "Desactivar" : "Activar"}
                          >
                            {site.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="Ver pública"
                          >
                            <a href={`/${site.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => downloadQR(site.slug)}
                            title="Descargar QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedSite(site)
                              setNewSlug(site.slug)
                              setSlugEditOpen(true)
                            }}
                            title="Cambiar slug"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                          {!site.isPublished && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => publishSite(site.id)}
                            >
                              Publicar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Site Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Kinec</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Select
                value={createForm.clientId}
                onValueChange={(v) =>
                  setCreateForm({
                    ...createForm,
                    clientId: v,
                    businessName: clients.find((c) => c.id === v)?.businessName ?? "",
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input
                placeholder="mi-negocio"
                value={createForm.slug}
                onChange={(e) =>
                  setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nombre del negocio</Label>
              <Input
                placeholder="Nombre del negocio"
                value={createForm.businessName}
                onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button className="w-full gold-gradient text-black font-semibold" onClick={createSite}>
              Crear Kinec
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Slug Dialog */}
      <Dialog open={slugEditOpen} onOpenChange={setSlugEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Slug</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Kinec: <strong>{selectedSite?.businessName}</strong>
            </p>
            <div>
              <Label>Nuevo slug</Label>
              <Input
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                }
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={changeSlug}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
