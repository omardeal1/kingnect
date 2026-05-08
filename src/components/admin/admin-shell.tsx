"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  UserCog,
  Kanban,
  Globe,
  ShoppingCart,
  CreditCard,
  Settings,
  ChevronLeft,
  Menu,
  Moon,
  Sun,
  LogOut,
  ArrowLeft,
  Crown,
  FileEdit,
  ShieldCheck,
  GitBranch,
  CalendarDays,
  Heart,
  UserPlus,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "@/i18n/provider"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { href: "/admin", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", key: "nav.clients", icon: Users },
  { href: "/admin/pipeline", key: "nav.pipeline", icon: Kanban },
  { href: "/admin/sites", key: "nav.qaiross", icon: Globe },
  { href: "/admin/orders", key: "nav.orders", icon: ShoppingCart },
  { href: "/admin/plans", key: "nav.plans", icon: CreditCard },
  { href: "/admin/platform-editor", key: "nav.platformEditor", icon: Settings },
  { href: "/admin/landing-editor", key: "nav.landingEditor", icon: FileEdit },
  { href: "/admin/branding", key: "nav.branding", icon: ShieldCheck },
  { href: "/admin/branches", key: "nav.branches", icon: GitBranch },
  { href: "/admin/reservations", key: "nav.reservations", icon: CalendarDays },
  { href: "/admin/customers", key: "nav.customers", icon: Users },
  { href: "/admin/employees", key: "nav.employees", icon: UserCog },
]

interface AdminShellProps {
  user: {
    name: string
    email: string
    image: string | null
  }
  children: React.ReactNode
}

function SidebarContent({
  collapsed,
  user,
  onNavigate,
}: {
  collapsed: boolean
  user: { name: string; email: string; image: string | null }
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslations("admin")

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg gold-gradient flex-shrink-0">
          <Crown className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h1 className="text-lg font-bold gold-gradient-text">QAIROSS</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("nav.adminPanel")}</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                        transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }
                      `}
                    >
                      <item.icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? "text-primary" : "group-hover:text-foreground"
                        }`}
                      />
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="truncate"
                        >
                          {t(item.key)}
                        </motion.span>
                      )}
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="admin-nav-indicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>{t(item.key)}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Moon className="w-4 h-4 flex-shrink-0" />
          )}
          {!collapsed && <span className="ml-3">{theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}</span>}
        </Button>

        <Separator />

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout">
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.closeSession")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslations("admin")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-border bg-card overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} user={user} />
        <div className="border-t border-border p-2 hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>
      </motion.aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">{t("nav.navMenu")}</SheetTitle>
              <SidebarContent
                collapsed={false}
                user={user}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <LanguageToggle variant="minimal" />
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              {t("title")}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={usePathname()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
