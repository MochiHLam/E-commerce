export default {
  title: 'Đăng sản phẩm',
  body: `
Quản lý sản phẩm giúp bạn giới thiệu hàng hóa, cập nhật giá bán và chủ động theo dõi tồn kho tại cửa hàng.

## Thêm sản phẩm mới

Trong mục **Quản lý sản phẩm**, chọn **Thêm sản phẩm** và cung cấp các thông tin:

- Tên sản phẩm, danh mục và mô tả rõ ràng.
- Ít nhất một hình ảnh đại diện cho sản phẩm.
- Giá bán bằng đồng Việt Nam và số lượng tồn kho.

Kiểm tra thông tin trước khi lưu. Sản phẩm được đăng bán sau khi lưu và hiển thị tại cửa hàng cũng như trong kết quả tìm kiếm. Giá bán do cửa hàng quyết định, không cần duyệt riêng.

## Cập nhật sản phẩm và tồn kho

Bạn có thể chỉnh sửa thông tin, điều chỉnh giá, bổ sung tồn kho, tạm ẩn hoặc xóa sản phẩm. Khi tồn kho bằng 0, khách hàng không thể đặt sản phẩm đó. Đơn hàng đang xử lý không bị ảnh hưởng khi bạn cập nhật tồn kho.

Mỗi sản phẩm có một mức giá và số lượng tồn kho; hiện không quản lý các phân loại riêng theo màu sắc hoặc kích cỡ.

## Gửi vật phẩm đấu giá

Sản phẩm gửi xét đấu giá cần thuộc danh mục được phép, đang được đăng bán và còn đúng một sản phẩm trong kho. Khi gửi xét, sản phẩm được ẩn khỏi trang bán thường. Nếu được duyệt, sản phẩm chuyển sang kho đấu giá, NaviShop thiết lập giá khởi điểm, bước giá và giá mua ngay, đồng thời cửa hàng không thể rút lại sản phẩm. Nếu bị từ chối, sản phẩm trở lại trạng thái bán thường.
`,
}
