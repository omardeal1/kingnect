"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import {
  Search,
  GitBranch,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  XCircle,
  FileEdit,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
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

interface BranchRow {
  id: string
  name: string
  slug: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  address: string | null
  whatsapp: string | null
  website: string | null
  mapsUrl: string | null
  description: string | null
  isActive: boolean
  isPublished: boolean
  createdAt: string
  site: {
    id: string
    slug: string
    businessName: string
    isActive: boolean
    client: {
      id: string
      businessName: string
      owner: {
        name: string | null
        email: string | null
      }
    }
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchRow[]>([])
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
  const { t } = useTranslations("admin")

  const statusFilters = [
    { value: "all", label: "Todas", icon: GitBranch },
    { value: "active", label: "Activas", icon: CheckCircle2 },
    { value: "inactive", label: "Inactivas", icon: XCircle },
    { value: "published", label: "Publicadas", icon: Eye },
    { value: "draft", label: "Borrador", icon: FileEdit },
  ]

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.set("status", filter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const res = await fetch(`/api/admin/branches?${params}`)
      const data = await res.json()
      setBranches(data.branches ?? [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch {
      toast.error("Error al cargar las sucursales")
    } finally {
      setLoading(false)
    }
  }, [filter, search, pagination.page])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setSearch(debouncedSearch), 400)
    return () => clearTimeout(timer)
  }, [debouncedSearch])

  const filteredBranches = branches

  const activeStatusBadge = (branch: BranchRow) => {
    if (!branch.isActive) {
      return (
        <Badge variant="destructive" className="text-[10px]">
          Inactiva
        </Badge>
      )
    }
    if (branch.isPublished) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
          Publicada
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
        Borrador
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Sucursales</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de todas las sucursales en la plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, ciudad, estado o negocio..."
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
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No se encontraron sucursales</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negocio</TableHead>
                      <TableHead>Sucursal</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="hidden md:table-cell">Ciudad</TableHead>
                      <TableHead className="hidden lg:table-cell">Estado</TableHead>
                      <TableHead>Activa</TableHead>
                      <TableHead>Publicada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <>
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium max-w-[150px] truncate">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{branch.site.businessName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="size-3.5 text-[#D4A849] shrink-0" />
                              <span className="truncate">{branch.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-accent px-1.5 py-0.5 rounded font-mono">
                              /{branch.site.slug}/{branch.slug}
                            </code>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {branch.city || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {branch.state || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={branch.isActive ? "default" : "secondary"}
                              className={`text-[10px] px-1.5 py-0 ${
                                branch.isActive
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-600 border-red-500/20"
                              }`}
                            >
                              {branch.isActive ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${
                                branch.isPublished
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {branch.isPublished ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === branch.id ? null : branch.id
                                  )
                                }
                                title="Ver detalles"
                              >
                                {expandedId === branch.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                                title="Ver página pública"
                              >
                                <a
                                  href={`/${branch.site.slug}/${branch.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded details row */}
                        <TableRow key={`${branch.id}-detail`}>
                          <TableCell colSpan={8} className="p-0">
                            <AnimatePresence>
                              {expandedId === branch.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-muted/30 px-6 py-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                      {branch.address && (
                                        <div className="flex items-start gap-2">
                                          <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Dirección</p>
                                            <p>{branch.address}</p>
                                          </div>
                                        </div>
                                      )}
                                      {branch.phone && (
                                        <div className="flex items-start gap-2">
                                          <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Teléfono</p>
                                            <p>{branch.phone}</p>
                                          </div>
                                        </div>
                                      )}
                                      {branch.email && (
                                        <div className="flex items-start gap-2">
                                          <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Correo</p>
                                            <p>{branch.email}</p>
                                          </div>
                                        </div>
                                      )}
                                      {branch.whatsapp && (
                                        <div className="flex items-start gap-2">
                                          <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">WhatsApp</p>
                                            <p>{branch.whatsapp}</p>
                                          </div>
                                        </div>
                                      )}
                                      {branch.website && (
                                        <div className="flex items-start gap-2">
                                          <Globe className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                          <div>
                                            <p className="font-medium text-xs text-muted-foreground">Sitio web</p>
                                            <a
                                              href={branch.website}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[#D4A849] hover:underline"
                                            >
                                              {branch.website}
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      {branch.description && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                          <p className="font-medium text-xs text-muted-foreground mb-1">Descripción</p>
                                          <p className="text-muted-foreground">{branch.description}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
                                      <span>
                                        <strong>Cliente:</strong> {branch.site.client.businessName}
                                      </span>
                                      <span>
                                        <strong>Propietario:</strong> {branch.site.client.owner.email}
                                      </span>
                                      <span>
                                        Creada: {new Date(branch.createdAt).toLocaleDateString("es-MX")}
                                      </span>
                                    </div>
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
