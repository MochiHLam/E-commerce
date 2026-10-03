export default {
  title: 'Quản lý và xử lý đơn hàng',
  body: `
Mọi đơn của cửa hàng nằm trong mục **Đơn hàng** của trang quản lý. Đơn đến từ đấu giá cũng nằm trong danh sách này và được đánh dấu riêng.

## Bước 1 — Xác nhận đơn

Bạn có tối đa **48 giờ** kể từ khi nhận đơn để xác nhận. Khi xác nhận, đơn chuyển sang "Đã xác nhận" và người mua nhận được thông báo.

[Ảnh: danh sách đơn hàng của cửa hàng]

## Bước 2 — Giao hàng

Chuẩn bị hàng, giao cho đơn vị vận chuyển rồi bấm **Đã giao cho đơn vị vận chuyển** trong vòng **1 ngày** sau khi xác nhận. Đơn chuyển sang "Đang giao".

[Ảnh: nút xác nhận đơn và nút báo giao]

## Bước 3 — Hoàn thành

Người mua bấm "Đã nhận hàng", hoặc đơn tự hoàn thành sau 3 ngày kể từ lúc bạn báo giao.

## Các mốc hạn bạn cần nhớ
- Quá **48 giờ** mà bạn chưa xác nhận, đơn tự hủy.
- Đã xác nhận nhưng quá **1 ngày** bạn chưa báo giao, đơn tự hủy.
- Khi đơn tự hủy, tiền hoàn lại cho người mua và hàng được cộng lại vào tồn kho.
- Sau khi bạn bấm báo giao, đơn không thể hủy nữa.

## Đơn từ đấu giá
Đơn đấu giá được tạo ngay khi vật phẩm được chốt, ở trạng thái "Đã xác nhận" và tiền vật phẩm đã được chia cho bạn. Bạn chỉ cần giao hàng và bấm báo giao. Ngay lúc bạn báo giao, hệ thống trừ phí vận chuyển từ ví của người thắng. Nếu ví của họ chưa đủ, nút báo giao tạm thời bị chặn và người thắng nhận thông báo cần nạp thêm tiền. Đơn đấu giá không thể hủy.
`,
}
