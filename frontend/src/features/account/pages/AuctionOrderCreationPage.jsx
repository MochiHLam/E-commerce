import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, MapPin, MessageCircle, Package, ShoppingBag, Store } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getMockWonAuctionItems } from '@/mocks/auction/historyMock'
import { getMockAuctionOrder, saveCheckoutMockOrders } from '@/mocks/account/orders'
import { MOCK_SHOPS } from '@/mocks/mockShops'

function getShippingAddresses(user) {
  if (Array.isArray(user?.shippingAddresses) && user.shippingAddresses.length > 0) {
    return user.shippingAddresses
  }
  if (!user?.address) return []
  return [{
    id: 'account-address',
    recipientName: user.name ?? '',
    phone: user.phone ?? '',
    address: user.address,
    isDefault: true,
  }]
}

function NotFoundState() {
  return (
    <main className="w-full flex-1 bg-gray-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">Không tìm thấy vật phẩm đấu giá thành</h1>
        <Link
          to="/user/auctions/items"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#056F1C] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại vật đấu thành
        </Link>
      </section>
    </main>
  )
}

export default function AuctionOrderCreationPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const found = getMockWonAuctionItems().find(({ item }) => item.itemId === itemId)
  const addresses = getShippingAddresses(user)
  const usableAddresses = addresses.filter((address) => address.address?.trim())
  const defaultAddress = usableAddresses.find((address) => address.isDefault) ?? usableAddresses[0]
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? '')
  const [pendingAddressId, setPendingAddressId] = useState(defaultAddress?.id ?? '')
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const submissionInProgress = useRef(false)

  useEffect(() => {
    setSelectedAddressId(defaultAddress?.id ?? '')
    setPendingAddressId(defaultAddress?.id ?? '')
  }, [defaultAddress?.id])

  if (!found?.item.isMe || found.item.state !== 'sold') return <NotFoundState />

  const { session, item } = found
  const sessionId = session.id
  const shop = MOCK_SHOPS.find((entry) => entry.slug === item.sourceShop?.slug)
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
  const existingOrder = getMockAuctionOrder(sessionId, itemId)

  const openShopChat = () => {
    if (!shop) return
    window.dispatchEvent(new CustomEvent('navishop:open-shop-chat', {
      detail: { shopId: shop.id },
    }))
  }

  const createOrder = () => {
    if (submissionInProgress.current || existingOrder) return
    if (!selectedAddress) {
      setError('Tài khoản chưa có địa chỉ giao hàng hợp lệ.')
      return
    }
    if (!shop) {
      setError('Không tìm thấy cửa hàng cung cấp vật phẩm này.')
      return
    }

    submissionInProgress.current = true
    setError('')
    const orderId = `AU-${sessionId}-${itemId}`
    const itemPrice = item.finalPrice ?? 0
    const order = {
      id: orderId,
      checkoutId: orderId,
      source: 'auction',
      auctionSessionId: sessionId,
      auctionItemId: itemId,
      status: 'shipping',
      shopSlug: shop.slug,
      storeName: shop.name,
      items: [{
        id: `${orderId}-item`,
        productName: item.title,
        image: item.images?.[0] ?? '',
        variantName: item.variantName ?? item.variantLabel ?? '',
        price: itemPrice,
        quantity: 1,
        merchandiseTotal: itemPrice,
      }],
      createdAt: new Date().toISOString(),
      paymentMethod: 'navishop-wallet',
      merchandiseTotal: itemPrice,
      shippingFee: 0,
      totalAmount: itemPrice,
      shippingAddress: {
        recipientName: selectedAddress.recipientName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
      },
    }

    try {
      saveCheckoutMockOrders([order])
      navigate('/order-success', {
        replace: true,
        state: { orderId, total: itemPrice, source: 'auction' },
      })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.')
      submissionInProgress.current = false
    }
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 xl:px-0">
        <Link
          to="/user/auctions/items"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#056F1C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại vật đấu thành
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Tạo đơn hàng đấu giá</h1>

        {existingOrder ? (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-700">Bạn đã tạo đơn cho vật phẩm này.</p>
            <Link
              to={`/user/orders/${encodeURIComponent(existingOrder.id)}`}
              className="mt-4 inline-flex min-h-10 items-center rounded-md bg-[#056F1C] px-4 text-sm font-semibold text-white hover:bg-[#045517]"
            >
              Xem đơn hàng
            </Link>
          </section>
        ) : (
          <div className="mt-6 space-y-5">
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <MapPin className="h-5 w-5 text-[#056F1C]" />
                  Địa chỉ giao hàng
                </h2>
                {usableAddresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAddressId(selectedAddressId)
                      setIsAddressDialogOpen(true)
                    }}
                    className="text-sm font-semibold text-[#056F1C] hover:underline"
                  >
                    Đổi địa chỉ
                  </button>
                )}
              </div>
              {selectedAddress && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-gray-900">
                        {selectedAddress.recipientName}
                        <span className="font-normal text-gray-500">{selectedAddress.phone}</span>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-gray-700">{selectedAddress.address}</p>
                    </div>
                    {selectedAddress.isDefault && (
                      <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#056F1C]">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <ShoppingBag className="h-5 w-5 text-[#056F1C]" />
                Vật phẩm đấu giá thành
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-3 font-semibold text-[#056F1C]">
                  <Store className="h-4 w-4 text-[#056F1C]" />
                  {shop?.name ?? item.sourceShop?.name ?? 'Cửa hàng'}
                  <button
                    type="button"
                    onClick={openShopChat}
                    disabled={!shop}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#056F1C] px-2.5 py-1 text-xs font-semibold text-[#056F1C] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 px-3 py-4 text-sm">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    {(item.variantName || item.variantLabel) && (
                      <p className="mt-1 text-sm text-gray-500">{item.variantName || item.variantLabel}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#056F1C]">Vật phẩm đấu giá thành</p>
                </div>
              </div>
            </section>
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={createOrder}
                disabled={!shop}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#056F1C] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Tạo đơn hàng
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddressDialogOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAddressDialogOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="auction-address-title" className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 id="auction-address-title" className="text-lg font-semibold text-gray-900">Chọn địa chỉ giao hàng</h2>
            </div>
            <div className="max-h-[65vh] space-y-3 overflow-y-auto p-5">
              {usableAddresses.map((address) => {
                const isPending = pendingAddressId === address.id
                return (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                      isPending ? 'border-[#056F1C] bg-green-50/60' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="auction-order-address"
                      checked={isPending}
                      onChange={() => setPendingAddressId(address.id)}
                      className="mt-1 h-4 w-4 accent-[#056F1C]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-gray-900">{address.recipientName}</span>
                      <span className="ml-2 text-sm text-gray-500">{address.phone}</span>
                      <span className="mt-2 block text-sm text-gray-700">{address.address}</span>
                      {address.isDefault && <span className="mt-2 inline-block text-xs font-semibold text-[#056F1C]">Mặc định</span>}
                    </span>
                    {isPending && <Check className="h-4 w-4 text-[#056F1C]" />}
                  </label>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsAddressDialogOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAddressId(pendingAddressId)
                  setIsAddressDialogOpen(false)
                }}
                disabled={!pendingAddressId}
                className="rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
