"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "@/i18n/provider"
import {
  Search,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BrandingClient {
  id: string
  businessName: string
  contactName: string | null
  email: string | null
  canControlBranding: boolean
  brandVisible: boolean
  miniSiteCount: number
  plan: string | null
  planSlug: string | null
  accountStatus: string
}

interface BrandingControlProps {
  onUpdateStats?: (visible: number, hidden: number) => void
}

export function BrandingControl({ onUpdateStats }: BrandingControlProps) {
  const [clients, setClients] = useState<BrandingClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    clientId: string
    businessName: string
    field: "showBrand" | "canControlBranding"
    newValue: boolean
  }>({ open: false, clientId: "", businessName: "", field: "showBrand", newValue: false })
  const [page, setPage] = useState(0)
  const pageSize = 20
  const { t } = useTranslations("admin")

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/branding?${params}`)
      const data = await res.json()
      const clientList = data.clients ?? []
      setClients(clientList)

      // Update parent with stats
      if (onUpdateStats) {
        const visible = clientList.filter((c: BrandingClient) => c.brandVisible).length
        const hidden = clientList.length - visible
        onUpdateStats(visible, hidden)
      }
    } catch {
      toast.error(t("branding.errors.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [search, t, onUpdateStats])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const openConfirm = (client: BrandingClient, field: "showBrand" | "canControlBranding", newValue: boolean) => {
    setConfirmDialog({
      open: true,
      clientId: client.id,
      businessName: client.businessName,
      field,
      newValue,
    })
  }

  const handleConfirm = async () => {
    const { clientId, field, newValue } = confirmDialog
    setUpdating(clientId)
    setConfirmDialog((prev) => ({ ...prev, open: false }))

    try {
      const body: Record<string, unknown> = { clientId }
      if (field === "showBrand") {
        body.showBrand = newValue
      } else {
        body.canControlBranding = newValue
      }

      const res = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const toastKey = field === "showBrand"
          ? newValue
            ? "branding.toastSuccess.brandShown"
            : "branding.toastSuccess.brandHidden"
          : newValue
            ? "branding.toastSuccess.controlGranted"
            : "branding.toastSuccess.controlRevoked"
        toast.success(t(toastKey, { name: confirmDialog.businessName }))
        fetchClients()
      } else {
        toast.error(t("branding.errors.updateFailed"))
      }
    } catch {
      toast.error(t("branding.errors.updateFailed"))
    } finally {
      setUpdating(null)
    }
  }

  const filteredClients = clients.filter((client) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      client.businessName.toLowerCase().includes(q) ||
      client.contactName?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q)
    )
  })

  const paginatedClients = filteredClients.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(filteredClients.length / pageSize)

  return (
    <>
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("branding.searchPlaceholder")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-9"
            />
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
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("branding.noClients")}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("branding.client")}</TableHead>
                      <TableHead>{t("branding.plan")}</TableHead>
                      <TableHead>{t("branding.sites")}</TableHead>
                      <TableHead>{t("branding.brandVisible")}</TableHead>
                      <TableHead>{t("branding.clientControl")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{client.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.contactName ?? client.email ?? ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.plan ? (
                            <Badge variant="outline" className="text-xs">
                              {client.plan}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.miniSiteCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                client.brandVisible
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                              }
                            >
                              {client.brandVisible
                                ? <><Eye className="w-3 h-3 mr-1" /> {t("branding.visible")}</>
                                : <><EyeOff className="w-3 h-3 mr-1" /> {t("branding.hidden")}</>
                              }
                            </Badge>
                            <Switch
                              checked={client.brandVisible}
                              disabled={updating === client.id}
                              onCheckedChange={(checked) =>
                                openConfirm(client, "showBrand", checked)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {client.canControlBranding ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Shield className="w-3 h-3 mr-1" />
                                {t("branding.enabled")}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {t("branding.disabled")}
                              </span>
                            )}
                            <Switch
                              checked={client.canControlBranding}
                              disabled={updating === client.id}
                              onCheckedChange={(checked) =>
                                openConfirm(client, "canControlBranding", checked)
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t("branding.clientsCount", { count: filteredClients.length })} · {t("branding.page", { current: page + 1, total: totalPages })}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.field === "showBrand"
                ? confirmDialog.newValue
                  ? t("branding.confirmShow", { name: confirmDialog.businessName })
                  : t("branding.confirmHide", { name: confirmDialog.businessName })
                : confirmDialog.newValue
                  ? t("branding.confirmGrant", { name: confirmDialog.businessName })
                  : t("branding.confirmRevoke", { name: confirmDialog.businessName })
              }
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.field === "showBrand"
                ? confirmDialog.newValue
                  ? t("branding.confirmShowDesc")
                  : t("branding.confirmHideDesc")
                : confirmDialog.newValue
                  ? t("branding.confirmGrantDesc")
                  : t("branding.confirmRevokeDesc")
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
            >
              {t("branding.cancel")}
            </Button>
            <Button onClick={handleConfirm}>
              {t("branding.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
