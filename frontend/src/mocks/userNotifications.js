import { INITIAL_NOTIFICATIONS } from '@/mocks/mockNotifications'

const USER_NOTIFICATIONS_KEY = 'navishop.mockUserNotifications'
const REPORTER_NOTIFICATIONS_KEY = 'navishop.mockReporterNotifications'

function readObject(key) {
  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) return {}
  const value = JSON.parse(rawValue)
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error('Dữ liệu thông báo mô phỏng không hợp lệ.')
  }
  return value
}

export function getUserNotifications(userId) {
  const savedByUser = readObject(USER_NOTIFICATIONS_KEY)
  const reporterByUser = readObject(REPORTER_NOTIFICATIONS_KEY)
  const saved = Array.isArray(savedByUser[userId]) ? savedByUser[userId] : []
  const reports = Array.isArray(reporterByUser[userId]) ? reporterByUser[userId] : []
  const savedById = new Map(saved.map((notification) => [notification.id, notification]))
  const merged = INITIAL_NOTIFICATIONS.map((notification) => ({
    ...notification,
    ...savedById.get(notification.id),
  }))
  const ids = new Set(merged.map((notification) => notification.id))
  return [
    ...reports.filter((notification) => !ids.has(notification.id)),
    ...merged,
  ].sort((first, second) => second.createdAt - first.createdAt)
}

export function saveUserNotifications(userId, notifications) {
  if (!userId || !Array.isArray(notifications)) {
    throw new Error('Không thể lưu trạng thái thông báo của tài khoản.')
  }
  const savedByUser = readObject(USER_NOTIFICATIONS_KEY)
  savedByUser[userId] = notifications
  window.localStorage.setItem(USER_NOTIFICATIONS_KEY, JSON.stringify(savedByUser))
  window.dispatchEvent(new CustomEvent('navishop:user-notifications-updated', {
    detail: { userId },
  }))
}
