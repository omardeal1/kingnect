"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { useTranslations } from "@/i18n/provider"
import { LanguageToggle } from "@/components/ui/language-toggle"

const emptySubscribe = () => () => {}

export function Navbar() {
  const { t } = useTranslations("landing.navbar")
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const NAV_LINKS = [
    { label: t("benefits"), href: "#beneficios" },
    { label: t("howItWorks"), href: "#como-funciona" },
    { label: t("pricing"), href: "#precios" },
    { label: t("faq"), href: "#faq" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-2xl font-bold">
          <span className="text-foreground">QAIROSS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle variant="minimal" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-9"
            aria-label={t("changeTheme")}
          >
            {mounted && (theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />)}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gold text-gold-foreground hover:bg-gold-hover"
            asChild
          >
            <Link href="/register">{t("createMyQaiross")}</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle variant="minimal" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-9"
            aria-label={t("changeTheme")}
          >
            {mounted && (theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />)}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" aria-label={t("menu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-1 text-left text-xl font-bold">
                  <span className="text-foreground">QAIROSS</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4 pt-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 px-4">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="w-full bg-gold text-gold-foreground hover:bg-gold-hover"
                    asChild
                  >
                    <Link href="/register">{t("createMyQaiross")}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
