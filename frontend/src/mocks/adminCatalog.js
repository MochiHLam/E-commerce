import { MOCK_SHOPS } from '@/mocks/mockShops'
import { PRODUCTS } from '@/mocks/products'
import { getCategories } from '@/mocks/categories'
import { getSellerApplications, getSellerProducts } from '@/mocks/seller'

function getCatalogData() {
  const categories = getCategories()
  const applications = getSellerApplications()
  const products = PRODUCTS.map((product) => ({
    ...product,
    status: product.status ?? 'active',
    categoryId: product.categoryId
      ?? categories.find((category) => category.name === product.category)?.id
      ?? null,
  }))
  const shops = MOCK_SHOPS.map((shop) => ({
    ...shop,
    shopId: shop.slug,
    status: 'approved',
  }))

  for (const application of applications) {
    if (application.status !== 'approved') continue
    const shop = {
      id: application.userId,
      shopId: application.userId,
      slug: application.slug,
      name: application.shopName,
      initial: application.shopName.trim().charAt(0).toLocaleUpperCase('vi'),
      avatarImage: application.avatar ?? '',
      description: application.description ?? '',
      address: application.pickupAddress ?? '',
      joinedAt: application.createdAt ?? application.submittedAt,
      status: application.status,
    }
    const existingShopIndex = shops.findIndex((item) => item.slug === shop.slug)
    if (existingShopIndex >= 0) shops[existingShopIndex] = { ...shops[existingShopIndex], ...shop }
    else shops.push(shop)

    for (const product of getSellerProducts(application.userId)) {
      products.push({
        ...product,
        shop: application.shopName,
        shopSlug: application.slug,
        shopId: application.userId,
        shopStatus: application.status,
        categoryId: categories.find((category) => category.name === product.category)?.id ?? null,
        createdAt: product.createdAt ?? null,
      })
    }
  }

  const productsByShopId = new Map()
  for (const product of products) {
    const shop = shops.find((item) => item.slug === product.shopSlug || item.shopId === product.shopId)
    if (!shop) continue
    product.shopId = shop.shopId
    product.shop = shop.name
    product.shopStatus = shop.status
    const shopProducts = productsByShopId.get(shop.shopId) ?? []
    shopProducts.push(product)
    productsByShopId.set(shop.shopId, shopProducts)
  }

  return {
    shops: shops.map((shop) => ({
      ...shop,
      productCount: productsByShopId.get(shop.shopId)?.length ?? 0,
    })),
    products: [...productsByShopId.values()].flat(),
  }
}

export function getAdminCatalogShops() {
  return getCatalogData().shops
}

export function getAdminCatalogProducts(shopId) {
  const { products } = getCatalogData()
  return shopId ? products.filter((product) => String(product.shopId) === String(shopId)) : products
}

export function getAdminCatalogShop(shopId) {
  return getAdminCatalogShops().find((shop) => String(shop.shopId) === String(shopId)) ?? null
}

export function getAdminCatalogProduct(shopId, productId) {
  return getAdminCatalogProducts(shopId).find((product) => String(product.id) === String(productId)) ?? null
}
