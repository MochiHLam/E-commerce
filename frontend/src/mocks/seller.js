import { MOCK_SHOPS } from '@/mocks/mockShops'

const APPLICATIONS_KEY = 'navishop.mockSeller.applications'
const PRODUCTS_KEY = 'navishop.mockSeller.products'
const SHOP_SETTINGS_KEY = 'navishop.mockSeller.settings'
const INFORMATION_CHANGE_INTERVAL_MONTHS = 6
const MOCK_APPLICATION_USER_ID = 'demo_seller_application'
const SELLER_PROFILE_FIELDS = [
  'shopName',
  'slug',
  'categoryId',
  'contactName',
  'phone',
  'email',
  'pickupAddress',
  'taxCode',
  'identityNumber',
  'description',
]
const MOCK_SELLER_APPLICATIONS = [
  {
    userId: MOCK_APPLICATION_USER_ID,
    shopName: 'ádd',
    slug: 'add',
    categoryId: '16',
    description: 'ádsadasdsadasdasdasdsad',
    contactName: 'Nguyễn Văn An',
    phone: '0901234567',
    pickupAddress: '01 Đường Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
    email: 'user@navishop.test',
    identityNumber: '123213123121',
    taxCode: '1231231232',
    submittedAt: new Date(2026, 9, 26, 10, 40, 39).toISOString(),
  },
  {
    userId: 'demo_seller_application_2',
    shopName: 'Sora Shoes',
    slug: 'sora-shoes',
    categoryId: '16',
    description: 'Cửa hàng giày dép nữ với các mẫu giày đi học và đi làm.',
    contactName: 'Trần Minh Anh',
    phone: '0912345678',
    pickupAddress: '25 Đường Lê Văn Việt, Phường Hiệp Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
    email: 'minhanh@navishop.test',
    identityNumber: '079123456789',
    taxCode: '0312345678',
    submittedAt: new Date(2026, 9, 26, 10, 45, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_3',
    shopName: 'Mây Boutique',
    slug: 'may-boutique',
    categoryId: '11',
    description: 'Thời trang nữ thanh lịch cho phong cách hàng ngày.',
    contactName: 'Lê Ngọc Hà',
    phone: '0987654321',
    pickupAddress: '18 Nguyễn Trãi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh',
    email: 'ngocha@navishop.test',
    identityNumber: '079234567891',
    taxCode: '0312345686',
    submittedAt: new Date(2026, 9, 26, 10, 50, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_4',
    shopName: 'Góc Công Nghệ',
    slug: 'goc-cong-nghe',
    categoryId: '2',
    description: 'Phụ kiện điện thoại và thiết bị công nghệ chính hãng.',
    contactName: 'Phạm Quốc Bảo',
    phone: '0908765432',
    pickupAddress: '82 Cách Mạng Tháng Tám, Phường 5, Quận 3, Thành phố Hồ Chí Minh',
    email: 'quocbao@navishop.test',
    identityNumber: '079345678912',
    taxCode: '0312345694',
    submittedAt: new Date(2026, 9, 26, 10, 55, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_5',
    shopName: 'Nhà Xinh Việt',
    slug: 'nha-xinh-viet',
    categoryId: '13',
    description: 'Đồ trang trí và vật dụng tiện ích cho không gian sống.',
    contactName: 'Võ Thị Thanh',
    phone: '0934567890',
    pickupAddress: '41 Phan Văn Trị, Phường 7, Quận Gò Vấp, Thành phố Hồ Chí Minh',
    email: 'thanh.vo@navishop.test',
    identityNumber: '079456789123',
    taxCode: '0312345702',
    submittedAt: new Date(2026, 9, 26, 11, 0, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_6',
    shopName: 'Mộc Nhiên Store',
    slug: 'moc-nhien-store',
    categoryId: '19',
    description: 'Sản phẩm tiêu dùng chọn lọc cho gia đình.',
    contactName: 'Đặng Minh Khoa',
    phone: '0978123456',
    pickupAddress: '12 Lê Lợi, Phường 4, Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu',
    email: 'minhkhoa@navishop.test',
    identityNumber: '079567891234',
    taxCode: '0312345710',
    submittedAt: new Date(2026, 9, 26, 11, 5, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_7',
    shopName: 'Luna Accessories',
    slug: 'luna-accessories',
    categoryId: '18',
    description: 'Trang sức và phụ kiện với thiết kế trẻ trung.',
    contactName: 'Nguyễn Thảo Vy',
    phone: '0918765432',
    pickupAddress: '56 Hai Bà Trưng, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    email: 'thaovy@navishop.test',
    identityNumber: '079678912345',
    taxCode: '0312345728',
    submittedAt: new Date(2026, 9, 26, 11, 10, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_8',
    shopName: 'Bếp Vui',
    slug: 'bep-vui',
    categoryId: '8',
    description: 'Đồ dùng bếp và thiết bị gia đình tiện lợi.',
    contactName: 'Trần Đức Long',
    phone: '0945678901',
    pickupAddress: '109 Nguyễn Văn Cừ, Phường An Hòa, Quận Ninh Kiều, Cần Thơ',
    email: 'duclong@navishop.test',
    identityNumber: '079789123456',
    taxCode: '0312345736',
    submittedAt: new Date(2026, 9, 26, 11, 15, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_9',
    shopName: 'Sách & Mực',
    slug: 'sach-va-muc',
    categoryId: '20',
    description: 'Sách, dụng cụ học tập và văn phòng phẩm.',
    contactName: 'Bùi Hoàng Nam',
    phone: '0967890123',
    pickupAddress: '7 Lê Duẩn, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    email: 'hoangnam@navishop.test',
    identityNumber: '079891234567',
    taxCode: '0312345744',
    submittedAt: new Date(2026, 9, 26, 11, 20, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_10',
    shopName: 'Chạy Bộ Mỗi Ngày',
    slug: 'chay-bo-moi-ngay',
    categoryId: '9',
    description: 'Trang phục và phụ kiện dành cho người yêu thể thao.',
    contactName: 'Hoàng Gia Huy',
    phone: '0923456789',
    pickupAddress: '32 Điện Biên Phủ, Phường Chính Gián, Quận Thanh Khê, Đà Nẵng',
    email: 'giahuy@navishop.test',
    identityNumber: '079912345678',
    taxCode: '0312345751',
    submittedAt: new Date(2026, 9, 26, 11, 25, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_11',
    shopName: 'Sắc Đẹp An Nhiên',
    slug: 'sac-dep-an-nhien',
    categoryId: '14',
    description: 'Mỹ phẩm và sản phẩm chăm sóc cá nhân.',
    contactName: 'Đỗ Khánh Linh',
    phone: '0981234567',
    pickupAddress: '65 Trần Phú, Phường Lộc Thọ, Thành phố Nha Trang, Khánh Hòa',
    email: 'khanhlinh@navishop.test',
    identityNumber: '070123456789',
    taxCode: '0312345769',
    submittedAt: new Date(2026, 9, 26, 11, 30, 0).toISOString(),
  },
  {
    userId: 'demo_seller_application_12',
    shopName: 'Điện Máy Phố',
    slug: 'dien-may-pho',
    categoryId: '3',
    description: 'Thiết bị điện tử gia dụng, tư vấn và hỗ trợ tận tình.',
    contactName: 'Nguyễn Thành Đạt',
    phone: '0902345678',
    pickupAddress: '208 Lạch Tray, Phường Đằng Giang, Quận Ngô Quyền, Hải Phòng',
    email: 'thanhdat@navishop.test',
    identityNumber: '070234567891',
    taxCode: '0312345777',
    submittedAt: new Date(2026, 9, 26, 11, 35, 0).toISOString(),
  },
]

const MOCK_SELLER_INFORMATION_UPDATE_REQUESTS = [
  {
    userId: 'demo_existing_shop_update_1',
    application: {
      shopName: 'Mộc Nhiên Living',
      slug: 'moc-nhien-living',
      categoryId: '13',
      description: 'Đồ trang trí và vật dụng tiện ích cho không gian sống.',
      contactName: 'Đặng Minh Khoa',
      phone: '0978123456',
      pickupAddress: '12 Lê Lợi, Phường 4, Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu',
      email: 'mocnhien@navishop.test',
      submittedAt: new Date(2026, 2, 15, 9, 0, 0).toISOString(),
      reviewedAt: new Date(2026, 2, 18, 14, 30, 0).toISOString(),
      lastInformationChangeAt: new Date(2026, 2, 18, 14, 30, 0).toISOString(),
      status: 'approved',
      pendingInformationUpdate: {
        shopName: 'Mộc Nhiên Home',
        slug: 'moc-nhien-living',
        categoryId: '13',
        description: 'Đồ gia dụng và vật dụng trang trí cho không gian sống.',
        contactName: 'Đặng Minh Khoa',
        phone: '0978123456',
        pickupAddress: '25 Lê Lợi, Phường 4, Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu',
        email: 'mocnhien@navishop.test',
        submittedAt: new Date(2026, 9, 26, 9, 15, 0).toISOString(),
      },
    },
  },
  {
    userId: 'demo_existing_shop_update_2',
    application: {
      shopName: 'Lam Tech Store',
      slug: 'lam-tech-store',
      categoryId: '2',
      description: 'Phụ kiện điện thoại và thiết bị công nghệ.',
      contactName: 'Phạm Quốc Bảo',
      phone: '0908765432',
      pickupAddress: '82 Cách Mạng Tháng Tám, Phường 5, Quận 3, Thành phố Hồ Chí Minh',
      email: 'lamtech@navishop.test',
      submittedAt: new Date(2026, 1, 10, 10, 0, 0).toISOString(),
      reviewedAt: new Date(2026, 1, 12, 16, 0, 0).toISOString(),
      lastInformationChangeAt: new Date(2026, 1, 12, 16, 0, 0).toISOString(),
      status: 'approved',
      pendingInformationUpdate: {
        shopName: 'Lam Tech & Phụ Kiện',
        slug: 'lam-tech-store',
        categoryId: '2',
        description: 'Điện thoại, phụ kiện và thiết bị công nghệ chính hãng.',
        contactName: 'Phạm Quốc Bảo',
        phone: '0908765432',
        pickupAddress: '82 Cách Mạng Tháng Tám, Phường 5, Quận 3, Thành phố Hồ Chí Minh',
        email: 'lamtech@navishop.test',
        submittedAt: new Date(2026, 9, 25, 15, 40, 0).toISOString(),
      },
    },
  },
  {
    userId: 'demo_existing_shop_update_3',
    application: {
      shopName: 'Nắng Vải Studio',
      slug: 'nang-vai-studio',
      categoryId: '11',
      description: 'Thời trang nữ với các thiết kế ứng dụng hằng ngày.',
      contactName: 'Lê Ngọc Hà',
      phone: '0987654321',
      pickupAddress: '18 Nguyễn Trãi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh',
      email: 'nangvai@navishop.test',
      submittedAt: new Date(2026, 0, 5, 11, 0, 0).toISOString(),
      reviewedAt: new Date(2026, 0, 8, 13, 0, 0).toISOString(),
      lastInformationChangeAt: new Date(2026, 0, 8, 13, 0, 0).toISOString(),
      status: 'approved',
      pendingInformationUpdate: {
        shopName: 'Nắng Vải Boutique',
        slug: 'nang-vai-studio',
        categoryId: '11',
        description: 'Thời trang nữ và phụ kiện cho phong cách thường ngày.',
        contactName: 'Lê Ngọc Hà',
        phone: '0987654321',
        pickupAddress: '18 Nguyễn Trãi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh',
        email: 'nangvai@navishop.test',
        submittedAt: new Date(2026, 9, 24, 8, 30, 0).toISOString(),
      },
    },
  },
]

const MOCK_REJECTED_SELLER_APPLICATIONS = [
  {
    userId: 'demo_rejected_seller_application_1',
    application: {
      shopName: 'Urban Gear VN',
      slug: 'urban-gear-vn',
      categoryId: '2',
      description: 'Phụ kiện công nghệ và đồ dùng cho người dùng hiện đại.',
      contactName: 'Nguyễn Hoàng Phúc',
      phone: '0903456781',
      pickupAddress: '128 Nguyễn Oanh, Phường 17, Quận Gò Vấp, Thành phố Hồ Chí Minh',
      email: 'urban.gear@navishop.test',
      identityNumber: '079345678101',
      taxCode: '0318901234',
      submittedAt: new Date(2026, 9, 20, 9, 20, 0).toISOString(),
      reviewedAt: new Date(2026, 9, 21, 14, 10, 0).toISOString(),
      status: 'rejected',
      reviewNote: 'Ảnh giấy tờ chưa rõ thông tin người đại diện. Vui lòng gửi lại ảnh đầy đủ, không bị lóa.',
    },
  },
  {
    userId: 'demo_rejected_seller_application_2',
    application: {
      shopName: 'Nhà Mây Decor',
      slug: 'nha-may-decor',
      categoryId: '13',
      description: 'Đồ trang trí thủ công cho nhà cửa và không gian sống.',
      contactName: 'Trần Thùy Dương',
      phone: '0912456782',
      pickupAddress: '35 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng',
      email: 'nhamay.decor@navishop.test',
      identityNumber: '048245678202',
      taxCode: '0402345678',
      submittedAt: new Date(2026, 9, 18, 10, 5, 0).toISOString(),
      reviewedAt: new Date(2026, 9, 19, 16, 25, 0).toISOString(),
      status: 'rejected',
      reviewNote: 'Địa chỉ lấy hàng chưa đầy đủ số nhà và phường/xã. Vui lòng bổ sung địa chỉ có thể xác minh.',
    },
  },
  {
    userId: 'demo_rejected_seller_application_3',
    application: {
      shopName: 'Bếp Nhà Linh',
      slug: 'bep-nha-linh',
      categoryId: '8',
      description: 'Dụng cụ nhà bếp tiện lợi cho gia đình.',
      contactName: 'Phạm Ngọc Linh',
      phone: '0934567823',
      pickupAddress: '76 Lê Hồng Phong, Phường Phước Hải, Thành phố Nha Trang, Khánh Hòa',
      email: 'bepnhalinh@navishop.test',
      identityNumber: '056345678303',
      taxCode: '4201987654',
      submittedAt: new Date(2026, 9, 16, 13, 35, 0).toISOString(),
      reviewedAt: new Date(2026, 9, 17, 11, 45, 0).toISOString(),
      status: 'rejected',
      reviewNote: 'Thông tin mã số thuế không khớp với tên người đại diện trong hồ sơ. Vui lòng kiểm tra và gửi lại thông tin chính xác.',
    },
  },
]

function withCreatedAt(details, previousApplication) {
  return {
    ...details,
    createdAt: previousApplication?.createdAt ?? new Date().toISOString(),
  }
}

function readCollection(key, label) {
  const value = JSON.parse(localStorage.getItem(key) ?? '{}')
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`Dữ liệu ${label} mock không hợp lệ.`)
  }
  return value
}

export function getSellerApplication(userId) {
  if (!userId) return null
  return readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')[userId] ?? null
}

export function isSellerShopOwner(application, userId) {
  return Boolean(application && userId)
}

export function getSellerShopSettings(userId) {
  const application = getSellerApplication(userId)
  if (!application) return null
  const settings = readCollection(SHOP_SETTINGS_KEY, 'thiết lập shop')[userId] ?? {}
  return {
    avatar: application.avatar ?? '',
    aiAssistantEnabled: settings.aiAssistantEnabled ?? true,
  }
}

export function getSellerMockChatSettings(shopSlug) {
  if (!shopSlug) return null
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const match = Object.entries(applications).find(([, application]) => (
    application.slug === shopSlug && application.status === 'approved'
  ))
  if (!match) return null
  const [userId] = match
  const settings = readCollection(SHOP_SETTINGS_KEY, 'thiết lập shop')[userId] ?? {}
  return typeof settings.aiAssistantEnabled === 'boolean'
    ? { aiAssistantEnabled: settings.aiAssistantEnabled }
    : null
}

export function updateSellerShopSettings(userId, updates) {
  if (!userId || !updates || typeof updates !== 'object') {
    throw new Error('Thiếu thông tin để cập nhật thiết lập shop.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'approved') {
    throw new Error('Chỉ shop đang hoạt động mới có thể cập nhật thiết lập.')
  }

  const settings = readCollection(SHOP_SETTINGS_KEY, 'thiết lập shop')
  const currentSettings = settings[userId] ?? {}
  const nextSettings = { ...currentSettings }

  if ('aiAssistantEnabled' in updates) {
    if (typeof updates.aiAssistantEnabled !== 'boolean') {
      throw new Error('Trạng thái trợ lý AI không hợp lệ.')
    }
    nextSettings.aiAssistantEnabled = updates.aiAssistantEnabled
  }
  if ('avatar' in updates) {
    if (typeof updates.avatar !== 'string') {
      throw new Error('Ảnh đại diện shop không hợp lệ.')
    }
    applications[userId] = { ...application, avatar: updates.avatar }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications))
  }

  localStorage.setItem(SHOP_SETTINGS_KEY, JSON.stringify({
    ...settings,
    [userId]: nextSettings,
  }))
  return {
    avatar: applications[userId]?.avatar ?? '',
    aiAssistantEnabled: nextSettings.aiAssistantEnabled ?? true,
  }
}

export function getSellerApplications() {
  return Object.entries(readCollection(APPLICATIONS_KEY, 'hồ sơ người bán'))
    .map(([userId, application]) => ({ ...application, userId }))
    .sort((left, right) => (
      new Date(right.pendingInformationUpdate?.submittedAt ?? right.submittedAt)
      - new Date(left.pendingInformationUpdate?.submittedAt ?? left.submittedAt)
    ))
}

export function updateSellerShopStatus(userId, status, reason, actorId) {
  if (!userId || !['approved', 'suspended'].includes(status) || !reason?.trim()) {
    throw new Error('Chọn trạng thái shop hợp lệ và nhập lý do thao tác.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || !['approved', 'suspended'].includes(application.status)) {
    throw new Error('Chỉ có thể tạm khóa hoặc mở lại shop đã được duyệt.')
  }
  if (application.status === status) {
    throw new Error(status === 'suspended' ? 'Shop đã đang bị tạm khóa.' : 'Shop đang hoạt động.')
  }

  const changedAt = new Date().toISOString()
  const historyEntry = {
    id: `${userId}-${changedAt}`,
    actorId: actorId ?? '',
    action: status === 'suspended' ? 'suspend' : 'reactivate',
    status,
    reason: reason.trim(),
    changedAt,
  }
  const updatedApplication = {
    ...application,
    status,
    statusReason: reason.trim(),
    statusChangedAt: changedAt,
    shopStatusHistory: [...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory : []), historyEntry],
  }

  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  window.dispatchEvent(new CustomEvent('navishop:seller-application-updated', { detail: { userId } }))
  return updatedApplication
}

export function getSellerInformationChangeAvailableAt(application) {
  if (!application?.lastInformationChangeAt) return null
  const availableAt = new Date(application.lastInformationChangeAt)
  if (Number.isNaN(availableAt.getTime())) {
    throw new Error('Ngày cập nhật hồ sơ cửa hàng không hợp lệ.')
  }
  const originalDay = availableAt.getDate()
  availableAt.setDate(1)
  availableAt.setMonth(availableAt.getMonth() + INFORMATION_CHANGE_INTERVAL_MONTHS)
  const lastDayOfTargetMonth = new Date(
    availableAt.getFullYear(),
    availableAt.getMonth() + 1,
    0,
  ).getDate()
  availableAt.setDate(Math.min(originalDay, lastDayOfTargetMonth))
  return availableAt
}

export function ensureMockSellerApplication() {
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  let hasChanges = false

  for (const { userId, ...application } of MOCK_SELLER_APPLICATIONS) {
    if (applications[userId]) continue
    applications[userId] = {
      ...application,
      status: 'pending',
      step: 4,
      createdAt: application.submittedAt,
      reviewedAt: null,
      reviewNote: '',
    }
    hasChanges = true
  }

  for (const { userId, application } of MOCK_SELLER_INFORMATION_UPDATE_REQUESTS) {
    if (applications[userId]) continue
    applications[userId] = {
      ...application,
      step: 4,
      createdAt: application.submittedAt,
      reviewNote: '',
      reviewHistory: [{
        type: 'review',
        reviewType: 'registration',
        status: 'approved',
        note: '',
        reviewedAt: application.reviewedAt,
      }],
    }
    hasChanges = true
  }

  for (const { userId, application } of MOCK_REJECTED_SELLER_APPLICATIONS) {
    if (applications[userId]) continue
    applications[userId] = {
      ...application,
      step: 4,
      createdAt: application.submittedAt,
      reviewHistory: [{
        type: 'review',
        reviewType: 'registration',
        status: 'rejected',
        note: application.reviewNote,
        reviewedAt: application.reviewedAt,
      }],
    }
    hasChanges = true
  }

  if (hasChanges) localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications))
}

function getSellerProfileSnapshot(application) {
  return Object.fromEntries(SELLER_PROFILE_FIELDS.map((field) => [field, application[field] ?? '']))
}

export function saveSellerDraft(userId, details, step) {
  if (!userId || !Number.isInteger(step) || step < 1 || step > 4) {
    throw new Error('Không thể lưu nháp hồ sơ người bán không hợp lệ.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const previousApplication = applications[userId]
  if (previousApplication?.status === 'pending' || previousApplication?.status === 'approved') {
    throw new Error('Hồ sơ hiện tại không thể chỉnh sửa.')
  }
  const application = {
    ...withCreatedAt(details, previousApplication),
    status: previousApplication?.status === 'rejected' ? 'rejected' : 'draft',
    step,
    submittedAt: previousApplication?.submittedAt ?? null,
    reviewedAt: previousApplication?.reviewedAt ?? null,
    reviewNote: previousApplication?.reviewNote ?? '',
    submissionHistory: previousApplication?.submissionHistory ?? [],
    reviewHistory: previousApplication?.reviewHistory ?? [],
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({ ...applications, [userId]: application }))
  return application
}

export function saveSellerApplication(userId, details) {
  if (!userId || !details?.shopName?.trim()) {
    throw new Error('Vui lòng đăng nhập và nhập tên cửa hàng.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const previousApplication = applications[userId]
  if (previousApplication?.status === 'pending' || previousApplication?.status === 'approved') {
    throw new Error('Hồ sơ hiện tại không thể gửi hoặc chỉnh sửa.')
  }
  const submittedAt = new Date().toISOString()
  const previousSubmission = previousApplication?.submittedAt
    ? [{
        type: 'submission',
        submittedAt: previousApplication.submittedAt,
        status: previousApplication.status,
        reviewNote: previousApplication.reviewNote ?? '',
      }]
    : []
  const submissionHistory = [
    ...(Array.isArray(previousApplication?.submissionHistory) && previousApplication.submissionHistory.length
      ? previousApplication.submissionHistory
      : previousSubmission),
    { type: 'submission', submittedAt, status: 'pending' },
  ]
  const application = {
    ...withCreatedAt(details, previousApplication),
    avatar: previousApplication?.avatar ?? '',
    shopName: details.shopName.trim(),
    status: 'pending',
    step: 4,
    submittedAt,
    reviewedAt: null,
    reviewNote: '',
    submissionHistory,
    reviewHistory: Array.isArray(previousApplication?.reviewHistory) ? previousApplication.reviewHistory : [],
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({ ...applications, [userId]: application }))
  return application
}

export function submitSellerInformationUpdate(userId, details) {
  if (!userId || !details?.shopName?.trim()) {
    throw new Error('Vui lòng đăng nhập và nhập tên cửa hàng.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'approved') {
    throw new Error('Chỉ shop đang hoạt động mới có thể gửi yêu cầu cập nhật.')
  }
  if (application.pendingInformationUpdate) {
    throw new Error('Shop đang có yêu cầu cập nhật thông tin chờ duyệt.')
  }
  const availableAt = getSellerInformationChangeAvailableAt(application)
  if (availableAt && Date.now() < availableAt.getTime()) {
    throw new Error(`Bạn có thể gửi yêu cầu đổi thông tin sau ngày ${availableAt.toLocaleDateString('vi-VN')}.`)
  }
  if (details.shopName.trim().length < 2 || details.shopName.trim().length > 50) {
    throw new Error('Tên shop cần từ 2 đến 50 ký tự.')
  }
  if (details.slug !== application.slug) throw new Error('Đường dẫn shop không thể thay đổi.')
  if (details.shopName.trim() !== application.shopName
    && !isSellerFieldAvailable(userId, 'shopName', details.shopName.trim())) {
    throw new Error('Tên shop đã được sử dụng.')
  }

  const pendingInformationUpdate = {
    ...details,
    shopName: details.shopName.trim(),
    slug: application.slug,
    submittedAt: new Date().toISOString(),
  }
  const updatedApplication = { ...application, pendingInformationUpdate }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  return updatedApplication
}

export function reviewSellerApplication(userId, status, reviewNote = '', options = {}) {
  if (!userId || !['approved', 'rejected'].includes(status)) {
    throw new Error('Thao tác duyệt hồ sơ không hợp lệ.')
  }
  if (status === 'rejected' && !reviewNote.trim()) {
    throw new Error('Vui lòng nhập lý do từ chối hồ sơ.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application) {
    throw new Error('Không tìm thấy hồ sơ đang chờ duyệt.')
  }
  const hasPendingInformationUpdate = Boolean(application.pendingInformationUpdate)
  const isInformationUpdate = options.reviewType === 'information-update'
  if (isInformationUpdate !== hasPendingInformationUpdate
    || (!isInformationUpdate && application.status !== 'pending')) {
    throw new Error('Không tìm thấy hồ sơ đang chờ duyệt.')
  }
  const currentRequestSubmittedAt = isInformationUpdate
    ? application.pendingInformationUpdate.submittedAt
    : application.submittedAt
  if (options.submittedAt && currentRequestSubmittedAt !== options.submittedAt) {
    throw new Error('Hồ sơ đã được cập nhật hoặc xử lý bởi tài khoản khác. Danh sách đã được làm mới.')
  }

  const reviewedAt = new Date().toISOString()
  const reviewHistory = [
    ...(Array.isArray(application.reviewHistory) ? application.reviewHistory : []),
    {
      type: 'review',
      reviewType: isInformationUpdate ? 'information-update' : 'registration',
      status,
      note: reviewNote.trim(),
      submittedAt: currentRequestSubmittedAt,
      reviewedAt,
      ...(isInformationUpdate ? {
        previousInformation: getSellerProfileSnapshot(application),
        requestedInformation: getSellerProfileSnapshot(application.pendingInformationUpdate),
      } : {}),
    },
  ]

  if (isInformationUpdate) {
    const updatedApplication = status === 'approved'
      ? {
          ...application,
          ...application.pendingInformationUpdate,
          avatar: application.avatar,
          submittedAt: application.submittedAt,
          status: 'approved',
          lastInformationChangeAt: reviewedAt,
          informationUpdateReviewNote: reviewNote.trim(),
          informationUpdateReviewedAt: reviewedAt,
          pendingInformationUpdate: null,
          reviewHistory,
        }
      : {
          ...application,
          informationUpdateReviewNote: reviewNote.trim(),
          informationUpdateReviewedAt: reviewedAt,
          pendingInformationUpdate: null,
          reviewHistory,
        }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
      ...applications,
      [userId]: updatedApplication,
    }))
    return updatedApplication
  }

  const updatedApplication = {
    ...application,
    status,
    ...(status === 'rejected' ? { step: 1 } : {}),
    reviewNote: reviewNote.trim(),
    reviewedAt,
    reviewHistory,
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  return updatedApplication
}

export function getSellerProducts(userId) {
  if (!userId) return []
  return readCollection(PRODUCTS_KEY, 'sản phẩm người bán')[userId] ?? []
}

export function createSellerProduct(userId, product) {
  if (!userId) throw new Error('Vui lòng đăng nhập để thêm sản phẩm.')
  if (!product?.name?.trim() || !product?.category?.trim() || !product?.description?.trim() || !product?.image) {
    throw new Error('Vui lòng nhập đầy đủ thông tin và chọn ít nhất một ảnh sản phẩm.')
  }
  if (!Number.isSafeInteger(product.price) || product.price <= 0) {
    throw new Error('Giá sản phẩm phải là số nguyên VND lớn hơn 0.')
  }
  if (!Number.isSafeInteger(product.stock) || product.stock < 0) {
    throw new Error('Tồn kho phải là số nguyên không âm.')
  }
  const products = readCollection(PRODUCTS_KEY, 'sản phẩm người bán')
  const nextProduct = {
    ...product,
    id: globalThis.crypto?.randomUUID?.() ?? `seller-product-${Date.now()}`,
    name: product.name.trim(),
    category: product.category.trim(),
    description: product.description.trim(),
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify({
    ...products,
    [userId]: [nextProduct, ...(products[userId] ?? [])],
  }))
  return nextProduct
}

export function updateSellerProduct(userId, productId, updates) {
  if (!userId || !productId) throw new Error('Thiếu thông tin sản phẩm cần cập nhật.')
  if (!updates?.name?.trim() || !updates?.category?.trim() || !updates?.description?.trim() || !updates?.image) {
    throw new Error('Vui lòng nhập đầy đủ thông tin và chọn ít nhất một ảnh sản phẩm.')
  }
  if (!Number.isSafeInteger(updates.price) || updates.price <= 0) {
    throw new Error('Giá sản phẩm phải là số nguyên VND lớn hơn 0.')
  }
  if (!Number.isSafeInteger(updates.stock) || updates.stock < 0) {
    throw new Error('Tồn kho phải là số nguyên không âm.')
  }
  const products = readCollection(PRODUCTS_KEY, 'sản phẩm người bán')
  const sellerProducts = products[userId] ?? []
  const productIndex = sellerProducts.findIndex((product) => product.id === productId)
  if (productIndex < 0) throw new Error('Không tìm thấy sản phẩm cần cập nhật.')
  const currentProduct = sellerProducts[productIndex]
  if (['auction_pending', 'auction_locked'].includes(currentProduct.status)) {
    throw new Error('Sản phẩm đang trong quy trình đấu giá và không thể chỉnh sửa.')
  }
  if (updates.status && updates.status !== currentProduct.status) {
    throw new Error('Không thể thay đổi trạng thái bán trong trang quản lý sản phẩm.')
  }

  const updatedProduct = {
    ...currentProduct,
    ...updates,
    name: updates.name.trim(),
    category: updates.category.trim(),
    description: updates.description.trim(),
    updatedAt: new Date().toISOString(),
  }
  const nextProducts = [...sellerProducts]
  nextProducts[productIndex] = updatedProduct
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify({
    ...products,
    [userId]: nextProducts,
  }))
  return updatedProduct
}

export function setSellerProductVisibility(userId, productId, isHidden) {
  if (!userId || !productId || typeof isHidden !== 'boolean') {
    throw new Error('Thông tin thao tác ẩn sản phẩm không hợp lệ.')
  }
  const products = readCollection(PRODUCTS_KEY, 'sản phẩm người bán')
  const sellerProducts = products[userId] ?? []
  const productIndex = sellerProducts.findIndex((product) => product.id === productId)
  if (productIndex < 0) throw new Error('Không tìm thấy sản phẩm cần cập nhật.')
  const currentProduct = sellerProducts[productIndex]
  if (['auction_pending', 'auction_locked'].includes(currentProduct.status)) {
    throw new Error('Sản phẩm đang trong quy trình đấu giá và không thể ẩn hoặc hiện.')
  }
  if (!['active', 'hidden'].includes(currentProduct.status)) {
    throw new Error('Chỉ sản phẩm đã đăng bán mới có thể ẩn hoặc hiện.')
  }

  const updatedProduct = {
    ...currentProduct,
    status: isHidden ? 'hidden' : 'active',
    updatedAt: new Date().toISOString(),
  }
  const nextProducts = [...sellerProducts]
  nextProducts[productIndex] = updatedProduct
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify({
    ...products,
    [userId]: nextProducts,
  }))
  return updatedProduct
}

export function deleteSellerProduct(userId, productId) {
  if (!userId || !productId) throw new Error('Thiếu thông tin sản phẩm cần xóa.')
  const products = readCollection(PRODUCTS_KEY, 'sản phẩm người bán')
  const sellerProducts = products[userId] ?? []
  const product = sellerProducts.find((item) => item.id === productId)
  if (!product) throw new Error('Không tìm thấy sản phẩm cần xóa.')
  if (['auction_pending', 'auction_locked'].includes(product.status)) {
    throw new Error('Sản phẩm đang trong quy trình đấu giá và không thể xóa.')
  }
  const nextProducts = sellerProducts.filter((item) => item.id !== productId)
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify({
    ...products,
    [userId]: nextProducts,
  }))
  return product
}

export function isSellerFieldAvailable(userId, field, value) {
  const normalizedValue = value?.trim().toLocaleLowerCase('vi')
  if (!normalizedValue) return false
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const shopField = field === 'shopName' ? 'name' : field
  const hasMockShopMatch = MOCK_SHOPS.some((shop) => (
    shop[shopField]?.trim().toLocaleLowerCase('vi') === normalizedValue
  ))
  if (hasMockShopMatch) return false
  const hasApplicationMatch = Object.entries(applications).some(([id, application]) => (
    id !== userId && application[field]?.trim().toLocaleLowerCase('vi') === normalizedValue
  ))
  return !hasApplicationMatch
}

export function createShopSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
