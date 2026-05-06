"use client"

import * as React from "react"
import type { ButtonStyleProps } from "./cylinder-pill"

export function SquareSoftButton({
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
    "inline-flex items-center gap-2.5 w-full px-5 py-3 rounded-xl font-medium text-sm",
    "shadow-sm transition-all duration-200",
    "hover:brightness-110 active:scale-[0.98]",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ")

  const style: React.CSSProperties = {
    backgroundColor: bg,
    color: fg,
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
