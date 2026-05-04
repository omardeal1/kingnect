"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  MessageCircle,
  Filter,
  Package,
  ChevronDown,
  CalendarDays,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ORDER_STATUSES } from "@/lib/constants"

// Placeholder orders data
const placeholderOrders = [
  {
    id: "1",
    customerName: "María García",
    customerPhone: "5215512345678",
    deliveryType: "delivery",
    status: "new",
    total: 45.99,
    notes: "Sin cebolla por favor",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    orderItems: [
      { id: "1", name: "Hamburguesa Clásica", quantity: 2, unitPrice: 12.99, total: 25.98 },
      { id: "2", name: "Papas Fritas", quantity: 1, unitPrice: 5.99, total: 5.99 },
      { id: "3", name: "Refresco", quantity: 2, unitPrice: 2.5, total: 5.0 },
    ],
  },
  {
    id: "2",
    customerName: "Carlos López",
    customerPhone: "5215587654321",
    deliveryType: "pickup",
    status: "preparing",
    total: 82.5,
    notes: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    orderItems: [
      { id: "4", name: "Pizza Hawaiana", quantity: 1, unitPrice: 45.0, total: 45.0 },
      { id: "5", name: "Pizza Pepperoni", quantity: 1, unitPrice: 37.5, total: 37.5 },
    ],
  },
  {
    id: "3",
    customerName: "Ana Martínez",
    customerPhone: "5215599887766",
    deliveryType: "delivery",
    status: "delivered",
    total: 23.0,
    notes: "Entregar en recepción",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    orderItems: [
      { id: "6", name: "Ensalada César", quantity: 1, unitPrice: 15.0, total: 15.0 },
      { id: "7", name: "Agua Mineral", quantity: 2, unitPrice: 4.0, total: 8.0 },
    ],
  },
  {
    id: "4",
    customerName: "Roberto Sánchez",
    customerPhone: "5215511223344",
    deliveryType: "pickup",
    status: "confirmed",
    total: 156.0,
    notes: "Para llevar",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    orderItems: [
      { id: "8", name: "Combo Familiar", quantity: 2, unitPrice: 78.0, total: 156.0 },
    ],
  },
  {
    id: "5",
    customerName: "Laura Torres",
    customerPhone: "5215566778899",
    deliveryType: "delivery",
    status: "ready",
    total: 67.5,
    notes: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    orderItems: [
      { id: "9", name: "Tacos al Pastor (5)", quantity: 2, unitPrice: 22.5, total: 45.0 },
      { id: "10", name: "Horchata", quantity: 2, unitPrice: 5.0, total: 10.0 },
      { id: "11", name: "Guacamole", quantity: 1, unitPrice: 12.5, total: 12.5 },
    ],
  },
]

const statusTransitions: Record<string, string[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [orders, setOrders] = React.useState(placeholderOrders)

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter
    const matchesSearch = order.customerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    const statusInfo = getStatusInfo(newStatus)
    toast.success(`Pedido actualizado a: ${statusInfo.label}`)

    // In production, this would call the API
    // fetch('/api/orders', { method: 'PUT', body: JSON.stringify({ orderId, status: newStatus }) })
  }

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Hola ${name}, gracias por tu pedido en nuestro negocio. 🙏`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los pedidos de tu Kinec
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre del cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SlidersHorizontal className="size-4 mr-2" />
                  <SelectValue placeholder="Filtrar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const transitions = statusTransitions[order.status] ?? []

              return (
                <motion.div
                  key={order.id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: statusInfo.color }}
                            />
                            <div>
                              <h3 className="font-semibold text-sm">
                                {order.customerName}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(order.createdAt)} ·{" "}
                                {order.deliveryType === "delivery"
                                  ? "Domicilio"
                                  : "Recoger"}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0"
                            style={{
                              backgroundColor: statusInfo.color + "20",
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Order Items */}
                        <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                          {order.orderItems.map((oi) => (
                            <div
                              key={oi.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {oi.quantity}x {oi.name}
                              </span>
                              <span className="font-medium">
                                ${oi.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <p className="text-xs text-muted-foreground italic">
                            📝 {order.notes}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          {transitions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                >
                                  Cambiar estado
                                  <ChevronDown className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {transitions.map((nextStatus) => {
                                  const nextInfo = getStatusInfo(nextStatus)
                                  return (
                                    <DropdownMenuItem
                                      key={nextStatus}
                                      onClick={() =>
                                        handleStatusChange(order.id, nextStatus)
                                      }
                                      className="gap-2"
                                    >
                                      <div
                                        className="size-2 rounded-full"
                                        style={{
                                          backgroundColor: nextInfo.color,
                                        }}
                                      />
                                      {nextInfo.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {order.customerPhone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 ml-auto"
                              onClick={() =>
                                openWhatsApp(
                                  order.customerPhone!,
                                  order.customerName
                                )
                              }
                            >
                              <MessageCircle className="size-3.5 text-green-600" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div variants={item}>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Package className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold mb-1">Aún no tienes pedidos</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Cuando tus clientes hagan pedidos desde tu Kinec,
                  aparecerán aquí para que puedas gestionarlos.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
