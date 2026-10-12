export default [
  {
    icon: '💰',
    title: 'Ba mức giá của mỗi vật phẩm',
    description:
      'Mỗi vật phẩm có giá khởi điểm (mức thấp nhất cho lượt đặt đầu), bước giá (mức tăng tối thiểu mỗi lượt) và giá mua ngay (mức trần). Cả ba do NaviShop quyết định khi duyệt và không đổi giữa chừng. Chỉ cần một lượt đặt hợp lệ là vật phẩm sẽ được bán.',
  },
  {
    icon: '🔒',
    title: 'Tiền được giữ theo từng lượt đặt',
    description:
      'Khi bạn đang dẫn đầu một món, số tiền bạn đặt được giữ lại trong ví. Nếu có người đặt cao hơn, tiền quay về số dư khả dụng ngay. Bạn có thể dẫn giá nhiều món cùng lúc, khi đó tiền giữ được cộng dồn, nên ví cần đủ cho mỗi lượt đặt mới.',
  },
  {
    icon: '⏱️',
    title: 'Cộng thêm giờ khi đặt phút chót',
    description:
      'Nếu có người đặt giá trong khoảng cuối giờ của món đó, thời gian kết thúc được dời ra. Khoảng này bằng khoảng một phần mười thời lượng của món: món 30 phút thì là 3 phút cuối, và được cộng đủ 3 phút tính từ lúc đặt. Việc này lặp lại được nhiều lần. Mỗi lần cộng giờ, bước giá của món đó tăng theo hệ số NaviShop cài cho phiên (thường là 1,5 lần).',
  },
  {
    icon: '⚡',
    title: 'Mua ngay để chốt luôn',
    description:
      'Bạn có thể bấm mua ngay để chốt món với đúng giá mua ngay, kể cả khi đang dẫn đầu (lúc đó bạn chỉ bị giữ thêm phần chênh). Một lượt đặt giá mà đạt hoặc vượt giá mua ngay cũng chốt luôn, với đúng số bạn đã đặt.',
  },
  {
    icon: '🚫',
    title: 'Những lúc bạn không đặt được giá',
    description:
      'Khi bạn đang dẫn đầu thì không cần và không thể đặt thêm. Chủ cửa hàng không được đặt giá món của mình. Bạn cũng không đặt được nếu chưa đăng ký phiên. Nếu nhiều người đặt cùng lúc, chỉ một lượt hợp lệ được nhận, những người còn lại cần đặt lại. Giá đã đặt thì không rút lại được.',
  },
  {
    icon: '🎟️',
    title: 'Phí đăng ký và hoàn phí',
    description:
      'Phí đăng ký do NaviShop đặt cho từng phiên, có thể bằng 0, và được trừ ngay vào ví khi đăng ký. Trong thời gian xem trước, bạn hủy đăng ký sẽ được hoàn đủ. Nếu NaviShop hủy phiên trước khi bắt đầu, mọi người đã đăng ký đều được hoàn đủ. Khi phiên đã chạy thì phí không hoàn và NaviShop không can thiệp giữa chừng.',
  },
]