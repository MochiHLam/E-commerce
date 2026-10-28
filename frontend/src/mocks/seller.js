import { MOCK_SHOPS } from '@/mocks/mockShops'

const APPLICATIONS_KEY = 'navishop.mockSeller.applications'
const PRODUCTS_KEY = 'navishop.mockSeller.products'
const SHOP_SETTINGS_KEY = 'navishop.mockSeller.settings'
const SHOP_AUDIT_KEY = 'navishop.mockSeller.shopAudit'
const MOCK_APPLICATION_USER_ID = 'demo_seller_application'
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
  if (key === APPLICATIONS_KEY) {
    let hasLegacyInformation = false
    for (const [userId, application] of Object.entries(value)) {
      if (!application || typeof application !== 'object') continue
      let updatedApplication = { ...application }
      const pendingInformationUpdate = updatedApplication.pendingInformationUpdate
      delete updatedApplication.pendingInformationUpdate
      delete updatedApplication.lastInformationChangeAt
      delete updatedApplication.informationUpdateReviewNote
      delete updatedApplication.informationUpdateReviewedAt
      if (pendingInformationUpdate) {
        const submittedAt = updatedApplication.submittedAt
        const status = updatedApplication.status
        const createdAt = updatedApplication.createdAt
        updatedApplication = {
          ...updatedApplication,
          ...pendingInformationUpdate,
          submittedAt,
          status,
          createdAt,
        }
      }
      if (Array.isArray(updatedApplication.reviewHistory)) {
        updatedApplication.reviewHistory = updatedApplication.reviewHistory.filter(
          (entry) => entry?.reviewType !== 'information-update',
        )
      }
      if (JSON.stringify(application) !== JSON.stringify(updatedApplication)) {
        value[userId] = updatedApplication
        hasLegacyInformation = true
      }
    }
    if (hasLegacyInformation) localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(value))
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

function addShopAudit(application, action, reason, actorId, statusBefore, statusAfter, occurredAt) {
  const entries = getSellerShopAudit()
  const auditEntry = {
    id: `${application.userId}-${occurredAt}-${action}`,
    actorId: actorId || 'seller',
    action,
    shopId: application.slug,
    shopName: application.shopName,
    reason,
    statusBefore,
    statusAfter,
    occurredAt,
  }
  localStorage.setItem(SHOP_AUDIT_KEY, JSON.stringify([auditEntry, ...entries]))
}

export function getSellerShopAudit() {
  const entries = JSON.parse(localStorage.getItem(SHOP_AUDIT_KEY) ?? '[]')
  if (!Array.isArray(entries) || entries.some((entry) => !entry?.id || !entry?.shopId || !entry?.action)) {
    throw new Error('Dữ liệu nhật ký shop mock không hợp lệ.')
  }
  return entries
}

function saveShopApplication(userId, updatedApplication) {
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  window.dispatchEvent(new CustomEvent('navishop:seller-application-updated', { detail: { userId } }))
  return updatedApplication
}

export function getSellerApplications() {
  return Object.entries(readCollection(APPLICATIONS_KEY, 'hồ sơ người bán'))
    .map(([userId, application]) => ({ ...application, userId }))
    .sort((left, right) => (
      new Date(right.submittedAt) - new Date(left.submittedAt)
    ))
}

export function updateSellerShopStatus(userId, status, reason, actorId) {
  if (!userId || !['approved', 'suspended', 'banned'].includes(status) || !reason?.trim()) {
    throw new Error('Chọn trạng thái shop hợp lệ và nhập lý do thao tác.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || !['approved', 'suspended'].includes(application.status)) {
    throw new Error('Chỉ có thể thay đổi trạng thái shop đang hoạt động hoặc tạm khóa.')
  }
  if (application.status === status) {
    throw new Error(`Shop đã ở trạng thái ${status}.`)
  }

  const changedAt = new Date().toISOString()
  const historyEntry = {
    id: `${userId}-${changedAt}`,
    actorId: actorId ?? '',
    action: status === 'suspended' ? 'suspend' : status === 'banned' ? 'ban' : 'reactivate',
    status,
    reason: reason.trim(),
    changedAt,
  }
  const updatedApplication = {
    ...application,
    status,
    statusReason: reason.trim(),
    statusChangedAt: changedAt,
    statusSource: actorId || 'admin',
    shopStatusHistory: [...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory : []), historyEntry],
  }

  addShopAudit({ ...application, userId }, historyEntry.action, reason.trim(), actorId, application.status, status, changedAt)
  saveShopApplication(userId, updatedApplication)
  return updatedApplication
}

