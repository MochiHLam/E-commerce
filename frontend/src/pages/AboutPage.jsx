import SidebarLayout from '@/components/SidebarLayout'

const ABOUT_LINKS = [
  { label: 'Giới thiệu NaviShop', href: '/about' },
  { label: 'Chính sách',          href: '/policies' },
]

export default function AboutPage() {
  return (
    <SidebarLayout
      sidebarTitle="Về NaviShop"
      sidebarLinks={ABOUT_LINKS}
      activeHref="/about"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        Giới thiệu NaviShop
      </h1>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">NaviShop là gì?</h2>
          <p>
            NaviShop là nền tảng thương mại điện tử được xây dựng bởi đội ngũ Navi Team, với sứ mệnh
            mang đến trải nghiệm mua sắm trực tuyến tiện lợi, an toàn và hiệu quả cho người dùng Việt Nam.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Tầm nhìn</h2>
          <p>
            Trở thành nền tảng thương mại điện tử hàng đầu khu vực, kết nối hàng triệu người mua và
            người bán, tạo ra một hệ sinh thái kinh doanh bền vững và minh bạch.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Giá trị cốt lõi</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-gray-700">Tin cậy</span> — Mọi giao dịch được bảo vệ bởi hệ thống bảo mật tiên tiến.</li>
            <li><span className="font-medium text-gray-700">Minh bạch</span> — Thông tin sản phẩm và giá cả rõ ràng, không ẩn phí.</li>
            <li><span className="font-medium text-gray-700">Tiện lợi</span> — Giao diện thân thiện, thanh toán đa dạng, giao hàng nhanh.</li>
            <li><span className="font-medium text-gray-700">Đổi mới</span> — Liên tục phát triển tính năng mới như đấu giá trực tuyến.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Đấu giá NaviShop</h2>
          <p>
            Nổi bật với tính năng <span className="font-semibold text-[#056F1C]">Phiên Đấu Giá</span> độc đáo —
            người dùng có thể tham gia đặt giá cho các sản phẩm chất lượng cao với mức giá khởi điểm hấp dẫn.
            Mỗi phiên đấu giá được tổ chức định kỳ, tạo sự hứng thú và cạnh tranh lành mạnh.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Liên hệ</h2>
          <p>
            <strong>Địa chỉ:</strong> 01 Đ. Võ Văn Ngân, Thủ Đức, Hồ Chí Minh, Việt Nam<br />
            <strong>Email:</strong> contact@navishop.vn<br />
            <strong>Hotline:</strong> 1800-6888 (miễn phí)
          </p>
        </div>
      </div>
    </SidebarLayout>
  )
}
