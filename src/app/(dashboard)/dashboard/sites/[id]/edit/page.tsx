"use client"

import * as React from "react"
import { EditorLayout } from "@/components/editor/editor-layout"

export default function SiteEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)

  return <EditorLayout siteId={id} />
}
