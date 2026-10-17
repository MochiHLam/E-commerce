import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NOTIFICATION_ICONS, formatNotificationDateTime } from '@/mocks/mockNotifications'

export default function NotificationsSection({ notifications, setNotifications, filter = 'all' }) {
  const visibleNotifications = filter === 'all'
    ? notifications
    : notifications.filter((notification) => notification.type === filter)
  const heading = filter === 'order'
    ? 'Thông báo đơn hàng'
    : filter === 'auction'
      ? 'Thông báo đấu giá'
      : 'Thông báo'
  const hasUnreadNotifications = visibleNotifications.some((notification) => !notification.isRead)

  const markVisibleNotificationsAsRead = () => {
    setNotifications((current) => current.map((notification) =>
      notification.type === filter ? { ...notification, isRead: true } : notification,
    ))
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        {filter !== 'all' && (
          <button
            type="button"
            onClick={markVisibleNotificationsAsRead}
            disabled={!hasUnreadNotifications}
            className="whitespace-nowrap text-sm font-semibold text-[#056F1C] hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline"
          >
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>
      {visibleNotifications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
          <p className="text-sm text-gray-500">Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {visibleNotifications.map((notification) => {
            const NotificationIcon = NOTIFICATION_ICONS[notification.type] ?? Bell
            return (
              <Link
                key={notification.id}
                to={notification.href}
                onClick={() => setNotifications((current) => current.map((item) =>
                  item.id === notification.id ? { ...item, isRead: true } : item,
                ))}
                className={`grid grid-cols-[10%_minmax(0,1fr)] items-start gap-4 px-5 py-4 transition hover:bg-gray-50 ${notification.isRead ? '' : 'bg-green-50/70'}`}
              >
                <span className="mt-0.5">
                  {notification.image ? (
                    <img src={notification.image} alt="" className="aspect-square w-full rounded-md object-cover" />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center rounded-full bg-gray-100 text-[#056F1C]">
                      <NotificationIcon className="h-5 w-5" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-start justify-between gap-2">
                    <span className="block text-sm font-semibold leading-relaxed text-gray-900">{notification.title}</span>
                    {!notification.isRead && (
                      <span aria-label="Chưa đọc" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#056F1C]" />
                    )}
                  </span>
                  {notification.body && <span className="mt-1 block text-sm leading-relaxed text-gray-700">{notification.body}</span>}
                  <span className="mt-1 block text-xs text-gray-500">{formatNotificationDateTime(notification.createdAt)}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
