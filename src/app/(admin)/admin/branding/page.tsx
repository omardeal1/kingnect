"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { BrandingControl } from "@/components/admin/branding-control"
import { toast } from "sonner"

export default function BrandingPage() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [hiddenCount, setHiddenCount] = useState(0)
  const [bulkDialog, setBulkDialog] = useState<{
    open: boolean
    action: "show" | "hide"
  } | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const { t } = useTranslations("admin")

  const handleUpdateStats = useCallback((visible: number, hidden: number) => {
    setVisibleCount(visible)
    setHiddenCount(hidden)
  }, [])

  const handleBulkAction = async () => {
    if (!bulkDialog) return
    setBulkLoading(true)

    try {
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showBrand: bulkDialog.action === "show" }),
      })

      if (res.ok) {
        const toastKey = bulkDialog.action === "show"
          ? "branding.toastSuccess.bulkShow"
          : "branding.toastSuccess.bulkHide"
        toast.success(t(toastKey))
        // Force refresh by triggering the stats callback indirectly
        window.location.reload()
      } else {
        toast.error(t("branding.errors.bulkFailed"))
      }
    } catch {
      toast.error(t("branding.errors.bulkFailed"))
    } finally {
      setBulkLoading(false)
      setBulkDialog(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("branding.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("branding.subtitle")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visibleCount}</p>
                <p className="text-xs text-muted-foreground">{t("branding.visibleCount")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-500/10">
                <EyeOff className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hiddenCount}</p>
                <p className="text-xs text-muted-foreground">{t("branding.hiddenCount")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visibleCount + hiddenCount}</p>
                <p className="text-xs text-muted-foreground">{t("branding.totalClients")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setBulkDialog({ open: true, action: "show" })}
                >
                  <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {t("branding.showAll")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setBulkDialog({ open: true, action: "hide" })}
                >
                  <EyeOff className="w-3.5 h-3.5 mr-1 text-gray-500" />
                  {t("branding.hideAll")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Branding Control Table */}
      <BrandingControl onUpdateStats={handleUpdateStats} />

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkDialog?.open ?? false} onOpenChange={(open) => setBulkDialog(open ? bulkDialog : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkDialog?.action === "show"
                ? t("branding.bulkShowTitle")
                : t("branding.bulkHideTitle")
              }
            </DialogTitle>
            <DialogDescription>
              {bulkDialog?.action === "show"
                ? t("branding.bulkShowDesc")
                : t("branding.bulkHideDesc")
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkDialog(null)}
              disabled={bulkLoading}
            >
              {t("branding.cancel")}
            </Button>
            <Button
              variant={bulkDialog?.action === "hide" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={bulkLoading}
            >
              {bulkLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("branding.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
