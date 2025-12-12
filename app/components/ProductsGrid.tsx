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
      setAddStatuses((prev) => ({ ...prev, [productId]: 'Сначала войдите в аккаунт' }))
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
          throw new Error((errorData as { message?: string })?.message || 'Не удалось добавить в корзину')
        } catch (err) {
          throw new Error(`Ошибка ${res.status}: ${res.statusText || 'Не удалось добавить в корзину'}`)
        }
      }

      setAddStatuses((prev) => ({ ...prev, [productId]: 'Добавлено ✓' }))
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
        [productId]: err instanceof Error ? err.message : 'Ошибка добавления' 
      }))
    } finally {
      setAddingStates((prev) => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Каталог товаров</h2>
      </div>

      {loading && <div className="rounded-lg bg-white p-4 shadow">Загрузка...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const productId =
              typeof item.product_id === 'number'
                ? item.product_id
                : null

            const CardContent = () => (
              <>
                {item.photos && item.photos[0] ? (
                  <img
                    src={normalizePhoto(item.photos[0])}
                    alt={item.name}
                    className="mb-3 h-48 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-48 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                    Нет фото
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                <div className="mt-3 flex items-center gap-2">
                  {item.price !== undefined && (
                    <span className="text-lg font-bold text-rose-600">{item.price} ₸</span>
                  )}
                  {item.oldPrice !== undefined && (
                    <span className="text-sm text-gray-400 line-through">{item.oldPrice} ₸</span>
                  )}
                </div>
                {productId && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={(e) => handleAddToCart(productId, e)}
                      disabled={addingStates[productId]}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {addingStates[productId] ? 'Добавление...' : 'Добавить в корзину'}
                      <CartIcon className="h-4 w-4" />
                    </button>
                    {addStatuses[productId] && (
                      <p className="text-center text-xs text-gray-600">
                        {addStatuses[productId]}
                      </p>
                    )}
                  </div>
                )}
              </>
            )

            if (!productId) {
              return (
                <div
                  key={item.name}
                  className="rounded-xl bg-white p-4 shadow opacity-80"
                  title="Нет ID товара для перехода"
                >
                  <CardContent />
                </div>
              )
            }

            return (
              <div
                key={productId ?? item.name}
                className="rounded-xl bg-white p-4 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link
                  href={`/product/${productId}`}
                  className="block"
                  title="Посмотреть детали товара"
                >
                  <div className="pointer-events-none">
                    {item.photos && item.photos[0] ? (
                      <img
                        src={normalizePhoto(item.photos[0])}
                        alt={item.name}
                        className="mb-3 h-48 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mb-3 flex h-48 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        Нет фото
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      {item.price !== undefined && (
                        <span className="text-lg font-bold text-rose-600">{item.price} ₸</span>
                      )}
                      {item.oldPrice !== undefined && (
                        <span className="text-sm text-gray-400 line-through">{item.oldPrice} ₸</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={(e) => handleAddToCart(productId, e)}
                    disabled={addingStates[productId]}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {addingStates[productId] ? 'Добавление...' : 'Добавить в корзину'}
                    <CartIcon className="h-4 w-4" />
                  </button>
                  {addStatuses[productId] && (
                    <p className="text-center text-xs text-gray-600">
                      {addStatuses[productId]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {!items.length && (
            <div className="col-span-full rounded-lg bg-white p-4 text-center text-sm text-gray-500 shadow">
              Товары не найдены
            </div>
          )}
        </div>
      )}
    </section>
  )
}
