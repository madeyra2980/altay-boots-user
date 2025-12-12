'use client'

import { useEffect, useState } from 'react'

type CompanyData = {
  company_id: number
  name: string
  text: string
  photoURL: string
  base: string
  city: string
}

const normalizePhoto = (url?: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}

export default function ContactsPage() {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch('http://185.146.3.132:8080/api/v1/auth/company')
        const data = await res.json()
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 bg-stone-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-stone-200 rounded-2xl"></div>
            <div className="h-64 bg-stone-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Контакты
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Свяжитесь с нами удобным для вас способом. Мы всегда рады помочь вам с выбором и ответить на любые вопросы.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 border-b border-stone-100 pb-8">
                {company?.photoURL && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200">
                    <img
                      src={normalizePhoto(company.photoURL)}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {company?.name || 'Altay Boots'}
                  </h2>
                  <p className="mt-1 text-stone-500">
                    {company?.text || 'Качественная обувь ручной работы'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {company?.city && company?.base && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg text-orange-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">Адрес офиса</h3>
                      <p className="text-stone-600 mt-1">{company.city}, {company.base}</p>
                      <p className="text-stone-500 text-sm">Казахстан</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">Телефон</h3>
                      <a href="tel:+77770000000" className="block text-stone-600 mt-1 hover:text-orange-600 transition-colors">
                        +7 777 000 00 00
                      </a>
                      <span className="text-xs text-stone-400">Пн-Вс 9:00-20:00</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">Email</h3>
                      <a href="mailto:hello@altayboots.kz" className="block text-stone-600 mt-1 hover:text-orange-600 transition-colors">
                        hello@altayboots.kz
                      </a>
                      <span className="text-xs text-stone-400">По всем вопросам</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours & Support Card */}
          <div className="space-y-8">
            <div className="bg-stone-900 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
               {/* Decorative Circle */}
               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-orange-500 rounded-full opacity-10 blur-2xl"></div>
               
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Часы работы
              </h2>
              
              <div className="space-y-4 text-stone-300">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span>Понедельник - Пятница</span>
                  <span className="font-medium text-white">9:00 - 20:00</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span>Суббота</span>
                  <span className="font-medium text-white">10:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Воскресенье</span>
                  <span className="font-medium text-white">10:00 - 16:00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Нужна помощь?</h3>
              <p className="text-stone-600 mb-6">
                Наши специалисты готовы ответить на все ваши вопросы и помочь с выбором идеальной пары обуви.
              </p>
              <button className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
                Написать в WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Мы в социальных сетях</h2>
          <p className="text-stone-500 mb-8">Следите за новинками и акциями</p>
          
          <div className="flex justify-center gap-6">
            <a href="#" className="p-4 bg-white rounded-full text-stone-400 hover:text-pink-600 hover:shadow-lg transition-all border border-stone-200">
              <span className="sr-only">Instagram</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="p-4 bg-white rounded-full text-stone-400 hover:text-blue-500 hover:shadow-lg transition-all border border-stone-200">
              <span className="sr-only">Facebook</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="p-4 bg-white rounded-full text-stone-400 hover:text-blue-400 hover:shadow-lg transition-all border border-stone-200">
              <span className="sr-only">Telegram</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
