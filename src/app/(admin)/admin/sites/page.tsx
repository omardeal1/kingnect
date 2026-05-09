"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
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
  const { t } = useTranslations("admin")

  const siteFilters = [
    { value: "all", label: t("sites.all"), icon: Globe },
    { value: "active", label: t("sites.activePlural"), icon: CheckCircle2 },
    { value: "inactive", label: t("sites.inactivePlural"), icon: XCircle },
    { value: "published", label: t("sites.publishedPlural"), icon: Eye },
    { value: "draft", label: t("sites.draftPlural"), icon: FileEdit },
  ]

  const fetchSites = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      const res = await fetch(`/api/admin/sites?${params}`)
      const data = await res.json()
      setSites(data.sites ?? [])
    } catch {
      toast.error(t("sites.errors.loadFailed"))
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
        toast.success(currentActive ? t("sites.toastSuccess.deactivated") : t("sites.toastSuccess.activated"))
        fetchSites()
      }
    } catch {
      toast.error(t("sites.errors.updateFailed"))
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
        toast.success(t("sites.toastSuccess.published"))
        fetchSites()
      }
    } catch {
      toast.error(t("sites.errors.publishFailed"))
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
        toast.success(t("sites.toastSuccess.slugUpdated"))
        setSlugEditOpen(false)
        fetchSites()
      } else {
        toast.error(data.error ?? t("sites.errors.slugUpdateFailed"))
      }
    } catch {
      toast.error(t("sites.errors.slugUpdateFailed"))
    }
  }

  const createSite = async () => {
    if (!createForm.clientId || !createForm.slug || !createForm.businessName) {
      toast.error(t("sites.errors.completeFields"))
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
        toast.success(t("sites.toastSuccess.created"))
        setCreateOpen(false)
        setCreateForm({ clientId: "", slug: "", businessName: "" })
        fetchSites()
      } else {
        toast.error(data.error ?? t("sites.errors.createFailed"))
      }
    } catch {
      toast.error(t("sites.errors.createFailed"))
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
    if (!site.isActive) return <Badge variant="destructive">{t("sites.inactive")}</Badge>
    if (!site.isPublished) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{t("sites.draft")}</Badge>
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t("sites.active")}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("sites.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("sites.subtitle")}
          </p>
        </div>
        <Button className="gold-gradient text-black font-semibold" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("sites.newQaiross")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("sites.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {siteFilters.map((f) => (
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
              {t("sites.noSites")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sites.businessName")}</TableHead>
                    <TableHead>{t("sites.slug")}</TableHead>
                    <TableHead>{t("sites.client")}</TableHead>
                    <TableHead>{t("sites.status")}</TableHead>
                    <TableHead className="text-right">{t("sites.actions")}</TableHead>
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
                            title={t("sites.edit")}
                          >
                            <a href={`/dashboard/sites/${site.id}/edit`} target="_blank" rel="noopener noreferrer">
                              <Edit className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleActive(site.id, site.isActive)}
                            title={site.isActive ? t("sites.inactive") : t("sites.active")}
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
                            title={t("sites.viewPublic")}
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
                            title={t("sites.downloadQr")}
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
                            title={t("sites.changeSlug")}
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
                              {t("sites.publish")}
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
            <DialogTitle>{t("sites.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sites.client")}</Label>
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
                  <SelectValue placeholder={t("sites.selectClient")} />
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
              <Label>{t("sites.slugLabel")}</Label>
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
              <Label>{t("sites.businessNameLabel")}</Label>
              <Input
                placeholder={t("sites.businessNameLabel")}
                value={createForm.businessName}
                onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button className="w-full gold-gradient text-black font-semibold" onClick={createSite}>
              {t("sites.createQaiross")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Slug Dialog */}
      <Dialog open={slugEditOpen} onOpenChange={setSlugEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("sites.changeSlugTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("sites.qairossLabel")}: <strong>{selectedSite?.businessName}</strong>
            </p>
            <div>
              <Label>{t("sites.newSlug")}</Label>
              <Input
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                }
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={changeSlug}>
              {t("sites.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
