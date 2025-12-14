'use client'

import React, { useEffect, useState } from 'react'
import { getCatalogs, Catalog } from '../service/CatalogService'
import Link from 'next/link'
import Loading from '../components/ui/Loading'

export default function CatalogsPage() {
    const [catalogs, setCatalogs] = useState<Catalog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const data = await getCatalogs()
                setCatalogs(data)
            } catch (error) {
                console.error('Failed to load catalogs', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCatalogs()
    }, [])

    if (loading) {
        return <Loading fullScreen />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-stone-900 mb-3 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        Каталоги товаров
                    </h1>
                    <p className="text-stone-600">Выберите категорию для просмотра</p>
                </div>

                {/* Catalog List */}
                <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
                    {catalogs.length > 0 ? (
                        <nav>
                            <ul className="divide-y divide-stone-100">
                                {catalogs.map((catalog, index) => (
                                    <li key={catalog.catalog_id}>
                                        <Link
                                            href={`/catalog/${catalog.catalog_id}`}
                                            className="group flex items-center justify-between px-8 py-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-300 transform hover:scale-[1.02]"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Icon */}
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>

                                                {/* Catalog Name */}
                                                <div>
                                                    <h3 className="text-xl font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                                                        {catalog.name}
                                                    </h3>
                                                    <p className="text-sm text-stone-500">Нажмите для просмотра товаров</p>
                                                </div>
                                            </div>

                                            {/* Arrow Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 group-hover:bg-orange-100 transition-all duration-300 group-hover:translate-x-1">
                                                <svg className="w-5 h-5 text-stone-400 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ) : (
                        <div className="px-8 py-16 text-center text-stone-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-lg font-medium">Каталоги пока не добавлены</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
