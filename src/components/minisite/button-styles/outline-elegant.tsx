"use client"

import * as React from "react"
import { useState } from "react"
import type { ButtonStyleProps } from "./cylinder-pill"

export function OutlineElegantButton({
  icon,
  label,
  href,
  onClick,
  className = "",
  accentColor = "#D4A849",
  textColor,
  disabled = false,
}: ButtonStyleProps) {
  const [hovered, setHovered] = useState(false)

  const border = accentColor
  const fg = hovered ? "#FFFFFF" : (textColor || accentColor)
  const bg = hovered ? accentColor : "transparent"

  const classes = [
    "inline-flex items-center gap-2.5 w-full px-5 py-3 rounded-xl font-medium text-sm",
    "border-2 transition-all duration-200",
    "hover:scale-[1.01] active:scale-[0.98]",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ")

  const style: React.CSSProperties = {
    backgroundColor: bg,
    borderColor: border,
    color: fg,
    transition: "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease",
  }

  const mouseProps = disabled
    ? {}
    : {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        style={style}
        {...mouseProps}
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
      {...mouseProps}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
