"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle2,
  CreditCard,
  StickyNote,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

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
  createdAt: string
  owner: { name: string | null; email: string | null; image: string | null }
  subscription: {
    id: string
    status: string
    trialStart: string | null
    trialEnd: string | null
    currentPeriodEnd: string | null
    plan: { id: string; name: string; slug: string; price: number }
  } | null
  miniSites: Array<{ id: string; slug: string; businessName: string; isActive: boolean }>
}

const statusFilters = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "blocked", label: "Bloqueado" },
  { value: "trial", label: "En Trial" },
]

const statusBadgeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
}

const subscriptionBadgeMap: Record<string, { label: string; className: string }> = {
  active: { label: "Activa", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  trial: { label: "Trial", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  inactive: { label: "Inactiva", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  past_due: { label: "Vencida", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  cancelled: { label: "Cancelada", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [plans, setPlans] = useState<Array<{ id: string; name: string; slug: string; price: number }>>([])
  const [page, setPage] = useState(0)
  const pageSize = 20

  const fetchClients = async () => {
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
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans")
      const data = await res.json()
      setPlans(data.plans ?? [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchClients()
    fetchPlans()
  }, [search, statusFilter])

  const openDetail = (client: ClientData) => {
    setSelectedClient(client)
    setDetailOpen(true)
    setNewNote("")
    setSelectedPlanId(client.subscription?.plan?.id ?? "")
  }

  const updateClientStatus = async (clientId: string, accountStatus: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, accountStatus }),
      })
      if (res.ok) {
        toast.success(`Cliente ${accountStatus === "blocked" ? "bloqueado" : "reactivado"}`)
        fetchClients()
        if (selectedClient?.id === clientId) {
          setSelectedClient({ ...selectedClient, accountStatus })
        }
      }
    } catch {
      toast.error("Error al actualizar cliente")
    }
  }

  const changePlan = async (clientId: string, planId: string) => {
    try {
      const sub = clients.find((c) => c.id === clientId)?.subscription
      if (!sub) {
        toast.error("Cliente sin suscripción")
        return
      }
      const res = await fetch(`/api/admin/plans`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: sub.id, planId }),
      })
      if (res.ok) {
        toast.success("Plan actualizado")
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

  const activateTrial = async (clientId: string) => {
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, accountStatus: "active" }),
      })
      if (res.ok) {
        toast.success("Trial activado")
        fetchClients()
      }
    } catch {
      toast.error("Error al activar trial")
    }
  }

  const paginatedClients = clients.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(clients.length / pageSize)

  const parsedNotes = (notes: string | null) => {
    if (!notes) return []
    try {
      return JSON.parse(notes)
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona todos los clientes de la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, contacto, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setStatusFilter(f.value); setPage(0) }}
                >
                  {f.label}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (search) params.set("search", search)
                  params.set("expiring", "true")
                  setLoading(true)
                  fetch(`/api/admin/clients?${params}`)
                    .then((r) => r.json())
                    .then((d) => { setClients(d.clients ?? []); setPage(0) })
                    .catch(() => toast.error("Error"))
                    .finally(() => setLoading(false))
                }}
              >
                Por vencer
              </Button>
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
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron clientes
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negocio</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Mini Web</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => {
                      const subStatus = client.subscription?.status ?? "inactive"
                      const subBadge = subscriptionBadgeMap[subStatus] ?? subscriptionBadgeMap.inactive
                      const accBadge = statusBadgeMap[client.accountStatus] ?? statusBadgeMap.active

                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            {client.businessName}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{client.contactName ?? "—"}</p>
                              <p className="text-xs text-muted-foreground">{client.email ?? client.owner.email ?? ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {client.subscription?.plan?.name ?? "Sin plan"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {client.subscription?.currentPeriodEnd
                              ? new Date(client.subscription.currentPeriodEnd).toLocaleDateString("es")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={accBadge.variant} className="text-xs w-fit">
                                {accBadge.label}
                              </Badge>
                              <Badge variant="outline" className={`text-xs w-fit ${subBadge.className}`}>
                                {subBadge.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {client.miniSites[0] ? (
                              <a
                                href={`/${client.miniSites[0].slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm flex items-center gap-1"
                              >
                                {client.miniSites[0].slug}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDetail(client)}
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
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
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
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

      {/* Client Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedClient?.businessName}
              {selectedClient && (
                <Badge variant={statusBadgeMap[selectedClient.accountStatus]?.variant ?? "default"}>
                  {statusBadgeMap[selectedClient.accountStatus]?.label ?? selectedClient.accountStatus}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Negocio</p>
                  <p className="text-sm font-medium">{selectedClient.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contacto</p>
                  <p className="text-sm font-medium">{selectedClient.contactName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{selectedClient.email ?? selectedClient.owner.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{selectedClient.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium">{selectedClient.whatsapp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                  <p className="text-sm font-medium capitalize">{selectedClient.pipelineStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registrado</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedClient.createdAt).toLocaleDateString("es")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mini Web</p>
                  {selectedClient.miniSites[0] ? (
                    <a
                      href={`/${selectedClient.miniSites[0].slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      {selectedClient.miniSites[0].slug}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-sm">—</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Subscription */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Suscripción</h3>
                {selectedClient.subscription ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan actual</p>
                      <p className="text-sm font-medium">
                        {selectedClient.subscription.plan.name} — ${selectedClient.subscription.plan.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <Badge
                        variant="outline"
                        className={subscriptionBadgeMap[selectedClient.subscription.status]?.className ?? ""}
                      >
                        {subscriptionBadgeMap[selectedClient.subscription.status]?.label ?? selectedClient.subscription.status}
                      </Badge>
                    </div>
                    {selectedClient.subscription.trialStart && (
                      <div>
                        <p className="text-xs text-muted-foreground">Trial inicio</p>
                        <p className="text-sm">
                          {new Date(selectedClient.subscription.trialStart).toLocaleDateString("es")}
                        </p>
                      </div>
                    )}
                    {selectedClient.subscription.trialEnd && (
                      <div>
                        <p className="text-xs text-muted-foreground">Trial fin</p>
                        <p className="text-sm">
                          {new Date(selectedClient.subscription.trialEnd).toLocaleDateString("es")}
                        </p>
                      </div>
                    )}
                    {selectedClient.subscription.currentPeriodEnd && (
                      <div>
                        <p className="text-xs text-muted-foreground">Período fin</p>
                        <p className="text-sm">
                          {new Date(selectedClient.subscription.currentPeriodEnd).toLocaleDateString("es")}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin suscripción</p>
                )}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Acciones rápidas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.accountStatus === "active" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateClientStatus(selectedClient.id, "blocked")}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Bloquear
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateClientStatus(selectedClient.id, "active")}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Reactivar
                    </Button>
                  )}
                  {selectedClient.subscription?.status === "trial" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateTrial(selectedClient.id)}
                    >
                      Activar Trial
                    </Button>
                  )}
                </div>

                {/* Change Plan */}
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Cambiar plan</label>
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger className="mt-1">
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
                    onClick={() => changePlan(selectedClient.id, selectedPlanId)}
                    disabled={!selectedPlanId}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Notas internas</h3>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {parsedNotes(selectedClient.notes).map((n: { text: string; addedBy: string; addedAt: string }, i: number) => (
                    <div key={i} className="p-2 bg-accent rounded-lg">
                      <p className="text-sm">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.addedBy} · {new Date(n.addedAt).toLocaleDateString("es")}
                      </p>
                    </div>
                  ))}
                  {parsedNotes(selectedClient.notes).length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin notas</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Agregar nota..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                    <StickyNote className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
