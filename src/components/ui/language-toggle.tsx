"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/i18n/provider";
import { localeNames, type Locale, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "default" | "pill" | "minimal";
}

export function LanguageToggle({ className, variant = "default" }: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();

  const handleToggle = () => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]);
  };

  if (variant === "pill") {
    return (
      <div className={cn("flex items-center rounded-full bg-muted p-1", className)}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all",
              locale === loc
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted",
          className
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="uppercase">{locale}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors",
        className
      )}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === "es" ? "Español" : "English"}</span>
    </button>
  );
}
