"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useTranslations } from "@/i18n/provider"
import { LanguageToggle } from "@/components/ui/language-toggle"

export function Footer() {
  const { t } = useTranslations("landing.footer")

  const FOOTER_LINKS = [
    { label: t("home"), href: "/" },
    { label: t("pricing"), href: "#precios" },
    { label: t("login"), href: "/login" },
    { label: t("register"), href: "/register" },
  ]

  const LEGAL_LINKS = [
    { label: t("termsAndConditions"), href: "/terminos" },
    { label: t("privacyPolicy"), href: "/privacidad" },
  ]

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo & Description */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-1 text-xl font-bold"
            >
              <span className="text-foreground">QAIROSS</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <span className="font-semibold text-foreground">
                QAIROSS
              </span>
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Social Icons */}
          <div className="flex items-center gap-4">
            <LanguageToggle variant="minimal" />
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Twitter"
            >
              <Twitter className="size-4" />
            </a>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t pt-8 md:flex-row md:justify-between">
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: "2025" })}
          </p>
        </div>
      </div>
    </footer>
  )
}
