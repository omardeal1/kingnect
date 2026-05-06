"use client"

import * as React from "react"

export interface ButtonStyleProps {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  className?: string
  accentColor?: string
  textColor?: string
  disabled?: boolean
}

export function CylinderPillButton({
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
    "inline-flex items-center gap-2.5 w-full px-5 py-3 rounded-full font-medium text-sm",
    "shadow-md transition-all duration-200",
    "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
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
