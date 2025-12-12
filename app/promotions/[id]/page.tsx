'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

type Promotion = {
  promotion_id: number
  name: string
  description: string
  photos: string[]
  percentageDiscounted: number
  global: boolean
  catalogId: number | null
  productId: number | null
  startDate: string
  endDate: string
}

export default function PromotionPage() {
  const { id } = useParams()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchPromotion = async () => {
      try {
        const res = await fetch(`http://185.146.3.132:8080/api/v1/auth/promotion/${id}`)
        if (!res.ok) throw new Error('Failed to fetch promotion')
        const data = await res.json()
        setPromotion(data)
      } catch (err) {
        setError('Не удалось загрузить акцию')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotion()
  }, [id])

  if (loading) return <div className="p-10 text-center">Загрузка...</div>
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>
  if (!promotion) return <div className="p-10 text-center">Акция не найдена</div>

  const mainPhoto = promotion.photos && promotion.photos.length > 0 
    ? `http://185.146.3.132:8080${promotion.photos[0]}` 
    : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-900">
        ← На главную
      </Link>
      
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        {mainPhoto && (
          <div className="relative h-64 w-full md:h-96">
            <Image
              src={mainPhoto}
              alt={promotion.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white md:bottom-10 md:left-10">
               <span className="mb-2 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                -{promotion.percentageDiscounted}% Скидка
              </span>
              <h1 className="text-3xl font-bold md:text-5xl">{promotion.name}</h1>
            </div>
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Описание</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">{promotion.description}</p>
              </div>

               <div className="rounded-xl bg-gray-50 p-6 border border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600"> 
                    <div>
                        <p className="font-medium text-gray-900">Дата начала</p>
                        <p>{promotion.startDate}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                     <div>
                        <p className="font-medium text-gray-900">Дата окончания</p>
                        <p>{promotion.endDate}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Действия</h3>
              {promotion.catalogId && (
                <Link 
                  href={`/catalog/${promotion.catalogId}`}
                  className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Перейти в каталог
                </Link>
              )}
               {promotion.productId && (
                <Link 
                  href={`/product/${promotion.productId}`}
                  className="flex w-full items-center justify-center rounded-xl border-2 border-gray-900 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Смотреть товар
                </Link>
              )}
               {!promotion.catalogId && !promotion.productId && (
                 <p className="text-sm text-gray-500">Эта акция распространяется на множество товаров. Смотрите каталог для подробностей.</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
