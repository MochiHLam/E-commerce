import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { isSellerShopActive } from '@/mocks/seller'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'navishop.mockCart.items'

function readStoredCart() {
  try {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY)
    if (!storedItems) return []

    const items = JSON.parse(storedItems)
    if (!Array.isArray(items)) {
      throw new Error('Dữ liệu giỏ hàng mô phỏng không hợp lệ.')
    }
    return items.filter((item) => (
      item
      && typeof item.id === 'string'
      && Number.isFinite(item.price)
      && Number.isFinite(item.quantity)
      && item.quantity > 0
    ))
  } catch (error) {
    console.error('Không thể đọc giỏ hàng đã lưu.', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Không thể lưu giỏ hàng trên thiết bị này.', error)
    }
  }, [items])

  const addToCart = useCallback((product) => {
    if (!isSellerShopActive(product.shopSlug)) return false
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
    return true
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
