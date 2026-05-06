"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type { SelectedModifier } from "@/lib/modifier-types"
import { calculateModifierCost } from "@/lib/modifier-types"

export interface CartItem {
  menuItemId: string
  cartItemId: string
  name: string
  price: number
  quantity: number
  modifiers: SelectedModifier[]
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { cartItemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { cartItemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_OPEN"; payload: boolean }

// Generate a unique cart item ID based on menuItemId and modifier selections
export function generateCartItemId(
  menuItemId: string,
  modifiers: SelectedModifier[]
): string {
  const modifierKey = modifiers
    .map((m) => m.optionId)
    .sort()
    .join("-")
  return `${menuItemId}|${modifierKey}`
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.cartItemId === action.payload.cartItemId
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartItemId === action.payload.cartItemId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.cartItemId !== action.payload.cartItemId),
      }
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.cartItemId !== action.payload.cartItemId),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartItemId === action.payload.cartItemId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      }
    }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "SET_OPEN":
      return { ...state, isOpen: action.payload }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  setOpen: (open: boolean) => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  })

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item })
    dispatch({ type: "SET_OPEN", payload: true })
  }, [])

  const removeItem = useCallback((cartItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { cartItemId } })
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const setOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_OPEN", payload: open })
  }, [])

  const total = state.items.reduce((sum, i) => {
    const modifierCost = calculateModifierCost(i.modifiers)
    return sum + (i.price + modifierCost) * i.quantity
  }, 0)
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setOpen,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
