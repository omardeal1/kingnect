"use client"

import * as React from "react"
import type { ButtonStyleProps } from "./cylinder-pill"

export function IconOnlyButton({
  icon,
  label,
  href,
  onClick,
  className = "",
  accentColor = "#D4A849",
  textColor,
  disabled = false,
}: ButtonStyleProps) {
  const bg = accentColor
  const fg = textColor || "#FFFFFF"

  const classes = [
    "inline-flex items-center justify-center w-12 h-12 rounded-full font-medium text-sm",
    "shadow-sm transition-all duration-200",
    "hover:scale-110 active:scale-95",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ")

  const style: React.CSSProperties = {
    backgroundColor: bg,
    color: fg,
    minWidth: "48px",
    minHeight: "48px",
  }

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        style={style}
        aria-label={label}
      >
        <span className="flex-shrink-0">{icon}</span>
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
      aria-label={label}
    >
      <span className="flex-shrink-0">{icon}</span>
    </button>
  )
}
