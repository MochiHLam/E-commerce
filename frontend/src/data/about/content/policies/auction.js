export default {
  title: 'Thỏa thuận Đấu giá',
  body: `
## Cách vận hành

- Mỗi thời điểm chỉ có một phiên, gồm ít nhất 10 vật phẩm, đấu giá lần lượt.
- Mỗi vật phẩm 5 phút, giữa hai vật phẩm nghỉ 1 phút.
- Sau khi NaviShop mở phiên, có 24 giờ chờ để bạn đăng ký tham gia. Các thông số thời gian và bước giá được cố định khi mở phiên, không đổi giữa chừng.

## Điều kiện tham gia

- Đăng nhập, tài khoản không bị khóa, ví đủ số dư khả dụng.
- Đăng ký trước khi phiên bắt đầu. Phiên đã bắt đầu thì không đăng ký được, hẹn gặp ở phiên kế tiếp.
- Chủ cửa hàng không đặt giá vật phẩm của mình.

## Giá và cách đặt giá

- Giá khởi điểm: mức thấp nhất của lượt đầu. Có một lượt hợp lệ là vật phẩm được bán, không có giá sàn nào được giấu.
- Bước giá: mức tăng tối thiểu mỗi lượt. Giá mua ngay: mức trần của vật phẩm. Cả ba mức do NaviShop quyết định khi duyệt, mọi vật phẩm đều có giá mua ngay.
- Bạn không đặt giá khi đang dẫn đầu. Khi đặt giá, hệ thống khóa đúng số tiền bạn đặt và trả lại khi có người đặt cao hơn.
- Nhiều người đặt cùng lúc thì chỉ một lượt hợp lệ được chấp nhận, bạn cần đặt lại. Giá đã đặt không rút lại được.

## Gia hạn và mua ngay

- Đặt giá trong 15 giây cuối thì thời gian kết thúc dời tới 15 giây sau lượt đó, không giới hạn số lần. Sau mỗi lần gia hạn, bước giá nhân lên theo hệ số của NaviShop (hiện là 1,5 lần).
- Mua ngay chốt vật phẩm với đúng giá mua ngay; người đang dẫn đầu vẫn bấm được và chỉ khóa thêm phần chênh. Lượt đặt giá thường đạt hoặc vượt giá mua ngay cũng chốt ngay, với đúng số đã đặt.

## Kết thúc vật phẩm

- Hết giờ, người dẫn đầu thắng. Không ai đặt giá thì vật phẩm về kho chờ phiên sau.
- NaviShop có thể hủy phiên khi còn chờ, và kết thúc sớm phiên trong lúc giải lao. Vật phẩm đã đấu xong giữ nguyên kết quả, vật phẩm chưa tới lượt về kho.

## Khi bạn thắng

> Quan trọng: Đấu giá miễn hủy, miễn trả. Kết quả không thể hủy và không hoàn tiền.

- Tiền đã khóa bị trừ ngay khi chốt: NaviShop thu hoa hồng riêng cho đấu giá, phần còn lại chuyển cho cửa hàng.
- Một đơn hàng được tạo để cửa hàng giao cho bạn.
- Phí vận chuyển được trừ từ ví bạn lúc cửa hàng bấm giao. Ví chưa đủ thì cửa hàng chưa giao được và bạn nhận thông báo nạp thêm, nên hãy giữ đủ số dư sau khi thắng.
- Bạn bấm "Đã nhận hàng", hoặc đơn tự hoàn thành sau 3 ngày kể từ lúc báo giao. Bước này chỉ chuyển phí vận chuyển, không ảnh hưởng tiền vật phẩm.
- Nếu tài khoản bị khóa khi đang dẫn đầu, lượt đặt giá vẫn được chốt bình thường.
`,
}
