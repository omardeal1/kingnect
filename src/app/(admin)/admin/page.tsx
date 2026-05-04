"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Globe,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
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
        <p className="text-muted-foreground">Error al cargar estadísticas</p>
      </div>
    )
  }

  const metricCards = [
    {
      label: "Kinecs Activas",
      value: stats.sites.active,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Kinecs Inactivas",
      value: stats.sites.inactive,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Kinecs Borrador",
      value: stats.sites.draft,
      icon: FileEdit,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Clientes Nuevos (Mes)",
      value: stats.clients.newThisMonth,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Clientes Activos",
      value: stats.clients.active,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Clientes Bloqueados",
      value: stats.clients.blocked,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "En Trial",
      value: stats.clients.trial,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "MRR Estimado",
      value: `$${stats.revenue.mrr.toLocaleString("es")}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pedidos Hoy",
      value: stats.orders.today,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pedidos Este Mes",
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
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">
            Vista general de KINGNECT
          </p>
        </div>
        <Button asChild className="gold-gradient text-black font-semibold">
          <Link href="/admin/sites">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Kinec
          </Link>
        </Button>
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
              Última Actividad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sin actividad reciente
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
                        {log.user?.name ?? "Sistema"} ·{" "}
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
              Resumen de Kinecs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">Publicadas y Activas</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {stats.sites.active}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-red-500" />
                <span className="text-sm">Desactivadas</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {stats.sites.inactive}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Borrador</span>
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
                ? `${Math.round((stats.sites.active / stats.sites.total) * 100)}% de Kinecs activas`
                : "Sin Kinecs"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
