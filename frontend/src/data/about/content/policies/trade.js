export default {
  title: 'Thỏa thuận Mua bán',
  body: `
## Đặt hàng và hạn xử lý

Mỗi lần thanh toán là một sản phẩm của một cửa hàng. Tổng thanh toán gồm tiền hàng và phí vận chuyển cố định mỗi đơn.

Đơn đi qua 4 trạng thái: Chờ xác nhận, Đã xác nhận, Đang giao, Đã nhận hàng.

- Cửa hàng xác nhận đơn trong 48 giờ.
- Sau khi xác nhận, cửa hàng giao cho đơn vị vận chuyển trong 1 ngày.
- Sau khi báo giao, bạn có 3 ngày để bấm "Đã nhận hàng". Hết hạn mà bạn không bấm, đơn tự hoàn thành và tiền chuyển cho cửa hàng.

## Hủy đơn và hoàn tiền

- Bạn hủy tự do khi đơn còn "Chờ xác nhận".
- Đơn tự hủy nếu cửa hàng không xác nhận trong 48 giờ, hoặc không giao hàng trong 1 ngày sau khi xác nhận.
- Mọi trường hợp hủy được hoàn 100% (gồm phí vận chuyển) về ví, hàng được cộng lại vào kho.
- Sau khi cửa hàng báo giao, đơn không thể hủy. NaviShop hiện không hỗ trợ trả hàng hay khiếu nại sau khi giao, hãy kiểm tra kỹ trước khi đặt hàng.

## Ví NaviShop

Mọi giao dịch đều dùng ví NaviShop, mỗi tài khoản một ví dùng chung cho mua và bán.

- Hai loại số dư: *khả dụng* (dùng ngay) và *đang khóa* (giữ cho lượt đặt giá bạn đang dẫn đầu).
- Nạp tiền hiện chỉ mang tính mô phỏng. Chưa hỗ trợ rút tiền về ngân hàng.
- Tiền được giữ hộ: khi đặt hàng, tiền bị trừ khỏi ví và NaviShop giữ hộ, chỉ chuyển cho cửa hàng, NaviShop (hoa hồng) và đơn vị vận chuyển khi đơn hoàn thành. Đơn bị hủy thì hoàn lại đủ.
- Mọi lần tiền ra vào đều có trong Lịch sử ví, chỉ thêm dòng, không sửa hay xóa.

## Dành cho người bán

- Mở cửa hàng: gửi đăng ký và chờ duyệt. Bị từ chối thì nhận lý do và được sửa, gửi lại.
- Đăng sản phẩm: bạn tự đặt giá, không cần ai duyệt. Mỗi sản phẩm một mức giá, một số lượng tồn kho, không có biến thể; hàng nhiều màu hoặc kích cỡ thì đăng thành sản phẩm riêng.
- Hoa hồng: NaviShop thu theo tỉ lệ phần trăm trên tiền hàng, khác nhau theo danh mục. Phí vận chuyển không tính hoa hồng và không thuộc về cửa hàng. Bạn nhận tiền hàng trừ hoa hồng khi đơn hoàn thành, đơn bị hủy thì không có hoa hồng.
- Gửi vật phẩm đấu giá: sản phẩm thuộc danh mục cho phép, chỉ còn 1 món trong kho. NaviShop duyệt và tự đặt giá, giá bạn đề xuất chỉ để tham khảo. Đã được duyệt thì không thể rút lại, vật phẩm không ai đặt giá sẽ quay về kho chờ phiên sau.
- Khi cửa hàng bị khóa tạm: sản phẩm bị ẩn, không đăng thêm và không nhận đơn mới, các đơn đang xử lý tiếp tục. Khóa vĩnh viễn thì ví chủ cửa hàng bị đóng băng.
`,
}
