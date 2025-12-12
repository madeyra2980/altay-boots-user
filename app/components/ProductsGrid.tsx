'use client'

import Link from 'next/link'
import { useEffect, useState, type SVGProps } from 'react'

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/products'

type Product = {
  product_id?: number
  catalog_id?: number
  name: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: string[]
}

const normalizePhoto = (url?: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
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

export default function ProductsGrid() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingStates, setAddingStates] = useState<Record<number, boolean>>({})
  const [addStatuses, setAddStatuses] = useState<Record<number, string>>({})

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(API_URL, {
          headers: {
            accept: '*/*',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Не удалось загрузить товары')
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setAddStatuses((prev) => ({ ...prev, [productId]: '' }))
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setAddStatuses((prev) => ({ ...prev, [productId]: 'Войдите в аккаунт' }))
      return
    }

    try {
      setAddingStates((prev) => ({ ...prev, [productId]: true }))
      const res = await fetch('http://185.146.3.132:8080/api/v1/user/add-product-to-cart', {
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

      setAddStatuses((prev) => ({ ...prev, [productId]: 'В корзине' }))
      if (typeof window !== 'undefined') {
        const current = Number(localStorage.getItem('cartCount') || '0') || 0
        const next = current + 1
        localStorage.setItem('cartCount', String(next))
        window.dispatchEvent(new Event('storage'))
      }
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setAddStatuses((prev) => ({ ...prev, [productId]: '' }))
      }, 2000)
    } catch (err) {
      setAddStatuses((prev) => ({ 
        ...prev, 
        [productId]: err instanceof Error ? err.message : 'Ошибка' 
      }))
    } finally {
      setAddingStates((prev) => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-stone-50">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 border-l-4 border-orange-500 pl-4">Каталог товаров</h2>
        <div className="hidden sm:block text-sm text-stone-500">{items.length} товаров</div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="aspect-[3/4] rounded-lg bg-stone-200 animate-pulse"></div>
           ))}
        </div>
      )}
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-700 ring-1 ring-red-200">
          <p className="font-medium">Упс! {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {items.map((item) => {
            const productId =
              typeof item.product_id === 'number'
                ? item.product_id
                : null

            return (
              <div
                key={productId ?? item.name}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
              >
                <Link
                  href={productId ? `/product/${productId}` : '#'}
                  className="relative block aspect-[4/5] overflow-hidden bg-stone-100"
                >
                    {item.photos && item.photos[0] ? (
                      <img
                        src={normalizePhoto(item.photos[0])}
                        alt={item.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400">
                        <span className="text-sm font-medium">Нет фото</span>
                      </div>
                    )}
                    
                    {/* Badge Overlay - e.g. New or Sale (Example logic) */}
                    {item.oldPrice && item.price && item.oldPrice > item.price && (
                      <div className="absolute top-3 right-3 rounded-full bg-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
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
                  
                  <div className="mt-4 flex items-end justify-between gap-4 border-t border-stone-100 pt-4">
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
                        onClick={(e) => productId && handleAddToCart(productId, e)}
                        disabled={productId ? addingStates[productId] : true}
                        className={`relative z-10 flex items-center justify-center rounded-lg p-2.5 transition-all
                          ${productId && addStatuses[productId] === 'В корзине' 
                             ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                             : 'bg-stone-900 text-white hover:bg-orange-600 shadow-md hover:shadow-lg active:scale-95'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Добавить в корзину"
                      >
                         {productId && addingStates[productId] ? (
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : productId && addStatuses[productId] === 'В корзине' ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                         ) : (
                            <CartIcon className="h-5 w-5" />
                         )}
                      </button>
                    )}
                  </div>
                   {productId && addStatuses[productId] && addStatuses[productId] !== 'В корзине' && (
                      <p className="mt-1 text-xs text-center text-orange-600 font-medium absolute bottom-16 left-0 right-0 bg-white/90 py-1 backdrop-blur-sm">
                        {addStatuses[productId]}
                      </p>
                    )}
                </div>
              </div>
            )
          })}

          {!items.length && !loading && (
            <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-xl border border-dashed border-stone-300">
              Товары не найдены
            </div>
          )}
        </div>
      )}
    </section>
  )
}