export function requestSellerShopDeletion(userId, orders) {
  if (!userId || !Array.isArray(orders)) {
    throw new Error('Thiếu thông tin để gửi yêu cầu xóa Shop.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'approved') {
    throw new Error('Chỉ Shop đang hoạt động mới có thể gửi yêu cầu xóa.')
  }
  if (application.deletionRequest?.status === 'pending') {
    throw new Error('Shop đã có yêu cầu xóa đang chờ Admin phê duyệt.')
  }
  const shopOrderCount = getSellerShopOrderCount(userId, orders)
  if (shopOrderCount) {
    throw new Error(`Không thể yêu cầu xóa Shop vì đang có ${shopOrderCount} đơn hàng. Shop cần không có đơn hàng ở mọi trạng thái.`)
  }
  const submittedAt = new Date().toISOString()
  const deletionRequest = {
    status: 'pending',
    requestedBy: userId,
    submittedAt,
    reviewedBy: '',
    reviewedAt: '',
    rejectionReason: '',
  }
  const updatedApplication = {
    ...application,
    status: 'pending_deletion',
    statusReason: 'Chủ Shop đã gửi yêu cầu xóa, đang chờ Admin phê duyệt.',
    statusChangedAt: submittedAt,
    statusSource: 'seller',
    deletionRequest,
    shopStatusHistory: [
      ...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory : []),
      { id: `${userId}-${submittedAt}`, actorId: userId, action: 'request-deletion', status: 'pending_deletion', reason: '', changedAt: submittedAt },
    ],
  }
  addShopAudit({ ...application, userId }, 'request-deletion', 'Chủ Shop gửi yêu cầu xóa.', userId, application.status, 'pending_deletion', submittedAt)
  return saveShopApplication(userId, updatedApplication)
}

export function getSellerShopOrderCount(userId, orders) {
  const application = getSellerApplication(userId)
  if (!application || !Array.isArray(orders)) {
    throw new Error('Thiếu thông tin để kiểm tra điều kiện xóa Shop.')
  }
  return orders.filter((order) => (
    order.shopSlug === application.slug
    || order.storeName === application.shopName
    || order.shop === application.shopName
  )).length
}

export function reviewSellerShopDeletion(userId, decision, reason, actorId, restoreStatus = 'approved') {
  if (!userId || !['approved', 'rejected'].includes(decision) || !reason?.trim()) {
    throw new Error('Chọn quyết định hợp lệ và nhập lý do xử lý yêu cầu xóa.')
  }
  if (decision === 'rejected' && !['approved', 'suspended'].includes(restoreStatus)) {
    throw new Error('Chọn trạng thái Shop sau khi từ chối yêu cầu.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'pending_deletion' || application.deletionRequest?.status !== 'pending') {
    throw new Error('Yêu cầu xóa đã được xử lý hoặc không còn hợp lệ.')
  }
  const reviewedAt = new Date().toISOString()
  const nextStatus = decision === 'approved' ? 'deleted' : restoreStatus
  const deletionRequest = {
    ...application.deletionRequest,
    status: decision,
    reviewedBy: actorId || 'Admin',
    reviewedAt,
    rejectionReason: decision === 'rejected' ? reason.trim() : '',
    decisionReason: reason.trim(),
  }
  const updatedApplication = {
    ...application,
    status: nextStatus,
    statusReason: decision === 'approved' || nextStatus === 'suspended' ? reason.trim() : '',
    statusChangedAt: reviewedAt,
    statusSource: actorId || 'admin',
    deletionRequest,
    shopStatusHistory: [
      ...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory : []),
      { id: `${userId}-${reviewedAt}`, actorId: actorId || '', action: decision === 'approved' ? 'approve-deletion' : 'reject-deletion', status: nextStatus, reason: reason.trim(), changedAt: reviewedAt },
    ],
  }
  addShopAudit({ ...application, userId }, `${decision}-deletion`, reason.trim(), actorId, application.status, nextStatus, reviewedAt)
  return saveShopApplication(userId, updatedApplication)
}

