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
}

const normalizePhoto = (url?: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}

const Footer = () => {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const year = new Date().getFullYear()

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch('http://185.146.3.132:8080/api/v1/auth/company')
        const data = await res.json()
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company data:', error)
      }
    }

    fetchCompany()
  }, [])

  return (
    <footer className="relative mt-12 w-full overflow-hidden text-white bg-gradient-to-r from-[#b7002b]/90 via-[#e00035]/85 to-[#ff0040]/80">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-multiply"
        style={{
          backgroundImage: company?.photoURL 
            ? `url(${normalizePhoto(company.photoURL)})` 
            : "url('https://www.shutterstock.com/image-photo/man-boots-deep-snow-winter-260nw-2341564623.jpg')"
        }} 
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr,1fr,1fr]">
          <div className="flex items-start gap-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 p-1">
              {company?.photoURL ? (
                <Image
                  src={logo}
                  alt='Company Logo'
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-white/20 animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-extrabold uppercase leading-tight">
                {company?.name || 'Altay Boots'}
              </p>
              <p className="text-sm text-white/80">
                {company?.text || 'Тепло, надежность и комфорт в любой погоде.'}
              </p>
              {company?.city && company?.base && (
                <p className="text-xs text-white/70">
                  {company.city}, {company.base}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Навигация
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/" className="transition hover:text-yellow-300">
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="transition hover:text-yellow-300"
                >
                  Каталог
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="transition hover:text-yellow-300"
                >
                  Войти
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="transition hover:text-yellow-300"
                >
                  Зарегистрироваться
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Контакты
            </p>
            <div className="space-y-2 text-sm text-white/80">
              <p className="leading-tight">
                Телефон: <a href="tel:+77770000000" className="hover:text-yellow-300">+7 777 000 00 00</a>
              </p>
              <p className="leading-tight">
                Почта:{" "}
                <a
                  href="mailto:hello@altayboots.kz"
                  className="hover:text-yellow-300"
                >
                  hello@altayboots.kz
                </a>
              </p>
              {company?.city && (
                <p className="leading-tight">
                  Адрес: {company.city}, Казахстан
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/20 pt-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {year} {company?.name || 'Altay Boots'}. Все права защищены.</p>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Зимняя коллекция
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Доставка по Казахстану
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Ручная выделка кожи
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
