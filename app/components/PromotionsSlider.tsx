'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Promotion {
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

const PromotionsSlider = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('http://185.146.3.132:8080/api/v1/auth/promotions')
        const data = await response.json()
        setPromotions(data)
      } catch (error) {
        console.error('Error fetching promotions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  useEffect(() => {
    if (promotions.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 5000) // Auto-slide every 5 seconds

    return () => clearInterval(interval)
  }, [promotions.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (promotions.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 py-8">
      <div className="mx-auto  px-4">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Slides */}
          <div className="relative h-64 md:h-80 lg:h-96">
            {promotions.map((promotion, index) => (
              <div
                key={promotion.promotion_id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100'
                    : index < currentSlide
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
              >
                  <Link href={`/promotions/${promotion.promotion_id}`} className="relative block h-full w-full cursor-pointer">
                  {/* Background Image */}
                  {promotion.photos && promotion.photos.length > 0 && (
                    <div className="absolute inset-0">
                      <Image
                        src={`http://185.146.3.132:8080${promotion.photos[0]}`}
                        alt={promotion.name}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-12 lg:px-16">
                    <div className="max-w-2xl space-y-4">
                      {/* Discount Badge */}
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-6 py-2 text-white shadow-lg">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-2xl font-extrabold">
                          -{promotion.percentageDiscounted}%
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                        {promotion.name}
                      </h2>

                      {/* Description */}
                      <p className="text-lg text-gray-200 md:text-xl">
                        {promotion.description}
                      </p>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Начало: {promotion.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Конец: {promotion.endDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {promotions.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Previous slide"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next slide"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {promotions.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromotionsSlider
