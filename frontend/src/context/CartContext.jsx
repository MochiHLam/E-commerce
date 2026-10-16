import React, { createContext, useCallback, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const quantity = product.quantity ?? 1
      const existing = prev.find(
        (item) => item.id === product.id && item.variantId === product.variantId,
      )
      if (existing) {
        return [
          ...prev.filter((item) => item !== existing),
          { ...existing, ...product, quantity: existing.quantity + quantity },
        ]
      }
      return [...prev, { ...product, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId, variantId) => {
    setItems((prev) => prev.filter((item) => (
      item.id !== productId || (variantId != null && item.variantId !== variantId)
    )))
  }, [])

  const updateQuantity = useCallback((productId, variantId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId || item.variantId !== variantId))
    } else {
      setItems((prev) =>
        prev.map((item) => (
          item.id === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        ))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
