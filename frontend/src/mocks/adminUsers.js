import { MOCK_ACCOUNTS } from '@/mocks/mockAccounts'

const ADMIN_USER_STATE_KEY = 'navishop.mockAdmin.users'

const MOCK_USER_DIRECTORY_DETAILS = {
  usr_001: { joinedAt: '2025-06-12T09:20:00.000Z', completedOrders: 8, reportWarnings: 0 },
  usr_002: { joinedAt: '2025-08-01T14:10:00.000Z', completedOrders: 3, reportWarnings: 1 },
  usr_google_001: { joinedAt: '2025-11-16T06:45:00.000Z', completedOrders: 0, reportWarnings: 0 },
  adm_001: { joinedAt: '2025-01-01T08:00:00.000Z', completedOrders: null, reportWarnings: null },
}

function readAdminUserState() {
  const value = JSON.parse(localStorage.getItem(ADMIN_USER_STATE_KEY) ?? '{"statuses":{},"history":[]}')
  if (!value || Array.isArray(value) || typeof value !== 'object'
    || !value.statuses || typeof value.statuses !== 'object' || !Array.isArray(value.history)) {
    throw new Error('Dữ liệu quản lý user mock không hợp lệ.')
  }
  return value
}

export function getAdminUserDirectory(currentUserId, currentUser = null) {
  const { statuses } = readAdminUserState()

  return MOCK_ACCOUNTS.map((account) => {
    const isCustomer = account.role === 'user'
    const demoDetails = MOCK_USER_DIRECTORY_DETAILS[account.id] ?? {}
    const statusRecord = statuses[account.id] ?? {}
    const profile = account.id === currentUserId && currentUser ? currentUser : account
    return {
      id: account.id,
      name: profile.name ?? account.name,
      email: profile.email ?? account.email,
      role: account.role,
      phone: profile.phone ?? '',
      gender: profile.gender ?? '',
      dob: profile.dob ?? '',
      address: profile.address ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      loginProvider: profile.loginProvider ?? 'password',
      shippingAddresses: Array.isArray(profile.shippingAddresses) ? profile.shippingAddresses : [],
      joinedAt: demoDetails.joinedAt ?? null,
      status: isCustomer ? statusRecord.status ?? 'active' : 'staff',
      statusReason: statusRecord.reason ?? '',
      statusChangedAt: statusRecord.changedAt ?? null,
      completedOrders: demoDetails.completedOrders ?? null,
      reportWarnings: demoDetails.reportWarnings ?? null,
      canManage: isCustomer && account.id !== currentUserId,
      isCurrentUser: account.id === currentUserId,
    }
  }).sort((left, right) => {
    const roleOrder = { user: 0, admin: 1 }
    return roleOrder[left.role] - roleOrder[right.role] || left.name.localeCompare(right.name, 'vi')
  })
}

export function getAdminUserHistory(userId) {
  if (!userId) return []
  const { history } = readAdminUserState()
  return history
    .filter((entry) => entry.userId === userId)
    .sort((left, right) => new Date(right.changedAt) - new Date(left.changedAt))
}

export function updateMockAdminUserStatus(userId, status, reason, actorId) {
  if (!userId || !['active', 'locked'].includes(status) || !reason?.trim()) {
    throw new Error('Chọn trạng thái hợp lệ và nhập lý do trước khi lưu.')
  }
  const account = MOCK_ACCOUNTS.find((candidate) => candidate.id === userId)
  if (!account || account.role !== 'user') {
    throw new Error('Chỉ tài khoản người dùng mới được khóa hoặc mở khóa tại đây.')
  }
  if (userId === actorId) {
    throw new Error('Không thể thay đổi trạng thái tài khoản đang đăng nhập.')
  }

  const currentState = readAdminUserState()
  const currentStatus = currentState.statuses[userId]?.status ?? 'active'
  if (currentStatus === status) {
    throw new Error(`Tài khoản đã ở trạng thái "${status === 'locked' ? 'đã khóa' : 'đang hoạt động'}".`)
  }

  const changedAt = new Date().toISOString()
  const historyEntry = {
    id: `${userId}-${changedAt}`,
    userId,
    actorId,
    action: status === 'locked' ? 'lock' : 'unlock',
    status,
    reason: reason.trim(),
    changedAt,
  }
  const nextState = {
    statuses: {
      ...currentState.statuses,
      [userId]: { status, reason: reason.trim(), changedAt },
    },
    history: [...currentState.history, historyEntry],
  }
  localStorage.setItem(ADMIN_USER_STATE_KEY, JSON.stringify(nextState))
  return historyEntry
}
