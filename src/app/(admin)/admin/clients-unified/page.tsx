"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Eye,
  Ban,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Users,
  Globe,
  GitBranch,
  CreditCard,
  StickyNote,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  Building2,
  Phone,
  Mail,
  Sparkles,
  Save,
  Info,
  Zap,
  Lock,
  Unlock,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { type FeatureKey, FEATURE_DEFINITIONS, parsePlanFeatures, getEffectiveFeatures, CATEGORY_LABELS, parseExtraFeatures as parseExtraFeaturesLib } from "@/lib/plan-features"

// ── Types ────────────────────────────────────────────────────────────────────────

interface ClientMiniSite {
  id: string
  slug: string
  businessName: string
  isActive: boolean
  isPublished: boolean
  branches?: Array<{ id: string; name: string; slug: string; isActive: boolean }>
}

interface ClientData {
  id: string
  businessName: string
  contactName: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  pipelineStatus: string
  accountStatus: string
  notes: string | null
  canControlBranding: boolean
  createdAt: string
  owner: { id: string; name: string | null; email: string | null; image: string | null }
  subscription: {
    id: string
    status: string
    trialStart: string | null
    trialEnd: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    extraFeatures: string
    customLimits: string
    plan: { id: string; name: string; slug: string; price: number; features: string }
  } | null
  miniSites: ClientMiniSite[]
}

interface PlanOption {
  id: string
  name: string
  slug: string
  price: number
}

// ── Constants ────────────────────────────────────────────────────────────────────

const CUSTOM_LIMIT_DEFAULTS: Record<string, number> = {
  maxCategories: 10,
  maxProducts: 100,
  maxBranches: 3,
  dailyAiLimit: 50,
}

const CUSTOM_LIMIT_LABELS: Record<string, string> = {
  maxCategories: "Máx. Categorías",
  maxProducts: "Máx. Productos",
  maxBranches: "Máx. Sucursales",
  dailyAiLimit: "Límite Diario IA",
}

const statusBadgeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
}

