export default {
  title: 'Theo dõi trạng thái đơn hàng',
  body: `
Vào **Đơn hàng của tôi** để xem tất cả đơn và tình trạng của từng đơn. NaviShop hiện theo dõi hành trình qua **trạng thái đơn**, chưa có mã vận đơn của hãng vận chuyển.

## Bốn trạng thái của một đơn

| Trạng thái | Ý nghĩa | Ai chuyển |
|---|---|---|
| **Chờ xác nhận** | Bạn vừa đặt hàng, cửa hàng chưa xác nhận | Bạn đặt hàng |
| **Đã xác nhận** | Cửa hàng đã nhận đơn và đang chuẩn bị hàng | Cửa hàng |
| **Đang giao** | Cửa hàng đã giao hàng cho đơn vị vận chuyển | Cửa hàng |
| **Đã nhận hàng** | Đơn hoàn thành | Bạn xác nhận, hoặc hệ thống tự động |

[Ảnh: trang Đơn hàng của tôi]
[Ảnh: chi tiết một đơn ở trạng thái "Đang giao"]

## Khi hàng đến tay bạn
Kiểm tra hàng, rồi bấm **Đã nhận hàng**. Khi bạn bấm, đơn hoàn thành và tiền được chuyển cho cửa hàng, nên hãy chắc chắn rằng bạn đã nhận đúng hàng. Nếu bạn không bấm gì, đơn sẽ **tự hoàn thành sau 3 ngày** kể từ lúc chuyển sang "Đang giao".

## Thông báo
Bạn nhận thông báo trong NaviShop khi cửa hàng xác nhận đơn, khi đơn được giao đi và khi đơn tự động bị hủy. Bấm vào thông báo để mở đúng đơn hàng.

## Đơn bị hủy
Đơn có thể bị hủy khi bạn chủ động hủy lúc còn "Chờ xác nhận", hoặc khi cửa hàng không xác nhận hay không giao hàng đúng hạn. Tiền được hoàn lại vào ví của bạn, xem chi tiết ở trang [Hoàn tiền](/help/thanh-toan/refund).

## Đánh giá sản phẩm
Sau khi nhận hàng, bạn có thể để lại số sao và nhận xét cho sản phẩm.
- Chỉ người đã mua sản phẩm đó của cửa hàng đó mới được đánh giá.
- Bạn có thể **sửa** nội dung và số sao, hoặc **xóa** đánh giá của mình bất cứ lúc nào.
- Đánh giá bị nhiều người báo cáo vi phạm có thể bị ẩn trong lúc chờ kiểm duyệt. Khi bị ẩn, đánh giá đó không được tính vào tổng số đánh giá và điểm sao trung bình.
`,
}
