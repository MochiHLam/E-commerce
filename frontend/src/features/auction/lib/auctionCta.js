/**
 * Tính CTA cho banner/hero đấu giá dựa vào trạng thái phiên + user.
 * Dùng chung cho AuctionBanner (HomePage) và HeroSection (AuctionAboutPage).
 *
 * @returns {{ label: string, variant: 'primary'|'muted', disabled: boolean, action: object }}
 *   action.type = 'navigate' | 'login' | 'popup' | 'register'
 */

const LOGIN = { type: 'login' }

export function getAuctionCta({ session, isLoggedIn, isRegistered, registrationBlocked = false }) {
  const status = session?.status ?? 'closed'
  const to = session?.id ? `/auction/${session.id}` : null

  if (status === 'closed') {
    if (session?.closedReason === 'completed') {
      return { label: 'Phiên đã kết thúc', variant: 'muted', disabled: true, action: { type: 'none' } }
    }
    return { label: 'Đăng ký', variant: 'muted', disabled: true, action: { type: 'none' } }
  }

  if (status === 'pending') {
    if (registrationBlocked && !isRegistered) {
      return { label: 'Hết lượt đăng ký', variant: 'muted', disabled: true, action: { type: 'none' } }
    }
    return {
      label: isRegistered ? 'Hủy đăng ký' : 'Đăng ký',
      variant: 'primary',
      disabled: false,
      action: isRegistered
        ? isLoggedIn ? { type: 'cancel' } : LOGIN
        : isLoggedIn ? { type: 'register' } : LOGIN,
    }
  }

  if (status === 'active') {
    return {
      label: 'Tham gia',
      variant: isRegistered ? 'primary' : 'muted',
      disabled: !isRegistered,
      action: !isRegistered
        ? { type: 'none' }
        : isLoggedIn ? { type: 'navigate', to } : LOGIN,
    }
  }

  return { label: 'Đăng ký', variant: 'muted', disabled: true, action: { type: 'none' } }
}
