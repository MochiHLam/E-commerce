import { getProductDetailMock } from '@/mocks/productDetails'
import { PRODUCTS } from '@/mocks/products'

export function getCartItemStock(item) {
  const product = PRODUCTS.find((entry) => entry.id === item.id)
  if (!product) return 0

  const variant = getProductDetailMock(product).variants.find(
    (entry) => entry.id === item.variantId,
  )
  return variant?.stock ?? 0
}

export function getCartInventoryIssues(items) {
  return items
    .map((item) => ({ item, stock: getCartItemStock(item) }))
    .filter(({ item, stock }) => item.quantity > stock)
}
