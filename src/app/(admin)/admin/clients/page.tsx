"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Eye, Ban, CheckCircle2, StickyNote, ExternalLink,
  Loader2, ChevronLeft, ChevronRight, Plus, Edit3, Trash2,
  FileEdit, QrCode, Save, X, Users, MapPin, Building2, CreditCard,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

/* ─── Types ──────────────────────────────────────────────────────────────────── */

interface PlanData { id: string; name: string; slug: string; price: number; features?: string }

interface MiniSiteData {
  id: string; slug: string; businessName: string
  isActive: boolean; isPublished: boolean
  branches: Array<{ id: string; name: string; slug: string; isActive: boolean }>
}

interface SubscriptionData {
  id: string; status: string; trialStart: string | null
  trialEnd: string | null; currentPeriodEnd: string | null
  plan: PlanData; extraFeatures?: string | null
}

interface ClientData {
  id: string; businessName: string; contactName: string | null
  phone: string | null; whatsapp: string | null; email: string | null
  pipelineStatus: string; accountStatus: string; notes: string | null
  createdAt: string
  owner: { name: string | null; email: string | null; image: string | null }
  subscription: SubscriptionData | null
  miniSites: MiniSiteData[]
}

interface EmployeeData {
  id: string; name: string; email: string; phone: string | null
  isActive: boolean; roleId: string
  role: { id: string; name: string }
  user: { name: string; client: { id: string; businessName: string } } | null
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "blocked", label: "Bloqueado" },
  { value: "cancelled", label: "Cancelado" },
]

const ACCOUNT_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
}

