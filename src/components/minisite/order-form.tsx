"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useCart } from "./cart-provider"
import { OrderSuccess } from "./order-success"

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
      .map((i) => `- ${i.name} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n")
    const deliveryLabel = deliveryType === "pickup" ? "Recoger" : "Delivery"
    let msg = `Hola, quiero hacer un pedido:\n${itemsList}\nTotal: $${total.toFixed(2)}\nNombre: ${name} | Tel: ${phone}\nEntrega: ${deliveryLabel}`
    if (deliveryType === "delivery" && address) {
      msg += ` | Dirección: ${address}`
    }
    if (notes) {
      msg += ` | Notas: ${notes}`
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
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.price,
            total: i.price * i.quantity,
          })),
          total,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al crear pedido")
      }
      const data = await res.json()
      setOrderResult({ orderNumber: data.order?.id?.slice(-6).toUpperCase() || "OK" })
      clearCart()
    } catch (err) {
      console.error(err)
      alert("Error al crear el pedido. Intenta de nuevo.")
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
        Volver al carrito
      </button>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
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
            Teléfono / WhatsApp *
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
            Tipo de entrega
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
              Recoger
            </button>
            <button
              onClick={() => setDeliveryType("delivery")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: deliveryType === "delivery" ? accentColor : `${accentColor}10`,
                color: deliveryType === "delivery" ? "#FFFFFF" : accentColor,
              }}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Address (delivery only) */}
        {deliveryType === "delivery" && (
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: textColor }}>
              Dirección de entrega *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, colonia..."
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
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones especiales, alergias, etc."
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
            Resumen del pedido
          </p>
          {items.map((i) => (
            <div key={i.menuItemId} className="flex justify-between text-xs" style={{ color: textColor }}>
              <span>
                {i.name} x{i.quantity}
              </span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div
            className="flex justify-between font-bold text-sm pt-2 border-t"
            style={{ color: accentColor, borderColor: `${accentColor}20` }}
          >
            <span>Total</span>
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
            Enviar por WhatsApp
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
              Procesando...
            </>
          ) : (
            "Confirmar pedido"
          )}
        </button>
      </div>
    </motion.div>
  )
}
