export default {
  title: 'Quản lý đơn hàng',
  body: `
Quản lý đơn hàng giúp bạn theo dõi yêu cầu mua, xử lý giao hàng đúng hạn và nắm được trạng thái từng đơn.

## Theo dõi đơn hàng

Trong mục **Quản lý đơn hàng**, bạn có thể xem tất cả đơn hoặc lọc theo trạng thái:

| Trạng thái | Việc cần làm |
|---|---|
| Chờ xác nhận | Xác nhận đơn trong vòng 48 giờ kể từ khi khách đặt |
| Đã xác nhận | Chuẩn bị hàng và báo giao trong vòng 1 ngày |
| Đang giao | Theo dõi quá trình giao hàng; khách có tối đa 3 ngày để xác nhận đã nhận |
| Hoàn thành | Xem thông tin đơn đã kết thúc |
| Đã hủy | Xem lý do và thông tin hoàn tiền |

Mỗi đơn hiển thị thông tin khách hàng, địa chỉ nhận hàng, sản phẩm, số lượng, tiền hàng, phí vận chuyển và thời hạn xử lý.

## Xác nhận và giao hàng

1. Mở đơn ở trạng thái **Chờ xác nhận** và chọn **Xác nhận** để tiếp nhận.
2. Chuẩn bị sản phẩm, bàn giao cho đơn vị vận chuyển, sau đó cập nhật trạng thái **Đang giao**.
3. Khách hàng xác nhận đã nhận hàng; nếu chưa xác nhận trong vòng 3 ngày kể từ khi đơn chuyển sang trạng thái đang giao, đơn tự động hoàn thành.

## Thời hạn và hủy đơn

Nếu bạn không xác nhận đơn trong 48 giờ, đơn sẽ tự động hủy. Sau khi xác nhận, bạn có 1 ngày để cập nhật đã giao; quá thời hạn, đơn cũng tự động hủy. Trong cả hai trường hợp, khách được hoàn toàn bộ số tiền đã thanh toán, bao gồm phí vận chuyển, và sản phẩm được cộng lại vào tồn kho.

Người bán không thể chủ động hủy đơn. Sau khi đã cập nhật trạng thái đang giao, đơn không thể bị hủy.

Đơn hàng phát sinh từ đấu giá được chuyển thẳng sang trạng thái **Đã xác nhận**; bạn thực hiện bước chuẩn bị và báo giao như các đơn hàng khác.
`,
}
