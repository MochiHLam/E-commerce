import { MOCK_SHOPS } from '@/mocks/mockShops'
import { CATEGORIES } from '@/mocks/categories'

const TYPES = [
  { name: 'Chuột không dây', category: 'Máy Tính & Laptop', shopSlug: 'cong-nghe-moi' },
  { name: 'Bàn phím cơ', category: 'Máy Tính & Laptop', shopSlug: 'cong-nghe-moi' },
  { name: 'Tai nghe chụp tai', category: 'Thiết Bị Điện Tử', shopSlug: 'am-thanh-viet' },
  { name: 'Đồng hồ cơ', category: 'Đồng Hồ', shopSlug: 'phu-kien-xinh' },
  { name: 'Balo laptop', category: 'Thể Thao & Du Lịch', shopSlug: 'the-gioi-giay' },
  { name: 'Giày thể thao', category: 'Giày Dép Nam', shopSlug: 'the-gioi-giay' },
  { name: 'Máy ảnh film', category: 'Máy Ảnh & Máy Quay', shopSlug: 'cong-nghe-moi' },
  { name: 'Sách học tiếng Anh', category: 'Nhà Sách Online', shopSlug: 'nha-sach-tri-thuc' },
]

export const PRODUCTS = Array.from({ length: 96 }, (_, index) => {
  const type = TYPES[index % TYPES.length]
  const shop = MOCK_SHOPS.find((item) => item.slug === type.shopSlug)
  return {
    id: `prd_${index + 1}`,
    name: `${type.name} mẫu ${index + 1}`,
    category: type.category,
    categoryId: CATEGORIES.find((category) => category.name === type.category)?.id ?? null,
    price: 50000 + ((index * 37) % 40) * 25000,
    rating: 3.5 + ((index * 7) % 16) / 10,
    sold: 20 + ((index * 53) % 900),
    shop: shop.name,
    shopSlug: shop.slug,
    image: '',
    createdAt: Date.now() - index * 3_600_000,
  }
})
