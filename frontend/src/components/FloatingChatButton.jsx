import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Search, Send, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOCK_SHOPS } from '@/mocks/mockShops'

function getCurrentTime() {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [shops, setShops] = useState(MOCK_SHOPS)
  const [selectedShopId, setSelectedShopId] = useState(MOCK_SHOPS[0].id)
  const [shopSearch, setShopSearch] = useState('')
  const [draft, setDraft] = useState('')
  const messagesListRef = useRef(null)
  const selectedShop = shops.find((shop) => shop.id === selectedShopId)
  const visibleShops = shops.filter((shop) =>
    shop.name.toLocaleLowerCase('vi-VN').includes(shopSearch.trim().toLocaleLowerCase('vi-VN')),
  )

  useEffect(() => {
    if (isOpen && messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight
    }
  }, [isOpen, selectedShopId, selectedShop?.messages.length])

  useEffect(() => {
    const openShopChat = (event) => {
      const shopId = event.detail?.shopId
      if (!MOCK_SHOPS.some((shop) => shop.id === shopId)) return
      setSelectedShopId(shopId)
      setIsOpen(true)
      setShops((current) => current.map((shop) =>
        shop.id === shopId ? { ...shop, unread: 0 } : shop,
      ))
    }

    window.addEventListener('navishop:open-shop-chat', openShopChat)
    return () => window.removeEventListener('navishop:open-shop-chat', openShopChat)
  }, [])

  const selectShop = (shopId) => {
    setSelectedShopId(shopId)
    setShops((current) => current.map((shop) =>
      shop.id === shopId ? { ...shop, unread: 0 } : shop,
    ))
  }

  const sendMessage = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !selectedShop) return

    setShops((current) => current.map((shop) => (
      shop.id === selectedShop.id
        ? {
            ...shop,
            messages: [
              ...shop.messages,
              { id: `buyer-${Date.now()}`, from: 'buyer', text, time: getCurrentTime() },
            ],
          }
        : shop
    )))
    setDraft('')
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen ? (
        <section
          id="floating-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="floating-chat-title"
          className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-2xl"
          style={{
            height: 'min(35rem, calc(100dvh - 2.5rem))',
            width: 'min(45rem, calc(100vw - 1.5rem))',
            minHeight: 0,
          }}
        >
          <header className="flex shrink-0 items-center justify-between bg-[#056F1C] px-4 py-3 text-white">
            <div>
              <h2 id="floating-chat-title" className="text-sm font-semibold">Tin nhắn với shop</h2>
              <p className="mt-0.5 text-xs text-white/75">Bản xem trước · Chưa kết nối real-time</p>
            </div>
            <button
              type="button"
              aria-label="Đóng khung chat"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden" style={{ flex: '1 1 0%', minHeight: 0 }}>
            <aside
              aria-label="Danh sách cửa hàng"
              className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-gray-200"
              style={{ flex: '0 0 30%', minHeight: 0 }}
            >
              <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-2">
                <label className="relative block">
                  <Search aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 bg-white text-gray-400" />
                  <input
                    type="search"
                    value={shopSearch}
                    onChange={(event) => setShopSearch(event.target.value)}
                    placeholder="Tìm cửa hàng"
                    aria-label="Tìm cửa hàng"
                    className="h-8 w-full rounded-md border border-gray-300 pl-3 pr-12 text-xs outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                  />
                </label>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ flex: '1 1 0%', height: 0, minHeight: 0 }}>
                {visibleShops.map((shop) => {
                  const lastMessage = shop.messages[shop.messages.length - 1]
                  const isSelected = shop.id === selectedShopId
                  return (
                    <button
                      key={shop.id}
                      type="button"
                      onClick={() => selectShop(shop.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className={`flex w-full items-start gap-2 px-3 py-3 text-left transition ${
                        isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${shop.color}`}>
                        {shop.initial}
                        {shop.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-1">
                          <span className="truncate text-[11px] font-semibold sm:text-xs">{shop.name}</span>
                          {shop.unread > 0 && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#056F1C] px-1 text-[10px] font-semibold text-white">
                              {shop.unread}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-gray-500">
                          {lastMessage?.from === 'buyer' ? 'Bạn: ' : ''}{lastMessage?.text}
                        </span>
                      </span>
                    </button>
                  )
                })}
                {visibleShops.length === 0 && (
                  <p className="px-3 py-5 text-center text-[11px] text-gray-500">Không tìm thấy cửa hàng.</p>
                )}
              </div>
            </aside>

            {selectedShop && (
              <div
                className="flex min-h-0 min-w-0 flex-col overflow-hidden"
                style={{ flex: '0 0 70%', height: '100%', minHeight: 0 }}
              >
                <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 px-3 sm:px-4">
                  <Link
                    to={`/${selectedShop.slug}`}
                    onClick={() => setIsOpen(false)}
                    aria-label={`Mở gian hàng ${selectedShop.name}`}
                    className="flex min-w-0 items-center gap-2 rounded-lg p-1 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${selectedShop.color}`}>
                      {selectedShop.initial}
                    </span>
                    <span className="truncate text-xs font-semibold text-gray-900">{selectedShop.name}</span>
                  </Link>
                </div>

                <div
                  ref={messagesListRef}
                  aria-live="polite"
                  className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain bg-gray-50 px-3 py-4 sm:px-4"
                  style={{ flex: '1 1 0%', height: 0, minHeight: 0 }}
                >
                  {selectedShop.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.from === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        message.from === 'buyer'
                          ? 'rounded-br-md bg-[#056F1C] text-white'
                          : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
                      }`}>
                        <p className="break-words text-xs">{message.text}</p>
                        <time className={`mt-1 block text-right text-[10px] ${
                          message.from === 'buyer' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {message.time}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="flex shrink-0 items-center gap-2 border-t border-gray-200 p-3">
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Nhập tin nhắn..."
                    aria-label="Nhập tin nhắn"
                    className="h-10 min-w-0 flex-1 rounded-full border border-gray-300 px-4 text-xs outline-none focus:border-[#056F1C] focus:ring-2 focus:ring-[#056F1C]/15"
                  />
                  <button
                    type="submit"
                    aria-label="Gửi tin nhắn"
                    disabled={!draft.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#056F1C] text-white transition hover:bg-[#045517] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          aria-label="Mở chat với shop"
          aria-expanded={false}
          aria-controls="floating-chat-panel"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#056F1C] px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Chat</span>
        </button>
      )}
    </div>
  )
}
