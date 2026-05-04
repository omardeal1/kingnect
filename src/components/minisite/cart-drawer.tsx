"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useCart } from "./cart-provider"
import { OrderForm } from "./order-form"
import { trackEvent } from "@/lib/analytics"

interface CartDrawerProps {
  accentColor: string
  textColor: string
  cardColor: string
  whatsappNumber?: string | null
  miniSiteId: string
  slug: string
}

export function CartDrawer({
  accentColor,
  textColor,
  cardColor,
  whatsappNumber,
  miniSiteId,
  slug,
}: CartDrawerProps) {
  const { items, isOpen, setOpen, removeItem, updateQuantity, total, clearCart } = useCart()
  const [showOrderForm, setShowOrderForm] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: accentColor }} />
            Tu Pedido
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Agrega productos al carrito"
              : `${items.length} producto${items.length > 1 ? "s" : ""} en tu pedido`}
          </SheetDescription>
        </SheetHeader>

        {showOrderForm ? (
          <OrderForm
            accentColor={accentColor}
            textColor={textColor}
            whatsappNumber={whatsappNumber}
            miniSiteId={miniSiteId}
            slug={slug}
            onBack={() => setShowOrderForm(false)}
            onSuccess={() => {
              clearCart()
              setShowOrderForm(false)
              setOpen(false)
            }}
          />
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto py-4 px-1">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-sm opacity-60">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="rounded-xl p-3 shadow-sm"
                      style={{ backgroundColor: cardColor }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold text-sm truncate"
                            style={{ color: textColor }}
                          >
                            {item.name}
                          </p>
                          <p
                            className="text-sm mt-0.5"
                            style={{ color: accentColor }}
                          >
                            ${item.price.toFixed(2)} c/u
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
                            style={{ borderColor: `${accentColor}30`, color: accentColor }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className="w-8 text-center font-semibold text-sm"
                            style={{ color: textColor }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
                            style={{ borderColor: `${accentColor}30`, color: accentColor }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p
                          className="font-bold text-sm"
                          style={{ color: accentColor }}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold" style={{ color: textColor }}>
                    Total
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: accentColor }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    trackEvent(miniSiteId, "click_link", { type: "order" })
                    setShowOrderForm(true)
                  }}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  Hacer pedido
                </button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
