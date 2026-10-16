export const PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'sales-desc', label: 'Bán chạy' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
]

export const RATING_OPTIONS = [5, 4, 3, 2, 1]

const PRODUCT_SORTERS = {
  newest: (first, second) => second.createdAt - first.createdAt,
  'sales-desc': (first, second) => second.sold - first.sold,
  'price-asc': (first, second) => first.price - second.price,
  'price-desc': (first, second) => second.price - first.price,
}

export function sortProducts(products, sort) {
  return [...products].sort(PRODUCT_SORTERS[sort] ?? PRODUCT_SORTERS.newest)
}

const toInt = (value) => {
  const number = Number.parseInt(value, 10)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function parseFilters(params) {
  const sort = params.get('sort')
  const rating = toInt(params.get('rating'))

  return {
    q: (params.get('q') ?? '').trim(),
    shop: (params.get('shop') ?? '').trim(),
    category: [...new Set(params.getAll('category').filter(Boolean))],
    categoryFromHome: params.get('categoryFromHome') === 'true',
    minPrice: toInt(params.get('minPrice')),
    maxPrice: toInt(params.get('maxPrice')),
    rating: rating >= 1 && rating <= 5 ? rating : null,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : 'newest',
    page: Math.max(1, toInt(params.get('page')) ?? 1),
  }
}
