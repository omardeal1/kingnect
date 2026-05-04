"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ShoppingCart,
  MessageCircle,
  Package,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ORDER_STATUSES } from "@/lib/constants"
import { useDashboardStore } from "@/lib/dashboard-store"

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

interface Order {
  id: string
  customerName: string
  customerPhone: string | null
  deliveryType: string
  status: string
  total: number
  notes: string | null
  createdAt: string
  orderItems: OrderItem[]
}

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
  const siteId = useDashboardStore((s) => s.data.siteId)
  const queryClient = useQueryClient()

  // Fetch orders from API
  const { data: ordersData, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["orders", siteId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?siteId=${siteId}`)
      if (!res.ok) throw new Error("Error al cargar pedidos")
      return res.json()
    },
    enabled: !!siteId,
  })

  const orders = ordersData?.orders ?? []

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al actualizar pedido")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      const statusInfo = getStatusInfo(variables.status)
      toast.success(`Pedido actualizado a: ${statusInfo.label}`)
      queryClient.invalidateQueries({ queryKey: ["orders", siteId] })
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar pedido")
    },
  })

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0]
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
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
    updateStatusMutation.mutate({ orderId, status: newStatus })
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

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-3 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        /* Orders List */
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
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : null}
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
                                      disabled={updateStatusMutation.isPending}
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
