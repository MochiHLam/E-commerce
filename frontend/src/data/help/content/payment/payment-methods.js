export default {
  title: 'Phương thức thanh toán',
  body: `
## Ví NaviShop

Mọi giao dịch trên NaviShop đều thực hiện qua ví NaviShop — mua hàng, nhận tiền bán, thanh toán đấu giá. Mỗi tài khoản có một ví, dùng chung cho cả mua và bán.

## Hai loại số dư

- Khả dụng: số tiền có thể dùng ngay.
- Đang khóa: số tiền đang giữ cho lượt đặt giá bạn đang dẫn đầu trong phiên đấu giá. Khi có người đặt giá cao hơn, tiền này trả lại về khả dụng.

## Nạp tiền

Vào mục "Ví" trong tài khoản để xem các tùy chọn nạp tiền. Nạp tiền hiện chưa kết nối cổng thanh toán hoặc ngân hàng và không tạo giao dịch tiền thật. NaviShop chưa hỗ trợ rút tiền về ngân hàng.

## Tiền được bảo vệ khi đặt hàng

Khi đặt hàng, tiền bị trừ khỏi ví và NaviShop giữ hộ cho đến khi đơn kết thúc. Đơn hoàn thành thì tiền chuyển cho cửa hàng; đơn bị hủy thì tiền hoàn lại đủ về ví của bạn.
`,
}
