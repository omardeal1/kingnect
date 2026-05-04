"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Globe,
  ShoppingCart,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  Menu,
  AlertTriangle,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useDashboardStore, type DashboardData } from "@/lib/dashboard-store"

interface DashboardShellProps {
  user: {
    name: string
    email: string
    image: string | null
  }
  dashboardData: DashboardData
  children: React.ReactNode
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mi Mini Web",
    href: "/dashboard/sites/_/edit",
    icon: Globe,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    label: "Facturación",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
]

export function DashboardShell({
  user,
  dashboardData,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const setData = useDashboardStore((s) => s.setData)

  // Sync server data to Zustand store for client components
  React.useEffect(() => {
    setData(dashboardData)
  }, [dashboardData, setData])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const { businessName, planName, siteId, isBlocked } = dashboardData

  // Update "Mi Mini Web" href with actual site ID
  const updatedNavItems = navItems.map((item) => {
    if (item.label === "Mi Mini Web" && siteId) {
      return { ...item, href: `/dashboard/sites/${siteId}/edit` }
    }
    return item
  })

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Blocked Account Banner */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive text-destructive-foreground overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                Tu cuenta está pausada. Actualiza tu pago para continuar.
              </span>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-semibold text-destructive hover:bg-white/90 transition-colors"
              >
                Reactivar ahora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 md:px-6">
          {/* Mobile menu trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Crown className="size-4" />
                  </div>
                  <span className="font-bold text-lg">KINGNECT</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {updatedNavItems.map((navItem) => (
                  <Link
                    key={navItem.href}
                    href={navItem.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(navItem.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <navItem.icon className="size-4" />
                    {navItem.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t p-3 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive px-3"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo / Business name */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Crown className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">
                {businessName}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Plan {planName}
              </span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Theme toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                  className="size-9"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  <span className="sr-only">Cambiar tema</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cambiar tema</TooltipContent>
            </Tooltip>
          )}

          {/* User avatar + logout */}
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex size-9 text-muted-foreground hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-card/50 shrink-0">
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {updatedNavItems.map((navItem) => (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(navItem.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <navItem.icon className="size-4" />
                {navItem.label}
              </Link>
            ))}
          </nav>
          <div className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive px-3"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-area-bottom">
        <div className="grid grid-cols-4 h-16">
          {updatedNavItems.map((navItem) => (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                isActive(navItem.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <navItem.icon className="size-5" />
              <span>{navItem.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
