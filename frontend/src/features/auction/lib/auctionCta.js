/**
 * Tính CTA cho banner/hero đấu giá dựa vào trạng thái phiên + user.
 * Dùng chung cho AuctionBanner (HomePage) và HeroSection (AuctionAboutPage).
 *
 * @returns {{ label: string, variant: 'primary'|'muted', disabled: boolean, action: object }}
 *   action.type = 'navigate' | 'login' | 'popup' | 'register'
 */

const LOGIN = { type: 'login' }

export function getAuctionCta({ session, isLoggedIn, isRegistered }) {
  const status = session?.status ?? 'closed'
  const to = session?.id ? `/auction/${session.id}` : null

  if (status === 'closed') {
    return { label: 'Đăng ký', variant: 'muted', disabled: true, action: { type: 'none' } }
  }

  if (status === 'pending') {
    return {
      label: isRegistered ? 'Tham gia' : 'Đăng ký',
      variant: isRegistered ? 'muted' : 'primary',
      disabled: Boolean(isRegistered),
      action: isRegistered
        ? { type: 'none' }
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
