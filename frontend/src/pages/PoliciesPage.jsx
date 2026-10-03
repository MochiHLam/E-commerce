import SidebarLayout from '@/components/SidebarLayout'

const ABOUT_LINKS = [
  { label: 'Giới thiệu NaviShop', href: '/about' },
  { label: 'Chính sách',          href: '/policies' },
]

const POLICIES = [
  {
    title: 'Chính sách bảo mật thông tin',
    content: `NaviShop cam kết bảo vệ thông tin cá nhân của người dùng theo đúng quy định pháp luật Việt Nam.
Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ và không chia sẻ dữ liệu cá nhân với bên thứ ba
khi chưa có sự đồng ý của người dùng. Mọi dữ liệu được mã hóa và lưu trữ an toàn trên hệ thống máy chủ bảo mật cao.`,
  },
  {
    title: 'Chính sách đổi trả hàng',
    content: `Người mua có thể yêu cầu đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi,
không đúng mô tả hoặc không đúng sản phẩm đã đặt. Sản phẩm cần được hoàn trả nguyên vẹn, còn nhãn mác và
không qua sử dụng. Chi phí vận chuyển hoàn hàng sẽ do người bán chịu nếu lỗi thuộc về phía người bán.`,
  },
  {
    title: 'Chính sách hoàn tiền',
    content: `Sau khi yêu cầu hoàn tiền được xét duyệt, NaviShop sẽ hoàn tiền vào tài khoản gốc trong vòng
5–10 ngày làm việc. Đối với thanh toán COD, tiền sẽ được hoàn qua chuyển khoản ngân hàng đến số tài khoản
bạn cung cấp. NaviShop không chịu trách nhiệm với các khoản phí ngân hàng phát sinh.`,
  },
  {
    title: 'Chính sách đấu giá',
    content: `Người tham gia đấu giá cần đăng ký trước khi phiên bắt đầu. Mức đặt giá tối thiểu mỗi lần
tăng là 10.000đ. Kết quả đấu giá là cuối cùng và không thể hủy. Người thắng đấu giá có nghĩa vụ hoàn tất
thanh toán trong vòng 24 giờ. Nếu không thanh toán đúng hạn, NaviShop có quyền hủy kết quả và cấm tài khoản.`,
  },
  {
    title: 'Điều khoản sử dụng',
    content: `Người dùng phải từ 18 tuổi trở lên để đăng ký tài khoản. Nghiêm cấm mọi hành vi gian lận,
giả mạo thông tin, đăng sản phẩm cấm theo quy định pháp luật, hoặc can thiệp vào hệ thống NaviShop.
Vi phạm điều khoản có thể dẫn đến khóa tài khoản vĩnh viễn và truy cứu trách nhiệm pháp lý.`,
  },
]

export default function PoliciesPage() {
  return (
    <SidebarLayout
      sidebarTitle="Về NaviShop"
      sidebarLinks={ABOUT_LINKS}
      activeHref="/policies"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
        Chính sách NaviShop
      </h1>

      <div className="space-y-8">
        {POLICIES.map((p, i) => (
          <div key={i} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <h2 className="text-base font-semibold text-gray-800 mb-2">{p.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.content}</p>
          </div>
        ))}
      </div>
    </SidebarLayout>
  )
}
