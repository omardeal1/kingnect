"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Minus } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/i18n/provider"
import type {
  ModifierGroupData,
  SelectedModifier,
  ModifierSelectionState,
} from "@/lib/modifier-types"
import {
  calculateModifierCost,
  validateModifierSelections,
} from "@/lib/modifier-types"

interface ModifierSelectorProduct {
  id: string
  name: string
  price: number
  imageUrl?: string | null
}

interface ModifierSelectorProps {
  isOpen: boolean
  onClose: () => void
  product: ModifierSelectorProduct | null
  modifierGroups: ModifierGroupData[]
  accentColor: string
  textColor: string
  cardColor: string
  onAddToCart: (modifiers: SelectedModifier[]) => void
}

export function ModifierSelector({
  isOpen,
  onClose,
  product,
  modifierGroups,
  accentColor,
  textColor,
  cardColor,
  onAddToCart,
}: ModifierSelectorProps) {
  const { t } = useTranslations("minisite")

  const [selections, setSelections] = useState<ModifierSelectionState>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  // Initialize selections when product changes
  const activeGroups = useMemo(() => {
    if (!product) return []
    return modifierGroups
      .filter((g) => g.isActive && g.options.some((o) => o.isActive))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((g) => ({
        ...g,
        options: g.options
          .filter((o) => o.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
  }, [product, modifierGroups])

  // Reset selections when product changes
  const resetSelections = useCallback(() => {
    const initial: ModifierSelectionState = {}
    for (const group of activeGroups) {
      initial[group.id] = {
        groupName: group.name,
        selectionType: group.selectionType,
        selected: [],
      }
    }
    setSelections(initial)
    setValidationError(null)
  }, [activeGroups])

  // Handle single selection (radio-like)
  const handleSingleSelect = (groupId: string, option: typeof activeGroups[0]["options"][0]) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        selected: [
          {
            groupId,
            groupName: prev[groupId]?.groupName || "",
            optionId: option.id,
            optionName: option.name,
            extraCost: option.extraCost,
            quantity: 1,
          },
        ],
      },
    }))
    setValidationError(null)
  }

  // Handle multiple selection (checkbox-like)
  const handleMultipleToggle = (groupId: string, option: typeof activeGroups[0]["options"][0]) => {
    setSelections((prev) => {
      const current = prev[groupId]?.selected || []
      const exists = current.find((s) => s.optionId === option.id)
      const newSelected = exists
        ? current.filter((s) => s.optionId !== option.id)
        : [
            ...current,
            {
              groupId,
              groupName: prev[groupId]?.groupName || "",
              optionId: option.id,
              optionName: option.name,
              extraCost: option.extraCost,
              quantity: 1,
            },
          ]
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          selected: newSelected,
        },
      }
    })
    setValidationError(null)
  }

  // Handle quantity selection (quantity selector)
  const handleQuantityChange = (
    groupId: string,
    option: typeof activeGroups[0]["options"][0],
    delta: number
  ) => {
    setSelections((prev) => {
      const current = prev[groupId]?.selected || []
      const existing = current.find((s) => s.optionId === option.id)
      let newSelected: typeof current

      if (existing) {
        const newQty = Math.max(0, Math.min(10, existing.quantity + delta))
        if (newQty === 0) {
          newSelected = current.filter((s) => s.optionId !== option.id)
        } else {
          newSelected = current.map((s) =>
            s.optionId === option.id ? { ...s, quantity: newQty } : s
          )
        }
      } else if (delta > 0) {
        newSelected = [
          ...current,
          {
            groupId,
            groupName: prev[groupId]?.groupName || "",
            optionId: option.id,
            optionName: option.name,
            extraCost: option.extraCost,
            quantity: 1,
          },
        ]
      } else {
        newSelected = current
      }

      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          selected: newSelected,
        },
      }
    })
    setValidationError(null)
  }

  // Collect all selected modifiers
  const allSelectedModifiers = useMemo(() => {
    return Object.values(selections).flatMap((s) => s.selected)
  }, [selections])

  // Calculate total modifier cost
  const modifierCost = useMemo(() => {
    return calculateModifierCost(allSelectedModifiers)
  }, [allSelectedModifiers])

  // Total price
  const totalPrice = (product?.price || 0) + modifierCost

  // Handle add to cart
  const handleAddToCart = () => {
    const { valid, missingGroups } = validateModifierSelections(activeGroups, selections)
    if (!valid) {
      setValidationError(
        `${t("modifiers.requiredMissing", "Please select options for")}: ${missingGroups.join(", ")}`
      )
      toast.error(t("modifiers.requiredMissing", "Please select all required options"))
      return
    }

    onAddToCart(allSelectedModifiers)
    resetSelections()
    onClose()
  }

  // Close and reset
  const handleClose = () => {
    resetSelections()
    onClose()
  }

  if (!product) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="sr-only">{product.name} — Modificadores</SheetTitle>
          <SheetDescription className="sr-only">
            {t("modifiers.selectModifiers", "Selecciona modificadores para tu producto")}
          </SheetDescription>
        </SheetHeader>

        {/* Product info header */}
        <div className="flex-shrink-0 flex gap-3 px-4 pb-3 border-b" style={{ borderColor: `${accentColor}15` }}>
          {product.imageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate" style={{ color: textColor }}>
              {product.name}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: accentColor }}>
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Modifier groups - scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {activeGroups.length === 0 ? (
            <p className="text-sm text-center py-8 opacity-60" style={{ color: textColor }}>
              {t("modifiers.noModifiers", "Sin modificadores disponibles")}
            </p>
          ) : (
            activeGroups.map((group) => (
              <div key={group.id}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-2">
                  <Label
                    className="font-semibold text-sm"
                    style={{ color: textColor }}
                  >
                    {group.name}
                  </Label>
                  {group.isRequired && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-medium"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      {t("modifiers.required", "Requerido")}
                    </Badge>
                  )}
                  <span className="text-[11px] opacity-50" style={{ color: textColor }}>
                    {group.selectionType === "single" && t("modifiers.selectOne", "Selecciona uno")}
                    {group.selectionType === "multiple" && t("modifiers.selectMultiple", "Selecciona varios")}
                    {group.selectionType === "quantity" && t("modifiers.selectQuantity", "Selecciona cantidad")}
                  </span>
                </div>

                {/* Options */}
                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isSelected =
                      group.selectionType === "single"
                        ? selections[group.id]?.selected[0]?.optionId === option.id
                        : selections[group.id]?.selected.some((s) => s.optionId === option.id)
                    const quantityItem = selections[group.id]?.selected.find(
                      (s) => s.optionId === option.id
                    )
                    const qty = quantityItem?.quantity || 0

                    return (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 p-2.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? `${accentColor}10` : "transparent",
                        }}
                        onClick={() => {
                          if (group.selectionType === "single") {
                            handleSingleSelect(group.id, option)
                          } else if (group.selectionType === "multiple") {
                            handleMultipleToggle(group.id, option)
                          }
                        }}
                      >
                        {/* Selection indicator */}
                        {group.selectionType === "single" && (
                          <div
                            className="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              borderColor: isSelected ? accentColor : `${textColor}30`,
                            }}
                          >
                            {isSelected && (
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: accentColor }}
                              />
                            )}
                          </div>
                        )}
                        {group.selectionType === "multiple" && (
                          <div
                            className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              borderColor: isSelected ? accentColor : `${textColor}30`,
                              backgroundColor: isSelected ? accentColor : "transparent",
                            }}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6l3 3 5-5"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        )}

                        {/* Option name and cost */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: textColor }}
                          >
                            {option.name}
                          </p>
                          {option.hasExtraCost && option.extraCost > 0 && (
                            <p className="text-xs opacity-60" style={{ color: textColor }}>
                              +${option.extraCost.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Quantity selector for quantity type */}
                        {group.selectionType === "quantity" && (
                          <div
                            className="flex items-center gap-1.5 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleQuantityChange(group.id, option, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors disabled:opacity-30"
                              style={{
                                borderColor: `${accentColor}40`,
                                color: accentColor,
                              }}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span
                              className="w-6 text-center text-sm font-semibold"
                              style={{ color: textColor }}
                            >
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(group.id, option, 1)}
                              disabled={qty >= 10}
                              className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors disabled:opacity-30"
                              style={{
                                borderColor: `${accentColor}40`,
                                color: accentColor,
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Cost for quantity type */}
                        {group.selectionType === "quantity" && qty > 0 && option.extraCost > 0 && (
                          <span
                            className="text-xs font-medium flex-shrink-0"
                            style={{ color: accentColor }}
                          >
                            +${(option.extraCost * qty).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex-shrink-0 px-4">
            <p className="text-xs text-red-500 font-medium">{validationError}</p>
          </div>
        )}

        {/* Footer with total and add button */}
        <div
          className="flex-shrink-0 border-t px-4 py-3"
          style={{ borderColor: `${accentColor}15` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: textColor }}>
              {t("cart.total", "Total")}
            </span>
            <span className="text-lg font-bold" style={{ color: accentColor }}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            {t("modifiers.addToCart", "Agregar al carrito")} — ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