const SUB_BADGE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  past_due: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const EXTRA_FEATURES = [
  "menú digital", "catálogo", "WhatsApp", "galería", "promociones",
  "reservaciones", "sucursales", "analíticas", "dominio personalizado", "sin marca",
] as const

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function AdminClientsPage() {
  /* state */
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const pageSize = 20

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<ClientData | null>(null)
  const [detailTab, setDetailTab] = useState("info")

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ businessName: "", contactName: "", phone: "", email: "" })

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ businessName: "", contactName: "", email: "", phone: "", password: "" })

  const [deleteOpen, setDeleteOpen] = useState(false)

  const [plans, setPlans] = useState<PlanData[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState("")

  const [employees, setEmployees] = useState<EmployeeData[]>([])

  const [newNote, setNewNote] = useState("")

  const [extraFeatures, setExtraFeatures] = useState<string[]>([])
  const [savingFeatures, setSavingFeatures] = useState(false)

  /* derived */
  const paginated = clients.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(clients.length / pageSize)
  const clientEmployees = employees.filter((e) => e.user?.client.id === selected?.id)

  const parsedNotes = useCallback(
    (notes: string | null) => {
      if (!notes) return []
      try { return JSON.parse(notes) as Array<{ text: string; addedBy: string; addedAt: string }> }
      catch { return [] }
    }, []
  )

  /* API calls */
  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/admin/clients?${params}`)
      const data = await res.json()
      setClients(data.clients ?? [])
    } catch { toast.error("Error al cargar clientes") }
    finally { setLoading(false) }
  }, [search, statusFilter])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      setPlans(data.plans ?? [])
    } catch { /* silent */ }
  }, [])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/employees?limit=999")
      const data = await res.json()
      setEmployees(data.employees ?? [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchClients(); fetchPlans(); fetchEmployees() }, [fetchClients, fetchPlans, fetchEmployees])

  /* handlers */
  const openDetail = (c: ClientData) => {
    setSelected(c)
    setDetailOpen(true)
    setDetailTab("info")
    setEditMode(false)
    setEditForm({ businessName: c.businessName, contactName: c.contactName ?? "", phone: c.phone ?? "", email: c.email ?? "" })
    setSelectedPlanId(c.subscription?.plan?.id ?? "")
    setNewNote("")
    try { setExtraFeatures(c.subscription?.extraFeatures ? JSON.parse(c.subscription.extraFeatures) : []) }
    catch { setExtraFeatures([]) }
  }

  const refreshSelected = () => fetchClients().then(() => {
    const fresh = clients.find((c) => c.id === selected?.id)
    if (fresh) setSelected(fresh)
  })

  const updateStatus = async (clientId: string, accountStatus: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, accountStatus }),
      })
      if (res.ok) {
        toast.success(accountStatus === "blocked" ? "Cliente bloqueado" : "Cliente reactivado")
        fetchClients()
        if (selected?.id === clientId) setSelected({ ...selected, accountStatus })
      }
    } catch { toast.error("Error al actualizar estado") }
  }

  const saveEdit = async () => {
    if (!selected) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected.id, ...editForm }),
      })
      if (res.ok) { toast.success("Cliente actualizado"); setEditMode(false); fetchClients(); refreshSelected() }
    } catch { toast.error("Error al guardar cambios") }
  }

  const changePlan = async () => {
    if (!selected?.subscription || !selectedPlanId) return
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: selected.subscription.id, planId: selectedPlanId }),
      })
      if (res.ok) { toast.success("Plan actualizado"); fetchClients(); refreshSelected() }
    } catch { toast.error("Error al cambiar plan") }
  }

  const addNote = async () => {
    if (!selected || !newNote.trim()) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected.id, note: newNote }),
      })
      if (res.ok) { toast.success("Nota agregada"); setNewNote(""); fetchClients(); refreshSelected() }
    } catch { toast.error("Error al agregar nota") }
  }

  const createClient = async () => {
    const { businessName, email, password } = createForm
    if (!businessName || !email || !password) { toast.error("Completa todos los campos requeridos"); return }
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (res.ok) {
        toast.success("Cliente creado exitosamente")
        setCreateOpen(false)
        setCreateForm({ businessName: "", contactName: "", email: "", phone: "", password: "" })
        fetchClients()
      } else {
        const d = await res.json()
        toast.error(d.error ?? "Error al crear cliente")
      }
    } catch { toast.error("Error al crear cliente") }
  }

  const deleteClient = async () => {
    if (!selected) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selected.id }),
      })
      if (res.ok) {
        toast.success("Cliente eliminado"); setDeleteOpen(false); setDetailOpen(false); fetchClients()
      } else { toast.error("Error al eliminar cliente") }
    } catch { toast.error("Error al eliminar cliente") }
  }

  const saveExtraFeatures = async () => {
    if (!selected?.subscription) return
    setSavingFeatures(true)
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: selected.subscription.id, extraFeatures: JSON.stringify(extraFeatures) }),
      })
      if (res.ok) { toast.success("Funciones extra guardadas"); fetchClients(); refreshSelected() }
    } catch { toast.error("Error al guardar funciones extra") }
    finally { setSavingFeatures(false) }
  }

  const downloadQR = (slug: string) => {
    const url = `${window.location.origin}/${slug}`
    const a = document.createElement("a")
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    a.download = `qr-${slug}.png`; a.target = "_blank"; a.click()
  }

  const siteStatusBadge = (site: MiniSiteData) => {
    if (!site.isActive) return <Badge variant="destructive">Inactiva</Badge>
    if (!site.isPublished) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Borrador</Badge>
    return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Publicada</Badge>
  }

  /* ─── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Clientes &amp; QAIROSS</h1>
          <p className="text-muted-foreground mt-1">Gestiona clientes, sitios, sucursales y empleados desde un solo lugar</p>
        </div>
        <Button className="gold-gradient text-black font-semibold" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Agregar Cliente
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, negocio, teléfono, email..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <Button key={f.value} variant={statusFilter === f.value ? "default" : "outline"} size="sm"
                  onClick={() => { setStatusFilter(f.value); setPage(0) }}>{f.label}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No se encontraron clientes</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negocio</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">QAIROSS</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((c) => {
                      const acc = ACCOUNT_BADGE[c.accountStatus] ?? ACCOUNT_BADGE.active
                      const subSt = c.subscription?.status ?? "inactive"
                      return (
                        <TableRow key={c.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => openDetail(c)}>
                          <TableCell className="font-medium">{c.businessName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{c.contactName ?? "—"}</p>
                              <p className="text-xs text-muted-foreground">{c.email ?? c.owner.email ?? ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{c.subscription?.plan?.name ?? "Sin plan"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={acc.variant} className="text-xs w-fit">{acc.label}</Badge>
                              {c.subscription && (
                                <Badge variant="outline" className={`text-xs w-fit ${SUB_BADGE[subSt] ?? ""}`}>
                                  {subSt === "active" ? "Activa" : subSt === "trial" ? "Trial" : subSt === "past_due" ? "Vencida" : "Inactiva"}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs">{c.miniSites.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(c)} title="Ver detalle">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {c.accountStatus === "active" ? (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                                  onClick={() => updateStatus(c.id, "blocked")} title="Bloquear">
                                  <Ban className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600"
                                  onClick={() => updateStatus(c.id, "active")} title="Reactivar">
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">{clients.length} clientes · Página {page + 1} de {totalPages}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ════════════ Detail Dialog ════════════ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                {selected?.businessName}
                {selected && <Badge variant={ACCOUNT_BADGE[selected.accountStatus]?.variant ?? "default"}>
                  {ACCOUNT_BADGE[selected.accountStatus]?.label ?? selected.accountStatus}</Badge>}
              </DialogTitle>
              <div className="flex gap-1">
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}><Edit3 className="w-3.5 h-3.5 mr-1" />Editar</Button>
                )}
                {selected?.accountStatus === "active" ? (
                  <Button variant="destructive" size="sm" onClick={() => updateStatus(selected.id, "blocked")}><Ban className="w-3.5 h-3.5 mr-1" />Bloquear</Button>
                ) : (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatus(selected!.id, "active")}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Reactivar</Button>
                )}
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeleteOpen(true)} title="Eliminar cliente">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selected && (
            <div className="px-6 pb-6">
              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="info" className="text-xs sm:text-sm gap-1"><Building2 className="w-3.5 h-3.5 hidden sm:block" />Info</TabsTrigger>
                  <TabsTrigger value="sites" className="text-xs sm:text-sm gap-1"><FileEdit className="w-3.5 h-3.5 hidden sm:block" />QAIROSS</TabsTrigger>
                  <TabsTrigger value="branches" className="text-xs sm:text-sm gap-1"><MapPin className="w-3.5 h-3.5 hidden sm:block" />Sucursales</TabsTrigger>
                  <TabsTrigger value="employees" className="text-xs sm:text-sm gap-1"><Users className="w-3.5 h-3.5 hidden sm:block" />Empleados</TabsTrigger>
                  <TabsTrigger value="plan" className="text-xs sm:text-sm gap-1"><CreditCard className="w-3.5 h-3.5 hidden sm:block" />Plan</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs sm:text-sm gap-1"><StickyNote className="w-3.5 h-3.5 hidden sm:block" />Notas</TabsTrigger>
                </TabsList>

                {/* ── Tab 1: Info del Cliente ── */}
                <TabsContent value="info" className="mt-4 space-y-4">
                  {editMode ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="text-xs text-muted-foreground">Negocio</label>
                          <Input value={editForm.businessName} onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })} className="mt-1" /></div>
                        <div><label className="text-xs text-muted-foreground">Contacto</label>
                          <Input value={editForm.contactName} onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })} className="mt-1" /></div>
                        <div><label className="text-xs text-muted-foreground">Email</label>
                          <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1" /></div>
                        <div><label className="text-xs text-muted-foreground">Teléfono</label>
                          <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="mt-1" /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1" />Guardar</Button>
                        <Button variant="outline" size="sm" onClick={() => setEditMode(false)}><X className="w-4 h-4 mr-1" />Cancelar</Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ["Negocio", selected.businessName],
                        ["Contacto", selected.contactName],
                        ["Email", selected.email ?? selected.owner.email],
                        ["Teléfono", selected.phone],
                        ["WhatsApp", selected.whatsapp],
                        ["Pipeline", selected.pipelineStatus],
                        ["Registrado", new Date(selected.createdAt).toLocaleDateString("es-MX")],
                        ["Cuenta owner", selected.owner.email],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium">{val ?? "—"}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                {/* ── Tab 2: QAIROSS (Sitios) ── */}
                <TabsContent value="sites" className="mt-4">
                  {selected.miniSites.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin sitios QAIROSS</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Sitio</TableHead><TableHead>Slug</TableHead><TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {selected.miniSites.map((site) => (
                            <TableRow key={site.id}>
                              <TableCell className="font-medium">{site.businessName}</TableCell>
                              <TableCell><code className="text-xs bg-accent px-1.5 py-0.5 rounded">/{site.slug}</code></TableCell>
                              <TableCell>{siteStatusBadge(site)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Abrir Editor">
                                    <a href={`/dashboard/sites/${site.id}/edit`} target="_blank" rel="noopener noreferrer"><Edit3 className="w-4 h-4" /></a>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver Sitio">
                                    <a href={`/${site.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadQR(site.slug)} title="QR">
                                    <QrCode className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                {/* ── Tab 3: Sucursales ── */}
                <TabsContent value="branches" className="mt-4">
                  {(() => {
                    const allBranches = selected.miniSites.flatMap((s) =>
                      s.branches.map((b) => ({ ...b, siteName: s.businessName }))
                    )
                    if (allBranches.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">Sin sucursales</p>
                    return (
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader><TableRow>
                            <TableHead>Sucursal</TableHead><TableHead>Sitio</TableHead><TableHead>Estado</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {allBranches.map((b) => (
                              <TableRow key={b.id}>
                                <TableCell className="font-medium">{b.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{b.siteName}</TableCell>
                                <TableCell>
                                  <Badge variant={b.isActive ? "default" : "secondary"} className="text-xs">
                                    {b.isActive ? "Activa" : "Inactiva"}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  })()}
                </TabsContent>

                {/* ── Tab 4: Empleados ── */}
                <TabsContent value="employees" className="mt-4">
                  {clientEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin empleados registrados</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {clientEmployees.map((emp) => (
                            <TableRow key={emp.id}>
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell className="text-sm">{emp.email}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{emp.role?.name ?? "—"}</Badge></TableCell>
                              <TableCell>
                                <Badge variant={emp.isActive ? "default" : "secondary"} className="text-xs">
                                  {emp.isActive ? "Activo" : "Inactivo"}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={async () => {
                                    try {
                                      await fetch("/api/admin/employees", {
                                        method: "PUT", headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ employeeId: emp.id, isActive: !emp.isActive }),
                                      })
                                      toast.success("Estado actualizado"); fetchEmployees()
                                    } catch { toast.error("Error al actualizar") }
                                  }}>{emp.isActive ? "Desactivar" : "Activar"}</Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => {
                                    try {
                                      await fetch(`/api/admin/employees?employeeId=${emp.id}`, { method: "DELETE" })
                                      toast.success("Empleado eliminado"); fetchEmployees()
                                    } catch { toast.error("Error al eliminar") }
                                  }}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                {/* ── Tab 5: Plan / Funciones Extra ── */}
                <TabsContent value="plan" className="mt-4 space-y-6">
                  {selected.subscription ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-xs text-muted-foreground">Plan actual</p>
                          <p className="text-sm font-semibold">{selected.subscription.plan.name} — ${selected.subscription.plan.price}</p></div>
                        <div><p className="text-xs text-muted-foreground">Estado suscripción</p>
                          <Badge variant="outline" className={`mt-1 ${SUB_BADGE[selected.subscription.status] ?? ""}`}>
                            {selected.subscription.status === "active" ? "Activa" : selected.subscription.status === "trial" ? "Trial" : selected.subscription.status}</Badge></div>
                        {selected.subscription.currentPeriodEnd && (
                          <div><p className="text-xs text-muted-foreground">Período fin</p>
                            <p className="text-sm">{new Date(selected.subscription.currentPeriodEnd).toLocaleDateString("es-MX")}</p></div>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-2">Cambiar plan</p>
                        <div className="flex items-end gap-2 flex-wrap">
                          <div className="flex-1 min-w-[180px]">
                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                              <SelectTrigger><SelectValue placeholder="Seleccionar plan" /></SelectTrigger>
                              <SelectContent>
                                {plans.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} — ${p.price}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button size="sm" onClick={changePlan} disabled={!selectedPlanId || selectedPlanId === selected.subscription.plan.id}>
                            Cambiar</Button>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-3">Funciones Extra</p>
                        <p className="text-xs text-muted-foreground mb-3">Habilita funciones adicionales más allá del plan actual del cliente.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {EXTRA_FEATURES.map((feat) => (
                            <label key={feat} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded-md p-2 transition-colors">
                              <Checkbox checked={extraFeatures.includes(feat)}
                                onCheckedChange={(checked) => setExtraFeatures(
                                  checked ? [...extraFeatures, feat] : extraFeatures.filter((f) => f !== feat)
                                )} />
                              <span className="capitalize">{feat}</span>
                            </label>
                          ))}
                        </div>
                        <Button size="sm" className="mt-4" onClick={saveExtraFeatures} disabled={savingFeatures}>
                          {savingFeatures ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                          Guardar funciones
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Este cliente no tiene suscripción.</p>
                  )}
                </TabsContent>

                {/* ── Tab 6: Notas ── */}
                <TabsContent value="notes" className="mt-4 space-y-4">
                  <AnimatePresence>
                    {parsedNotes(selected.notes).map((n, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3 bg-accent rounded-lg">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.addedBy} · {new Date(n.addedAt).toLocaleDateString("es-MX")}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {parsedNotes(selected.notes).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Sin notas</p>
                  )}
                  <div className="flex gap-2">
                    <Textarea placeholder="Agregar nota..." value={newNote} onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px]" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote() } }} />
                    <Button size="sm" onClick={addNote} disabled={!newNote.trim()}><StickyNote className="w-4 h-4" /></Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════ Create Client Dialog ════════════ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Agregar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Nombre del negocio *</label>
              <Input value={createForm.businessName} onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Nombre de contacto</label>
              <Input value={createForm.contactName} onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Email *</label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Teléfono</label>
              <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Contraseña temporal *</label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="mt-1" /></div>
            <Button className="w-full gold-gradient text-black font-semibold" onClick={createClient}>Crear Cliente</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════ Delete Confirmation ════════════ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al cliente <strong>{selected?.businessName}</strong>, su usuario asociado, suscripciones y todos los sitios QAIROSS. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteClient}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
