const OPTION_SETS = {
  'Giày Dép Nam': {
    label: 'Kích cỡ',
    values: ['38', '39', '40', '41', '42', '43'],
    stocks: [5, 8, 0, 12, 7, 3],
    priceSteps: [0, 0, 0, 0, 25000, 25000],
  },
  'Đồng Hồ': {
    label: 'Màu sắc',
    values: ['Đen', 'Bạc', 'Vàng hồng'],
    stocks: [14, 9, 0],
    priceSteps: [0, 50000, 100000],
  },
  'Nhà Sách Online': {
    label: 'Phiên bản',
    values: ['Bìa mềm', 'Bìa cứng'],
    stocks: [32, 11],
    priceSteps: [0, 45000],
  },
  'Thể Thao & Du Lịch': {
    label: 'Dung tích',
    values: ['15 lít', '20 lít', '25 lít'],
    stocks: [6, 0, 8],
    priceSteps: [0, 70000, 140000],
  },
}

const REVIEW_NAMES = [
  'Minh Anh', 'Quốc Bảo', 'Thảo Vy', 'Hoàng Nam', 'Ngọc Mai', 'Gia Huy',
  'Phương Linh', 'Tuấn Kiệt', 'Khánh Chi', 'Đức Anh', 'Bảo Ngọc', 'Thanh Tùng',
]
const REVIEW_RATINGS = [5, 5, 4, 5, 3, 4, 5, 2, 5, 4, 1, 5]
const RATING_VALUES = [1, 2, 3, 4, 5]
const REVIEW_TEXTS = [
  'Sản phẩm đúng mô tả, hoàn thiện tốt và giao hàng nhanh. Mình sẽ ủng hộ shop lần sau.',
  'Đóng gói cẩn thận, dùng ổn trong vài ngày đầu. Màu sắc bên ngoài giống hình.',
  'Chất lượng tốt trong tầm giá, shop tư vấn nhiệt tình và phản hồi nhanh.',
  'Hàng nhận đủ phụ kiện, hoạt động bình thường. Rất đáng mua.',
  'Sản phẩm ổn, tuy nhiên giao hàng hơi lâu hơn dự kiến một chút.',
  'Mình đã mua lần thứ hai, chất lượng vẫn tốt và shop đóng gói kỹ.',
  'Dùng tiện, thiết kế đẹp. Kích thước vừa như thông tin shop cung cấp.',
  'Sản phẩm chưa phù hợp với nhu cầu của mình, phần hoàn thiện chưa như kỳ vọng.',
  'Shop hỗ trợ đổi phân loại nhanh, sản phẩm sau khi nhận dùng tốt.',
  'Giá hợp lý, nhận hàng nguyên vẹn và không bị trầy xước.',
  'Sản phẩm có một điểm chưa ổn, mong shop kiểm tra kỹ hơn trước khi gửi.',
  'Rất hài lòng với lần mua này, giao đúng mẫu và đúng thời gian.',
]

export function getProductDetailMock(product) {
  const options = OPTION_SETS[product.category] ?? {
    label: 'Màu sắc',
    values: ['Đen', 'Trắng', 'Xám'],
    stocks: [18, 0, 11],
    priceSteps: [0, 25000, 50000],
  }
  const productIndex = Number(product.id.replace('prd_', '')) || 1
  const baseRating = Math.floor(product.rating)
  const higherRatingCount = Math.round((product.rating - baseRating) * REVIEW_RATINGS.length)
  const variants = options.values.map((value, index) => ({
    id: `${product.id}-sku-${index + 1}`,
    label: value,
    price: product.price + options.priceSteps[index],
    stock: options.stocks[(index + productIndex) % options.stocks.length],
  }))
  const reviews = REVIEW_RATINGS.map((_, index) => ({
    id: `${product.id}-review-${index + 1}`,
    name: REVIEW_NAMES[(index + productIndex) % REVIEW_NAMES.length],
    rating: (index * 7 + productIndex) % REVIEW_RATINGS.length < higherRatingCount
      ? baseRating + 1
      : baseRating,
    text: index % 4 === 2 ? null : REVIEW_TEXTS[(index + productIndex) % REVIEW_TEXTS.length],
    date: new Date(Date.UTC(2026, 9, 15 - index)).toISOString().slice(0, 10),
    hasPhotos: index % 3 === 0,
    helpful: (index * 7 + productIndex) % 23,
  }))
  const ratingCounts = Object.fromEntries(RATING_VALUES.map((rating) => [
    rating,
    reviews.filter((review) => review.rating === rating).length,
  ]))

  return {
    optionLabel: options.label,
    variants,
    description: `${product.name} được tuyển chọn kỹ lưỡng, phù hợp cho nhu cầu sử dụng hằng ngày. Sản phẩm có thiết kế tiện dụng, chất liệu bền bỉ và dễ bảo quản. Vui lòng chọn đúng phân loại trước khi đặt hàng; liên hệ shop nếu bạn cần tư vấn thêm về cách sử dụng hoặc chính sách đổi trả.`,
    reviewCount: reviews.length,
    ratingCounts,
    reviews,
  }
}
