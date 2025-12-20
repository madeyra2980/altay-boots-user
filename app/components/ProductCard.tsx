import Link from 'next/link'
import { useState, useEffect, type SVGProps } from 'react'
import { normalizePhoto } from '../utils/imageUtils'

type ProductPhoto = {
  photo_id: number
  photoURL: string
}

export type Product = {
  product_id?: number
  catalog_id?: number
  name: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: ProductPhoto[] | string[]
}

const CartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M4 5h2l1.5 12h9L18 8H7.4" />
    <circle cx="9" cy="19" r="1.2" />
    <circle cx="16" cy="19" r="1.2" />
  </svg>
)

export default function ProductCard({ item }: { item: Product }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [adding, setAdding] = useState(false)
  const [addStatus, setAddStatus] = useState<string | null>(null)
  // New state for hover
  const [isHovered, setIsHovered] = useState(false)

  const productId = typeof item.product_id === 'number' ? item.product_id : null
  const photos = item.photos && item.photos.length > 0 ? item.photos : []
  const allPhotos = photos.map(normalizePhoto)

  // Auto-play effect
  useEffect(() => {
    if (!isHovered || allPhotos.length <= 1) return

    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % allPhotos.length)
    }, 1500) // Change slide every 1.5 seconds

    return () => clearInterval(interval)
  }, [isHovered, allPhotos.length])

  // Reset to first image when not hovered (optional, but often cleaner for grids)
  useEffect(() => {
    if (!isHovered) {
      setActivePhotoIndex(0)
    }
  }, [isHovered])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!productId) return

    setAddStatus(null)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setAddStatus('Войдите в аккаунт')
      return
    }

    try {
      setAdding(true)
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!res.ok) {
        try {
          const errorData = await res.json()
          throw new Error((errorData as { message?: string })?.message || 'Ошибка')
        } catch (err) {
          throw new Error(`Ошибка ${res.status}`)
        }
      }

      setAddStatus('В корзине')
      if (typeof window !== 'undefined') {
        const current = Number(localStorage.getItem('cartCount') || '0') || 0
        const next = current + 1
        localStorage.setItem('cartCount', String(next))
        window.dispatchEvent(new Event('storage'))
      }

      setTimeout(() => {
        setAddStatus(null)
      }, 2000)
    } catch (err) {
      setAddStatus(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setAdding(false)
    }
  }

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActivePhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActivePhotoIndex((prev) => (prev + 1) % allPhotos.length)
  }

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={productId ? `/product/${productId}` : '#'}
        className="relative block aspect-[4/5] overflow-hidden bg-stone-100 group/image"
      >
        {allPhotos.length > 0 ? (
          <>
            <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activePhotoIndex * 100}%)` }}>
              {allPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${item.name} - ${index + 1}`}
                  className="h-full w-full flex-shrink-0 object-cover object-center"
                />
              ))}
            </div>

            {/* Carousel Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={handlePrevPhoto}
                className="pointer-events-auto flex items-center justify-center h-8 w-8 rounded-full bg-white/90 text-stone-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 z-20"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextPhoto}
                className="pointer-events-auto flex items-center justify-center h-8 w-8 rounded-full bg-white/90 text-stone-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 z-20"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Progressive Indicator Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
              {allPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActivePhotoIndex(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === activePhotoIndex
                      ? 'bg-white w-4'
                      : 'bg-white/40 w-1.5 hover:bg-white/60'
                    }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <span className="text-sm font-medium">Нет фото</span>
          </div>
        )}

        {/* Badge Overlay */}
        {item.oldPrice && item.price && item.oldPrice > item.price && (
          <div className="absolute top-3 right-3 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm z-10">
            Sale
          </div>
        )}
      </Link>


      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            <Link href={productId ? `/product/${productId}` : '#'}>
              <span aria-hidden="true" className="absolute inset-0" />
              {item.name}
            </Link>
          </h3>
          {item.description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-stone-100 pt-4 relative">
          <div className="flex flex-col">
            {item.oldPrice !== undefined && item.oldPrice > (item.price || 0) && (
              <span className="text-xs text-stone-400 line-through">{item.oldPrice} ₸</span>
            )}
            {item.price !== undefined && (
              <span className="text-xl font-bold text-stone-900">{item.price} ₸</span>
            )}
          </div>

          {productId && (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`relative z-20 flex items-center justify-center rounded-lg p-2.5 transition-all
                ${addStatus === 'В корзине'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-stone-900 text-white hover:bg-orange-600 shadow-md hover:shadow-lg active:scale-95'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Добавить в корзину"
            >
              {adding ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : addStatus === 'В корзине' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <CartIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {productId && addStatus && addStatus !== 'В корзине' && (
          <p className="mt-1 text-xs text-center text-orange-600 font-medium absolute bottom-16 left-0 right-0 bg-white/90 py-1 backdrop-blur-sm z-20 pointer-events-none">
            {addStatus}
          </p>
        )}
      </div>
    </div>
  )
}
