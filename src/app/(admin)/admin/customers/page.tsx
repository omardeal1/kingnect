"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import {
  Search,
  Loader2,
  Eye,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  UserPlus,
  Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface SiteOption {
  id: string
  businessName: string
  slug: string
  client: {
    id: string
    businessName: string
  }
}

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
  loyaltyConfig: {
    isEnabled: boolean
    targetValue: number
  } | null
}

const registrationMethodLabels: Record<string, string> = {
  manual: "Manual",
  google: "Google",
  facebook: "Facebook",
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [profileFilter, setProfileFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { t } = useTranslations("admin")

  // Add customer dialog
  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sites, setSites] = useState<SiteOption[]>([])
  const [sitesLoading, setSitesLoading] = useState(false)
  const [addForm, setAddForm] = useState({
    siteId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
    gender: "",
    city: "",
    hasWhatsapp: false,
  })

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (profileFilter !== "all") params.set("profileCompleted", profileFilter)
      params.set("page", String(page))
      params.set("limit", "25")

      const res = await fetch(`/api/admin/customers?${params}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotal(data.pagination?.total ?? 0)
    } catch {
      toast.error("Error al cargar clientes")
    } finally {
      setLoading(false)
    }
  }, [search, profileFilter, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const fetchSites = async () => {
    setSitesLoading(true)
    try {
      const res = await fetch("/api/admin/sites")
      const data = await res.json()
      setSites(data.sites ?? [])
    } catch {
      toast.error("Error al cargar sitios")
    } finally {
      setSitesLoading(false)
    }
  }

  const openDetail = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setDetailOpen(true)
  }

  const openAddDialog = () => {
    if (sites.length === 0) {
      fetchSites()
    }
    setAddForm({
      siteId: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      birthday: "",
      gender: "",
      city: "",
      hasWhatsapp: false,
    })
    setAddOpen(true)
  }

  const handleAddCustomer = async () => {
    if (!addForm.siteId) {
      toast.error("Selecciona un sitio")
      return
    }
    if (!addForm.phone.trim()) {
      toast.error("El teléfono es requerido")
      return
    }

    setAdding(true)
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: addForm.siteId,
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
          toast.info("Este cliente ya estaba registrado en este sitio")
        }
        setAddOpen(false)
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
    const headers = [
      "Negocio",
      "Cliente",
      "Teléfono",
      "Correo",
      "Método Registro",
      "Visitas",
      "Compras",
      "Lealtad",
      "Perfil",
      "Registro",
    ]
    const rows = customers.map((c) => [
      c.site.businessName,
      `${c.firstName || ""} ${c.lastName || ""}`.trim(),
      c.phone || "",
      c.email || "",
      registrationMethodLabels[c.registrationMethod] || c.registrationMethod,
      c.visitsCount,
      c.totalPurchases,
      c.currentProgress,
      c.profileCompleted ? "Completo" : "Incompleto",
      new Date(c.createdAt).toLocaleDateString("es"),
    ])

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV descargado")
  }

  const formatCustomerName = (c: CustomerData) => {
    if (c.firstName || c.lastName) {
      return `${c.firstName || ""} ${c.lastName || ""}`.trim()
    }
    return c.phone || "Sin nombre"
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Clientes registrados</h1>
            <p className="text-muted-foreground mt-1">
              Todos los clientes registrados en la plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={customers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={openAddDialog}
              className="gap-2"
              style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
            >
              <UserPlus className="w-4 h-4" />
              Agregar cliente
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por negocio o cliente..."
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
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los perfiles</SelectItem>
                  <SelectItem value="true">Completado</SelectItem>
                  <SelectItem value="false">Incompleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No se encontraron clientes</p>
                <p className="text-xs mb-4">Los clientes aparecerán aquí cuando se registren</p>
                <Button
                  onClick={openAddDialog}
                  className="gap-2"
                  style={{ backgroundColor: "#D4A849", borderColor: "#D4A849" }}
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar cliente manualmente
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negocio</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Visitas</TableHead>
                      <TableHead>Compras</TableHead>
                      <TableHead>Lealtad</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Ver</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-sm max-w-[140px] truncate">
                          {customer.site.businessName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCustomerName(customer)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.phone || "—"}
                        </TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate">
                          {customer.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {registrationMethodLabels[customer.registrationMethod] ||
                              customer.registrationMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.visitsCount}
                        </TableCell>
                        <TableCell className="text-sm">
                          ${customer.totalPurchases.toLocaleString("es", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.loyaltyConfig?.isEnabled ? (
                            <span>
                              {customer.currentProgress}/{customer.loyaltyConfig.targetValue}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.profileCompleted ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            >
                              <CheckCircle2 className="size-3 mr-0.5" />
                              Completo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                            >
                              <XCircle className="size-3 mr-0.5" />
                              Incompleto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDetail(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={item} className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} clientes encontrados
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
              {page} de {totalPages}
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

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Detalle del cliente
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="text-sm font-medium">
                    {formatCustomerName(selectedCustomer)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm">
                    {selectedCustomer.phone || "—"}
                    {selectedCustomer.hasWhatsapp && (
                      <Badge variant="outline" className="ml-1 text-[10px] text-green-600 border-green-500/30">
                        WA
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm">{selectedCustomer.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ciudad</p>
                  <p className="text-sm">{selectedCustomer.city || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <p className="text-sm">
                    {selectedCustomer.birthday
                      ? new Date(selectedCustomer.birthday).toLocaleDateString("es")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Género</p>
                  <p className="text-sm capitalize">
                    {selectedCustomer.gender || "—"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Business info */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Negocio</p>
                <p className="text-sm font-medium">
                  {selectedCustomer.site.businessName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliente plataforma: {selectedCustomer.site.client.businessName}
                </p>
              </div>

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
                  <p className="text-[10px] text-muted-foreground">Premios</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{selectedCustomer.rewardsRedeemed}</p>
                  <p className="text-[10px] text-muted-foreground">Canjeados</p>
                </div>
              </div>

              {/* QR Code */}
              {selectedCustomer.qrCheckinCode && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código QR de check-in</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 font-mono text-sm font-bold">
                    {selectedCustomer.qrCheckinCode}
                  </div>
                </div>
              )}

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="block">Método de registro</span>
                  <span className="text-foreground text-sm">
                    {registrationMethodLabels[selectedCustomer.registrationMethod] ||
                      selectedCustomer.registrationMethod}
                  </span>
                </div>
                <div>
                  <span className="block">Fecha de registro</span>
                  <span className="text-foreground text-sm">
                    {new Date(selectedCustomer.createdAt).toLocaleString("es")}
                  </span>
                </div>
                <div>
                  <span className="block">Perfil</span>
                  {selectedCustomer.profileCompleted ? (
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
                </div>
                <div>
                  <span className="block">Estado</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedCustomer.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                        : "bg-red-500/10 text-red-600 border-red-500/20 text-[10px]"
                    }
                  >
                    {selectedCustomer.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Agregar cliente
            </DialogTitle>
            <DialogDescription>
              Registra manualmente un nuevo cliente en un sitio de la plataforma
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Site selector */}
            <div className="space-y-1.5">
              <Label className="text-sm">Sitio *</Label>
              <Select
                value={addForm.siteId}
                onValueChange={(v) => setAddForm((f) => ({ ...f, siteId: v }))}
                disabled={sitesLoading}
              >
                <SelectTrigger>
                  <Building2 className="size-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={sitesLoading ? "Cargando sitios..." : "Seleccionar sitio"} />
                </SelectTrigger>
                <SelectContent>
                  {sites.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No hay sitios disponibles
                    </SelectItem>
                  ) : (
                    sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <span>{site.businessName}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          — {site.client.businessName}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Name fields */}
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

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-sm">Teléfono *</Label>
              <Input
                type="tel"
                value={addForm.phone}
                onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 555 123 4567"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm">Correo electrónico</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Birthday & Gender */}
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

            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-sm">Ciudad</Label>
              <Input
                value={addForm.city}
                onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Ciudad"
              />
            </div>

            {/* WhatsApp checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="admin-add-whatsapp"
                checked={addForm.hasWhatsapp}
                onCheckedChange={(checked) =>
                  setAddForm((f) => ({ ...f, hasWhatsapp: checked === true }))
                }
              />
              <label htmlFor="admin-add-whatsapp" className="text-sm cursor-pointer">
                Tiene WhatsApp
              </label>
            </div>

            {/* Submit */}
            <Button
              className="w-full gap-2"
              onClick={handleAddCustomer}
              disabled={
                adding ||
                !addForm.siteId ||
                !addForm.phone.trim() ||
                !addForm.firstName.trim()
              }
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
