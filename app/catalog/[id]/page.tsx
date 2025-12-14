'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductCard from '@/app/components/ProductCard'
import { getCatalogProducts, type CatalogProduct } from '@/app/service/CatalogService'

export default function CatalogPage() {
    const params = useParams()
    const router = useRouter()
    const catalogId = params.id ? Number(params.id) : null

    const [products, setProducts] = useState<CatalogProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (catalogId === null) {
            setError('Неверный ID каталога')
            setLoading(false)
            return
        }

        const fetchProducts = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getCatalogProducts(catalogId)
                setProducts(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки продуктов')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [catalogId])

    return (
        <main className="min-h-screen bg-stone-50">
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Header with Back Button */}
                <div className="mb-10">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 text-sm text-stone-600 hover:text-orange-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Назад к каталогам
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900 border-l-4 border-orange-500 pl-4">
                            Товары каталога
                        </h1>
                        {!loading && !error && (
                            <div className="hidden sm:block text-sm text-stone-500">
                                {products.length} {products.length === 1 ? 'товар' : 'товаров'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] rounded-lg bg-stone-200 animate-pulse"></div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-center text-red-700 ring-1 ring-red-200">
                        <p className="font-medium">Упс! {error}</p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                item={product}
                            />
                        ))}

                        {products.length === 0 && (
                            <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-xl border border-dashed border-stone-300">
                                <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-lg font-medium">В этом каталоге пока нет товаров</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}
