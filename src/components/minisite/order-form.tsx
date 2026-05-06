"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useCart } from "./cart-provider"
import { OrderSuccess } from "./order-success"
import { useTranslations } from "@/i18n/provider"
import { calculateModifierCost } from "@/lib/modifier-types"

interface OrderFormProps {
  accentColor: string
  textColor: string
  whatsappNumber?: string | null
  miniSiteId: string
  slug: string
  onBack: () => void
  onSuccess: () => void
}

export function OrderForm({
  accentColor,
  textColor,
  whatsappNumber,
  miniSiteId,
  slug,
  onBack,
  onSuccess,
}: OrderFormProps) {
  const { items, total, clearCart } = useCart()
  const { t } = useTranslations("minisite")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null)

  if (orderResult) {
    return <OrderSuccess orderNumber={orderResult.orderNumber} accentColor={accentColor} textColor={textColor} />
  }

  const buildWhatsAppMessage = () => {
    const itemsList = items
      .map((i) => {
        let line = `- ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`
        if (i.modifiers.length > 0) {
          const mods = i.modifiers
            .map((m) => {
              const qtyPrefix = m.quantity > 1 ? `${m.quantity}x ` : ""
              const costSuffix = m.extraCost > 0 ? ` (+$${(m.extraCost * m.quantity).toFixed(2)})` : ""
              return `  · ${qtyPrefix}${m.optionName}${costSuffix}`
            })
            .join("\n")
          line += `\n${mods}`
        }
        const modifierCost = calculateModifierCost(i.modifiers)
        if (modifierCost > 0) {
          line += `\n  Subtotal: $${((i.price + modifierCost) * i.quantity).toFixed(2)}`
        }
        return line
      })
      .join("\n")
    const deliveryLabel = deliveryType === "pickup" ? t("orders.pickup") : t("orders.delivery")
    let msg = `${t("orders.whatsappGreeting")}\n${itemsList}\n${t("cart.total")}: $${total.toFixed(2)}\n${t("orders.name")}: ${name} | ${t("orders.phone")}: ${phone}\n${t("orders.deliveryType")}: ${deliveryLabel}`
    if (deliveryType === "delivery" && address) {
      msg += ` | ${t("orders.address")}: ${address}`
    }
    if (notes) {
      msg += ` | ${t("orders.notes")}: ${notes}`
    }
    return msg
  }

  const handleWhatsApp = () => {
    if (!name.trim() || !phone.trim()) return
    const msg = buildWhatsAppMessage()
    const encoded = encodeURIComponent(msg)
    const number = whatsappNumber || ""
    window.open(`https://wa.me/${number}?text=${encoded}`, "_blank")
  }

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          miniSiteId,
          customerName: name,
          customerPhone: phone,
          deliveryType,
          address: deliveryType === "delivery" ? address : undefined,
          notes: notes || undefined,
          items: items.map((i) => {
            const modifierCost = calculateModifierCost(i.modifiers)
            return {
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.price,
              total: (i.price + modifierCost) * i.quantity,
              modifiers: i.modifiers.map((m) => ({
                modifierGroupName: m.groupName,
                optionName: m.optionName,
                extraCost: m.extraCost,
                quantity: m.quantity,
              })),
            }
          }),
          total,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("orders.createError"))
      }
      const data = await res.json()
      setOrderResult({ orderNumber: data.order?.id?.slice(-6).toUpperCase() || "OK" })
      clearCart()
    } catch (err) {
      console.error(err)
      alert(t("orders.createErrorRetry"))
    } finally {
      setLoading(false)
    }
  }

  const isValid = name.trim() && phone.trim() && (deliveryType === "pickup" || address.trim())

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm mb-4 opacity-70 hover:opacity-100 transition-opacity"
        style={{ color: textColor }}
      >
        <ArrowLeft className="w-4 h-4" />
        {t("orders.backToCart")}
      </button>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
            {t("orders.name")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("orders.namePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: `${accentColor}30`,
              color: textColor,
            }}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
            {t("orders.phone")} *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5215512345678"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: `${accentColor}30`,
              color: textColor,
            }}
          />
        </div>

        {/* Delivery type */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
            {t("orders.deliveryType")}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryType("pickup")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: deliveryType === "pickup" ? accentColor : `${accentColor}10`,
                color: deliveryType === "pickup" ? "#FFFFFF" : accentColor,
              }}
            >
              {t("orders.pickup")}
            </button>
            <button
              onClick={() => setDeliveryType("delivery")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: deliveryType === "delivery" ? accentColor : `${accentColor}10`,
                color: deliveryType === "delivery" ? "#FFFFFF" : accentColor,
              }}
            >
              {t("orders.delivery")}
            </button>
          </div>
        </div>

        {/* Address (delivery only) */}
        {deliveryType === "delivery" && (
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
              {t("orders.address")} *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("orders.addressPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2"
              style={{
                borderColor: `${accentColor}30`,
                color: textColor,
              }}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
            {t("orders.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("orders.notesPlaceholder")}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none focus:ring-2"
            style={{
              borderColor: `${accentColor}30`,
              color: textColor,
            }}
          />
        </div>

        {/* Order summary */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ backgroundColor: `${accentColor}08` }}
        >
          <p className="text-xs font-semibold" style={{ color: textColor }}>
            {t("orders.orderSummary")}
          </p>
          {items.map((i) => {
            const modifierCost = calculateModifierCost(i.modifiers)
            const itemTotal = (i.price + modifierCost) * i.quantity
            return (
              <div key={i.cartItemId} style={{ color: textColor }}>
                <div className="flex justify-between text-xs">
                  <span>
                    {i.name} x{i.quantity}
                  </span>
                  <span>${itemTotal.toFixed(2)}</span>
                </div>
                {/* Show modifiers per item */}
                {i.modifiers.length > 0 && (
                  <div className="ml-3 space-y-0.5">
                    {i.modifiers.map((mod) => (
                      <p key={mod.optionId} className="text-[11px] opacity-60">
                        {mod.quantity > 1 ? `${mod.quantity}x ` : ""}
                        {mod.optionName}
                        {mod.extraCost > 0 && ` (+$${(mod.extraCost * mod.quantity).toFixed(2)})`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div
            className="flex justify-between font-bold text-sm pt-2 border-t"
            style={{ color: accentColor, borderColor: `${accentColor}20` }}
          >
            <span>{t("cart.total")}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t pt-4 mt-4 space-y-3">
        {whatsappNumber && (
          <button
            onClick={handleWhatsApp}
            disabled={!isValid}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#25D366" }}
          >
            {t("orders.sendWhatsApp")}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("orders.processing")}
            </>
          ) : (
            <span>{t("orders.confirmOrder")}</span>
          )}
        </button>
      </div>
    </motion.div>
  )
}
