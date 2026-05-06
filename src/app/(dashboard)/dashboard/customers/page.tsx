"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "@/i18n/provider"
import {
  Search,
  Loader2,
  UserPlus,
  Users,
  QrCode,
  Eye,
  MessageCircle,
  Download,
  SlidersHorizontal,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Star,
  Award,
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
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useDashboardStore } from "@/lib/dashboard-store"

interface CustomerData {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  birthday: string | null
  gender: string | null
  city: string | null
  postalCode: string | null
  hasWhatsapp: boolean
  registrationMethod: string
  profileCompleted: boolean
  visitsCount: number
  totalPurchases: number
  currentProgress: number
  rewardsEarned: number
  rewardsRedeemed: number
  qrCheckinCode: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const registrationMethodLabels: Record<string, string> = {
  manual: "Manual",
  google: "Google",
  facebook: "Facebook",
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardCustomersPage() {
  const { t } = useTranslations("dashboard")
  const { locale } = useLocale()
  const siteId = useDashboardStore((s) => s.data.siteId)
  const businessName = useDashboardStore((s) => s.data.businessName)

  const [customers, setCustomers] = React.useState<CustomerData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [profileFilter, setProfileFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  // Detail dialog
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  // Add customer dialog
  const [addOpen, setAddOpen] = React.useState(false)
  const [addForm, setAddForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
    city: "",
    hasWhatsapp: false,
  })
  const [adding, setAdding] = React.useState(false)

  const fetchCustomers = React.useCallback(async () => {
    if (!siteId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (profileFilter !== "all") params.set("profileCompleted", profileFilter)
      params.set("page", String(page))
      params.set("limit", "25")

      const res = await fetch(`/api/sites/${siteId}/customers?${params}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotal(data.pagination?.total ?? 0)
    } catch {
      toast.error("Error al cargar clientes")
    } finally {
      setLoading(false)
    }
  }, [siteId, search, profileFilter, page])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const formatCustomerName = (c: CustomerData) => {
    if (c.firstName || c.lastName) {
      return `${c.firstName || ""} ${c.lastName || ""}`.trim()
    }
    return c.phone || "Sin nombre"
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Hola ${name}, gracias por visitarnos en ${businessName}. 🙏`
    )
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank")
  }

  // Add customer handler
  const handleAddCustomer = async () => {
    if (!addForm.phone.trim()) {
      toast.error("El teléfono es requerido")
      return
    }

    setAdding(true)
    try {
      const res = await fetch(`/api/sites/${siteId}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: addForm.firstName.trim() || undefined,
          lastName: addForm.lastName.trim() || undefined,
          phone: addForm.phone.trim(),
          email: addForm.email.trim() || undefined,
          birthday: addForm.birthday || undefined,
          gender: addForm.gender || undefined,
          city: addForm.city.trim() || undefined,
          hasWhatsapp: addForm.hasWhatsapp,
          registrationMethod: "manual",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.isNew) {
          toast.success("Cliente registrado exitosamente")
        } else {
          toast.info("Este cliente ya estaba registrado")
        }
        setAddOpen(false)
        setAddForm({ firstName: "", lastName: "", phone: "", email: "", birthday: "", gender: "", city: "", hasWhatsapp: false })
        fetchCustomers()
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al registrar cliente")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setAdding(false)
    }
  }

  const exportCSV = () => {
    const headers = ["Nombre", "Teléfono", "Correo", "Visitas", "Compras", "Puntos", "Perfil", "QR", "Registro"]
    const rows = customers.map((c) => [
      formatCustomerName(c),
      c.phone || "",
      c.email || "",
      c.visitsCount,
      c.totalPurchases,
      c.currentProgress,
      c.profileCompleted ? "Completo" : "Incompleto",
      c.qrCheckinCode || "",
      new Date(c.createdAt).toLocaleDateString("es"),
    ])

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clientes-${businessName}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV descargado")
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("customers.title") || "Clientes"}</h1>
              <p className="text-sm text-muted-foreground">
                {t("customers.subtitle") || "Gestiona los clientes de tu negocio"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} disabled={customers.length === 0} size="sm">
              <Download className="size-4 mr-1.5" />
              CSV
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="gap-1.5"
              style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
            >
              <UserPlus className="size-4" />
              Agregar cliente
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats summary */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-[#D4A849]" />
                <div>
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-[10px] text-muted-foreground">Total clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {customers.filter((c) => c.profileCompleted).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Perfil completo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {customers.reduce((sum, c) => sum + c.rewardsEarned, 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Premios ganados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString("es", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Compras totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  placeholder="Buscar por nombre, teléfono o correo..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
              <Select
                value={profileFilter}
                onValueChange={(v) => {
                  setProfileFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SlidersHorizontal className="size-4 mr-2" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Perfil completo</SelectItem>
                  <SelectItem value="false">Perfil incompleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length > 0 ? (
        /* Customer Table */
        <motion.div variants={item}>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead className="text-center">Visitas</TableHead>
                      <TableHead className="text-right">Compras</TableHead>
                      <TableHead className="text-center">Puntos</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>QR</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {(customer.firstName?.[0] || customer.phone?.[0] || "?").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate max-w-[140px]">
                                {formatCustomerName(customer)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {registrationMethodLabels[customer.registrationMethod] || customer.registrationMethod}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.phone || "—"}
                          {customer.hasWhatsapp && (
                            <MessageCircle className="inline size-3 ml-1 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate">
                          {customer.email || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {customer.visitsCount}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          ${customer.totalPurchases.toLocaleString("es", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm text-center">
                          {customer.currentProgress}
                        </TableCell>
                        <TableCell>
                          {customer.profileCompleted ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            >
                              Completo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                            >
                              Incompleto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.qrCheckinCode ? (
                            <Badge variant="outline" className="font-mono text-[10px]">
                              <QrCode className="size-3 mr-0.5" />
                              {customer.qrCheckinCode.slice(0, 6)}...
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setDetailOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {customer.phone && customer.hasWhatsapp && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  openWhatsApp(customer.phone!, formatCustomerName(customer))
                                }
                              >
                                <MessageCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Users className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold mb-1">No hay clientes registrados</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Los clientes aparecerán aquí cuando se registren desde tu QAIROSS o los agregues manualmente.
                </p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => setAddOpen(true)}
                  style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
                >
                  <UserPlus className="size-4" />
                  Agregar cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={item} className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} clientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </motion.div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detalle del cliente
            </DialogTitle>
            <DialogDescription>
              Información completa del cliente registrado
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {(selectedCustomer.firstName?.[0] || selectedCustomer.phone?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {formatCustomerName(selectedCustomer)}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">
                      {registrationMethodLabels[selectedCustomer.registrationMethod] || selectedCustomer.registrationMethod}
                    </Badge>
                    {selectedCustomer.profileCompleted ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                      >
                        <CheckCircle2 className="size-3 mr-0.5" />
                        Perfil completo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                      >
                        <XCircle className="size-3 mr-0.5" />
                        Perfil incompleto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Teléfono</p>
                    <p className="text-sm">{selectedCustomer.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Correo</p>
                    <p className="text-sm">{selectedCustomer.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Ciudad</p>
                    <p className="text-sm">{selectedCustomer.city || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Código QR</p>
                    <p className="text-sm font-mono">
                      {selectedCustomer.qrCheckinCode || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCustomer.birthday && (
                <div className="text-xs text-muted-foreground">
                  Fecha de nacimiento:{" "}
                  <span className="text-foreground">
                    {new Date(selectedCustomer.birthday).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {selectedCustomer.gender && (
                <div className="text-xs text-muted-foreground">
                  Género:{" "}
                  <span className="text-foreground capitalize">{selectedCustomer.gender}</span>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{selectedCustomer.visitsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Visitas</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">
                    ${selectedCustomer.totalPurchases.toLocaleString("es", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Compras</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{selectedCustomer.rewardsEarned}</p>
                  <p className="text-[10px] text-muted-foreground">Ganados</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{selectedCustomer.rewardsRedeemed}</p>
                  <p className="text-[10px] text-muted-foreground">Canjeados</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Registrado: {formatDate(selectedCustomer.createdAt)}
              </div>

              {/* Quick actions */}
              {selectedCustomer.phone && selectedCustomer.hasWhatsapp && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-green-600 border-green-500/30 hover:bg-green-500/10"
                  onClick={() =>
                    openWhatsApp(selectedCustomer.phone!, formatCustomerName(selectedCustomer))
                  }
                >
                  <MessageCircle className="size-4" />
                  Enviar mensaje por WhatsApp
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Agregar cliente
            </DialogTitle>
            <DialogDescription>
              Registra manualmente un nuevo cliente en tu negocio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Nombre *</Label>
                <Input
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="Nombre"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Apellido</Label>
                <Input
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Apellido"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Teléfono *</Label>
              <Input
                type="tel"
                value={addForm.phone}
                onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 555 123 4567"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Correo electrónico</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={addForm.birthday}
                  onChange={(e) => setAddForm((f) => ({ ...f, birthday: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Género</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Ciudad</Label>
              <Input
                value={addForm.city}
                onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Ciudad"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="add-whatsapp"
                checked={addForm.hasWhatsapp}
                onCheckedChange={(checked) =>
                  setAddForm((f) => ({ ...f, hasWhatsapp: checked === true }))
                }
              />
              <label htmlFor="add-whatsapp" className="text-sm cursor-pointer">
                Tiene WhatsApp
              </label>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleAddCustomer}
              disabled={adding || !addForm.phone.trim() || !addForm.firstName.trim()}
              style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
            >
              {adding ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Registrar cliente
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
