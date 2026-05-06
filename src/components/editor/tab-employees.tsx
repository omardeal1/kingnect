"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Edit,
  Send,
  Loader2,
  Check,
  X,
  Clock,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TabEmployeesProps {
  siteId: string
}

interface Employee {
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
  role?: { id: string; name: string; description: string | null }
}

interface RoleOption {
  id: string
  name: string
  description: string | null
}

export function TabEmployees({ siteId }: TabEmployeesProps) {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [roles, setRoles] = React.useState<RoleOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null)

  // Form state
  const [formName, setFormName] = React.useState("")
  const [formEmail, setFormEmail] = React.useState("")
  const [formPhone, setFormPhone] = React.useState("")
  const [formRoleId, setFormRoleId] = React.useState("")
  const [formAccessExpiresAt, setFormAccessExpiresAt] = React.useState("")

  // Fetch employees and roles on mount
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, rolesRes] = await Promise.all([
          fetch(`/api/sites/${siteId}/employees`),
          fetch(`/api/sites/${siteId}/employees/roles`),
        ])
        if (empRes.ok) {
          const data = await empRes.json()
          setEmployees(data.employees ?? [])
        }
        if (rolesRes.ok) {
          const data = await rolesRes.json()
          setRoles(data.roles ?? [])
          if (data.roles?.length > 0) {
            setFormRoleId(data.roles[0].id)
          }
        }
      } catch {
        toast.error("Error al cargar empleados")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [siteId])

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormRoleId(roles.length > 0 ? roles[0].id : "")
    setFormAccessExpiresAt("")
    setEditingEmployee(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormName(employee.name)
    setFormEmail(employee.email)
    setFormPhone(employee.phone ?? "")
    setFormRoleId(employee.roleId)
    setFormAccessExpiresAt(
      employee.accessExpiresAt
        ? new Date(employee.accessExpiresAt).toISOString().split("T")[0]
        : ""
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    if (!editingEmployee && (!formEmail.trim() || !formEmail.includes("@"))) {
      toast.error("El correo electrónico es obligatorio y debe ser válido")
      return
    }
    if (!formRoleId) {
      toast.error("Selecciona un rol")
      return
    }

    setSaving(true)
    try {
      if (editingEmployee) {
        // Update
        const res = await fetch(`/api/sites/${siteId}/employees`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: editingEmployee.id,
            name: formName.trim(),
            phone: formPhone.trim() || null,
            roleId: formRoleId,
            accessExpiresAt: formAccessExpiresAt || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Error al actualizar empleado")
        }
        const data = await res.json()
        setEmployees((prev) =>
          prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...data.employee } : e))
        )
        toast.success("Empleado actualizado correctamente")
      } else {
        // Create
        const res = await fetch(`/api/sites/${siteId}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim() || null,
            roleId: formRoleId,
            accessExpiresAt: formAccessExpiresAt || null,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Error al crear empleado")
        }
        const data = await res.json()
        setEmployees((prev) => [data.employee, ...prev])
        toast.success("Invitación enviada correctamente")
      }
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (employeeId: string) => {
    try {
      const res = await fetch(
        `/api/sites/${siteId}/employees?employeeId=${employeeId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Error al eliminar")
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId))
      toast.success("Empleado eliminado correctamente")
    } catch {
      toast.error("Error al eliminar empleado")
    }
  }

  const handleToggleActive = async (employee: Employee) => {
    const newActive = !employee.isActive
    // Optimistic update
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? { ...e, isActive: newActive } : e))
    )
    try {
      await fetch(`/api/sites/${siteId}/employees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, isActive: newActive }),
      })
      toast.success(newActive ? "Empleado activado" : "Empleado desactivado")
    } catch {
      // Rollback
      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? { ...e, isActive: !newActive } : e))
      )
      toast.error("Error al actualizar estado")
    }
  }

  const handleResendInvite = async (employee: Employee) => {
    // Mock resend invite
    toast.success(`Invitación reenviada a ${employee.email}`)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2" />
          Cargando empleados...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Empleados del Sitio ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-[#D4A849]" />
                Empleados
              </CardTitle>
              <CardDescription>
                Gestiona el acceso de tu equipo a este sitio
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openCreateDialog}>
                  <UserPlus className="size-4 mr-1.5" />
                  Invitar empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="size-4 text-[#D4A849]" />
                    {editingEmployee ? "Editar empleado" : "Invitar empleado"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEmployee
                      ? "Modifica los datos del empleado"
                      : "Agrega un nuevo miembro al equipo con acceso a este sitio"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Nombre completo *
                    </Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej: Juan Pérez García"
                      className="h-9"
                    />
                  </div>

                  {/* Email (only for new) */}
                  {!editingEmployee && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        Correo electrónico *
                      </Label>
                      <Input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="empleado@ejemplo.com"
                        className="h-9"
                      />
                    </div>
                  )}

                  {editingEmployee && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        Correo electrónico
                      </Label>
                      <Input
                        value={formEmail}
                        disabled
                        className="h-9 bg-muted"
                      />
                    </div>
                  )}

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      Teléfono
                    </Label>
                    <Input
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+52 555 123 4567"
                      className="h-9"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Shield className="size-3.5" />
                      Rol *
                    </Label>
                    <Select value={formRoleId} onValueChange={setFormRoleId}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Selecciona un rol" />
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

                  {/* Access Expiry */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Fecha de expiración de acceso
                    </Label>
                    <Input
                      type="date"
                      value={formAccessExpiresAt}
                      onChange={(e) => setFormAccessExpiresAt(e.target.value)}
                      className="h-9"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dejar vacío para acceso sin límite de tiempo
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                    ) : editingEmployee ? (
                      <Check className="size-4 mr-1.5" />
                    ) : (
                      <Send className="size-4 mr-1.5" />
                    )}
                    {editingEmployee
                      ? "Guardar cambios"
                      : "Enviar invitación"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="size-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground mb-1">
                No hay empleados invitados
              </p>
              <p className="text-xs text-muted-foreground">
                Agrega miembros a tu equipo para que puedan colaborar en este sitio
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold">{employees.length}</span>
                <span className="text-sm text-muted-foreground">
                  miembros en el equipo
                </span>
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  {employees.filter((e) => e.isActive).length} activos
                </Badge>
              </div>

              <Separator />

              {/* Employee cards */}
              <div className="space-y-2 max-h-[480px] overflow-y-auto">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                  >
                    {/* Avatar placeholder */}
                    <div className="size-9 rounded-full bg-[#D4A849]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-[#D4A849]">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium truncate">
                          {employee.name}
                        </span>
                        {employee.role && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-[#D4A849]/10 text-[#D4A849] border-[#D4A849]/20"
                          >
                            <Shield className="size-2.5 mr-0.5" />
                            {employee.role.name}
                          </Badge>
                        )}
                        <Badge
                          variant={employee.isActive ? "default" : "secondary"}
                          className={`text-[10px] px-1.5 py-0 ${
                            employee.isActive
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}
                        >
                          {employee.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {employee.email}
                        </span>
                      </div>

                      {employee.phone && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="size-3" />
                          {employee.phone}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-2.5" />
                          Invitado:{" "}
                          {new Date(employee.invitedAt).toLocaleDateString("es-MX")}
                        </span>
                        {employee.lastLoginAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-2.5" />
                            Último acceso:{" "}
                            {new Date(employee.lastLoginAt).toLocaleDateString("es-MX")}
                          </span>
                        )}
                        {employee.accessExpiresAt && (
                          <span
                            className={`flex items-center gap-1 ${
                              new Date(employee.accessExpiresAt) < new Date()
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            <Calendar className="size-2.5" />
                            Expira:{" "}
                            {new Date(employee.accessExpiresAt).toLocaleDateString("es-MX")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 mr-2">
                        <Switch
                          checked={employee.isActive}
                          onCheckedChange={() => handleToggleActive(employee)}
                          className="scale-75"
                        />
                      </div>
                      {!employee.userId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleResendInvite(employee)}
                          title="Reenviar invitación"
                        >
                          <Send className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => openEditDialog(employee)}
                        title="Editar"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => handleDelete(employee.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
