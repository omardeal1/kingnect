"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Search,
  Loader2,
  Eye,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  ChevronDown,
  ChevronUp,
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface ReservationData {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerWhatsapp: boolean
  reservationDate: string
  timeSlot: string
  partySize: number
  status: string
  notes: string | null
  googleCalendarEventId: string | null
  createdAt: string
  site: {
    id: string
    businessName: string
    slug: string
    client: {
      id: string
      businessName: string
      owner: { name: string | null; email: string | null }
    }
  }
  config: {
    reservationType: string
  }
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  approved: {
    label: "Aprobada",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  completed: {
    label: "Completada",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
  no_show: {
    label: "No asistió",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: UserX,
  },
}

const RESERVATION_TYPE_LABELS: Record<string, string> = {
  appointment: "Cita",
  table: "Mesa",
  space: "Espacio",
  class: "Clase",
  service: "Servicio",
  custom: "Personalizado",
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      params.set("page", String(pagination.page))

      const res = await fetch(`/api/admin/reservations?${params}`)
      const data = await res.json()
      setReservations(data.reservations ?? [])
      setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 0 })
    } catch {
      toast.error("Error al cargar reservaciones")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, pagination.page])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const updateStatus = async (
    reservationId: string,
    status: string
  ) => {
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, status }),
      })
      if (res.ok) {
        toast.success("Estado actualizado correctamente")
        fetchReservations()
        if (selectedReservation?.id === reservationId) {
          setSelectedReservation({ ...selectedReservation, status })
        }
      }
    } catch {
      toast.error("Error al actualizar estado")
    }
  }

  const openDetail = (reservation: ReservationData) => {
    setSelectedReservation(reservation)
    setDetailOpen(true)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reservaciones</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona todas las reservaciones de la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por negocio o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          ) : reservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No hay reservaciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Negocio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Personas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((res) => {
                    const cfg =
                      STATUS_CONFIG[res.status] ?? STATUS_CONFIG.pending
                    const isExpanded = expandedId === res.id

                    return (
                      <React.Fragment key={res.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => toggleExpand(res.id)}
                        >
                          <TableCell className="font-medium max-w-[150px] truncate">
                            {res.site.businessName}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{res.customerName}</p>
                              {res.customerPhone && (
                                <p className="text-xs text-muted-foreground">
                                  {res.customerPhone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(res.reservationDate).toLocaleDateString(
                              "es",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{res.timeSlot}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cfg.className}
                            >
                              <cfg.icon className="size-3 mr-1" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {RESERVATION_TYPE_LABELS[
                              res.config?.reservationType
                            ] || res.config?.reservationType || "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {res.partySize}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDetail(res)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(res.id)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded row with quick actions */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/20 px-6 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                  {res.customerEmail && (
                                    <span className="text-muted-foreground">
                                      {res.customerEmail}
                                    </span>
                                  )}
                                  {res.notes && (
                                    <span className="text-muted-foreground italic">
                                      &quot;{res.notes}&quot;
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {res.status !== "approved" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 text-emerald-600 border-emerald-600/30 hover:bg-emerald-600/10"
                                      onClick={() =>
                                        updateStatus(res.id, "approved")
                                      }
                                    >
                                      <CheckCircle className="size-3" />
                                      Aprobar
                                    </Button>
                                  )}
                                  {res.status !== "cancelled" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 text-red-600 border-red-600/30 hover:bg-red-600/10"
                                      onClick={() =>
                                        updateStatus(res.id, "cancelled")
                                      }
                                    >
                                      <XCircle className="size-3" />
                                      Cancelar
                                    </Button>
                                  )}
                                  {res.status !== "completed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 text-green-600 border-green-600/30 hover:bg-green-600/10"
                                      onClick={() =>
                                        updateStatus(res.id, "completed")
                                      }
                                    >
                                      <CheckCircle className="size-3" />
                                      Completar
                                    </Button>
                                  )}
                                  {res.status !== "no_show" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1 text-gray-600 border-gray-600/30 hover:bg-gray-600/10"
                                      onClick={() =>
                                        updateStatus(res.id, "no_show")
                                      }
                                    >
                                      <UserX className="size-3" />
                                      No asistió
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page - 1 }))
            }
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total}{" "}
            reservaciones)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((p) => ({ ...p, page: p.page + 1 }))
            }
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Reservación #{selectedReservation?.id.slice(-6) ?? ""}
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Negocio</p>
                  <p className="text-sm font-medium">
                    {selectedReservation.site.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cliente del negocio
                  </p>
                  <p className="text-sm">
                    {selectedReservation.site.client.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">
                    {selectedReservation.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">
                    {selectedReservation.customerPhone || "—"}
                    {selectedReservation.customerWhatsapp && (
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        WA
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">
                    {selectedReservation.customerEmail || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm">
                    {RESERVATION_TYPE_LABELS[
                      selectedReservation.config?.reservationType
                    ] || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm">
                    {new Date(
                      selectedReservation.reservationDate
                    ).toLocaleDateString("es", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="text-sm">{selectedReservation.timeSlot}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Personas</p>
                  <p className="text-sm">{selectedReservation.partySize}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge
                    variant="outline"
                    className={
                      STATUS_CONFIG[selectedReservation.status]?.className ||
                      ""
                    }
                  >
                    {STATUS_CONFIG[selectedReservation.status]?.label ||
                      selectedReservation.status}
                  </Badge>
                </div>
              </div>

              {selectedReservation.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm bg-accent p-2 rounded-lg mt-1">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}

              {selectedReservation.googleCalendarEventId && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Evento de Google Calendar
                  </p>
                  <p className="text-xs font-mono bg-accent p-2 rounded-lg mt-1">
                    {selectedReservation.googleCalendarEventId}
                  </p>
                </div>
              )}

              <Separator />

              {/* Change Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      className={`h-8 text-xs gap-1 ${
                        selectedReservation.status === key
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      disabled={selectedReservation.status === key}
                      onClick={() => updateStatus(selectedReservation.id, key)}
                    >
                      <cfg.icon className="size-3" />
                      {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
