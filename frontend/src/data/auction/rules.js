export default [
  {
    icon: '💰',
    title: 'Ba mức giá của mỗi vật phẩm',
    description:
      'Mỗi vật phẩm có giá khởi điểm (mức thấp nhất cho lượt đầu), bước giá (mức tăng tối thiểu mỗi lượt) và giá mua ngay (mức trần). Cả ba do NaviShop quyết định khi duyệt và không đổi giữa chừng. Chỉ cần có một lượt đặt giá hợp lệ là vật phẩm sẽ được bán.',
  },
  {
    icon: '🔒',
    title: 'Tiền được giữ theo lượt đặt giá',
    description:
      'Khi bạn đặt giá, đúng số tiền bạn đặt sẽ được giữ lại trong ví và hiện ở mục đang khóa. Nếu có người đặt cao hơn, tiền này quay về số dư khả dụng của bạn ngay, bạn không cần làm gì thêm.',
  },
  {
    icon: '⏱️',
    title: 'Gia hạn khi đặt giá phút chót',
    description:
      'Nếu có người đặt giá trong 15 giây cuối, thời gian kết thúc được dời thêm 15 giây tính từ lượt đó, và việc này có thể lặp lại nhiều lần. Sau mỗi lần gia hạn, bước giá tăng lên 1,5 lần, nên những phút cuối sẽ căng hơn bình thường.',
  },
  {
    icon: '⚡',
    title: 'Mua ngay để chốt luôn',
    description:
      'Bạn có thể bấm mua ngay để chốt vật phẩm với đúng giá mua ngay, kể cả khi đang dẫn đầu (lúc đó bạn chỉ bị giữ thêm phần chênh). Một lượt đặt giá thường mà đạt hoặc vượt giá mua ngay cũng chốt luôn, với đúng số bạn đã đặt.',
  },
  {
    icon: '🚫',
    title: 'Những lúc bạn không đặt được giá',
    description:
      'Khi bạn đang dẫn đầu thì không cần và không thể đặt thêm. Chủ cửa hàng cũng không được đặt giá vật phẩm của mình. Nếu nhiều người đặt cùng lúc, chỉ một lượt hợp lệ được nhận và những người còn lại cần đặt lại. Giá đã đặt thì không rút lại được.',
  },
  {
    icon: '📅',
    title: 'Điều kiện để tham gia',
    description:
      'Bạn cần đăng nhập, tài khoản không bị khóa và ví còn đủ số dư khả dụng. Việc đăng ký phải hoàn tất trước khi phiên bắt đầu. Nếu lỡ mất, bạn vẫn có thể xem phiên diễn ra và đăng ký cho phiên kế tiếp.',
  },
]
