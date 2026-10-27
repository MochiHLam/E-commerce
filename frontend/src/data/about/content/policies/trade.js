export default {
  title: 'Thỏa thuận Mua bán',
  body: `
## Đặt hàng và hạn xử lý

Mỗi lần thanh toán là một sản phẩm của một cửa hàng. Tổng thanh toán gồm tiền hàng và phí vận chuyển cố định mỗi đơn.

Đơn lần lượt ở các trạng thái Chờ xác nhận, Đang giao, Đã nhận hàng; đơn có thể kết thúc ở trạng thái Đã hủy.

- Cửa hàng xác nhận và bắt đầu giao đơn trong 48 giờ.
- Sau khi cửa hàng bắt đầu giao, bạn có 3 ngày để bấm "Đã nhận hàng". Hết hạn mà bạn không bấm, đơn tự hoàn thành và tiền chuyển cho cửa hàng.

## Hủy đơn và hoàn tiền

- Bạn hủy tự do khi đơn còn "Chờ xác nhận".
- Đơn tự hủy nếu cửa hàng không xác nhận và bắt đầu giao trong 48 giờ.
- Mọi trường hợp hủy được hoàn 100% (gồm phí vận chuyển) về ví, hàng được cộng lại vào kho.
- Sau khi cửa hàng chuyển đơn sang trạng thái đang giao, đơn không thể hủy. NaviShop hiện không hỗ trợ trả hàng hay khiếu nại sau khi giao, hãy kiểm tra kỹ trước khi đặt hàng.

## Ví NaviShop

Mọi giao dịch đều dùng ví NaviShop, mỗi tài khoản một ví dùng chung cho mua và bán.

- Hai loại số dư: *khả dụng* (dùng ngay) và *đang khóa* (giữ cho lượt đặt giá bạn đang dẫn đầu).
- Nạp tiền chưa kết nối cổng thanh toán hoặc ngân hàng. NaviShop chưa hỗ trợ rút tiền về ngân hàng.
- Tiền được giữ hộ: khi đặt hàng, tiền bị trừ khỏi ví và NaviShop giữ hộ, chỉ chuyển cho cửa hàng, NaviShop (hoa hồng) và đơn vị vận chuyển khi đơn hoàn thành. Đơn bị hủy thì hoàn lại đủ.
- Mọi lần tiền ra vào đều có trong Lịch sử ví, chỉ thêm dòng, không sửa hay xóa.

## Dành cho người bán

### Mở và quản lý cửa hàng

- Người dùng gửi hồ sơ mở cửa hàng để NaviShop xem xét. Nếu hồ sơ bị từ chối, người đăng ký nhận lý do, cập nhật thông tin và gửi lại.
- Chỉ cửa hàng đã được duyệt mới được đăng bán sản phẩm. Cửa hàng tự quyết định giá bán; mỗi sản phẩm gồm tên, danh mục, hình ảnh, mô tả, giá và số lượng tồn kho.
- Cửa hàng có thể cập nhật thông tin và tồn kho, tạm ẩn hoặc xóa sản phẩm. Sản phẩm hết hàng không thể được đặt.
- Sản phẩm gửi xét đấu giá phải thuộc danh mục được phép và có đúng một sản phẩm trong kho. Sản phẩm được ẩn khỏi bán thường trong thời gian xét; khi được duyệt vào kho đấu giá, cửa hàng không thể rút lại.
- Cửa hàng bị khóa tạm hoặc khóa vĩnh viễn không thể tạo sản phẩm hoặc nhận đơn mới; các đơn đang xử lý tiếp tục theo trạng thái hiện tại.

### Xử lý đơn hàng

- Cửa hàng có 48 giờ để xác nhận và bắt đầu giao đơn kể từ khi khách đặt.
- Nếu quá hạn, đơn tự động hủy; khách được hoàn toàn bộ tiền hàng và phí vận chuyển, sản phẩm được cộng lại vào tồn kho.
- Cửa hàng không thể chủ động hủy đơn. Sau khi đơn chuyển sang trạng thái đang giao, đơn không thể bị hủy. Khách có 3 ngày để xác nhận đã nhận hàng; hết thời hạn, đơn tự động hoàn thành.
- Đơn đấu giá xử lý theo quy trình riêng, không dùng bước xác nhận đơn thường.

### Doanh thu và hoa hồng

- Hoa hồng được tính trên tiền hàng theo tỉ lệ áp dụng cho danh mục; phí vận chuyển không tính hoa hồng.
- Khi đơn hoàn thành, cửa hàng nhận tiền hàng sau khi trừ hoa hồng. Phí vận chuyển được quyết toán riêng cho đơn vị vận chuyển.
- Đơn đấu giá áp dụng tỉ lệ hoa hồng riêng; tiền vật phẩm được quyết toán khi kết quả đấu giá được chốt.
`,
}
