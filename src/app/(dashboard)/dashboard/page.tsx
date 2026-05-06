"use client"

import * as React from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  Copy,
  ExternalLink,
  Pencil,
  Download,
  Eye,
  ShoppingCart,
  ArrowRight,
  MousePointerClick,
  Sparkles,
  QrCode,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { APP_URL, ORDER_STATUSES } from "@/lib/constants"
import { useDashboardStore } from "@/lib/dashboard-store"
import { useTranslations, useLocale } from "@/i18n/provider"

interface AnalyticsData {
  totalViews: number
  totalWhatsappClicks: number
  totalOrders: number
  dailyBreakdown: { date: string; views: number; clicks: number; orders: number }[]
}

interface OrderData {
  id: string
  customerName: string
  customerPhone: string | null
  deliveryType: string
  status: string
  total: number
  notes: string | null
  createdAt: string
  orderItems: { id: string; name: string; quantity: number; unitPrice: number; total: number }[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { t } = useTranslations("dashboard")
  const { locale } = useLocale()
  const dashboardData = useDashboardStore((s) => s.data)
  const {
    businessName,
    planName,
    planPrice,
    planSlug,
    siteSlug,
    siteId,
    periodStart,
    periodEnd,
  } = dashboardData

  const miniWebUrl = `${APP_URL}/${siteSlug || "mi-negocio"}`
  const qrRef = React.useRef<HTMLDivElement>(null)

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics", siteId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?siteId=${siteId}`)
      if (!res.ok) throw new Error("Error")
      return res.json()
    },
    enabled: !!siteId,
  })

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: OrderData[] }>({
    queryKey: ["orders", siteId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?siteId=${siteId}`)
      if (!res.ok) throw new Error("Error")
      return res.json()
    },
    enabled: !!siteId,
  })

  const recentOrders = ordersData?.orders?.slice(0, 5) ?? []

  // Calculate period progress
  const pStart = periodStart ? new Date(periodStart) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 12)
  const pEnd = periodEnd ? new Date(periodEnd) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 18)

  const totalDays = Math.ceil(
    (pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  const elapsedDays = Math.ceil(
    (Date.now() - pStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  const periodProgress = Math.min(
    100,
    Math.max(0, Math.round((elapsedDays / totalDays) * 100))
  )

  const daysRemaining = Math.max(
    0,
    Math.ceil((pEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(miniWebUrl)
      toast.success(t("billing.copyLinkSuccess"))
    } catch {
      toast.error(t("billing.copyLinkError"))
    }
  }

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current) return

    if (format === "svg") {
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) return
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qr-${siteSlug || "mini-web"}.svg`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t("billing.qrPngDownloaded"))
    } else {
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) return
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width * 2
        canvas.height = img.height * 2
        if (ctx) {
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        const pngUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = pngUrl
        a.download = `qr-${siteSlug || "mini-web"}.png`
        a.click()
        toast.success(t("billing.qrPngDownloaded"))
      }
      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)))
    }
  }

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0]
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Card */}
      <motion.div variants={item}>
        <Card className="border-0 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {t("welcome", { name: businessName || "Business" })}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("welcomeSubtitle")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Status Card */}
        <motion.div variants={item}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{t("planStatus.title")}</CardTitle>
              <CardDescription>{t("planStatus.currentPlan")}</CardDescription>
              <CardAction>
                <Badge variant="secondary" className="text-xs">
                  {planName}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("planStatus.periodEnd")}
                  </span>
                  <span className="font-medium">
                    {daysRemaining} {t("planStatus.daysRemaining")}
                  </span>
                </div>
                <Progress value={periodProgress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(pStart)}</span>
                  <span>{formatDate(pEnd)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${planPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("perMonth")}
                  </span>
                </span>
                <Link href="/dashboard/billing">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    {t("planStatus.upgradePlan")}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QAIROSS Card */}
        <motion.div variants={item}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{t("qairossCard.title")}</CardTitle>
              <CardDescription>{t("qairossCard.url")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                <span className="text-sm font-mono truncate flex-1">
                  {miniWebUrl}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0"
                  onClick={copyLink}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Link href={`/${siteSlug || "mi-negocio"}`} target="_blank" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <Eye className="size-3.5" />
                    {t("qairossCard.viewQaiross")}
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/sites/${siteId || "_"}/edit`}
                  className="flex-1"
                >
                  <Button size="sm" className="w-full gap-1.5">
                    <Pencil className="size-3.5" />
                    {t("qairossCard.editQaiross")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* QR Code Card */}
        <motion.div variants={item}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{t("qrCard.title")}</CardTitle>
              <CardDescription>
                {t("billing.scanToView")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                ref={qrRef}
                className="flex items-center justify-center rounded-xl bg-white p-4 mx-auto w-fit"
              >
                <QRCodeSVG
                  value={miniWebUrl}
                  size={160}
                  bgColor="#FFFFFF"
                  fgColor="#0A0A0A"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => downloadQR("png")}
                >
                  <Download className="size-3.5" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => downloadQR("svg")}
                >
                  <QrCode className="size-3.5" />
                  SVG
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Card */}
        <motion.div variants={item}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{t("statsCard.title")}</CardTitle>
              <CardDescription>{t("statsCard.last30Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5 text-center">
                      <Skeleton className="size-10 rounded-lg mx-auto" />
                      <Skeleton className="h-7 w-12 mx-auto" />
                      <Skeleton className="h-3 w-14 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 mx-auto">
                      <Eye className="size-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalViews ?? 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {t("statsCard.visits")}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 mx-auto">
                      <MousePointerClick className="size-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalWhatsappClicks ?? 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {t("statsCard.clicksWhatsapp")}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 mx-auto">
                      <ShoppingCart className="size-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {analytics?.totalOrders ?? 0}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {t("statsCard.orders")}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders Card */}
      <motion.div variants={item}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">{t("recentOrders.title")}</CardTitle>
            <CardDescription>{t("recentOrders.noOrdersDesc")}</CardDescription>
            <CardAction>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  {t("recentOrders.viewAll")}
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-2 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: statusInfo.color }}
                        />
                        <div>
                          <div className="text-sm font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          ${order.total.toFixed(2)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                          style={{
                            backgroundColor: statusInfo.color + "20",
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t("recentOrders.noOrders")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
