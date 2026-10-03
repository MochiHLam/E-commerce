import { Link } from 'react-router-dom'

const LAYOUT = 'max-w-[1500px] mx-auto'

export default function Footer() {
  return (
    <footer className="bg-[#f0f0f0] text-gray-500">
      <div className={`${LAYOUT} px-0 py-10`}>
        <div className="grid grid-cols-3 gap-12 pb-10">

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-800 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/help/shopping/find-product"      className="hover:text-[#056F1C] transition-colors">How To Buy</Link></li>
              <li><Link to="/help/selling/register-store"     className="hover:text-[#056F1C] transition-colors">How To Sell</Link></li>
              <li><Link to="/help/payment/payment-methods"   className="hover:text-[#056F1C] transition-colors">Payment</Link></li>
              <li><Link to="/help/shipping/shipping-time"    className="hover:text-[#056F1C] transition-colors">Shipping</Link></li>
              <li><Link to="/help/contact/email-support"     className="hover:text-[#056F1C] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About NaviShop */}
          <div>
            <h4 className="text-gray-800 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
              About NaviShop
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/info/about/overview"   className="hover:text-[#056F1C] transition-colors">About Us</Link></li>
              <li><Link to="/info/policies/terms"   className="hover:text-[#056F1C] transition-colors">Policies</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-gray-800 text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
              Follow Us
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-[#056F1C] transition-colors">
                  <img src="/images/facebook.png" alt="Facebook" className="h-4 w-4 object-contain" />
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-[#056F1C] transition-colors">
                  <img src="/images/instagram.png" alt="Instagram" className="h-4 w-4 object-contain" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-300 py-5 text-center text-xs leading-6 text-gray-500">
        <p>Địa chỉ: 01 Đ. Võ Văn Ngân, Thủ Đức, Hồ Chí Minh, Việt Nam</p>
        <p>Chăm sóc khách hàng: Gọi tổng đài NaviShop (miễn phí) ngay tại Trung tâm trợ giúp</p>
        <p>Chịu Trách Nhiệm Quản Lý Nội Dung: Nguyễn Hoàng Lâm</p>
        <p className="mt-1">© 2026 · Bản quyền thuộc về Navi Team</p>
      </div>
    </footer>
  )
}
