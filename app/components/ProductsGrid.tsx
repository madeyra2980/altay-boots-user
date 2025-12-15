'use client'

import { useEffect, useState } from 'react'
import ProductCard, { type Product } from './ProductCard'

const API_URL = '/api/products'

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

        // Безопасный парсинг JSON (защита от пустого ответа)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(data?.message || `Ошибка сервера: ${res.status}`)
        }

        if (!data) {
          throw new Error('Сервер вернул пустой ответ')
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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-stone-50">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 border-l-4 border-orange-500 pl-4">Все товары</h2>
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
          {items.map((item) => (
            <ProductCard
              key={item.product_id ?? item.name}
              item={item}
            />
          ))}

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
