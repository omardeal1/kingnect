"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
  Plus,
  Pencil,
  KeyRound,
  UserPlus,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface TeamMemberRow {
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

interface RoleOption {
  id: string
  name: string
  description: string | null
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  roleId: "",
  isActive: true,
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const debounceRef = useRef<NodeJS.Timeout>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [roles, setRoles] = useState<RoleOption[]>([])

  const statusFilters = [
    { value: "all", label: "Todos", icon: Users },
    { value: "active", label: "Activos", icon: CheckCircle2 },
    { value: "inactive", label: "Inactivos", icon: XCircle },
  ]

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/employees?${params}`)
      const data = await res.json()
      setMembers(data.employees ?? [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch {
      toast.error("Error al cargar el equipo")
    } finally {
      setLoading(false)
    }
  }, [filter, search, pagination.page])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles")
      const data = await res.json()
      setRoles(Array.isArray(data) ? data : data.roles ?? [])
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Debounce search
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
      setPagination((p) => ({ ...p, page: 1 }))
    }, 300)
  }

  const openAddDialog = () => {
    setForm(emptyForm)
    setShowAddDialog(true)
  }

  const openEditDialog = (member: TeamMemberRow) => {
    setEditingMember(member)
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone ?? "",
      roleId: member.roleId,
      isActive: member.isActive,
    })
    setShowEditDialog(true)
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nombre y correo son requeridos")
      return
    }
    setFormLoading(true)
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          roleId: form.roleId || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al agregar miembro")
      }
      toast.success("Miembro agregado correctamente")
      setShowAddDialog(false)
      setForm(emptyForm)
      fetchMembers()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al agregar miembro")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingMember) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nombre y correo son requeridos")
      return
    }
    setFormLoading(true)
    try {
      const res = await fetch(`/api/admin/employees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMember.id,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          roleId: form.roleId || null,
          isActive: form.isActive,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al editar miembro")
      }
      toast.success("Miembro actualizado correctamente")
      setShowEditDialog(false)
      setEditingMember(null)
      setForm(emptyForm)
      fetchMembers()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al editar miembro")
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (member: TeamMemberRow) => {
    try {
      const res = await fetch(`/api/admin/employees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          isActive: !member.isActive,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(member.isActive ? "Miembro desactivado" : "Miembro activado")
      fetchMembers()
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  const handleResetPassword = async (member: TeamMemberRow) => {
    if (!member.userId) {
      toast.error("El miembro no tiene una cuenta de usuario asociada")
      return
    }
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          mustChangePassword: true,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Se ha solicitado el cambio de contraseña")
    } catch {
      toast.error("Error al resetear contraseña")
    }
  }

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

  const roleBadge = (role: TeamMemberRow["role"]) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mi Equipo</h1>
          <p className="text-muted-foreground mt-1">
            Administra los miembros internos de tu equipo, asigna roles y permisos
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <UserPlus className="size-4" />
          Agregar miembro
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o teléfono..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
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
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No se encontraron miembros del equipo</p>
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
                    {members.map((member) => (
                      <>
                        <TableRow key={member.id}>
                          <TableCell className="font-medium max-w-[180px]">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-[#D4A849]/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-[#D4A849]">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="truncate block text-sm">
                                  {member.name}
                                </span>
                                {member.phone && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Phone className="size-2.5" />
                                    {member.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="size-3" />
                              {member.email}
                            </span>
                          </TableCell>
                          <TableCell>{roleBadge(member.role)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {member.user?.client ? (
                              <span className="flex items-center gap-1 text-sm">
                                <Building2 className="size-3 text-muted-foreground" />
                                {member.user.client.businessName}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Interno</span>
                            )}
                          </TableCell>
                          <TableCell>{statusBadge(member.isActive)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {member.lastLoginAt
                              ? new Date(member.lastLoginAt).toLocaleDateString("es-MX")
                              : "Nunca"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(member)}
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleResetPassword(member)}
                                title="Resetear contraseña"
                              >
                                <KeyRound className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleActive(member)}
                                title={member.isActive ? "Desactivar" : "Activar"}
                              >
                                {member.isActive ? (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setExpandedId(expandedId === member.id ? null : member.id)
                                }
                                title="Ver detalles"
                              >
                                {expandedId === member.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded details row */}
                        <TableRow key={`${member.id}-detail`}>
                          <TableCell colSpan={7} className="p-0">
                            <AnimatePresence>
                              {expandedId === member.id && (
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
                                          <p>{member.email}</p>
                                        </div>
                                      </div>
                                      {member.phone && (
                                        <div className="flex items-start gap-2">
                                          <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Teléfono</p>
                                            <p>{member.phone}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                          <p className="font-medium text-xs text-muted-foreground">Fecha de invitación</p>
                                          <p>{new Date(member.invitedAt).toLocaleDateString("es-MX")}</p>
                                        </div>
                                      </div>
                                      {member.accessExpiresAt && (
                                        <div className="flex items-start gap-2">
                                          <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Expiración de acceso</p>
                                            <p
                                              className={
                                                new Date(member.accessExpiresAt) < new Date()
                                                  ? "text-destructive"
                                                  : ""
                                              }
                                            >
                                              {new Date(member.accessExpiresAt).toLocaleDateString("es-MX")}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {member.role?.permissions && member.role.permissions.length > 0 && (
                                      <div className="pt-2 border-t">
                                        <p className="font-medium text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                          <Shield className="size-3" />
                                          Permisos del rol ({member.role.name})
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {member.role.permissions.map((perm) => (
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
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
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

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Agregar miembro al equipo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nombre completo</Label>
              <Input
                id="add-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Correo electrónico</Label>
              <Input
                id="add-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Teléfono (opcional)</Label>
              <Input
                id="add-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Rol</Label>
              <Select
                value={form.roleId}
                onValueChange={(value) => setForm({ ...form, roleId: value })}
              >
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5" />
              Editar miembro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select
                value={form.roleId}
                onValueChange={(value) => setForm({ ...form, roleId: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-active">Miembro activo</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="size-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
