'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
    const photoPath = photo.photoURL;
    if (photoPath.startsWith('http')) return photoPath;
    // Ensure there is a slash between base URL and path if missing
    const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
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
    <div className="relative w-full h-[600px] overflow-hidden bg-stone-900 group">
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
                {/* Background Image */}
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={promotion.name}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-transparent to-transparent opacity-60" />
                  </>
                ) : (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                    <span className="text-stone-600">No Image</span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-white space-y-6 animate-fade-in-up">
                      {/* Discount Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 backdrop-blur-sm border border-orange-500/50 text-white text-sm font-semibold shadow-lg shadow-orange-900/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span>-{promotion.percentageDiscounted}% Скидка</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
                        {promotion.name}
                      </h2>

                      {/* Description */}
                      <p className="text-lg sm:text-xl text-stone-200 line-clamp-2 max-w-xl leading-relaxed drop-shadow-sm">
                        {promotion.description}
                      </p>

                      {/* Dates & CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-8">
                        <button className="px-8 py-3 bg-white text-stone-900 font-bold rounded-lg hover:bg-stone-100 transition-colors shadow-xl">
                          Подробнее
                        </button>
                        <div className="flex flex-col gap-1 text-xs text-stone-400 font-medium bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span>Начало: {formatDate(promotion.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <span>Конец: {formatDate(promotion.endDate)}</span>
                          </div>
                        </div>
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
