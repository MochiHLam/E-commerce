import { getSellerApplication } from '@/mocks/seller'

export const SELLER_HOME = {
  none: '/seller/onboarding',
  draft: '/seller/onboarding',
  pending: '/seller/pending',
  rejected: '/seller/pending',
  approved: '/seller/dashboard',
  suspended: '/seller/dashboard',
  banned: '/seller/dashboard',
}

export function getSellerStatus(userId) {
  return getSellerApplication(userId)?.status ?? 'none'
}

export function getSellerHome(userId) {
  return SELLER_HOME[getSellerStatus(userId)] ?? '/seller'
}
