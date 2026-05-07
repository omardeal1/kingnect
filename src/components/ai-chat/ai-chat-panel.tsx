"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Sparkles,
  Send,
  X,
  Loader2,
  UtensilsCrossed,
  PencilLine,
  DollarSign,
  CalendarDays,
  Lightbulb,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/lib/editor-store"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  id?: string
}

interface MenuData {
  action?: string
  welcomeMessage?: string
  categories?: {
    name: string
    items: {
      name: string
      description: string
      suggestedPrice: number
    }[]
  }[]
}

interface QuickAction {
  id: string
  icon: React.ElementType
  label: string
  prompt: string
  color: string
}

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "create_menu",
    icon: Sparkles,
    label: "Crear mi menú completo con IA",
    prompt:
      "¡Hola! Quiero que me ayudes a crear un menú completo para mi negocio. ¿Me haces algunas preguntas para conocerlo mejor y luego lo generas?",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    id: "improve_desc",
    icon: PencilLine,
    label: "Mejorar descripciones de mis productos",
    prompt:
      "Quiero mejorar las descripciones de mis productos para que sean más atractivas para mis clientes. ¿Qué producto quieres que mejore?",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    id: "suggest_prices",
    icon: DollarSign,
    label: "Sugerir precios para mi negocio",
    prompt:
      "Necesito ayuda con los precios de mis productos. ¿Me puedes sugerir precios justos y competitivos?",
    color: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border-green-200 dark:border-green-800",
  },
  {
    id: "today_reservations",
    icon: CalendarDays,
    label: "¿Qué citas tengo hoy?",
    prompt: "today_reservations",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  {
    id: "business_tips",
    icon: Lightbulb,
    label: "Consejos para mi negocio",
    prompt: "business_tips",
    color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
  siteId: string
}

export function AIChatPanel({ isOpen, onClose, siteId }: AIChatPanelProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [menuData, setMenuData] = React.useState<MenuData | null>(null)
  const [showQuickActions, setShowQuickActions] = React.useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { addMenuCategory, addMenuItem } = useEditorStore()

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // ─── Send message ───────────────────────────────────────────────

  const sendMessage = async (content: string, isQuickAction = false) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: content.trim(),
      id: `user-${Date.now()}`,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setShowQuickActions(false)
    setIsLoading(true)

    try {
      // Determine if it's a quick action that needs special handling
      const isReservationsAction = content === "today_reservations"
      const isTipsAction = content === "business_tips"

      const body: Record<string, unknown> = {
        messages: [...messages, userMessage],
        siteId,
      }

      if (isReservationsAction) {
        body.quickAction = "today_reservations"
        body.messages = [{ role: "user", content: "¿Qué reservaciones tengo hoy?" }]
      } else if (isTipsAction) {
        body.quickAction = "business_tips"
        body.messages = [{ role: "user", content: "Dame consejos para mi negocio" }]
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al conectar con la IA")
      }

      const data = await res.json()

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || data,
        id: `ai-${Date.now()}`,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If menu data was returned, show apply button
      if (data.menuData) {
        setMenuData(data.menuData)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido"
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Lo siento, hubo un error: ${msg}. Intenta de nuevo.`,
        id: `error-${Date.now()}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Apply generated menu ───────────────────────────────────────

  const handleApplyMenu = () => {
    if (!menuData?.categories) return

    try {
      let categoryIndex = 0
      for (const category of menuData.categories) {
        const catId = `cat-ai-${Date.now()}-${categoryIndex}`
        addMenuCategory({
          id: catId,
          miniSiteId: siteId,
          name: category.name,
          enabled: true,
          sortOrder: categoryIndex,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          menuItems: [],
        })

        if (category.items) {
          category.items.forEach((item, itemIdx) => {
            addMenuItem(catId, {
              id: `item-ai-${Date.now()}-${categoryIndex}-${itemIdx}`,
              miniSiteId: siteId,
              categoryId: catId,
              name: item.name,
              description: item.description,
              price: item.suggestedPrice,
              imageUrl: null,
              isOrderable: false,
              enabled: true,
              sortOrder: itemIdx,
              badge: null,
              specialInstructionsEnabled: true,
            })
          })
        }

        categoryIndex++
      }

      toast.success(
        `¡Menú aplicado! ${menuData.categories.length} categorías con ${menuData.categories.reduce((acc, c) => acc + (c.items?.length || 0), 0)} productos agregados.`
      )
      setMenuData(null)

      // Add confirmation message
      const confirmMsg: ChatMessage = {
        role: "assistant",
        content: "¡Listo! He agregado todo el menú a tu editor. Puedes revisar y editar cada categoría y producto en la pestaña **Menú**. Recuerda guardar los cambios cuando termines.",
        id: `confirm-${Date.now()}`,
      }
      setMessages((prev) => [...prev, confirmMsg])
    } catch {
      toast.error("Error al aplicar el menú. Intenta de nuevo.")
    }
  }

  // ─── Handle key press ───────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ─── Quick action handler ───────────────────────────────────────

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === "create_menu") {
      // For create menu, send the prompt and let AI ask questions
      const initMsg: ChatMessage = {
        role: "assistant",
        content:
          "¡Con gusto te ayudo a crear tu menú completo! Para hacerlo perfecto, necesito que me respondas unas preguntas:\n\n1. ¿Cómo se llama tu negocio?\n2. ¿Qué tipo de negocio es? (restaurante, barbería, tienda, cafetería, etc.)\n3. Cuéntame brevemente sobre tu negocio\n4. ¿En qué ciudad o zona estás?\n5. ¿Qué estilo prefieres? (elegante, casual, moderno, familiar)\n\nRespóndeme las que puedas y generaré un menú profesional para ti.",
        id: `ai-init-${Date.now()}`,
      }
      setMessages([initMsg])
      setShowQuickActions(false)
    } else {
      sendMessage(action.prompt, true)
    }
  }

  // ─── Reset chat ─────────────────────────────────────────────────

  const resetChat = () => {
    setMessages([])
    setMenuData(null)
    setShowQuickActions(true)
    setInput("")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop (mobile) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 lg:hidden"
          onClick={onClose}
        />
      </AnimatePresence>

      {/* Chat panel */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-border lg:rounded-l-2xl"
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Asistente IA QAIROSS
              </h3>
              <p className="text-[11px] text-white/70">
                Powered by GPT-4o-mini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={resetChat}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ─── Messages area ───────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        >
          {/* Empty state with quick actions */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              {/* AI avatar */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900"
                />
              </div>

              <div className="text-center max-w-xs">
                <h4 className="font-bold text-lg text-foreground mb-1">
                  ¿En qué te puedo ayudar?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Soy tu asistente de IA. Puedo crear menús, sugerir precios, mejorar descripciones y más.
                </p>
              </div>

              {/* Quick action cards */}
              <div className="w-full space-y-2 px-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                    style={{
                      background: "transparent",
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}
                    >
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 mr-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#D4A849] text-white rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {/* Simple markdown-like rendering */}
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                  )
                )}
              </div>
            </motion.div>
          ))}

          {/* Menu data apply card */}
          {menuData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-800 dark:text-amber-200">
                  Menú generado con éxito
                </span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                {menuData.categories?.length} categorías,{" "}
                {menuData.categories
                  ?.reduce((acc, c) => acc + (c.items?.length || 0), 0)
                  .toFixed(0)}{" "}
                productos
              </div>
              <Button
                onClick={handleApplyMenu}
                className="w-full text-white text-sm font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
                }}
              >
                Aplicar todo al editor
              </Button>
            </motion.div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#D4A849] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[#D4A849] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-[#D4A849] rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  Pensando...
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Quick actions bar (when chat started) ──────── */}
        {messages.length > 0 && showQuickActions && (
          <div className="px-4 py-2 border-t border-border shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all hover:scale-105 active:scale-95 shrink-0 ${action.color}`}
                >
                  <action.icon className="w-3 h-3" />
                  {action.label.length > 30
                    ? action.label.slice(0, 28) + "..."
                    : action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Input area ──────────────────────────────────── */}
        <div className="border-t border-border px-4 py-3 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A849]/50 focus:border-[#D4A849] transition-all placeholder:text-muted-foreground max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 rounded-xl p-0 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #D4A849 0%, #B8912E 100%)"
                  : undefined,
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            IA puede cometer errores. Revisa la información antes de aplicar.
          </p>
        </div>
      </motion.div>
    </>
  )
}
