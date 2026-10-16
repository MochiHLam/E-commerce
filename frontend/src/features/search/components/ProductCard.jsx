import { ImageIcon, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatVND } from '@/lib/format'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-10 w-10 text-gray-300" /></div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">{product.name}</p>
        <p className="text-base font-bold text-[#056F1C]">{formatVND(product.price)}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating.toFixed(1)}
          </span>
          <span>Đã bán {product.sold}</span>
        </div>
        <p className="truncate text-xs text-gray-500">{product.shop}</p>
      </div>
    </Link>
  )
}
