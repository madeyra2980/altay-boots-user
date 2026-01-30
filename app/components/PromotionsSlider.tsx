'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '../i18n/LanguageContext'

interface PromotionPhoto {
  photo_id: number
  photoURL: string
}

interface Promotion {
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

const PromotionsSlider = () => {
  const { t } = useLanguage()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('/api/promotions')

        // Безопасный парсинг JSON (защита от пустого ответа)
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          // If it's 403 or 401, we just treat it as no promotions available for the current user/guest
          if (response.status === 403 || response.status === 401) {
            setPromotions([])
            return
          }
          console.error('Error fetching promotions: Server returned', response.status)
          return
        }

        if (data && Array.isArray(data)) {
          setPromotions(data)
        }
      } catch (error) {
        console.error('Error fetching promotions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  // ... (keep existing interval logic)
  useEffect(() => {
    if (promotions.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [promotions.length])

  // ... (keep existing navigation functions)
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  const getImageUrl = (photo: PromotionPhoto | undefined) => {
    if (!photo || !photo.photoURL) return null;
    const path = photo.photoURL;
    if (path.startsWith('http')) return path;

    // Очищаем путь: оставляем только то, что начинается с /uploads
    const idx = path.indexOf("/uploads");
    if (idx !== -1) {
      return `http://185.146.3.132:8080${path.slice(idx)}`;
    }

    // Ensure there is a slash between base URL and path if missing
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://185.146.3.132:8080${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-stone-100 animate-pulse flex items-center justify-center">
        <div className="text-stone-300">Загрузка акций...</div>
      </div>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-white group">
      {/* Slides */}
      <div className="relative w-full h-full">
        {promotions.map((promotion, index) => {
          const imageUrl = promotion.photos && promotion.photos.length > 0 ? getImageUrl(promotion.photos[0]) : null;

          return (
            <div
              key={promotion.promotion_id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <Link href={`/promotions/${promotion.promotion_id}`} className="block w-full h-full relative cursor-pointer">
                {/* Padding wrapper to match header alignment */}
                <div className="h-full px-4 sm:px-6 lg:px-8">
                  {/* Centered Container matching header width */}
                  <div className="mx-auto max-w-7xl h-full relative">
                    {/* Background Image */}
                    {imageUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imageUrl}
                          alt={promotion.name}
                          fill
                          className="object-cover object-center"
                          priority={index === 0}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                        <span className="text-stone-600">No Image</span>
                      </div>
                    )}

                    {/* Discount Badge - Positioned inside the centered container */}
                    {/* Немного сдвигаем вправо, чтобы бейдж не прилипал к самому краю */}
                    <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20">
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-600/90 backdrop-blur-sm border border-orange-500/50 text-white text-sm font-semibold shadow-lg shadow-orange-900/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span>-{promotion.percentageDiscounted}% Скидка</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {promotions.length > 1 && (
        <>
          <button
    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
    className="absolute left-10 sm:left-24 lg:left-40 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/70 backdrop-blur-md text-black hover:bg-white/90 transition-all border border-black/10 shadow-lg"
    aria-label="Previous slide"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Оң жақ батырма - right мәнін үлкейттік, ортаға жақындады */}
  <button
    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
    className="absolute right-10 sm:right-24 lg:right-40 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/70 backdrop-blur-md text-black hover:bg-white/90 transition-all border border-black/10 shadow-lg"
    aria-label="Next slide"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
        </>
      )}

      {/* Dots Navigation */}
      {promotions.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/50 hover:bg-white'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PromotionsSlider