export function submitSellerShopAppeal(userId, reason, explanation) {
  if (!userId || !reason?.trim() || !explanation?.trim()) {
    throw new Error('Vui lòng nhập lý do khiếu nại và nội dung giải trình.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'suspended') {
    throw new Error('Chỉ Shop đang bị tạm khóa mới có thể gửi khiếu nại.')
  }
  if (application.appeal?.status === 'pending') {
    throw new Error('Bạn đã có khiếu nại đang chờ Admin xem xét.')
  }
  const submittedAt = new Date().toISOString()
  const appeal = {
    status: 'pending',
    reason: reason.trim(),
    explanation: explanation.trim(),
    submittedAt,
    reviewedBy: '',
    reviewedAt: '',
    response: '',
  }
  const updatedApplication = { ...application, appeal }
  addShopAudit({ ...application, userId }, 'submit-appeal', reason.trim(), userId, application.status, application.status, submittedAt)
  return saveShopApplication(userId, updatedApplication)
}

export function reviewSellerShopAppeal(userId, decision, reason, actorId) {
  if (!userId || !['approved', 'rejected'].includes(decision) || !reason?.trim()) {
    throw new Error('Chọn kết quả khiếu nại và nhập nội dung phản hồi.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  if (!application || application.status !== 'suspended' || application.appeal?.status !== 'pending') {
    throw new Error('Không tìm thấy khiếu nại đang chờ xử lý.')
  }
  const reviewedAt = new Date().toISOString()
  const nextStatus = decision === 'approved' ? 'approved' : 'suspended'
  const appeal = {
    ...application.appeal,
    status: decision,
    reviewedBy: actorId || 'Admin',
    reviewedAt,
    response: reason.trim(),
  }
  const updatedApplication = {
    ...application,
    status: nextStatus,
    statusReason: nextStatus === 'suspended' ? application.statusReason : '',
    statusChangedAt: decision === 'approved' ? reviewedAt : application.statusChangedAt,
    statusSource: actorId || 'admin',
    appeal,
    shopStatusHistory: decision === 'approved'
      ? [...(Array.isArray(application.shopStatusHistory) ? application.shopStatusHistory : []), {
          id: `${userId}-${reviewedAt}`,
          actorId: actorId || '',
          action: 'appeal-approved',
          status: 'approved',
          reason: reason.trim(),
          changedAt: reviewedAt,
        }]
      : application.shopStatusHistory,
  }
  addShopAudit({ ...application, userId }, `appeal-${decision}`, reason.trim(), actorId, application.status, nextStatus, reviewedAt)
  return saveShopApplication(userId, updatedApplication)
}

export function getShopApplicationBySlug(slug) {
  if (!slug) return null
  return getSellerApplications().find((application) => application.slug === slug) ?? null
}

export function isSellerShopActive(slug) {
  const application = getShopApplicationBySlug(slug)
  return !application || application.status === 'approved'
}

function assertSellerCanManage(userId) {
  const application = getSellerApplication(userId)
  if (!application || application.status !== 'approved') {
    throw new Error('Shop không ở trạng thái hoạt động; thao tác bán hàng và chỉnh sửa đã bị khóa.')
  }
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

export function saveSellerDraft(userId, details, step) {
  if (!userId || !Number.isInteger(step) || step < 1 || step > 4) {
    throw new Error('Không thể lưu nháp hồ sơ người bán không hợp lệ.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const previousApplication = applications[userId]
  if (['pending', 'approved', 'suspended', 'banned', 'pending_deletion', 'deleted'].includes(previousApplication?.status)) {
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
  if (['pending', 'approved', 'suspended', 'banned', 'pending_deletion', 'deleted'].includes(previousApplication?.status)) {
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

export function updateSellerInformation(userId, details) {
  if (!userId || !details?.shopName?.trim()) {
    throw new Error('Vui lòng đăng nhập và nhập tên cửa hàng.')
  }
  const applications = readCollection(APPLICATIONS_KEY, 'hồ sơ người bán')
  const application = applications[userId]
  assertSellerCanManage(userId)
  if (!application || application.status !== 'approved') {
    throw new Error('Chỉ shop đang hoạt động mới có thể cập nhật thông tin.')
  }
  if (details.shopName.trim().length < 2 || details.shopName.trim().length > 50) {
    throw new Error('Tên shop cần từ 2 đến 50 ký tự.')
  }
  if (details.slug !== application.slug) throw new Error('Đường dẫn shop không thể thay đổi.')
  if (details.shopName.trim() !== application.shopName
    && !isSellerFieldAvailable(userId, 'shopName', details.shopName.trim())) {
    throw new Error('Tên shop đã được sử dụng.')
  }

  const updatedApplication = {
    ...application,
    categoryId: details.categoryId,
    description: details.description,
    contactName: details.contactName,
    phone: details.phone,
    pickupAddress: details.pickupAddress,
    identityNumber: details.identityNumber,
    taxCode: details.taxCode,
    shopName: details.shopName.trim(),
    slug: application.slug,
    email: application.email || details.email || '',
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({
    ...applications,
    [userId]: updatedApplication,
  }))
  window.dispatchEvent(new CustomEvent('navishop:seller-application-updated', { detail: { userId } }))
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
  if (application.status !== 'pending') {
    throw new Error('Không tìm thấy hồ sơ đang chờ duyệt.')
  }
  if (options.submittedAt && application.submittedAt !== options.submittedAt) {
    throw new Error('Hồ sơ đã được cập nhật hoặc xử lý bởi tài khoản khác. Danh sách đã được làm mới.')
  }

  const reviewedAt = new Date().toISOString()
  const reviewHistory = [
    ...(Array.isArray(application.reviewHistory) ? application.reviewHistory : []),
    {
      type: 'review',
      reviewType: 'registration',
      status,
      note: reviewNote.trim(),
      submittedAt: application.submittedAt,
      reviewedAt,
    },
  ]

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
  assertSellerCanManage(userId)
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
  assertSellerCanManage(userId)
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
  assertSellerCanManage(userId)
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
  assertSellerCanManage(userId)
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
