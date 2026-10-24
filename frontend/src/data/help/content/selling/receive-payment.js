export default {
  title: 'Nhận thanh toán',
  body: `
Doanh thu từ đơn hàng được quyết toán vào ví cửa hàng khi đơn hoàn thành. Khoản thanh toán được giữ trong quá trình xử lý đơn để bảo đảm việc chia tiền chính xác.

## Cách tính doanh thu

- **Tiền hàng** = giá sản phẩm × số lượng.
- **Hoa hồng NaviShop** được tính theo tỉ lệ áp dụng cho danh mục sản phẩm.
- **Doanh thu cửa hàng** = tiền hàng − hoa hồng.
- Phí vận chuyển được tính riêng theo đơn, chuyển cho đơn vị vận chuyển và không tính hoa hồng.

Ví dụ: với tiền hàng 100.000 ₫ và tỉ lệ hoa hồng 5%, doanh thu cửa hàng là 95.000 ₫; phí vận chuyển được quyết toán riêng.

## Thời điểm quyết toán

Khi đơn hoàn thành, tiền hàng sau khi trừ hoa hồng được chuyển vào ví cửa hàng. Nếu đơn bị hủy trước khi giao, khách được hoàn lại toàn bộ khoản đã thanh toán và cửa hàng không phát sinh doanh thu hoặc hoa hồng.

Đơn hàng từ đấu giá áp dụng tỉ lệ hoa hồng riêng. Tiền vật phẩm được quyết toán cho cửa hàng khi kết quả đấu giá được chốt; phí vận chuyển được thu riêng từ người mua khi cửa hàng báo giao.

## Theo dõi doanh thu

Trong mục **Doanh thu**, chủ cửa hàng có thể xem tổng tiền nhận theo ngày, tuần hoặc tháng, số đơn hoàn thành, đơn đang chờ xử lý và sản phẩm sắp hết hàng. Lịch sử ví ghi nhận từng khoản thu và tham chiếu đến đơn hàng liên quan.
`,
}
