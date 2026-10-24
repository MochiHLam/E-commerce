// CHỈ DÙNG KHI DEV. Xóa file này khi nối API đăng nhập thật.
export const MOCK_PASSWORD_RESET_PREFIX = 'navishop.mockPasswordReset.'

export const MOCK_ACCOUNTS = [
  {
    id: 'usr_001',
    name: 'Nguyễn Văn An',
    email: 'user@navishop.test',
    password: '12345678',
    role: 'user',
    hasShop: false,
    phone: '0901234567',
    address: '01 Đường Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
    shippingAddresses: [{
      id: 'account-address',
      recipientName: 'Nguyễn Văn An',
      phone: '0901234567',
      address: '01 Đường Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
      isDefault: true,
    }],
  },
  { id: 'usr_002', name: 'User 1', email: 'user1@navishop.test', password: '12345678', role: 'user', hasShop: false },
  { id: 'usr_google_001', name: 'Người bán Google Demo', email: 'google-buyer@navishop.test', role: 'user', hasShop: false, loginProvider: 'google' },
  { id: 'mod_001', name: 'Lê Kiểm Duyệt', email: 'mod@navishop.test', password: '12345678', role: 'mod' },
  { id: 'adm_001', name: 'Phạm Quản Trị', email: 'admin@navishop.test', password: '12345678', role: 'admin' },
]
