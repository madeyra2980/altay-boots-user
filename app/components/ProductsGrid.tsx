'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/products'

type Product = {
  id?: number
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
              typeof item.id === 'number'
                ? item.id
                : typeof item.catalog_id === 'number'
                  ? item.catalog_id
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
              <Link
                key={productId ?? item.name}
                href={`/product/${productId}`}
                className="block rounded-xl bg-white p-4 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
                title="Посмотреть детали товара"
              >
                <CardContent />
              </Link>
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

