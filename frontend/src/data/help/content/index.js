import findProduct      from './shopping/find-product'
import addToCart        from './shopping/add-to-cart'
import checkout         from './shopping/checkout'
import trackOrder       from './shopping/track-order'

import registerStore    from './selling/register-store'
import listProduct      from './selling/list-product'
import manageOrders     from './selling/manage-orders'
import receivePayment   from './selling/receive-payment'

import paymentMethods   from './payment/payment-methods'
import paymentSecurity  from './payment/payment-security'
import refund           from './payment/refund'

import shippingTime     from './shipping/shipping-time'
import shippingFee      from './shipping/shipping-fee'

import emailSupport     from './contact/email-support'

export const CONTENT_MAP = {
  'shopping/find-product':      findProduct,
  'shopping/add-to-cart':       addToCart,
  'shopping/checkout':          checkout,
  'shopping/track-order':       trackOrder,

  'selling/register-store':     registerStore,
  'selling/list-product':       listProduct,
  'selling/manage-orders':      manageOrders,
  'selling/receive-payment':    receivePayment,

  'payment/payment-methods':    paymentMethods,
  'payment/payment-security':   paymentSecurity,
  'payment/refund':             refund,

  'shipping/shipping-time':     shippingTime,
  'shipping/shipping-fee':      shippingFee,

  'contact/email-support':      emailSupport,
}
