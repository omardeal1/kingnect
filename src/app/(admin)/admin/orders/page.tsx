"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Download,
  Loader2,
  Eye,
  ShoppingCart,
  Calendar,
  Filter,
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

interface OrderData {
  id: string
  customerName: string
  customerPhone: string | null
  deliveryType: string
  status: string
  total: number
  notes: string | null
  createdAt: string
  miniSite: {
    id: string
    businessName: string
    slug: string
    client: {
      id: string
      businessName: string
      owner: { name: string | null; email: string | null }
    }
  }
  orderItems: OrderItem[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nuevo", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  confirmed: { label: "Confirmado", className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  preparing: { label: "Preparando", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  ready: { label: "Listo", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  delivered: { label: "Entregado", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  cancelled: { label: "Cancelado", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [businessSearch, setBusinessSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (businessSearch) params.set("businessName", businessSearch)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (fromDate) params.set("from", fromDate)
      if (toDate) params.set("to", toDate)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      toast.error("Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [businessSearch, statusFilter, fromDate, toDate])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      })
      if (res.ok) {
        toast.success("Estado actualizado")
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status })
        }
      }
    } catch {
      toast.error("Error al actualizar estado")
    }
  }

  const exportCSV = () => {
    const headers = ["ID", "Negocio", "Cliente", "Total", "Estado", "Tipo entrega", "Fecha"]
    const rows = orders.map((o) => [
      o.id,
      o.miniSite.businessName,
      o.customerName,
      o.total,
      o.status,
      o.deliveryType,
      new Date(o.createdAt).toLocaleDateString("es"),
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV descargado")
  }

  const openDetail = (order: OrderData) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Todos los pedidos de la plataforma
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={orders.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por negocio..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[140px]"
                placeholder="Desde"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[140px]"
                placeholder="Hasta"
              />
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
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron pedidos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Negocio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const cfg = statusConfig[order.status] ?? statusConfig.new
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.miniSite.businessName}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.customerName}</p>
                            {order.customerPhone && (
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${order.total.toLocaleString("es", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDetail(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Pedido #{selectedOrder?.id.slice(-6)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Negocio</p>
                  <p className="text-sm font-medium">{selectedOrder.miniSite.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente plataforma</p>
                  <p className="text-sm">{selectedOrder.miniSite.client.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente pedido</p>
                  <p className="text-sm">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{selectedOrder.customerPhone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo entrega</p>
                  <p className="text-sm capitalize">{selectedOrder.deliveryType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleString("es")}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm bg-accent p-2 rounded-lg mt-1">{selectedOrder.notes}</p>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Items</h3>
                <div className="space-y-1">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${item.total.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Change Status */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Cambiar estado</h3>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => updateStatus(selectedOrder.id, newStatus)}
                    disabled={newStatus === selectedOrder.status}
                  >
                    Actualizar
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
