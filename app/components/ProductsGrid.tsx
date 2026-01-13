'use client'

import { useEffect, useState } from 'react'
import ProductCard, { type Product } from './ProductCard'
import { useLanguage } from '../i18n/LanguageContext'

const API_URL = '/api/products'

export default function ProductsGrid() {
  const { t } = useLanguage()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 16

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

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-stone-50">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 border-l-4 border-orange-500 pl-4">{t('home.allProducts')}</h2>
        <div className="hidden sm:block text-sm text-stone-500">{items.length} {t('common.items')}</div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {[...Array(itemsPerPage)].map((_, i) => (
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

            {!items.length && !loading && (
              <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-xl border border-dashed border-stone-300">
                {t('home.noProducts')}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-stone-600 transition-all"
                aria-label="Предыдущая страница"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  // Logic to show only some page numbers if there are too many
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 2
                  ) {
                    if (page === 2 && currentPage > 4) return <span key="dots1" className="px-2 text-stone-400">...</span>
                    if (page === totalPages - 1 && currentPage < totalPages - 3) return <span key="dots2" className="px-2 text-stone-400">...</span>
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                          : 'text-stone-600 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-stone-600 transition-all"
                aria-label="Следующая страница"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