const subscriptionBadgeMap: Record<string, { label: string; className: string }> = {
  active: { label: "Activa", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  trial: { label: "Prueba", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  inactive: { label: "Inactiva", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  past_due: { label: "Vencida", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  cancelled: { label: "Cancelada", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
}

const pipelineLabel: Record<string, string> = {
  lead: "Lead",
  contacted: "Contactado",
  demo: "Demo",
  active: "Activo",
  churned: "Perdido",
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

// ── Component ────────────────────────────────────────────────────────────────────

export default function ClientsUnifiedPage() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 15

  // Plans
  const [plans, setPlans] = useState<PlanOption[]>([])

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)

  // Create form
  const [createForm, setCreateForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    password: "",
  })

  // Edit form
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    whatsapp: "",
    email: "",
    pipelineStatus: "",
  })

  // Notes
  const [newNote, setNewNote] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState("")

  // Extra features
  const [extraFeatures, setExtraFeatures] = useState<string[]>([])

  // Custom limits
  const [customLimits, setCustomLimits] = useState<Record<string, number>>({})

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/admin/clients?${params}`)
      const data = await res.json()
      setClients(data.clients ?? [])
    } catch {
      toast.error("Error al cargar clientes")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      setPlans(data.plans ?? [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchClients()
    fetchPlans()
  }, [fetchClients, fetchPlans])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const parseNotes = (notes: string | null) => {
    if (!notes) return []
    try {
      return JSON.parse(notes)
    } catch {
      return []
    }
  }

  const parseExtraFeatures = (features: string) => {
    try {
      return JSON.parse(features || "[]")
    } catch {
      return []
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm({ businessName: "", contactName: "", phone: "", email: "", password: "" })
    setCreateOpen(true)
  }

  const openEdit = (client: ClientData) => {
    setSelectedClient(client)
    setEditForm({
      businessName: client.businessName,
      contactName: client.contactName ?? "",
      phone: client.phone ?? "",
      whatsapp: client.whatsapp ?? "",
      email: client.email ?? "",
      pipelineStatus: client.pipelineStatus,
    })
    setEditOpen(true)
  }

  const openDelete = (client: ClientData) => {
    setSelectedClient(client)
    setDeleteOpen(true)
  }

  const toggleExpand = (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null)
    } else {
      setExpandedClientId(clientId)
      const client = clients.find((c) => c.id === clientId)
      if (client) {
        setSelectedClient(client)
        setSelectedPlanId(client.subscription?.plan?.id ?? "")
        setExtraFeatures(client.subscription?.extraFeatures ? parseExtraFeatures(client.subscription.extraFeatures) : [])
        try { setCustomLimits(client.subscription?.customLimits ? JSON.parse(client.subscription.customLimits) : {}) } catch { setCustomLimits({}) }
      }
    }
  }

  const handleCreateClient = async () => {
    if (!createForm.businessName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error("Nombre de negocio, email y contraseña son requeridos")
      return
    }
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (res.ok) {
        toast.success("Cliente creado exitosamente")
        setCreateOpen(false)
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al crear cliente")
      }
    } catch {
      toast.error("Error al crear cliente")
    }
  }

  const handleEditClient = async () => {
    if (!selectedClient) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          businessName: editForm.businessName,
          contactName: editForm.contactName,
          phone: editForm.phone,
          whatsapp: editForm.whatsapp,
          email: editForm.email,
          pipelineStatus: editForm.pipelineStatus,
        }),
      })
      if (res.ok) {
        toast.success("Cliente actualizado")
        setEditOpen(false)
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al actualizar")
      }
    } catch {
      toast.error("Error al actualizar cliente")
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id }),
      })
      if (res.ok) {
        toast.success("Cliente eliminado")
        setDeleteOpen(false)
        setSelectedClient(null)
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al eliminar")
      }
    } catch {
      toast.error("Error al eliminar cliente")
    }
  }

  const updateClientStatus = async (clientId: string, accountStatus: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, accountStatus }),
      })
      if (res.ok) {
        toast.success(accountStatus === "blocked" ? "Cliente bloqueado" : "Cliente reactivado")
        fetchClients()
      }
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  const changePlan = async (clientId: string, planId: string) => {
    try {
      const sub = clients.find((c) => c.id === clientId)?.subscription
      if (!sub) {
        toast.error("El cliente no tiene suscripción")
        return
      }
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: sub.id, planId }),
      })
      if (res.ok) {
        toast.success("Plan cambiado exitosamente")
        fetchClients()
      }
    } catch {
      toast.error("Error al cambiar plan")
    }
  }

  const addNote = async () => {
    if (!selectedClient || !newNote.trim()) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, note: newNote }),
      })
      if (res.ok) {
        toast.success("Nota agregada")
        setNewNote("")
        fetchClients()
      }
    } catch {
      toast.error("Error al agregar nota")
    }
  }

  const saveExtraFeatures = async () => {
    if (!selectedClient?.subscription) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          subscriptionId: selectedClient.subscription.id,
          extraFeatures: JSON.stringify(extraFeatures),
        }),
      })
      if (res.ok) {
        toast.success("Funciones extra actualizadas")
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al guardar")
      }
    } catch {
      toast.error("Error al guardar funciones extra")
    }
  }

  const createSubscriptionForClient = async (clientId: string, planId: string) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createSubscription: true, clientId, planId }),
      })
      if (res.ok) {
        toast.success("Suscripción creada exitosamente")
        fetchClients()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al crear suscripción")
      }
    } catch {
      toast.error("Error al crear suscripción")
    }
  }

  const saveCustomLimits = async () => {
    if (!selectedClient?.subscription) return
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: selectedClient.subscription.id,
          customLimits: JSON.stringify(customLimits),
        }),
      })
      if (res.ok) {
        toast.success("Límites personalizados guardados")
        fetchClients()
      } else {
        toast.error("Error al guardar límites")
      }
    } catch {
      toast.error("Error al guardar límites")
    }
  }

  // ── Pagination ──────────────────────────────────────────────────────────────

  const filteredClients = clients
  const paginatedClients = filteredClients.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filteredClients.length / pageSize)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestión unificada de clientes, sitios y planes
          </p>
        </div>
        <Button onClick={openCreate} className="gold-gradient text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, negocio, teléfono, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Todos" },
                { value: "active", label: "Activos" },
                { value: "blocked", label: "Bloqueados" },
              ].map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatusFilter(f.value); setPage(0) }}
                >
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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No se encontraron clientes</p>
            </div>
          ) : (
            <>
              <motion.div variants={container} initial="hidden" animate="show">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Negocio</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Sitios</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => {
                        const subStatus = client.subscription?.status ?? "inactive"
                        const subBadge = subscriptionBadgeMap[subStatus] ?? subscriptionBadgeMap.inactive
                        const accBadge = statusBadgeMap[client.accountStatus] ?? statusBadgeMap.active
                        const isExpanded = expandedClientId === client.id

                        return (
                          <>
                            <motion.tr
                              key={client.id}
                              variants={item}
                              className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                                isExpanded ? "bg-accent/30" : ""
                              }`}
                              onClick={() => toggleExpand(client.id)}
                            >
                              <TableCell className="w-8">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{client.businessName}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{client.contactName ?? "—"}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {client.email ?? client.owner.email ?? ""}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {client.subscription?.plan?.name ?? "Sin plan"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={accBadge.variant} className="text-xs w-fit">
                                    {accBadge.label}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs w-fit ${subBadge.className}`}
                                  >
                                    {subBadge.label}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  <Globe className="w-3 h-3 mr-1" />
                                  {client.miniSites.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEdit(client)}
                                    title="Editar"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  {client.accountStatus === "active" ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => updateClientStatus(client.id, "blocked")}
                                      title="Bloquear"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-emerald-600"
                                      onClick={() => updateClientStatus(client.id, "active")}
                                      title="Reactivar"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => openDelete(client)}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>

                            {/* Expanded row */}
                            {isExpanded && (
                              <TableRow key={`${client.id}-expanded`}>
                                <TableCell colSpan={7} className="p-0">
                                  <AnimatePresence>
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="border-t bg-accent/20"
                                    >
                                      <div className="p-4 md:p-6">
                                        <ClientExpandedDetail
                                          client={client}
                                          plans={plans}
                                          selectedPlanId={selectedPlanId}
                                          setSelectedPlanId={setSelectedPlanId}
                                          newNote={newNote}
                                          setNewNote={setNewNote}
                                          addNote={addNote}
                                          changePlan={changePlan}
                                          updateClientStatus={updateClientStatus}
                                          parseNotes={parseNotes}
                                          extraFeatures={extraFeatures}
                                          setExtraFeatures={setExtraFeatures}
                                          saveExtraFeatures={saveExtraFeatures}
                                          customLimits={customLimits}
                                          setCustomLimits={setCustomLimits}
                                          saveCustomLimits={saveCustomLimits}
                                          createSubscriptionForClient={createSubscriptionForClient}
                                        />
                                      </div>
                                    </motion.div>
                                  </AnimatePresence>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {clients.length} clientes · Página {page + 1} de {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Create Client Dialog ───────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Nuevo Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Negocio *</Label>
              <Input
                placeholder="Ej: Restaurante La Casa"
                value={createForm.businessName}
                onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
              />
            </div>
            <div>
              <Label>Nombre de Contacto</Label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={createForm.contactName}
                onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teléfono</Label>
                <Input
                  placeholder="+52 55 1234 5678"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Contraseña temporal *</Label>
              <Input
                type="password"
                placeholder="Contraseña para la cuenta"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} className="gold-gradient text-black font-semibold">
              Crear Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Client Dialog ─────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div>
                <Label>Nombre del Negocio</Label>
                <Input
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                />
              </div>
              <div>
                <Label>Nombre de Contacto</Label>
                <Input
                  value={editForm.contactName}
                  onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado del Pipeline</Label>
                <Select
                  value={editForm.pipelineStatus}
                  onValueChange={(v) => setEditForm({ ...editForm, pipelineStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(pipelineLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditClient}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Client Dialog ───────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Cliente
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de que deseas eliminar <strong>{selectedClient.businessName}</strong>?
                Esta acción eliminará el cliente, su usuario, suscripciones y todos los sitios asociados.
              </p>
              <p className="text-sm font-medium text-destructive">
                Esta acción no se puede deshacer.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Expanded Detail Sub-component ────────────────────────────────────────────

function ClientExpandedDetail({
  client,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  newNote,
  setNewNote,
  addNote,
  changePlan,
  updateClientStatus,
  parseNotes,
  extraFeatures,
  setExtraFeatures,
  saveExtraFeatures,
  customLimits,
  setCustomLimits,
  saveCustomLimits,
  createSubscriptionForClient,
}: {
  client: ClientData
  plans: PlanOption[]
  selectedPlanId: string
  setSelectedPlanId: (v: string) => void
  newNote: string
  setNewNote: (v: string) => void
  addNote: () => void
  changePlan: (clientId: string, planId: string) => void
  updateClientStatus: (clientId: string, status: string) => void
  parseNotes: (notes: string | null) => Array<{ text: string; addedBy: string; addedAt: string }>
  extraFeatures: string[]
  setExtraFeatures: (v: string[]) => void
  saveExtraFeatures: () => void
  customLimits: Record<string, number>
  setCustomLimits: (v: Record<string, number>) => void
  saveCustomLimits: () => void
  createSubscriptionForClient: (clientId: string, planId: string) => void
}) {
  // Compute plan features & effective features for the client
  const planFeaturesJson = client.subscription?.plan?.features ?? null
  const extraFeaturesJson = client.subscription?.extraFeatures ?? null
  const { planFeatures, extraFeatures: parsedExtra, effectiveFeatures } = getEffectiveFeatures(planFeaturesJson, extraFeaturesJson)
  const extraKeysSet = new Set(parsedExtra)
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="details" className="gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Detalles</span>
        </TabsTrigger>
        <TabsTrigger value="sites" className="gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sitios</span>
        </TabsTrigger>
        <TabsTrigger value="plan" className="gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Plan / Funciones Extra</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-1.5">
          <StickyNote className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Notas</span>
        </TabsTrigger>
      </TabsList>

      {/* ── Details Tab ──────────────────────────────────────────────────────── */}
      <TabsContent value="details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Negocio</p>
            <p className="text-sm font-medium">{client.businessName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Contacto</p>
            <p className="text-sm font-medium">{client.contactName ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </p>
            <p className="text-sm font-medium">{client.email ?? client.owner.email ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" /> Teléfono
            </p>
            <p className="text-sm font-medium">{client.phone ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">WhatsApp</p>
            <p className="text-sm font-medium">{client.whatsapp ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pipeline</p>
            <Badge variant="outline" className="text-xs">
              {pipelineLabel[client.pipelineStatus] ?? client.pipelineStatus}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cuenta Owner</p>
            <p className="text-sm font-medium">{client.owner.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Registrado</p>
            <p className="text-sm font-medium">
              {new Date(client.createdAt).toLocaleDateString("es")}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-2">
          {client.accountStatus === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => updateClientStatus(client.id, "blocked")}
            >
              <Ban className="w-4 h-4 mr-1" />
              Bloquear Cliente
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => updateClientStatus(client.id, "active")}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Reactivar Cliente
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/employees`} target="_blank" rel="noopener noreferrer">
              <Shield className="w-4 h-4 mr-1" />
              Mi Equipo
            </a>
          </Button>
        </div>
      </TabsContent>

      {/* ── Sites Tab ───────────────────────────────────────────────────────── */}
      <TabsContent value="sites">
        <div className="mt-2 space-y-3">
          {client.miniSites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Este cliente no tiene sitios aún</p>
            </div>
          ) : (
            client.miniSites.map((site) => (
              <Card key={site.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{site.businessName}</p>
                        <a
                          href={`/${site.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          /{site.slug}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={site.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {site.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge
                        variant={site.isPublished ? "outline" : "secondary"}
                        className={`text-xs ${
                          site.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : ""
                        }`}
                      >
                        {site.isPublished ? "Publicado" : "Borrador"}
                      </Badge>
                    </div>
                  </div>
                  {site.branches && site.branches.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        Sucursales ({site.branches.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {site.branches.map((branch) => (
                          <Badge
                            key={branch.id}
                            variant={branch.isActive ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {branch.name}
                            {!branch.isActive && " (inactiva)"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* ── Plan / Extra Features Tab ──────────────────────────────────────── */}
      <TabsContent value="plan">
        <div className="mt-2 space-y-6">
          {/* ── Section A: Plan Assignment ─────────────────────────────────── */}
          {client.subscription ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Plan Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-medium">
                      {client.subscription.plan.name} — ${client.subscription.plan.price}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <Badge
                      variant="outline"
                      className={
                        subscriptionBadgeMap[client.subscription.status]?.className ?? ""
                      }
                    >
                      {subscriptionBadgeMap[client.subscription.status]?.label ?? client.subscription.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Inicio Periodo</p>
                    <p className="text-sm">
                      {client.subscription.currentPeriodStart
                        ? new Date(client.subscription.currentPeriodStart).toLocaleDateString("es")
                        : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Fin Periodo</p>
                    <p className="text-sm">
                      {client.subscription.currentPeriodEnd
                        ? new Date(client.subscription.currentPeriodEnd).toLocaleDateString("es")
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-2 pt-2 border-t">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Cambiar Plan</p>
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} — ${plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="gold-gradient text-black font-semibold"
                    onClick={() => changePlan(client.id, selectedPlanId)}
                    disabled={!selectedPlanId || selectedPlanId === client.subscription?.plan?.id}
                  >
                    Cambiar Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Asignar Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Este cliente no tiene suscripción. Asigna un plan para activarlo.</p>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} — ${plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="gold-gradient text-black font-semibold"
                    onClick={() => createSubscriptionForClient(client.id, selectedPlanId)}
                    disabled={!selectedPlanId}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Asignar Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {client.subscription && (
            <>
              <Separator />

              {/* ── Section B: Features del Plan (READ-ONLY) ─────────────────── */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Features del Plan
                </h3>
                <div className="space-y-4">
                  {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                    const categoryFeatures = FEATURE_DEFINITIONS.filter((f) => f.category === category)
                    if (categoryFeatures.length === 0) return null
                    return (
                      <div key={category}>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {categoryFeatures.map((feat) => {
                            const isEnabled = effectiveFeatures[feat.key] ?? true
                            const isFromPlan = planFeatures[feat.key] === true
                            const isFromExtra = !isFromPlan && extraKeysSet.has(feat.key)
                            return (
                              <div
                                key={feat.key}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                                  isEnabled ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                                }`}
                              >
                                {isEnabled ? (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500 shrink-0" />
                                )}
                                <span className="flex-1 text-xs">{feat.label}</span>
                                {isFromPlan && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">Plan</Badge>
                                )}
                                {isFromExtra && (
                                  <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 border-amber-500/20">EXTRA</Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* ── Section C: Funciones Extra (TOGGLES) ────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Funciones Extra
                  <span className="text-xs font-normal text-muted-foreground">(activar features no incluidas en el plan)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                  {FEATURE_DEFINITIONS.filter((f) => planFeatures[f.key] === false).map((feat) => {
                    const isToggledOn = extraFeatures.includes(feat.key)
                    return (
                      <div
                        key={feat.key}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                          isToggledOn
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-accent/30 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Zap className={`w-4 h-4 shrink-0 ${isToggledOn ? "text-amber-500" : "text-muted-foreground"}`} />
                          <span className="text-xs truncate">{feat.label}</span>
                        </div>
                        <Switch
                          checked={isToggledOn}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExtraFeatures([...extraFeatures, feat.key])
                            } else {
                              setExtraFeatures(extraFeatures.filter((k) => k !== feat.key))
                            }
                          }}
                          className="scale-90"
                        />
                      </div>
                    )
                  })}
                  {FEATURE_DEFINITIONS.filter((f) => planFeatures[f.key] === false).length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full">Todas las features están incluidas en el plan.</p>
                  )}
                </div>
                <Button size="sm" onClick={saveExtraFeatures} className="gold-gradient text-black font-semibold">
                  <Save className="w-4 h-4 mr-1" />
                  Guardar Funciones Extra
                </Button>
              </div>

              <Separator />

              {/* ── Section D: Límites Personalizados ───────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Límites Personalizados
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Deja vacío para usar el valor por defecto del plan. Los valores personalizados sobreescriben los límites del plan.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {Object.entries(CUSTOM_LIMIT_LABELS).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          value={customLimits[key] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value
                            setCustomLimits({
                              ...customLimits,
                              [key]: val ? Number(val) : undefined as unknown as number,
                            })
                          }}
                          placeholder={`Default: ${CUSTOM_LIMIT_DEFAULTS[key] ?? "—"}`}
                          className="pr-8 text-sm"
                        />
                        {customLimits[key] && (
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              const copy = { ...customLimits }
                              delete copy[key]
                              setCustomLimits(copy)
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={saveCustomLimits} className="gold-gradient text-black font-semibold">
                    <Save className="w-4 h-4 mr-1" />
                    Guardar Límites
                  </Button>
                  <button
                    className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
                    onClick={() => setCustomLimits({})}
                  >
                    Restablecer a valores del plan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </TabsContent>

      {/* ── Notes Tab ──────────────────────────────────────────────────────── */}
      <TabsContent value="notes">
        <div className="mt-2 space-y-3">
          <div className="max-h-60 overflow-y-auto space-y-2">
            {parseNotes(client.notes).map(
              (n: { text: string; addedBy: string; addedAt: string }, i: number) => (
                <div key={i} className="p-3 bg-accent rounded-lg">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.addedBy} · {new Date(n.addedAt).toLocaleDateString("es")}
                  </p>
                </div>
              )
            )}
            {parseNotes(client.notes).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin notas internas
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Agregar nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[60px]"
            />
            <Button size="sm" onClick={addNote} disabled={!newNote.trim()} className="shrink-0">
              <StickyNote className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
