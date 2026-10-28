const CATEGORIES_KEY = 'navishop.mockCategories'

export let CATEGORIES = [
  { id: 1, name: 'Thời Trang Nam', icon: '👔' },
  { id: 2, name: 'Điện Thoại & Phụ Kiện', icon: '📱' },
  { id: 3, name: 'Thiết Bị Điện Tử', icon: '🖥️' },
  { id: 4, name: 'Máy Tính & Laptop', icon: '💻' },
  { id: 5, name: 'Máy Ảnh & Máy Quay', icon: '📷' },
  { id: 6, name: 'Đồng Hồ', icon: '⌚' },
  { id: 7, name: 'Giày Dép Nam', icon: '👟' },
  { id: 8, name: 'Thiết Bị Gia Dụng', icon: '🔌' },
  { id: 9, name: 'Thể Thao & Du Lịch', icon: '⚽' },
  { id: 10, name: 'Ô Tô & Xe Máy & Xe Đạp', icon: '🏍️' },
  { id: 11, name: 'Thời Trang Nữ', icon: '👗' },
  { id: 12, name: 'Mẹ & Bé', icon: '👶' },
  { id: 13, name: 'Nhà Cửa & Đời Sống', icon: '🛋️' },
  { id: 14, name: 'Sắc Đẹp', icon: '💄' },
  { id: 15, name: 'Sức Khỏe', icon: '💊' },
  { id: 16, name: 'Giày Dép Nữ', icon: '👠' },
  { id: 17, name: 'Túi Ví Nữ', icon: '👜' },
  { id: 18, name: 'Phụ Kiện & Trang Sức Nữ', icon: '💍' },
  { id: 19, name: 'Bách Hóa Online', icon: '🛒' },
  { id: 20, name: 'Nhà Sách Online', icon: '📚' },
]
const DEFAULT_CATEGORIES = CATEGORIES

function getDefaultCategories() {
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    description: '',
    commissionRate: null,
    auctionAllowed: false,
  }))
}

export function getCategories() {
  const storedValue = localStorage.getItem(CATEGORIES_KEY)
  if (!storedValue) {
    CATEGORIES = getDefaultCategories()
    return CATEGORIES
  }

  const categories = JSON.parse(storedValue)
  if (!Array.isArray(categories) || categories.some((category) => (
    !category || !Number.isInteger(Number(category.id)) || !category.name?.trim()
  ))) {
    throw new Error('Dữ liệu danh mục mô phỏng không hợp lệ.')
  }
  CATEGORIES = categories
  return CATEGORIES
}

function validateCategory(details, categories, currentId = null) {
  const name = details?.name?.trim()
  if (!name) throw new Error('Vui lòng nhập tên danh mục.')
  if (name.length > 60) throw new Error('Tên danh mục không được vượt quá 60 ký tự.')
  if (categories.some((category) => (
    String(category.id) !== String(currentId)
    && category.name.trim().toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi')
  ))) {
    throw new Error('Tên danh mục đã tồn tại.')
  }

  const commissionRate = Number(details.commissionRate)
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    throw new Error('Hoa hồng phải nằm trong khoảng 0% đến 100%.')
  }
  if (typeof details.auctionAllowed !== 'boolean') {
    throw new Error('Vui lòng xác định danh mục có cho phép đấu giá hay không.')
  }
  return {
    name,
    description: details.description?.trim() ?? '',
    commissionRate,
    auctionAllowed: details.auctionAllowed,
  }
}

function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  CATEGORIES = categories
  window.dispatchEvent(new CustomEvent('navishop:categories-updated'))
  return categories
}

export function createCategory(details) {
  const categories = getCategories()
  const categoryDetails = validateCategory(details, categories)
  const nextId = categories.reduce((maxId, category) => Math.max(maxId, Number(category.id)), 0) + 1
  const category = { id: nextId, icon: '📦', ...categoryDetails }
  saveCategories([...categories, category])
  return category
}

export function updateCategory(categoryId, details) {
  const categories = getCategories()
  const currentCategory = categories.find((category) => String(category.id) === String(categoryId))
  if (!currentCategory) throw new Error('Không tìm thấy danh mục cần cập nhật.')
  const categoryDetails = validateCategory(details, categories, categoryId)
  const updatedCategory = { ...currentCategory, ...categoryDetails }
  saveCategories(categories.map((category) => (
    String(category.id) === String(categoryId) ? updatedCategory : category
  )))
  return updatedCategory
}

export function deleteCategory(categoryId, products = []) {
  const categories = getCategories()
  const category = categories.find((item) => String(item.id) === String(categoryId))
  if (!category) throw new Error('Không tìm thấy danh mục cần xóa.')
  const linkedProducts = products.filter((product) => (
    String(product.categoryId ?? '') === String(categoryId)
    || product.category?.trim().toLocaleLowerCase('vi') === category.name.trim().toLocaleLowerCase('vi')
  ))
  if (linkedProducts.length > 0) {
    throw new Error(
      `Không thể xóa danh mục "${category.name}" vì còn ${linkedProducts.length} sản phẩm đang sử dụng. Chuyển sản phẩm sang danh mục khác trước khi xóa.`,
    )
  }
  saveCategories(categories.filter((item) => String(item.id) !== String(categoryId)))
}
