export default {
  title: 'Các phương thức thanh toán trên NaviShop',
  body: `
NaviShop dùng **ví NaviShop** cho mọi giao dịch: mua hàng, nhận tiền bán hàng và tham gia đấu giá. Hiện chưa yêu cầu thẻ ngân hàng hay tài khoản ngân hàng.

## Nạp tiền vào ví
Chọn **Nạp tiền**, nhập số tiền và xác nhận. Số dư được cộng vào ví ngay lập tức. Việc nạp tiền hiện chỉ mang tính mô phỏng, chưa kết nối ngân hàng hay cổng thanh toán thật.

[Ảnh: màn hình nạp tiền]

## Hai loại số dư

| Số dư | Ý nghĩa |
|---|---|
| **Khả dụng** | Số tiền bạn dùng được ngay để đặt hàng hoặc đặt giá |
| **Đang khóa** | Số tiền đang được giữ cho lượt đặt giá bạn đang dẫn đầu trong phiên đấu giá |

## Ví hoạt động trong từng tình huống
- **Mua hàng:** toàn bộ tổng thanh toán được trừ từ số dư khả dụng khi bạn đặt hàng.
- **Đặt giá đấu giá:** hệ thống khóa đúng số tiền bạn đặt. Khi có người đặt giá cao hơn, tiền của bạn được trả lại số dư khả dụng. Khi bạn thắng, số tiền đã khóa được trừ thật.
- **Bán hàng:** tiền bạn nhận được cộng vào số dư khả dụng.

## Lịch sử ví
Mục **Lịch sử ví** liệt kê mọi lần tiền ra vào ví của bạn, để bạn đối chiếu bất cứ lúc nào.

[Ảnh: màn hình Lịch sử ví]

## Khi tài khoản bị khóa
Tài khoản bị khóa vẫn đăng nhập và xem được, nhưng không thể nạp tiền, mua hàng hay đặt giá, và ví không chi tiêu được cho tới khi được mở khóa.
`,
}
