"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckCircle2,
  XCircle,
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
import { toast } from "sonner"

interface EmployeeRow {
  id: string
  userId: string | null
  roleId: string
  email: string
  name: string
  phone: string | null
  isActive: boolean
  invitedAt: string
  invitedBy: string | null
  accessExpiresAt: string | null
  lastLoginAt: string | null
  role: {
    id: string
    name: string
    description: string | null
    permissions: { id: string; module: string; action: string; description: string | null }[]
  } | null
  user: {
    name: string | null
    client: {
      id: string
      businessName: string
    } | null
  } | null
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const statusFilters = [
    { value: "all", label: "Todos", icon: Users },
    { value: "active", label: "Activos", icon: CheckCircle2 },
    { value: "inactive", label: "Inactivos", icon: XCircle },
  ]

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/employees?${params}`)
      const data = await res.json()
      setEmployees(data.employees ?? [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch {
      toast.error("Error al cargar los empleados")
    } finally {
      setLoading(false)
    }
  }, [filter, search, pagination.page])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setSearch(debouncedSearch), 400)
    return () => clearTimeout(timer)
  }, [debouncedSearch])

  const statusBadge = (isActive: boolean) => (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={`text-[10px] px-1.5 py-0 ${
        isActive
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          : "bg-red-500/10 text-red-600 border-red-500/20"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </Badge>
  )

  const roleBadge = (role: EmployeeRow["role"]) => {
    if (!role) {
      return <Badge variant="secondary" className="text-[10px]">Sin rol</Badge>
    }
    return (
      <Badge
        variant="secondary"
        className="text-[10px] px-1.5 py-0 bg-[#D4A849]/10 text-[#D4A849] border-[#D4A849]/20"
      >
        <Shield className="size-2.5 mr-0.5" />
        {role.name}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Empleados</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de todos los empleados en la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={debouncedSearch}
                onChange={(e) => {
                  setDebouncedSearch(e.target.value)
                  setPagination((p) => ({ ...p, page: 1 }))
                }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFilter(f.value)
                    setPagination((p) => ({ ...p, page: 1 }))
                  }}
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
          ) : employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No se encontraron empleados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="hidden lg:table-cell">Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <>
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium max-w-[180px]">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-[#D4A849]/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-[#D4A849]">
                                  {employee.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="truncate block text-sm">
                                  {employee.name}
                                </span>
                                {employee.phone && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Phone className="size-2.5" />
                                    {employee.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="size-3" />
                              {employee.email}
                            </span>
                          </TableCell>
                          <TableCell>{roleBadge(employee.role)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {employee.user?.client ? (
                              <span className="flex items-center gap-1 text-sm">
                                <Building2 className="size-3 text-muted-foreground" />
                                {employee.user.client.businessName}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{statusBadge(employee.isActive)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {employee.lastLoginAt
                              ? new Date(employee.lastLoginAt).toLocaleDateString("es-MX")
                              : "Nunca"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setExpandedId(
                                  expandedId === employee.id ? null : employee.id
                                )
                              }
                              title="Ver detalles"
                            >
                              {expandedId === employee.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded details row */}
                        <TableRow key={`${employee.id}-detail`}>
                          <TableCell colSpan={7} className="p-0">
                            <AnimatePresence>
                              {expandedId === employee.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-muted/30 px-6 py-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                      <div className="flex items-start gap-2">
                                        <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                          <p className="font-medium text-xs text-muted-foreground">Correo</p>
                                          <p>{employee.email}</p>
                                        </div>
                                      </div>
                                      {employee.phone && (
                                        <div className="flex items-start gap-2">
                                          <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Teléfono</p>
                                            <p>{employee.phone}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                          <p className="font-medium text-xs text-muted-foreground">Fecha de invitación</p>
                                          <p>{new Date(employee.invitedAt).toLocaleDateString("es-MX")}</p>
                                        </div>
                                      </div>
                                      {employee.accessExpiresAt && (
                                        <div className="flex items-start gap-2">
                                          <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Expiración de acceso</p>
                                            <p
                                              className={
                                                new Date(employee.accessExpiresAt) < new Date()
                                                  ? "text-destructive"
                                                  : ""
                                              }
                                            >
                                              {new Date(employee.accessExpiresAt).toLocaleDateString("es-MX")}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      {employee.user?.client && (
                                        <div className="flex items-start gap-2">
                                          <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Cliente</p>
                                            <p>{employee.user.client.businessName}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {employee.role?.permissions && employee.role.permissions.length > 0 && (
                                      <div className="pt-2 border-t">
                                        <p className="font-medium text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                          <Shield className="size-3" />
                                          Permisos del rol ({employee.role.name})
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {employee.role.permissions.map((perm) => (
                                            <Badge
                                              key={perm.id}
                                              variant="outline"
                                              className="text-[10px] px-1.5 py-0"
                                            >
                                              {perm.module}.{perm.action}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                    {pagination.total}
                  </p>
                  <div className="flex gap-2">
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
