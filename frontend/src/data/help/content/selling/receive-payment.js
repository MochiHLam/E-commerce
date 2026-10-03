export default {
  title: 'Nhận thanh toán từ NaviShop',
  body: `
## Đơn thường
Khi người mua đặt hàng, tiền được NaviShop giữ hộ. Tiền chỉ chuyển cho bạn khi đơn **hoàn thành** (người mua xác nhận đã nhận, hoặc tự hoàn thành sau 3 ngày). Lúc đó hệ thống tự chia:
- **Phần bạn nhận:** tiền hàng trừ hoa hồng.
- **Hoa hồng:** NaviShop thu theo tỉ lệ phần trăm trên tiền hàng. Tỉ lệ khác nhau theo danh mục sản phẩm.
- **Phí vận chuyển:** là khoản thu hộ để trả cho đơn vị vận chuyển, không thuộc về bạn và không bị tính hoa hồng.

Đơn bị hủy thì bạn không nhận tiền và không bị tính hoa hồng.

## Đơn đấu giá
Tiền được chia ngay lúc vật phẩm được chốt, không chờ người thắng xác nhận nhận hàng. Hoa hồng của đấu giá có tỉ lệ riêng, khác với đơn thường.

[Ảnh: trang doanh thu của cửa hàng]

## Xem doanh thu
Vào mục **Doanh thu** để xem số tiền bạn đã nhận và khoản hoa hồng đã trừ. Mọi lần tiền vào ví đều có dòng ghi trong **Lịch sử ví**.

## Sử dụng tiền bán hàng
Tiền bán hàng nằm trong ví NaviShop của bạn. Bạn dùng tiền này để mua hàng hoặc tham gia đấu giá. Hiện NaviShop chưa hỗ trợ rút tiền về tài khoản ngân hàng.

Nếu cửa hàng bị khóa vĩnh viễn, ví của chủ cửa hàng không còn dùng để chi tiêu được.
`,
}
