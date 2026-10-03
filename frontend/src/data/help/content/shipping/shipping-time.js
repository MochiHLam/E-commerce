export default {
  title: 'Thời gian giao hàng',
  body: `
Từ lúc bạn đặt hàng đến lúc đơn hoàn thành, đơn đi qua các mốc sau. Mỗi mốc có thời hạn để không ai phải chờ vô thời hạn.

| Mốc | Thời hạn tối đa | Nếu quá hạn |
|---|---|---|
| Cửa hàng xác nhận đơn | 48 giờ kể từ lúc bạn đặt hàng | Đơn tự hủy, hoàn tiền đầy đủ |
| Cửa hàng giao cho đơn vị vận chuyển | 1 ngày kể từ lúc xác nhận | Đơn tự hủy, hoàn tiền đầy đủ |
| Bạn xác nhận đã nhận hàng | 3 ngày kể từ lúc cửa hàng báo giao | Đơn tự hoàn thành, tiền chuyển cho cửa hàng |

[Ảnh: sơ đồ các mốc thời gian của một đơn hàng]

## Lưu ý
- Các mốc thời hạn trên do NaviShop quy định và có thể được điều chỉnh. Mốc áp dụng cho đơn của bạn được cố định tại thời điểm bạn đặt hàng.
- Thời gian hàng thực tế đến tay bạn phụ thuộc vào cửa hàng và đơn vị vận chuyển. Hãy theo dõi trạng thái đơn trong [Theo dõi đơn hàng](/help/mua-sam/track-order).
- Với đơn từ đấu giá, cửa hàng cũng giao hàng theo cùng quy trình sau khi vật phẩm được chốt.
`,
}
