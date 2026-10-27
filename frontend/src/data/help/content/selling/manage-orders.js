export default {
  title: 'Quản lý đơn hàng',
  body: `
Quản lý đơn hàng giúp bạn theo dõi yêu cầu mua, xử lý giao hàng đúng hạn và nắm được trạng thái từng đơn.

## Theo dõi đơn hàng

Trong mục **Quản lý đơn hàng**, bạn có thể xem tất cả đơn hoặc lọc theo trạng thái:

| Trạng thái | Việc cần làm |
|---|---|
| Chờ xác nhận | Xác nhận và bắt đầu giao đơn trong vòng 48 giờ kể từ khi khách đặt |
| Đang giao | Theo dõi đơn; khách có tối đa 3 ngày để xác nhận đã nhận |
| Hoàn thành | Xem thông tin đơn đã kết thúc |
| Đã hủy | Xem lý do và thông tin hoàn tiền |

Mỗi đơn hiển thị thông tin khách hàng, địa chỉ nhận hàng, sản phẩm, số lượng, tiền hàng, phí vận chuyển và thời hạn xử lý.

## Xác nhận và giao hàng

1. Mở đơn ở trạng thái **Chờ xác nhận**, chuẩn bị sản phẩm rồi chọn **Xác nhận & bắt đầu giao**. Trạng thái chuyển thẳng sang **Đang giao**.
2. Theo dõi việc giao hàng ngoài hệ thống; NaviShop không có tài khoản hay bước xử lý riêng cho đơn vị vận chuyển.
3. Khách hàng xác nhận đã nhận hàng; nếu chưa xác nhận trong vòng 3 ngày kể từ khi shop bắt đầu giao, đơn tự động hoàn thành.

## Thời hạn và hủy đơn

Nếu bạn không xác nhận và bắt đầu giao đơn trong 48 giờ, đơn sẽ tự động hủy. Khách được hoàn toàn bộ số tiền đã thanh toán, bao gồm phí vận chuyển, và sản phẩm được cộng lại vào tồn kho.

Người bán không thể chủ động hủy đơn. Sau khi đã chuyển trạng thái sang đang giao, đơn không thể bị hủy.

Đơn hàng phát sinh từ đấu giá có quy trình riêng và không dùng thao tác xác nhận đơn thường.
`,
}
