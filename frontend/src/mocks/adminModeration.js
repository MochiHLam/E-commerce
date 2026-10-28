const CASES_KEY = 'navishop.mockAdminModeration.cases'
const AUDIT_KEY = 'navishop.mockAdminModeration.audit'
const REPORTER_NOTIFICATIONS_KEY = 'navishop.mockReporterNotifications'

const DEMO_CASES = [
  {
    id: 'case-report-product-001',
    status: 'open',
    target: {
      type: 'product',
      id: 'prd_6',
      label: 'Giày thể thao mẫu 6',
      owner: 'Thế Giới Giày',
      shopId: 'the-gioi-giay',
      image: '',
      isHidden: false,
    },
    reports: [
      {
        id: 'report-product-001-a',
        reporterId: 'buyer-demo-01',
        reporterName: 'Minh Anh',
        reason: 'Thông tin hoặc hình ảnh gây hiểu nhầm',
        details: 'Hình ảnh và thông tin chất liệu sản phẩm có điểm chưa khớp, đề nghị kiểm tra lại.',
        submittedAt: Date.now() - 3 * 60 * 60_000,
        evidenceImages: [
          {
            src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=480&q=80',
            alt: 'Ảnh bằng chứng sản phẩm đồng hồ',
          },
        ],
      },
      {
        id: 'report-product-001-b',
        reporterId: 'buyer-demo-01',
        reporterName: 'Minh Anh',
        reason: 'Nghi ngờ hàng giả, hàng nhái',
        details: 'Thông tin nguồn gốc chưa rõ ràng.',
        submittedAt: Date.now() - 2 * 60 * 60_000,
        evidenceImages: [],
      },
      {
        id: 'report-product-001-c',
        reporterId: 'buyer-demo-02',
        reporterName: 'Quốc Bảo',
        reason: 'Thông tin hoặc hình ảnh gây hiểu nhầm',
        details: 'Một nội dung khác trong cùng case cần được kiểm tra.',
        submittedAt: Date.now() - 60 * 60_000,
        evidenceImages: [],
      },
    ],
    openedAt: Date.now() - 3 * 60 * 60_000,
    history: [],
  },
  {
    id: 'case-report-review-002',
    status: 'open',
    target: {
      type: 'review',
      id: 'prd_4-review-2',
      label: 'Đánh giá sản phẩm Đồng hồ cơ mẫu 4',
      owner: 'Phụ Kiện Xinh',
      shopId: 'phu-kien-xinh',
      productId: 'prd_4',
      image: '',
      isHidden: true,
    },
    reports: [
      {
        id: 'report-review-002-a',
        reporterId: 'buyer-demo-03',
        reporterName: 'Thảo Vy',
        reason: 'Ngôn từ xúc phạm hoặc không phù hợp',
        details: 'Nội dung đánh giá có lời lẽ không phù hợp với cộng đồng.',
        submittedAt: Date.now() - 18 * 60 * 60_000,
        evidenceImages: [],
      },
    ],
    openedAt: Date.now() - 18 * 60 * 60_000,
    history: [],
  },
  {
    id: 'case-report-shop-003',
    status: 'completed',
    target: {
      type: 'shop',
      id: 'shop-tech',
      label: 'Công Nghệ Mới',
      owner: 'Công Nghệ Mới',
      image: '',
    },
    reports: [
      {
        id: 'report-shop-003-a',
        reporterId: 'buyer-demo-04',
        reporterName: 'Hoàng Nam',
        reason: 'Thông tin cửa hàng không chính xác',
        details: 'Thông tin trong gian hàng cần được rà soát.',
        submittedAt: Date.now() - 6 * 24 * 60 * 60_000,
        evidenceImages: [],
      },
    ],
    openedAt: Date.now() - 6 * 24 * 60 * 60_000,
    resolution: {
      status: 'completed',
      reason: 'Đã nhắc cửa hàng rà soát thông tin hồ sơ.',
      decidedBy: 'Admin',
      decidedAt: Date.now() - 5 * 24 * 60 * 60_000,
    },
    history: [],
  },
]

function readCollection(key, fallback, validate) {
  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) return fallback
  const value = JSON.parse(rawValue)
  if (!Array.isArray(value) || value.some((item) => !validate(item))) {
    throw new Error('Dữ liệu mô phỏng báo cáo & kiểm duyệt không hợp lệ.')
  }
  return value
}

function validCase(item) {
  return Boolean(
    item?.id
    && ['shop', 'product', 'review'].includes(item.target?.type)
    && item.target?.label
    && Array.isArray(item.reports)
    && item.reports.every((report) => report?.id),
  )
}

export function getAdminReportCases() {
  return readCollection(CASES_KEY, import.meta.env.DEV ? DEMO_CASES : [], validCase).map((reportCase) => ({
    ...reportCase,
    status: reportCase.status === 'escalated' ? 'open' : reportCase.status === 'resolved' ? 'completed' : reportCase.status,
  }))
}

export function getAdminModerationAudit() {
  return readCollection(AUDIT_KEY, [], (item) => Boolean(item?.id && item?.caseId && item?.action))
}

export async function compressReportEvidence(files) {
  return Promise.all(files.map(async (file, index) => {
    const bitmap = await createImageBitmap(file)
    try {
      const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Không thể xử lý ảnh bằng chứng.')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      return {
        src: canvas.toDataURL('image/jpeg', 0.72),
        alt: `Ảnh bằng chứng ${index + 1}`,
      }
    } finally {
      bitmap.close()
    }
  }))
}

