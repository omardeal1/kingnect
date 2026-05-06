"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, RefreshCw, Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface GeneratedCategory {
  name: string
  items: {
    name: string
    description: string
    suggestedPrice: number
  }[]
}

interface GeneratedMenu {
  welcomeMessage: string
  categories: GeneratedCategory[]
}

interface AiMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (menu: GeneratedMenu) => void
  accentColor?: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AiMenuModal({
  open,
  onOpenChange,
  onAccept,
  accentColor = "#D4A849",
}: AiMenuModalProps) {
  const [businessType, setBusinessType] = useState("")
  const [city, setCity] = useState("")
  const [style, setStyle] = useState("")
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<GeneratedMenu | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  // ─── Generate Menu ───────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!businessType || !city || !style) {
      toast.error("Completa todos los campos")
      return
    }

    setLoading(true)
    setGenerated(null)

    try {
      const res = await fetch("/api/ai/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_menu",
          businessType,
          city,
          style,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al generar el menú")
      }

      setGenerated(data)
      // Expand all categories by default
      setExpandedCategories(new Set(data.categories.map((c: GeneratedCategory) => c.name)))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Accept ─────────────────────────────────────────────────────
  const handleAccept = () => {
    if (!generated) return
    toast.success("Menú generado aplicado correctamente")
    onAccept(generated)
    handleClose()
  }

  // ─── Close / Reset ──────────────────────────────────────────────
  const handleClose = () => {
    setGenerated(null)
    setExpandedCategories(new Set())
    onOpenChange(false)
  }

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const businessTypes = [
    "Restaurante",
    "Taquería",
    "Cafetería",
    "Barbería",
    "Spa / Salon de belleza",
    "Panadería",
    "Pizzería",
    "Sushi bar",
    "Cocktail bar",
    "Heladería",
    "Food truck",
    "Pastelería",
    "Otro",
  ]

  const cities = [
    "Tijuana",
    "Monterrey",
    "CDMX",
    "Guadalajara",
    "Puebla",
    "Cancún",
    "Mérida",
    "Los Angeles",
    "San Diego",
    "Houston",
    "Miami",
    "Otra",
  ]

  const styles = [
    { value: "fino", label: "Fino / Gourmet" },
    { value: "casual", label: "Casual" },
    { value: "familiar", label: "Familiar" },
    { value: "moderno", label: "Moderno" },
    { value: "rustico", label: "Rústico" },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
            Generar menú con IA
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {!generated && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-2"
            >
              <p className="text-sm text-muted-foreground">
                La IA generará un menú completo con categorías, productos,
                descripciones y precios sugeridos basados en tu tipo de negocio.
              </p>

              {/* Business Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de negocio</label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ciudad</label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Estilo deseado</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost estimate */}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <span>💰</span>
                <span>
                  Cada generación cuesta aprox. $0.01-0.03 USD en API de OpenAI.
                </span>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar menú
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full border-4 border-transparent animate-spin"
                  style={{
                    borderTopColor: accentColor,
                    borderRightColor: accentColor,
                  }}
                />
                <Sparkles
                  className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ color: accentColor }}
                />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                La IA está creando tu menú...
              </p>
            </motion.div>
          )}

          {/* Generated Preview */}
          {generated && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Welcome Message */}
              <div
                className="rounded-lg p-3 text-sm font-medium text-center"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                &ldquo;{generated.welcomeMessage}&rdquo;
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {generated.categories.map((category) => (
                  <div key={category.name} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
                    >
                      <span>{category.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedCategories.has(category.name) ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedCategories.has(category.name) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-2">
                            {category.items.map((item) => (
                              <div
                                key={item.name}
                                className="bg-muted/30 rounded-md p-2.5 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: accentColor }}
                                  >
                                    ${item.suggestedPrice.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: accentColor }}
                  onClick={handleAccept}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aceptar todo
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
