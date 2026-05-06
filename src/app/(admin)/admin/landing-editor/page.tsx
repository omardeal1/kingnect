"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  EyeOff,
  Save,
  Rocket,
  Loader2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useTranslations } from "@/i18n/provider"
import { SectionEditor } from "@/components/admin/landing-editor/section-editor"
import { PreviewPanel } from "@/components/admin/landing-editor/preview-panel"
import {
  SECTION_ORDER,
  DEFAULT_SECTIONS,
  type LandingSection,
} from "@/lib/landing-content"

// ─── Section navigation config ──────────────────────────────────────────────────

const SECTION_NAV = [
  { key: "hero", labelKey: "sections.hero" },
  { key: "benefits", labelKey: "sections.benefits" },
  { key: "howItWorks", labelKey: "sections.howItWorks" },
  { key: "orders", labelKey: "sections.orders" },
  { key: "pricing", labelKey: "sections.pricing" },
  { key: "testimonials", labelKey: "sections.testimonials" },
  { key: "faq", labelKey: "sections.faq" },
  { key: "cta", labelKey: "sections.cta" },
  { key: "footer", labelKey: "sections.footer" },
] as const

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function AdminLandingEditorPage() {
  const { t } = useTranslations("admin.landingEditor")
  const [sections, setSections] = useState<LandingSection[]>([])
  const [originalSections, setOriginalSections] = useState<LandingSection[]>([])
  const [activeSection, setActiveSection] = useState<string>("hero")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // ── Fetch sections ──

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/landing-content")
      if (res.ok) {
        const data = await res.json()
        setSections(data.sections ?? [])
        setOriginalSections(data.sections ?? [])
        setHasChanges(false)
      }
    } catch {
      toast.error("Error al cargar contenido")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  // ── Detect changes ──

  useEffect(() => {
    const changed = JSON.stringify(sections) !== JSON.stringify(originalSections)
    setHasChanges(changed)
  }, [sections, originalSections])

  // ── Section helpers ──

  const getSection = useCallback(
    (key: string): LandingSection | undefined => {
      return sections.find((s) => s.sectionKey === key)
    },
    [sections]
  )

  const updateSection = useCallback(
    (updated: LandingSection) => {
      setSections((prev) =>
        prev.map((s) =>
          s.sectionKey === updated.sectionKey ? updated : s
        )
      )
    },
    []
  )

  // ── Save draft ──

  const saveDraft = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/landing-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })
      if (res.ok) {
        toast.success(t("changesSaved"))
        setOriginalSections([...sections])
      } else {
        toast.error("Error al guardar")
      }
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  // ── Publish ──

  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch("/api/admin/landing-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })
      if (res.ok) {
        toast.success(t("publishSuccess"))
        setOriginalSections([...sections])
        await fetchSections()
      } else {
        toast.error("Error al publicar")
      }
    } catch {
      toast.error("Error al publicar")
    } finally {
      setPublishing(false)
    }
  }

  // ── Reset to defaults ──

  const resetToDefaults = () => {
    const defaults = SECTION_ORDER.map((key, index) => ({
      ...DEFAULT_SECTIONS[key],
      sortOrder: index,
      isActive: true,
    }))
    setSections(defaults)
    setShowResetDialog(false)
    toast.success(t("resetSuccess"))
  }

  // ── Loading state ──

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentSection = getSection(activeSection)
  const activeCount = sections.filter((s) => s.isActive).length

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-600 text-xs">
              ● {t("unsavedChanges")}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {activeCount}/{sections.length} {t("activeSections")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            disabled={saving || publishing}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {t("resetDefaults")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullPreview(true)}
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            {t("fullPreview")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDraft}
            disabled={saving || publishing || !hasChanges}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {t("saveDraft")}
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={publish}
            disabled={publishing || saving}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-1" />
            )}
            {t("publish")}
          </Button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Section List */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {SECTION_NAV.map((nav) => {
                  const section = getSection(nav.key)
                  const isActive = activeSection === nav.key
                  const isEnabled = section?.isActive ?? true

                  return (
                    <button
                      key={nav.key}
                      onClick={() => setActiveSection(nav.key)}
                      className={`
                        flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium
                        transition-all duration-200 text-left
                        ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                        }
                      `}
                    >
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          isEnabled ? "bg-green-500" : "bg-muted-foreground/30"
                        }`}
                      />
                      <span className="truncate flex-1">{t(nav.labelKey)}</span>
                      {isActive && (
                        <motion.div
                          layoutId="landing-editor-indicator"
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Center: Section Editor */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardContent className="p-6">
                  {currentSection ? (
                    <SectionEditor
                      section={currentSection}
                      onChange={updateSection}
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {t("selectSection")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-4">
          <PreviewPanel sections={sections} />
        </div>
      </div>

      {/* ── Full Preview Dialog ── */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-base">{t("fullPreview")}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullPreview(false)}
            >
              <Minimize2 className="w-4 h-4 mr-1" />
              {t("closePreview")}
            </Button>
          </DialogHeader>
          <div className="overflow-auto h-[calc(85vh-4rem)]">
            <PreviewPanel sections={sections} fullPreview />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reset Confirmation Dialog ── */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("resetDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefaults}>
              {t("confirmReset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
