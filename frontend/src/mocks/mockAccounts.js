// CHỈ DÙNG KHI DEV. Xóa file này khi nối API đăng nhập thật.
export const MOCK_ACCOUNTS = [
  { id: 'usr_001', name: 'Nguyễn Văn An', email: 'user@navishop.test', password: '12345678', role: 'user', hasShop: false },
  { id: 'usr_002', name: 'Trần Thị Bình', email: 'seller@navishop.test', password: '12345678', role: 'user', hasShop: true },
  { id: 'mod_001', name: 'Lê Kiểm Duyệt', email: 'mod@navishop.test', password: '12345678', role: 'mod' },
  { id: 'adm_001', name: 'Phạm Quản Trị', email: 'admin@navishop.test', password: '12345678', role: 'admin' },
]
