export default {
  title: 'Thỏa thuận Đấu giá',
  body: `
## Cách vận hành

- Mỗi thời điểm chỉ có một phiên đấu giá, các vật phẩm được tổ chức theo lịch của phiên.
- Số lượng vật phẩm, thời lượng mỗi vật phẩm, khoảng cách giữa các lượt lên sàn, thời gian mở đăng ký và quy tắc gia hạn được xác định theo cấu hình của phiên.
- Admin có thể cấu hình các thông số thời gian và giá tiền, gồm số lượng vật phẩm, thời lượng mỗi vật phẩm, ngưỡng và thời lượng gia hạn, thời gian đăng ký, giá khởi điểm, bước giá và phí đăng ký khi phiên còn đóng, chưa mở.
- Khi phiên được mở, toàn bộ thông số đã chốt và không thể chỉnh sửa trong trạng thái chờ đăng ký (pending) hoặc đang diễn ra (active).

## Điều kiện tham gia

- Đăng nhập, tài khoản không bị khóa, ví đủ số dư khả dụng.
- Đăng ký trước khi phiên bắt đầu. Phiên đã bắt đầu thì không đăng ký được, hẹn gặp ở phiên kế tiếp.
- Chủ cửa hàng không đặt giá vật phẩm của mình.

## Giá và cách đặt giá

- Giá khởi điểm: mức thấp nhất của lượt đầu. Có một lượt hợp lệ là vật phẩm được bán, không có giá sàn nào được giấu.
- Bước giá: mức tăng tối thiểu mỗi lượt. Giá khởi điểm và bước giá do NaviShop quyết định khi duyệt vật phẩm.
- Bạn vẫn có thể tiếp tục đặt giá khi đang dẫn đầu. Số tiền đang khóa cho lượt dẫn đầu trước được dùng để bù trừ; ví chỉ khóa thêm phần chênh lệch của lượt giá mới. Khi có người đặt cao hơn, khoản đang khóa cho bạn được trả lại vào số dư khả dụng.
- Nhiều người đặt cùng lúc thì chỉ một lượt hợp lệ được chấp nhận, bạn cần đặt lại. Giá đã đặt không rút lại được.

## Gia hạn

- Khi có lượt đặt trong khoảng thời gian gia hạn do admin cấu hình, thời gian kết thúc được dời thêm theo thời lượng gia hạn đã thiết lập cho phiên. Gia hạn lặp lại không giới hạn số lần.

## Kết thúc vật phẩm

- Hết giờ, người dẫn đầu thắng. Không ai đặt giá thì vật phẩm về kho chờ phiên sau.
- NaviShop chỉ có thể hủy phiên trước khi phiên bắt đầu. Khi phiên đã diễn ra, phiên không thể bị kết thúc sớm trong lúc giải lao; từng vật phẩm tiếp tục theo lịch và kết thúc vào thời điểm đã quy định. Vật phẩm đã đấu xong giữ nguyên kết quả, vật phẩm chưa tới lượt vẫn chờ đến lượt trong phiên.

## Khi bạn thắng

> Quan trọng: Đấu giá miễn hủy, miễn trả. Kết quả không thể hủy và không hoàn tiền.

- Tiền đã khóa bị trừ ngay khi chốt: NaviShop thu hoa hồng riêng cho đấu giá, phần còn lại chuyển cho cửa hàng.
- Một đơn hàng được tạo để cửa hàng giao cho bạn.
- Phí vận chuyển được trừ từ ví bạn lúc cửa hàng bấm giao. Ví chưa đủ thì cửa hàng chưa giao được và bạn nhận thông báo nạp thêm, nên hãy giữ đủ số dư sau khi thắng.
- Bạn bấm "Đã nhận hàng", hoặc đơn tự hoàn thành sau 3 ngày kể từ lúc báo giao. Bước này chỉ chuyển phí vận chuyển, không ảnh hưởng tiền vật phẩm.
- Nếu tài khoản bị khóa khi đang dẫn đầu, lượt đặt giá vẫn được chốt bình thường.
`,
}
