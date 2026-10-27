import { useMemo, useState } from 'react'
import { Bot, ImagePlus, Save, Store, Trash2 } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  getSellerApplication,
  getSellerShopSettings,
  updateSellerShopSettings,
} from '@/mocks/seller'

const MAX_AVATAR_SIZE = 1024 * 1024

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Không thể đọc ảnh đã chọn.'))
        return
      }
      resolve(reader.result)
    }, { once: true })
    reader.addEventListener('error', () => reject(new Error('Không thể đọc ảnh đã chọn.')), { once: true })
    reader.readAsDataURL(file)
  })
}

export default function SellerSettingsPage() {
  const { user, isLoggedIn } = useAuth()
  const application = user?.role === 'user' ? getSellerApplication(user.id) : null
  const savedSettings = useMemo(() => getSellerShopSettings(user?.id), [user?.id])
  const [avatar, setAvatar] = useState(savedSettings?.avatar ?? '')
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(savedSettings?.aiAssistantEnabled ?? true)
  const [savedAvatar, setSavedAvatar] = useState(savedSettings?.avatar ?? '')
  const [savedAiAssistantEnabled, setSavedAiAssistantEnabled] = useState(savedSettings?.aiAssistantEnabled ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const isReadOnly = application?.status !== 'approved'
  const isDirty = avatar !== savedAvatar || aiAssistantEnabled !== savedAiAssistantEnabled

  if (!isLoggedIn || user?.role !== 'user') return <Navigate to="/seller" replace />
  if (!application || !['approved', 'suspended', 'banned'].includes(application.status)) {
    return <Navigate to="/seller/dashboard" replace />
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Logo shop chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.')
      setNotice('')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('Ảnh logo không được lớn hơn 1 MB để lưu được trong dữ liệu mock.')
      setNotice('')
      return
    }
    try {
      setAvatar(await readImageAsDataUrl(file))
      setError('')
      setNotice('Ảnh xem trước đã sẵn sàng. Hãy lưu thiết lập để áp dụng.')
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Không thể đọc ảnh đã chọn.')
      setNotice('')
    }
  }

  const saveSettings = () => {
    if (isReadOnly || isSaving || !isDirty) return
    setIsSaving(true)
    setError('')
    setNotice('')
    try {
      const nextSettings = updateSellerShopSettings(user.id, {
        avatar,
        aiAssistantEnabled,
      })
      setAvatar(nextSettings.avatar)
      setSavedAvatar(nextSettings.avatar)
      setAiAssistantEnabled(nextSettings.aiAssistantEnabled)
      setSavedAiAssistantEnabled(nextSettings.aiAssistantEnabled)
      window.dispatchEvent(new CustomEvent('navishop:seller-settings-updated', {
        detail: {
          shopSlug: application.slug,
          aiAssistantEnabled: nextSettings.aiAssistantEnabled,
        },
      }))
      setNotice('Thiết lập mock đã được lưu trên trình duyệt này.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu thiết lập shop.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thiết lập shop</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Quản lý logo hiển thị và tùy chọn trợ lý chat của cửa hàng.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
          Bản xem trước · lưu trên trình duyệt
        </span>
      </header>

      {isReadOnly && (
        <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Shop đang ở trạng thái {application.status === 'suspended' ? 'tạm khóa' : 'đã khóa'}; các thiết lập chỉ xem, không thể chỉnh sửa.
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#056F1C]">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900">Logo cửa hàng</h2>
              <p className="mt-1 text-sm text-gray-500">Ảnh đại diện hiển thị cùng tên shop.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 text-2xl font-bold text-[#056F1C]">
              {avatar
                ? <img src={avatar} alt={`Logo ${application.shopName}`} className="h-full w-full object-cover" />
                : application.shopName?.[0] ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{application.shopName}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Chọn JPG, PNG hoặc WebP tối đa 1 MB. Ảnh được lưu tạm trong localStorage, không tải lên dịch vụ bên ngoài.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#056F1C] ${isReadOnly ? 'pointer-events-none opacity-50' : ''}`}>
                  <ImagePlus className="h-4 w-4" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isReadOnly}
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </label>
                {avatar && (
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => {
                      setAvatar('')
                      setError('')
                      setNotice('Logo sẽ được gỡ khi bạn lưu thiết lập.')
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Gỡ logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900">Trợ lý chat</h2>
              <p className="mt-1 text-sm text-gray-500">Tùy chọn demo cho giao diện chat hiện có.</p>
            </div>
          </div>
          <label className="mt-5 flex cursor-pointer items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold text-gray-900">Bật trợ lý AI</span>
              <span className="mt-1 block text-sm leading-6 text-gray-500">
                Khi tắt, chat mock chỉ còn cuộc trò chuyện với shop.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-label="Bật trợ lý AI"
              checked={aiAssistantEnabled}
              disabled={isReadOnly}
              onChange={(event) => {
                setAiAssistantEnabled(event.target.checked)
                setNotice('')
              }}
              className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-[#056F1C] focus:ring-[#056F1C] disabled:cursor-not-allowed"
            />
          </label>
          <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
            Mock này chỉ thay đổi tùy chọn trình duyệt. Không gọi Gemini/API và không lưu API key; tích hợp thật phải đi qua backend.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-900/[0.02] sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">Thông tin hiển thị</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Thông tin hồ sơ hiện tại được dùng trên gian hàng. Chỉnh sửa thông tin cần gửi yêu cầu duyệt riêng.
              </p>
            </div>
            <Link
              to="/seller/information"
              className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C]"
            >
              Xem thông tin cửa hàng
            </Link>
          </div>
          <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-gray-500">Tên shop</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{application.shopName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Đường dẫn</dt>
              <dd className="mt-1 break-all text-sm font-semibold text-gray-900">navishop.vn/{application.slug}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500">Mô tả cửa hàng</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{application.description || 'Chưa có mô tả.'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="sticky bottom-0 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-[#f6f8f7]/95 py-3 backdrop-blur">
        <p className="text-xs leading-5 text-gray-500">
          Thay đổi được lưu trong trình duyệt này; chưa đồng bộ với backend.
        </p>
        <button
          type="button"
          disabled={isReadOnly || isSaving || !isDirty}
          onClick={saveSettings}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#056F1C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#045517] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#056F1C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Đang lưu…' : 'Lưu thiết lập'}
        </button>
      </div>
    </div>
  )
}
