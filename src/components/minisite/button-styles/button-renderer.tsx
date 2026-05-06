"use client"

import * as React from "react"
import { CylinderPillButton, type ButtonStyleProps } from "./cylinder-pill"
import { SquareSoftButton } from "./square-soft"
import { IconOnlyButton } from "./icon-only"
import { GlassmorphismButton } from "./glassmorphism"
import { OutlineElegantButton } from "./outline-elegant"

export type ButtonStyleType =
  | "cylinder_pill"
  | "square_soft"
  | "icon_only"
  | "glassmorphism"
  | "outline_elegant"

export interface ButtonRendererProps extends ButtonStyleProps {
  style: ButtonStyleType
}

export function ButtonRenderer({
  style,
  ...props
}: ButtonRendererProps) {
  switch (style) {
    case "cylinder_pill":
      return <CylinderPillButton {...props} />
    case "square_soft":
      return <SquareSoftButton {...props} />
    case "icon_only":
      return <IconOnlyButton {...props} />
    case "glassmorphism":
      return <GlassmorphismButton {...props} />
    case "outline_elegant":
      return <OutlineElegantButton {...props} />
    default:
      return <CylinderPillButton {...props} />
  }
}

export { CylinderPillButton } from "./cylinder-pill"
export { SquareSoftButton } from "./square-soft"
export { IconOnlyButton } from "./icon-only"
export { GlassmorphismButton } from "./glassmorphism"
export { OutlineElegantButton } from "./outline-elegant"
