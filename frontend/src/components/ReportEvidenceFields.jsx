import { useEffect, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

const MAX_IMAGES = 3
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export default function ReportEvidenceFields({
  details,
  onDetailsChange,
  images,
  onImagesChange,
  idPrefix,
  allowImages = true,
}) {
  const [previews, setPreviews] = useState([])
  const [imageError, setImageError] = useState('')
  const detailsId = `${idPrefix}-details`
  const imagesId = `${idPrefix}-images`

  useEffect(() => {
    const nextPreviews = images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviews(nextPreviews)
    return () => nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url))
  }, [images])

  const addImages = (event) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    const errors = []
    const accepted = []

    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: chỉ chấp nhận tệp hình ảnh.`)
      } else if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: ảnh vượt quá 5 MB.`)
      } else {
        accepted.push(file)
      }
    }

    const availableSlots = Math.max(0, MAX_IMAGES - images.length)
    if (accepted.length > availableSlots) {
      errors.push(`Chỉ có thể đính kèm tối đa ${MAX_IMAGES} ảnh.`)
    }
    onImagesChange([...images, ...accepted.slice(0, availableSlots)])
    setImageError(errors.join(' '))
  }

  const removeImage = (index) => {
    onImagesChange(images.filter((_, imageIndex) => imageIndex !== index))
    setImageError('')
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label htmlFor={detailsId} className="text-sm font-semibold text-gray-800">
          Mô tả chi tiết
        </label>
        <textarea
          id={detailsId}
          required
          rows={4}
          maxLength={1000}
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          placeholder="Mô tả lý do báo cáo"
          className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#056F1C]"
        />
        <p className="mt-1 text-right text-xs text-gray-500">{details.length}/1000</p>
      </div>

      {allowImages && (
        <div>
          <span className="block text-sm font-semibold text-gray-800">Ảnh bằng chứng (không bắt buộc)</span>
          <label
            htmlFor={imagesId}
            className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-[#056F1C] hover:text-[#056F1C]"
          >
            <ImagePlus className="h-4 w-4" />
            Thêm ảnh
          </label>
          <input
            id={imagesId}
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
            disabled={images.length >= MAX_IMAGES}
            className="sr-only"
          />
          <p className="mt-1 text-xs text-gray-500">Tối đa {MAX_IMAGES} ảnh, mỗi ảnh không quá 5 MB.</p>
          {imageError && <p role="alert" className="mt-2 text-xs text-red-600">{imageError}</p>}
          {previews.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {previews.map(({ file, url }, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`} className="relative">
                  <img src={url} alt={`Ảnh bằng chứng ${index + 1}`} className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                  <button
                    type="button"
                    aria-label={`Xóa ảnh ${index + 1}`}
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
