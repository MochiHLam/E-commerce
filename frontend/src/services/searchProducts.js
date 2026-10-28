import { normalizeVi } from '@/lib/normalizeVi'
import { PAGE_SIZE, sortProducts } from '@/lib/searchFilters'
import { MOCK_SHOPS } from '@/mocks/mockShops'
import { PRODUCTS } from '@/mocks/products'
import { isSellerShopActive } from '@/mocks/seller'

export async function searchProducts(filters) {
  const keyword = normalizeVi(filters.q)
  const activeShops = MOCK_SHOPS.filter((shop) => isSellerShopActive(shop.slug))
  const activeShopSlugs = new Set(activeShops.map((shop) => shop.slug))
  const scopedShop = activeShops.find((shop) => shop.slug === filters.shop)
  const searchableProducts = filters.shop
    ? scopedShop ? PRODUCTS.filter((product) => product.shopSlug === scopedShop.slug) : []
    : PRODUCTS.filter((product) => activeShopSlugs.has(product.shopSlug))
  const hasProductFilters = filters.category.length > 0
    || filters.minPrice != null
    || filters.maxPrice != null
    || filters.rating != null
  const availableShops = filters.shop ? (scopedShop ? [scopedShop] : []) : activeShops
  const matchedShops = availableShops
    .flatMap((shop) => {
      const shopProducts = searchableProducts.filter((product) => product.shopSlug === shop.slug)
      const matchingProducts = shopProducts.filter((product) =>
        (!keyword || normalizeVi(product.name).includes(keyword))
        && (filters.category.length === 0 || filters.category.includes(product.category))
        && (filters.minPrice == null || product.price >= filters.minPrice)
        && (filters.maxPrice == null || product.price <= filters.maxPrice)
        && (filters.rating == null || product.rating >= filters.rating),
      )
      const shopNameMatches = keyword && normalizeVi(shop.name).includes(keyword)
      if (hasProductFilters && matchingProducts.length === 0) return []
      if (!hasProductFilters && keyword && !shopNameMatches && matchingProducts.length === 0) return []
      const sold = shopProducts.reduce((totalSold, product) => totalSold + product.sold, 0)
      return [{ ...shop, sold }]
    })
    .sort((first, second) => second.sold - first.sold)

  const beforeCategory = searchableProducts
    .filter((product) => {
      if (!keyword) return true
      return normalizeVi(product.name).includes(keyword)
        || normalizeVi(activeShops.find((shop) => shop.slug === product.shopSlug)?.name ?? '').includes(keyword)
    })
    .filter((product) => filters.minPrice == null || product.price >= filters.minPrice)
    .filter((product) => filters.maxPrice == null || product.price <= filters.maxPrice)
    .filter((product) => filters.rating == null || product.rating >= filters.rating)

  const counts = new Map()
  for (const product of beforeCategory) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
  }
  const categories = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((first, second) => second.count - first.count)

  const matched = beforeCategory
    .filter((product) => filters.category.length === 0 || filters.category.includes(product.category))
  const sorted = sortProducts(matched, filters.sort)

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)
  const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  await new Promise((resolve) => setTimeout(resolve, 250))
  return { items, total, totalPages, page, categories, shops: matchedShops }
}
