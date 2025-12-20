'use client'

import { useEffect, useState, useRef } from 'react'
import ProductCard, { type Product } from './ProductCard'

const ITEMS_PER_PAGE = 16

const API_URL = '/api/products'

export default function ProductsGrid() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const gridRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    setCurrentPage(1)
  }, [minPrice, maxPrice])

  const filteredItems = items.filter(item => {
    const price = item.price || 0
    const min = minPrice === '' ? 0 : parseFloat(minPrice)
    const max = maxPrice === '' ? Infinity : parseFloat(maxPrice)
    return price >= min && price <= max
  })

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section ref={gridRef} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-stone-50 scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 border-l-4 border-orange-500 pl-4 mb-2">Все товары</h2>
          <div className="text-sm text-stone-500">{filteredItems.length} {filteredItems.length === items.length ? 'товаров' : 'найдено'}</div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200 ring-4 ring-stone-50/50">
          <div className="flex items-center gap-2 text-stone-900 font-bold px-1">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm uppercase tracking-widest">Фильтр по цене</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[120px]">
              <div className="relative group">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="От 0 ₸"
                  className="w-full h-12 rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 text-sm font-medium text-stone-900 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="text-stone-300 font-bold">—</div>

            <div className="flex-1 min-w-[120px]">
              <div className="relative group">
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="До 999 999 ₸"
                  className="w-full h-12 rounded-2xl border-2 border-stone-100 bg-stone-50 px-4 text-sm font-medium text-stone-900 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 placeholder:text-stone-400"
                />
              </div>
            </div>

            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="flex items-center gap-2 h-12 px-5 text-orange-600 font-bold text-xs uppercase tracking-wider hover:bg-orange-50 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-orange-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Сбросить
              </button>
            )}
          </div>
        </div>
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
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {currentItems.map((item) => (
              <ProductCard
                key={item.product_id ?? item.name}
                item={item}
              />
            ))}

            {!filteredItems.length && !loading && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
                <div className="mx-auto w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-stone-900 font-bold mb-1">Ничего не найдено</h3>
                <p className="text-stone-500 text-sm">Попробуйте изменить параметры фильтрации</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-200 ${currentPage === 1
                  ? 'border-transparent text-stone-300 cursor-not-allowed'
                  : 'border-stone-200 text-stone-600 hover:border-orange-500 hover:text-orange-500'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  const isActive = currentPage === page

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all duration-300 transform active:scale-90 ${isActive
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110'
                        : 'bg-white border-2 border-stone-100 text-stone-500 hover:border-orange-200 hover:text-orange-500'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-200 ${currentPage === totalPages
                  ? 'border-transparent text-stone-300 cursor-not-allowed'
                  : 'border-stone-200 text-stone-600 hover:border-orange-500 hover:text-orange-500'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
