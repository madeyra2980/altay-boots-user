'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Loading from '../../components/ui/Loading'

interface PromotionPhoto {
  photo_id: number
  photoURL: string
}

type Promotion = {
  promotion_id: number
  name: string
  description: string
  photos: PromotionPhoto[]
  percentageDiscounted: number
  global: boolean
  catalogId: number | null
  productId: number | null
  startDate: string
  endDate: string
}

const MONTHS_RU: { [key: number]: string } = {
  0: 'Января',
  1: 'Февраля',
  2: 'Марта',
  3: 'Апреля',
  4: 'Мая',
  5: 'Июня',
  6: 'Июля',
  7: 'Августа',
  8: 'Сентября',
  9: 'Октября',
  10: 'Ноября',
  11: 'Декабря',
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const month = MONTHS_RU[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
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
        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800))
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

  if (loading) return <Loading fullScreen />

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Ошибка</h2>
        <p className="text-stone-600">{error}</p>
        <Link href="/" className="inline-block mt-6 px-4 py-2 bg-stone-900 text-white rounded-md hover:bg-orange-600 transition-colors">
          На главную
        </Link>
      </div>
    </div>
  )

  if (!promotion) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-stone-900">Акция не найдена</h2>
        <Link href="/" className="text-orange-600 hover:underline mt-4 inline-block">Вернуться в магазин</Link>
      </div>
    </div>
  )

  const getPhotoUrl = (photo: PromotionPhoto | undefined) => {
    if (!photo || !photo.photoURL) return null
    const photoPath = photo.photoURL
    if (photoPath.startsWith('http')) return photoPath
    const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`
    return `http://185.146.3.132:8080${cleanPath}`
  }

  const mainPhoto = promotion.photos && promotion.photos.length > 0
    ? getPhotoUrl(promotion.photos[0])
    : null

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors mb-8 group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          На главную
        </Link>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          {mainPhoto && (
            <div className="relative h-[400px] sm:h-[500px] w-full group">
              <Image
                src={mainPhoto}
                alt={promotion.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

              <div className="absolute top-6 left-6 z-10">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-600/90 text-white font-bold text-sm shadow-lg backdrop-blur-sm border border-orange-500/50">
                  -{promotion.percentageDiscounted}% Скидка
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2">
                  {promotion.name}
                </h1>
              </div>
            </div>
          )}

          <div className="p-8 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    Описание
                  </h2>
                  <p className="text-lg text-stone-600 leading-relaxed whitespace-pre-line">
                    {promotion.description}
                  </p>
                </div>

                <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                  <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Период проведения</h3>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Дата начала</p>
                        <p className="text-stone-900 font-bold">{formatDate(promotion.startDate)}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px bg-stone-200 self-center h-8"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 font-medium">Дата окончания</p>
                        <p className="text-stone-900 font-bold">{formatDate(promotion.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-stone-900 rounded-xl p-6 text-white shadow-2xl shadow-stone-900/20">
                  <h3 className="text-xl font-bold mb-6">Действия</h3>
                  <div className="space-y-4">
                    {promotion.catalogId && (
                      <Link
                        href={`/catalog/${promotion.catalogId}`}
                        className="block w-full text-center px-6 py-3 bg-white text-stone-900 font-bold rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                      >
                        Перейти в каталог
                      </Link>
                    )}
                    {promotion.productId && (
                      <Link
                        href={`/product/${promotion.productId}`}
                        className="block w-full text-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all shadow-lg"
                      >
                        Смотреть товар
                      </Link>
                    )}
                    {!promotion.catalogId && !promotion.productId && (
                      <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                        <p className="text-stone-300 text-sm leading-relaxed">
                          Эта акция распространяется на множество товаров. Перейдите в общий каталог для подробностей.
                        </p>
                        <Link
                          href="/"
                          className="inline-block mt-4 text-orange-400 hover:text-white font-medium text-sm transition-colors border-b border-orange-400/50 hover:border-white"
                        >
                          Перейти в магазин →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
