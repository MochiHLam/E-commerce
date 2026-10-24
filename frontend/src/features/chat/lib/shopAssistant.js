import { formatVND } from '@/lib/format'
import { PRODUCTS } from '@/mocks/products'
import { getProductDetailMock } from '@/mocks/productDetails'

const STOP_WORDS = new Set([
  'ban', 'ben', 'co', 'cua', 'duoc', 'gi', 'gia', 'hang', 'hang', 'la', 'loai',
  'minh', 'mua', 'nao', 'nay', 'shop', 'san', 'pham', 'toi', 'tu', 'va', 'voi',
])

function normalizeText(value) {
  return value
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
}

function getPriceLimit(text) {
  const match = normalizeText(text).match(
    /(?:duoi|nho hon|toi da|tam)\s+(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan)?/,
  )
  if (!match) return null

  const amount = Number(match[1].replace(',', '.'))
  if (!Number.isFinite(amount)) return null
  if (match[2] === 'trieu' || match[2] === 'tr') return amount * 1_000_000
  if (match[2] === 'k' || match[2] === 'nghin' || match[2] === 'ngan') return amount * 1_000
  return amount
}

function getShopProducts(shopSlug) {
  return PRODUCTS
    .filter((product) => product.shopSlug === shopSlug)
    .map((product) => {
      const detail = getProductDetailMock(product, [])
      const price = Math.min(product.price, ...detail.variants.map((variant) => variant.price))
      const availableVariants = detail.variants.filter((variant) => variant.stock > 0)
      return {
        ...product,
        detail,
        price,
        stock: availableVariants.reduce((total, variant) => total + variant.stock, 0),
        availableVariants,
      }
    })
}

function findRelevantProducts(products, text) {
  const words = normalizeText(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
  return products
    .map((product) => ({
      product,
      score: words.reduce((score, word) => (
        score + (normalizeText(`${product.name} ${product.category}`).includes(word) ? 1 : 0)
      ), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ product }) => product)
}

function productCard(product) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    href: `/products/${product.id}`,
  }
}

function reply(text, products = []) {
  return { text, products }
}

export function getShopAssistantReply({ shop, text }) {
  const normalized = normalizeText(text)
  const products = getShopProducts(shop.slug)
  const relevantProducts = findRelevantProducts(products, text)
  const asksToMeetShop = /(gap|noi chuyen voi|nhan vien|nguoi that|tu van vien|shop tu van)/.test(normalized)
  const asksForTransaction = /(dat hang|mua giup|huy don|hoan tien|hoan don|don hang cua toi|ma don)/.test(normalized)
  const asksAuction = /(dau gia|gia dau|gia khoi diem|buoc gia)/.test(normalized)

  if (asksToMeetShop) {
    return reply('Bạn có thể tự chuyển sang mục “Người thật” để nhắn trực tiếp với shop. Tin nhắn trong cuộc trò chuyện AI này sẽ không được chuyển tiếp.')
  }
  if (asksForTransaction || asksAuction) {
    return reply('Mình chỉ hỗ trợ thông tin sản phẩm và chính sách chung, không xử lý đơn hàng, ví hoặc đấu giá. Nếu cần hỏi riêng về trường hợp của bạn, hãy tự chuyển sang cuộc trò chuyện “Người thật” với shop.')
  }

  if (/(ship|giao hang|van chuyen|phi giao|phi ship)/.test(normalized)) {
    return {
      text: 'Theo chính sách NaviShop, phí vận chuyển là mức cố định do sàn cấu hình và sẽ hiện ở bước xác nhận đơn. Shop có tối đa 48 giờ để xác nhận đơn và 1 ngày sau khi xác nhận để giao cho đơn vị vận chuyển.',
      products: [],
    }
  }
  if (/(doi tra|tra hang|khieu nai|chinh sach)/.test(normalized)) {
    return {
      text: 'NaviShop hiện chưa hỗ trợ đổi trả hoặc khiếu nại sau khi đơn đã giao. Nếu bạn cần trao đổi với shop, hãy tự chuyển sang cuộc trò chuyện “Người thật”.',
      products: [],
    }
  }

  const priceLimit = getPriceLimit(text)
  const asksRecommendation = /(goi y|tim|co .* nao|san pham nao|duoi|nho hon|toi da|tam)/.test(normalized)
  if (asksRecommendation) {
    let candidates = relevantProducts.length ? relevantProducts : products
    if (priceLimit !== null) candidates = candidates.filter((product) => product.price <= priceLimit)
    candidates = candidates.filter((product) => product.stock > 0).slice(0, 3)
    if (candidates.length) {
      return {
        text: `Một số sản phẩm còn hàng của ${shop.name}${priceLimit ? ` trong tầm ${formatVND(priceLimit)}` : ''}:`,
        products: candidates.map(productCard),
      }
    }
    return reply('Mình chưa tìm thấy sản phẩm còn hàng phù hợp trong dữ liệu của shop. Bạn có thể tự chuyển sang cuộc trò chuyện “Người thật” để hỏi shop.')
  }

  const asksStock = /(con hang|het hang|ton kho|so luong|tinh trang hang)/.test(normalized)
  const asksPrice = /(gia|bao nhieu|gia tien)/.test(normalized)
  const asksDescription = /(mo ta|thong tin|chi tiet|chat lieu|dac diem)/.test(normalized)
  if (relevantProducts.length && (asksStock || asksPrice || asksDescription)) {
    const product = relevantProducts[0]
    const details = []
    if (asksPrice) details.push(`Giá từ ${formatVND(product.price)}.`)
    if (asksStock) {
      const stockText = product.availableVariants.length
        ? `Còn hàng ở ${product.availableVariants.map((variant) => `${variant.label} (${variant.stock})`).join(', ')}.`
        : 'Sản phẩm hiện đã hết hàng.'
      details.push(stockText)
    }
    if (asksDescription) details.push(product.detail.description)
    return {
      text: `${product.name}: ${details.join(' ')}`,
      products: [productCard(product)],
    }
  }

  if (asksStock || asksPrice || asksDescription) {
    return {
      text: 'Bạn cho mình biết tên sản phẩm cụ thể để kiểm tra thông tin nhé.',
      products: [],
      handoff: false,
    }
  }

  return reply('Mình chưa có đủ thông tin để trả lời chính xác. Bạn có thể hỏi trực tiếp shop bằng cách tự chuyển sang cuộc trò chuyện “Người thật”. Tin nhắn ở đây sẽ không được gửi cho shop.')
}
