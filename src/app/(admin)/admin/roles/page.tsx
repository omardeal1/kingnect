"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  ChevronRight,
  Loader2,
  Save,
  X,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PermissionRecord {
  id: string
  module: string
  action: string
  description?: string
}

interface RoleData {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  createdAt: string
  _count: { employees: number; permissions: number }
  permissions: Array<{ permissionId: string; permission: PermissionRecord }>
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const MODULES = [
  "clients",
  "sites",
  "orders",
  "plans",
  "employees",
  "branches",
  "reservations",
  "loyalty",
  "analytics",
  "platform",
  "branding",
  "landing",
] as const

const ACTIONS = [
  "ver",
  "crear",
  "editar",
  "eliminar",
  "gestionar",
] as const

const MODULE_LABELS: Record<string, string> = {
  clients: "Clientes",
  sites: "Sitios",
  orders: "Pedidos",
  plans: "Planes",
  employees: "Empleados",
  branches: "Sucursales",
  reservations: "Reservaciones",
  loyalty: "Lealtad",
  analytics: "Analíticas",
  platform: "Plataforma",
  branding: "Branding",
  landing: "Landing",
}

const ACTION_LABELS: Record<string, string> = {
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
  gestionar: "Gestionar",
}

// ─── Permission Key Helpers ─────────────────────────────────────────────────────

const permKey = (mod: string, act: string) => `${mod}:${act}`

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [permMatrix, setPermMatrix] = useState<Set<string>>(new Set())
  const [permLoading, setPermLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)
  const [formSaving, setFormSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<RoleData | null>(null)

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/roles")
      const data = await res.json()
      setRoles(data.roles ?? [])
    } catch {
      toast.error("Error al cargar los roles")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // ─── Permission Matrix ─────────────────────────────────────────────────────

  const loadPermissions = useCallback(
    async (roleId: string) => {
      setPermLoading(true)
      try {
        const res = await fetch(`/api/admin/roles/${roleId}`)
        const data = await res.json()
        if (data.role) {
          const keys = new Set<string>()
          for (const rp of data.role.permissions) {
            keys.add(permKey(rp.permission.module, rp.permission.action))
          }
          setPermMatrix(keys)
        }
      } catch {
        toast.error("Error al cargar permisos")
      } finally {
        setPermLoading(false)
      }
    },
    []
  )

  const selectRole = (roleId: string) => {
    setSelectedRoleId(roleId === selectedRoleId ? null : roleId)
    if (roleId !== selectedRoleId) {
      loadPermissions(roleId)
    }
  }

  const togglePermission = (mod: string, act: string) => {
    setPermMatrix((prev) => {
      const next = new Set(prev)
      const key = permKey(mod, act)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAllModule = (mod: string) => {
    setPermMatrix((prev) => {
      const next = new Set(prev)
      const allChecked = ACTIONS.every((a) => next.has(permKey(mod, a)))
      for (const a of ACTIONS) {
        const key = permKey(mod, a)
        if (allChecked) next.delete(key)
        else next.add(key)
      }
      return next
    })
  }

  const toggleAllPermissions = () => {
    setPermMatrix((prev) => {
      const allChecked = MODULES.every((m) =>
        ACTIONS.every((a) => prev.has(permKey(m, a)))
      )
      if (allChecked) return new Set<string>()
      const next = new Set<string>()
      for (const m of MODULES) for (const a of ACTIONS) next.add(permKey(m, a))
      return next
    })
  }

  const savePermissions = async () => {
    if (!selectedRoleId) return
    setPermSaving(true)
    try {
      const permissions = Array.from(permMatrix).map((key) => {
        const [module, action] = key.split(":")
        return { module, action }
      })
      const res = await fetch(`/api/admin/roles/${selectedRoleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      })
      if (res.ok) {
        toast.success("Permisos guardados correctamente")
        fetchRoles()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al guardar permisos")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setPermSaving(false)
    }
  }

  // ─── Role CRUD ────────────────────────────────────────────────────────────

  const openCreateForm = () => {
    setFormMode("create")
    setFormName("")
    setFormDesc("")
    setFormIsActive(true)
    setFormOpen(true)
  }

  const openEditForm = (role: RoleData) => {
    setFormMode("edit")
    setFormName(role.name)
    setFormDesc(role.description ?? "")
    setFormIsActive(role.isActive)
    setFormOpen(true)
  }

  const saveForm = async () => {
    if (!formName.trim()) {
      toast.error("El nombre del rol es requerido")
      return
    }
    setFormSaving(true)
    try {
      let res: Response
      if (formMode === "create") {
        res = await fetch("/api/admin/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            description: formDesc.trim() || null,
            isSystem: false,
          }),
        })
      } else {
        const role = roles.find(
          (r) => r.name === formName || selectedRoleId === r.id
        )
        const targetId = role?.id ?? selectedRoleId
        res = await fetch(`/api/admin/roles/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            description: formDesc.trim() || null,
            isActive: formIsActive,
          }),
        })
      }

      if (res.ok) {
        toast.success(
          formMode === "create"
            ? "Rol creado correctamente"
            : "Rol actualizado correctamente"
        )
        setFormOpen(false)
        fetchRoles()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al guardar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setFormSaving(false)
    }
  }

  const deleteRole = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/roles/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success(`Rol "${deleteTarget.name}" eliminado`)
        if (selectedRoleId === deleteTarget.id) {
          setSelectedRoleId(null)
          setPermMatrix(new Set())
        }
        setDeleteTarget(null)
        fetchRoles()
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al eliminar")
      }
    } catch {
      toast.error("Error de conexión")
    }
  }

  const toggleRoleActive = async (role: RoleData) => {
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !role.isActive }),
      })
      if (res.ok) {
        toast.success(
          role.isActive ? "Rol desactivado" : "Rol activado"
        )
        fetchRoles()
      }
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  // ─── Computed ─────────────────────────────────────────────────────────────

  const selectedRole = roles.find((r) => r.id === selectedRoleId)
  const allChecked = MODULES.every((m) =>
    ACTIONS.every((a) => permMatrix.has(permKey(m, a)))
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Roles y Permisos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los roles de acceso y sus permisos en la plataforma
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Crear Rol
        </Button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Roles List ─── */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Roles ({roles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay roles creados
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        onClick={() => selectRole(role.id)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-accent/50 flex items-center gap-3 ${
                          selectedRoleId === role.id
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">
                              {role.name}
                            </span>
                            {role.isSystem && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              >
                                Sistema
                              </Badge>
                            )}
                            {!role.isActive && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-200"
                              >
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {role.description}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {role._count.employees} empleado
                            {role._count.employees !== 1 ? "s" : ""} ·{" "}
                            {role._count.permissions} permiso
                            {role._count.permissions !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            selectedRoleId === role.id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Permission Matrix Panel ─── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedRole ? (
              <motion.div
                key={selectedRole.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {selectedRole.isSystem ? (
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-primary" />
                          )}
                          {selectedRole.name}
                          <Badge variant="outline" className="text-[10px]">
                            {permMatrix.size} permiso
                            {permMatrix.size !== 1 ? "s" : ""}
                          </Badge>
                        </CardTitle>
                        {selectedRole.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedRole.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openEditForm(selectedRole)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          disabled={selectedRole.isSystem}
                          onClick={() => setDeleteTarget(selectedRole)}
                          title={
                            selectedRole.isSystem
                              ? "No se puede eliminar un rol del sistema"
                              : "Eliminar rol"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </Button>
                        <div className="flex items-center gap-1.5 ml-2">
                          <Switch
                            checked={selectedRole.isActive}
                            onCheckedChange={() => toggleRoleActive(selectedRole)}
                          />
                          <Label className="text-xs">
                            {selectedRole.isActive ? "Activo" : "Inactivo"}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-4">
                    {permLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {/* Action headers + Select All */}
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[540px]">
                            <thead>
                              <tr>
                                <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-3 w-32">
                                  Módulo
                                </th>
                                <th className="text-center pb-2">
                                  <button
                                    onClick={toggleAllPermissions}
                                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mx-auto"
                                  >
                                    <Checkbox
                                      checked={allChecked}
                                      onCheckedChange={toggleAllPermissions}
                                    />
                                    Todos
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {MODULES.map((mod) => {
                                const modChecked = ACTIONS.every((a) =>
                                  permMatrix.has(permKey(mod, a))
                                )
                                const modIndeterminate =
                                  !modChecked &&
                                  ACTIONS.some((a) =>
                                    permMatrix.has(permKey(mod, a))
                                  )

                                return (
                                  <tr key={mod} className="group">
                                    <td className="py-2 pr-3">
                                      <button
                                        onClick={() => toggleAllModule(mod)}
                                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                      >
                                        <Checkbox
                                          checked={modChecked}
                                          {...(modIndeterminate
                                            ? {
                                                "data-state": "indeterminate",
                                                className:
                                                  "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
                                              }
                                            : {})}
                                        />
                                        {MODULE_LABELS[mod]}
                                      </button>
                                    </td>
                                    <td>
                                      <div className="flex items-center justify-center gap-1">
                                        {ACTIONS.map((act) => {
                                          const key = permKey(mod, act)
                                          const checked = permMatrix.has(key)
                                          return (
                                            <button
                                              key={act}
                                              onClick={() =>
                                                togglePermission(mod, act)
                                              }
                                              className="w-9 h-9 flex items-center justify-center rounded-md transition-colors hover:bg-accent"
                                              title={`${MODULE_LABELS[mod]} → ${ACTION_LABELS[act]}`}
                                            >
                                              <Checkbox checked={checked} />
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Action labels legend */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                          <span className="text-[11px] text-muted-foreground">
                            Acciones:
                          </span>
                          {ACTIONS.map((act, i) => (
                            <Badge
                              key={act}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {ACTION_LABELS[act]}
                            </Badge>
                          ))}
                        </div>

                        {/* Save button */}
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={savePermissions}
                            disabled={permSaving}
                            className="gap-2 min-w-[160px]"
                          >
                            {permSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {permSaving ? "Guardando..." : "Guardar Permisos"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    Selecciona un rol
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Elige un rol de la lista para ver y editar sus permisos
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Crear Nuevo Rol" : "Editar Rol"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="role-name">Nombre</Label>
              <Input
                id="role-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Gerente, Cajero, Editor..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="role-desc">Descripción</Label>
              <Textarea
                id="role-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Descripción opcional del rol..."
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="role-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="role-active">Rol activo</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={saveForm} disabled={formSaving || !formName.trim()}>
              {formSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              {formMode === "create" ? "Crear Rol" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget._count.employees > 0
                ? `Este rol tiene ${deleteTarget._count.employees} empleado(s) asignado(s). No se puede eliminar hasta reasignar los empleados.`
                : "Esta acción no se puede deshacer. El rol y sus permisos serán eliminados permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteRole}
              disabled={!!(deleteTarget && deleteTarget._count.employees > 0)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
