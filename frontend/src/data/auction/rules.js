export default [
  {
    icon: '💰',
    title: 'Giá và bước giá của mỗi vật phẩm',
    description:
      'Mỗi vật phẩm có giá khởi điểm (mức thấp nhất cho lượt đặt đầu) và bước giá (mức tăng tối thiểu mỗi lượt). Admin cấu hình các mức giá khi phiên còn đóng, trước khi mở; khi phiên đã mở và ở trạng thái chờ đăng ký hoặc đang diễn ra, không thể chỉnh sửa. Chỉ cần một lượt đặt hợp lệ là vật phẩm sẽ được bán.',
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
      'Nếu có người đặt giá trong khoảng cuối giờ, thời gian kết thúc được dời thêm theo cấu hình của phiên. Gia hạn có thể lặp lại nhiều lần. Ngưỡng kích hoạt và thời lượng gia hạn do admin cấu hình trước khi mở phiên; khi phiên đã mở thì không thể chỉnh sửa.',
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