import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NOTIFICATION_ICONS, formatRelativeTime } from '@/mocks/mockNotifications'

export default function NotificationsSection({ notifications, setNotifications }) {
  return (
    <>
      <h1 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Thông báo</h1>
      {notifications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
          <p className="text-sm text-gray-500">Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="max-w-4xl divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {notifications.map((notification) => {
            const NotificationIcon = NOTIFICATION_ICONS[notification.type] ?? Bell
            return (
              <Link
                key={notification.id}
                to={notification.href}
                onClick={() => setNotifications((current) => current.map((item) =>
                  item.id === notification.id ? { ...item, isRead: true } : item,
                ))}
                className={`flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50 ${notification.isRead ? '' : 'bg-green-50/70'}`}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#056F1C]">
                  <NotificationIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-relaxed text-gray-800">{notification.title}</span>
                  <span className="mt-1 block text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</span>
                </span>
                {!notification.isRead && (
                  <span aria-label="Chưa đọc" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#056F1C]" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