export function createAdminReport({
  target,
  reporterId,
  reporterName,
  reason,
  details = '',
  evidenceImages = [],
}) {
  if (!target?.type || !target.id || !target.label || !reporterId || !reason?.trim()) {
    throw new Error('Thiếu thông tin bắt buộc để gửi báo cáo.')
  }
  if (!['shop', 'product', 'review'].includes(target.type)) {
    throw new Error('Loại đối tượng báo cáo không hợp lệ.')
  }
  const cases = getAdminReportCases()
  const existingCase = cases.find((reportCase) => (
    reportCase.status === 'open'
    && reportCase.target.type === target.type
    && reportCase.target.id === target.id
  ))
  const now = Date.now()
  const reportId = `report-${now}-${Math.random().toString(36).slice(2, 8)}`
  const report = {
    id: reportId,
    reporterId,
    reporterName: reporterName || 'Người dùng',
    reason: reason.trim(),
    details: details.trim(),
    submittedAt: now,
    evidenceImages,
  }
  const updatedCases = existingCase
    ? cases.map((reportCase) => reportCase.id === existingCase.id
      ? { ...reportCase, reports: [...reportCase.reports, report] }
      : reportCase)
    : [{
        id: `case-${target.type}-${now}`,
        status: 'open',
        target: { ...target },
        reports: [report],
        openedAt: now,
        history: [],
      }, ...cases]
  window.localStorage.setItem(CASES_KEY, JSON.stringify(updatedCases))
  window.dispatchEvent(new CustomEvent('navishop:moderation-updated', {
    detail: { caseId: existingCase?.id ?? updatedCases[0].id },
  }))
  return reportId
}

export function closeAdminReportCase(caseId, status, reason, decidedBy = 'Admin') {
  const cases = getAdminReportCases()
  const currentCase = cases.find((item) => item.id === caseId)
  if (!currentCase) throw new Error('Không tìm thấy case báo cáo.')
  if (currentCase.status !== 'open') {
    const conflict = new Error('Case đã được xử lý bởi người khác. Danh sách đã được làm mới.')
    conflict.code = 'CASE_ALREADY_RESOLVED'
    throw conflict
  }
  if (!['completed', 'dismissed'].includes(status) || !reason?.trim()) {
    throw new Error('Chọn kết quả đóng case và nhập lý do xử lý.')
  }

  const decidedAt = Date.now()
  const closedCase = {
    ...currentCase,
    status,
    resolution: {
      status,
      reason: reason.trim(),
      decidedBy,
      decidedAt,
    },
    history: [
      ...(currentCase.history ?? []),
      { type: status, label: status === 'completed' ? 'Đã xử lý' : 'Đã loại bỏ', note: reason.trim(), actor: decidedBy, at: decidedAt },
    ],
  }
  const auditEntry = {
    id: `${caseId}-${decidedAt}`,
    caseId,
    action: status === 'completed' ? 'Đóng case: đã xử lý' : 'Đóng case: đã loại bỏ',
    note: reason.trim(),
    actor: decidedBy,
    createdAt: decidedAt,
  }
  const audit = getAdminModerationAudit()
  const reporterNotifications = JSON.parse(window.localStorage.getItem(REPORTER_NOTIFICATIONS_KEY) || '{}')
  const uniqueReporters = new Map(currentCase.reports
    .filter((report) => report.reporterId)
    .map((report) => [report.reporterId, report]))
  const resultLabel = status === 'completed' ? 'đã được xem xét và xử lý' : 'đã được xem xét và đóng'
  for (const [reporterId, report] of uniqueReporters) {
    const userNotifications = Array.isArray(reporterNotifications[reporterId])
      ? reporterNotifications[reporterId]
      : []
    const notificationId = `noti-${caseId}-${reporterId}`
    reporterNotifications[reporterId] = [
      {
        id: notificationId,
        type: 'report',
        title: 'Báo cáo của bạn đã được xử lý',
        body: `Cảm ơn bạn đã hỗ trợ xây dựng môi trường NaviShop an toàn. Báo cáo về “${currentCase.target.label}” ${resultLabel}.`,
        image: '',
        createdAt: decidedAt,
        href: `/user/reports/${encodeURIComponent(notificationId)}`,
        isRead: false,
        report: {
          type: currentCase.target.type === 'shop' ? 'Cửa hàng' : currentCase.target.type === 'review' ? 'Đánh giá' : 'Sản phẩm',
          target: currentCase.target.label,
          reportedAccount: currentCase.target.owner || '',
          reason: report.reason,
          details: report.details,
          evidenceImages: report.evidenceImages ?? [],
          submittedAt: report.submittedAt,
          processedAt: decidedAt,
          result: reason.trim(),
          caseStatus: status,
        },
      },
      ...userNotifications.filter((item) => item.id !== notificationId),
    ]
  }

  window.localStorage.setItem(
    CASES_KEY,
    JSON.stringify(cases.map((item) => item.id === caseId ? closedCase : item)),
  )
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify([auditEntry, ...audit]))
  window.localStorage.setItem(REPORTER_NOTIFICATIONS_KEY, JSON.stringify(reporterNotifications))
  window.dispatchEvent(new CustomEvent('navishop:moderation-updated', { detail: { caseId } }))
  window.dispatchEvent(new CustomEvent('navishop:reporter-notifications-updated'))
  return closedCase
}
