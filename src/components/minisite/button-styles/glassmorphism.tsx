"use client"

import * as React from "react"
import type { ButtonStyleProps } from "./cylinder-pill"

export function GlassmorphismButton({
  icon,
  label,
  href,
  onClick,
  className = "",
  accentColor,
  textColor,
  disabled = false,
}: ButtonStyleProps) {
  const fg = textColor || "#FFFFFF"

  const classes = [
    "inline-flex items-center gap-2.5 w-full px-5 py-3 rounded-xl font-medium text-sm",
    "backdrop-blur-md border transition-all duration-200",
    "hover:bg-white/25 active:scale-[0.98]",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ")

  const style: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: fg,
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  }

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        style={style}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span>{label}</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
      style={style}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
