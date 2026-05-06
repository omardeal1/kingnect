"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Loader2,
  Eye,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface PipelineClient {
  id: string
  businessName: string
  contactName: string | null
  phone: string | null
  pipelineStatus: string
  accountStatus: string
  createdAt: string
  owner: { name: string | null; email: string | null }
  subscription: {
    status: string
    plan: { name: string; slug: string; price: number } | null
  } | null
  miniSites: Array<{ id: string; slug: string; businessName: string }>
}

const STATUS_ORDER = [
  "lead",
  "contacted",
  "in_design",
  "in_review",
  "approved",
  "published",
  "active",
  "blocked",
  "cancelled",
]

const STATUS_COLORS: Record<string, { color: string; bgColor: string }> = {
  lead: { color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
  contacted: { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  in_design: { color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  in_review: { color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
  approved: { color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-900/20" },
  published: { color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-900/20" },
  active: { color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  blocked: { color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
  cancelled: { color: "text-gray-500", bgColor: "bg-gray-50 dark:bg-gray-800/50" },
}

export default function AdminPipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, PipelineClient[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<PipelineClient | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [moveStatus, setMoveStatus] = useState("")
  const { t } = useTranslations("admin")

  const fetchPipeline = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/pipeline")
      const data = await res.json()
      setPipeline(data.pipeline ?? {})
    } catch {
      toast.error(t("pipeline.errors.loadFailed"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPipeline()
  }, [])

  const moveClient = async (clientId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, pipelineStatus: newStatus }),
      })
      if (res.ok) {
        toast.success(t("pipeline.toastSuccess.moved", { status: t(`pipeline.statuses.${newStatus}`) }))
        fetchPipeline()
        setDetailOpen(false)
      }
    } catch {
      toast.error(t("pipeline.errors.moveFailed"))
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const idx = STATUS_ORDER.indexOf(currentStatus)
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return null
    return STATUS_ORDER[idx + 1]
  }

  const getPrevStatus = (currentStatus: string): string | null => {
    const idx = STATUS_ORDER.indexOf(currentStatus)
    if (idx <= 0) return null
    return STATUS_ORDER[idx - 1]
  }

  const daysInColumn = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const openDetail = (client: PipelineClient) => {
    setSelectedClient(client)
    setMoveStatus(client.pipelineStatus)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("pipeline.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("pipeline.subtitle")}
        </p>
      </div>

      {/* Kanban Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUS_ORDER.map((status) => {
            const colors = STATUS_COLORS[status] ?? STATUS_COLORS.lead
            const clients = pipeline[status] ?? []

            return (
              <div key={status} className="w-72 flex-shrink-0">
                {/* Column header */}
                <div className={`rounded-t-lg px-3 py-2 ${colors.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${colors.color}`}>
                      {t(`pipeline.statuses.${status}`)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {clients.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto">
                  {clients.map((client) => {
                    const nextStatus = getNextStatus(status)
                    const prevStatus = getPrevStatus(status)

                    return (
                      <motion.div
                        key={client.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openDetail(client)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium truncate flex-1">
                                {client.businessName}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ml-2 flex-shrink-0 ${colors.color}`}
                              >
                                {t(`pipeline.statuses.${status}`)}
                              </Badge>
                            </div>

                            {client.subscription?.plan && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {client.subscription.plan.name}
                              </p>
                            )}

                            {client.phone && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </p>
                            )}

                            <p className="text-[10px] text-muted-foreground mt-1">
                              {daysInColumn(client.createdAt)} {t("pipeline.days")}
                            </p>

                            {/* Move buttons */}
                            <div className="flex items-center gap-1 mt-2">
                              {prevStatus && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-[10px] px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveClient(client.id, prevStatus)
                                  }}
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </Button>
                              )}
                              {nextStatus && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-[10px] px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveClient(client.id, nextStatus)
                                  }}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Client Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedClient?.businessName}</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("pipeline.contact")}</p>
                  <p className="text-sm">{selectedClient.contactName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("pipeline.phone")}</p>
                  <p className="text-sm">{selectedClient.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("pipeline.email")}</p>
                  <p className="text-sm">{selectedClient.owner.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("pipeline.plan")}</p>
                  <p className="text-sm">
                    {selectedClient.subscription?.plan?.name ?? t("pipeline.noPlan")}
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">{t("pipeline.moveTo")}</label>
                  <Select value={moveStatus} onValueChange={setMoveStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`pipeline.statuses.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  onClick={() => moveClient(selectedClient.id, moveStatus)}
                  disabled={moveStatus === selectedClient.pipelineStatus}
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  {t("pipeline.move")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
