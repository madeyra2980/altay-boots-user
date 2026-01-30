'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import logo from '../utils/logo.jpg'

type CompanyData = {
  company_id: number
  name: string
  text: string
  photoURL: string
  base: string
  city: string
  street?: string
  phone?: string
  email?: string
}

const normalizePhoto = (url?: string) => {
  if (!url) return logo
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}

const Footer = () => {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const year = new Date().getFullYear()

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch('http://185.146.3.132:8080/api/v1/auth/company')
        
        if (!res.ok) {
          console.warn('Company API response not OK:', res.status, res.statusText)
          return
        }
        
        const text = await res.text()
        if (!text.trim()) {
          console.warn('Company API returned empty response')
          return
        }
        
        try {
          const data = JSON.parse(text)
          setCompany(data)
        } catch (parseError) {
          console.error('Failed to parse company data as JSON:', parseError, 'Response:', text)
        }
      } catch (error) {
        console.error('Error fetching company data:', error)
      }
    }

    fetchCompany()
  }, [])

  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">

          {/* Brand Column */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-3">

              <span className="text-xl font-bold tracking-tight text-white">
                {company?.name || 'Altay Boots'}
              </span>
            </div>
            <p className="text-sm leading-6 text-stone-400 max-w-xs">
              {company?.text || 'Создаем обувь, которая соединяет традиции качества с современным комфортом.'}
            </p>
            {company?.city && (company?.street || company?.base) && (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                {[company.city, company.street || company.base].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Навигация</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/" className="text-sm leading-6 hover:text-orange-500 transition-colors">Главная</Link>
                  </li>
                  <li>
                    <Link href="/my-orders" className="text-sm leading-6 hover:text-orange-500 transition-colors">Мои заказы</Link>
                  </li>
                  <li>
                    <Link href="/contacts" className="text-sm leading-6 hover:text-orange-500 transition-colors">О нас</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Аккаунт</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/signin" className="text-sm leading-6 hover:text-orange-500 transition-colors">Войти</Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-sm leading-6 hover:text-orange-500 transition-colors">Регистрация</Link>
                  </li>
                  <li>
                    <Link href="/basket" className="text-sm leading-6 hover:text-orange-500 transition-colors">Корзина</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Контакты</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {(company?.city || company?.street || company?.base) && (
                    <li className="flex items-start gap-2">
                      <svg className="h-4 w-4 text-stone-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      <span className="text-sm leading-6 text-stone-400">
                        {[company?.city, company?.street || company?.base].filter(Boolean).join(', ')}
                      </span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    <a href={`tel:${company?.phone || '+77752794489'}`} className="text-sm leading-6 hover:text-white transition-colors">{company?.phone || '+7 775 279 44 89'}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-stone-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    <a href={`https://api.whatsapp.com/send?phone=${company?.phone?.replace(/\s/g, '') || '77752794489'}`} target="_blank" rel="noopener noreferrer" className="text-sm leading-6 hover:text-white transition-colors">Написать на WhatsApp</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    <a href={`mailto:${company?.email || 'altayboots@gmail.com'}`} className="text-sm leading-6 hover:text-white transition-colors">{company?.email || 'altayboots@gmail.com'}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-stone-800 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs leading-5 text-stone-500">
            &copy; {year} {company?.name || 'Altay Boots'}. Все права защищены.
          </p>
          <div className="flex gap-6 text-xs text-stone-600 font-medium tracking-wide uppercase">
            <span>Зимняя коллекция</span>
            <span>Доставка по Казахстану</span>
            <span>Ручная работа</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
