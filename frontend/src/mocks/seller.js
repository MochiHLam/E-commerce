const APPLICATIONS_KEY = 'navishop.mockSeller.applications'
const PRODUCTS_KEY = 'navishop.mockSeller.products'

function readCollection(key, label) {
  const value = JSON.parse(localStorage.getItem(key) ?? '{}')
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Dữ liệu ${label} mock không hợp lệ.`)
  }
  return value
}

export function getSellerApplication(userId) {
  if (!userId) return null
  return readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')[userId] ?? null
}

export function getSellerApplications() {
  return Object.entries(readCollection(APPLICATIONS_KEY, 'hồ sơ người bán'))
    .map(([userId, application]) => ({ ...application, userId }))
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt))
}

export function saveSellerApplication(userId, details) {
  if (!userId || !details?.shopName?.trim()) {
    throw new Error('Vui lòng đăng nhập và nhập tên cửa hàng.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const previousApplication = applications[userId]
  const application = {
    ...details,
    shopName: details.shopName.trim(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: '',
    ...(previousApplication?.createdAt ? { createdAt: previousApplication.createdAt } : { createdAt: new Date().toISOString() }),
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({ ...applications, [userId]: application }))
  return application
}

export function reviewSellerApplication(userId, status, reviewNote = '') {
  if (!userId || !['approved', 'rejected'].includes(status)) {
    throw new Error('Thao tác duyệt hồ sơ không hợp lệ.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'pending') {
    throw new Error('Không tìm thấy hồ sơ đang chờ duyệt.')
  }
  const updatedApplication = {
    ...application,
    status,
    reviewNote: reviewNote.trim(),
    reviewedAt: new Date().toISOString(),
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  return updatedApplication
}

export function getSellerProducts(userId) {
  if (!userId) return []
  return readCollection(PRODUCTS_KEY, 'sản phẩm người bán')[userId] ?? []
}

export function createSellerProduct(userId, product) {
  if (!userId || !product?.name?.trim()) {
    throw new Error('Vui lòng đăng nhập và nhập tên sản phẩm.')
  }
  const products = readCollection(PRODUCTS_KEY, 'sản phẩm người bán')
  const nextProduct = {
    ...product,
    id: globalThis.crypto?.randomUUID?.() ?? `seller-product-${Date.now()}`,
    name: product.name.trim(),
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify({
    ...products,
    [userId]: [nextProduct, ...(products[userId] ?? [])],
  }))
  return nextProduct
}
