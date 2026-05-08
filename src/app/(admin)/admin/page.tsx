"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations } from "@/i18n/provider"
import {
  Globe,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Shield,
  Eye,
  EyeOff,
  FileEdit,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Stats {
  sites: { active: number; inactive: number; draft: number; total: number }
  clients: { active: number; blocked: number; trial: number; newThisMonth: number; total: number }
  revenue: { mrr: number; thisMonth: number }
  orders: { today: number; thisMonth: number; total: number }
  recentActivity: Array<{
    id: string
    action: string
    entityType: string | null
    entityId: string | null
    createdAt: string
    user: { name: string | null; email: string | null } | null
  }>
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslations("admin")

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">{t("dashboard.errorLoading")}</p>
      </div>
    )
  }

  const metricCards = [
    {
      label: t("dashboard.sites.active"),
      value: stats.sites.active,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: t("dashboard.sites.inactive"),
      value: stats.sites.inactive,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: t("dashboard.sites.draft"),
      value: stats.sites.draft,
      icon: FileEdit,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: t("dashboard.clients.newThisMonth"),
      value: stats.clients.newThisMonth,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("dashboard.clients.active"),
      value: stats.clients.active,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: t("dashboard.clients.blocked"),
      value: stats.clients.blocked,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: t("dashboard.clients.trial"),
      value: stats.clients.trial,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: t("dashboard.revenue.mrr"),
      value: `$${stats.revenue.mrr.toLocaleString("es")}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("dashboard.orders.today"),
      value: stats.orders.today,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: t("dashboard.orders.thisMonth"),
      value: stats.orders.thisMonth,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/customers">
              <Users className="w-4 h-4 mr-1" />
              Agregar Cliente
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/employees">
              <Shield className="w-4 h-4 mr-1" />
              Agregar Equipo
            </Link>
          </Button>
          <Button asChild className="gold-gradient text-black font-semibold">
            <Link href="/admin/sites">
              <Plus className="w-4 h-4 mr-2" />
              {t("dashboard.newQaiross")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {metricCards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t("dashboard.lastActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t("dashboard.noActivity")}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user?.name ?? "System"} ·{" "}
                        {new Date(log.createdAt).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {t("dashboard.qairossSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">{t("dashboard.publishedActive")}</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {stats.sites.active}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-red-500" />
                <span className="text-sm">{t("dashboard.deactivated")}</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {stats.sites.inactive}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-500" />
                <span className="text-sm">{t("dashboard.draft")}</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {stats.sites.draft}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{
                  width: `${stats.sites.total > 0 ? (stats.sites.active / stats.sites.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {stats.sites.total > 0
                ? t("dashboard.activePercentage", { percentage: Math.round((stats.sites.active / stats.sites.total) * 100) })
                : t("dashboard.noQaiross")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
