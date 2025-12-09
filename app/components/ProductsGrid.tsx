'use client'

import { useEffect, useState } from 'react'

type Product = {
  id?: number
  name: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: string[]
}

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/products'

export default function ProductsGrid() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const data = await res.json().catch(() => [])
        if (!res.ok) {
          const message = (data && data.message) || 'Не удалось загрузить товары'
          throw new Error(message)
        }
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Каталог товаров</h2>
        <p className="text-sm text-gray-500">Данные с API: /api/v1/user/products</p>
      </div>

      {loading && <div className="rounded-lg bg-white p-4 shadow">Загрузка...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id ?? item.name}
              className="rounded-xl bg-white p-4 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              {item.photos && item.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photos[0]}
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
          ))}

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

