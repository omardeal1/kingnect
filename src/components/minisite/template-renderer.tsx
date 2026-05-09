"use client"

import { MiniSitePage } from "./minisite-page"
import { FashionTemplate } from "./templates/template-fashion"
import { MedicalTemplate } from "./templates/template-medical"
import { PremiumTemplate } from "./templates/template-premium"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TemplateRendererProps {
  site: any
}

export function TemplateRenderer({ site }: TemplateRendererProps) {
  const template = site.siteTemplate || "classic"
  
  switch (template) {
    case "medical":
      return <MedicalTemplate site={site} />
    case "premium":
      return <PremiumTemplate site={site} />
    case "fashion":
      return <FashionTemplate site={site} />
    case "classic":
    default:
      return <MiniSitePage site={site} />
  }
}
