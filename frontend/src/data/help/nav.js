export const HELP_GROUPS = [
  {
    groupSlug: 'shopping',
    label: 'Mua sắm với NaviShop',
    items: [
      { slug: 'find-product',  label: 'Tìm sản phẩm' },
      { slug: 'add-to-cart',   label: 'Thêm vào giỏ hàng' },
      { slug: 'checkout',      label: 'Đặt hàng & Thanh toán' },
      { slug: 'track-order',   label: 'Theo dõi đơn hàng' },
    ],
  },
  {
    groupSlug: 'selling',
    label: 'Bán hàng Trực tuyến',
    items: [
      { slug: 'register-store',  label: 'Đăng ký cửa hàng' },
      { slug: 'list-product',    label: 'Đăng sản phẩm mới' },
      { slug: 'manage-orders',   label: 'Quản lý đơn hàng' },
      { slug: 'receive-payment', label: 'Nhận thanh toán' },
    ],
  },
  {
    groupSlug: 'payment',
    label: 'Thanh toán',
    items: [
      { slug: 'payment-methods',  label: 'Phương thức thanh toán' },
      { slug: 'payment-security', label: 'Bảo mật thanh toán' },
      { slug: 'refund',           label: 'Hoàn tiền' },
    ],
  },
  {
    groupSlug: 'shipping',
    label: 'Vận chuyển',
    items: [
      { slug: 'shipping-time', label: 'Thời gian giao hàng' },
      { slug: 'shipping-fee',  label: 'Phí vận chuyển' },
    ],
  },
  {
    groupSlug: 'contact',
    label: 'Liên hệ hỗ trợ',
    items: [
      { slug: 'email-support', label: 'Email hỗ trợ' },
    ],
  },
]
