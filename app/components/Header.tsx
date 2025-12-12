'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
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

const Header = () => {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const serverSnapshot = { isAuthed: false, userId: '', cartCount: 0 }

  const snapshotRef = useRef(serverSnapshot)

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

  const getClientSnapshot = () => {
    if (typeof window === 'undefined') return serverSnapshot

    const next = {
      isAuthed: Boolean(localStorage.getItem('token')),
      userId: localStorage.getItem('userId') || '',
      cartCount: Number(localStorage.getItem('cartCount') || '0') || 0,
    }

    const cached = snapshotRef.current
    if (
      cached.isAuthed !== next.isAuthed ||
      cached.userId !== next.userId ||
      cached.cartCount !== next.cartCount
    ) {
      snapshotRef.current = next
    }

    return snapshotRef.current
  }

  const getServerSnapshot = () => serverSnapshot

  const subscribe = (listener: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const handler = () => listener()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }

  const { isAuthed, userId, cartCount } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('cartCount')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  }

  return (
    <header className="relative w-full overflow-hidden text-white bg-gradient-to-r from-[#b7002b]/90 via-[#e00035]/85 to-[#ff0040]/80">
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-multiply"
        style={{
          backgroundImage: company?.photoURL 
            ? `url(${normalizePhoto(company.photoURL)})` 
            : "url('https://www.shutterstock.com/image-photo/man-boots-deep-snow-winter-260nw-2341564623.jpg')"
        }}
      />
      <div className="absolute inset-0" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
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
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold leading-tight md:text-3xl">
                {company?.name || 'ALTAY BOOTS'}
              </span>
            </div>
          </div>

          <nav className="rounded-full bg-black/30 px-5 py-2 text-xs font-medium uppercase tracking-wide shadow md:px-8 md:text-sm">
            <ul className="flex flex-wrap items-center gap-4 md:gap-6">
              <li>
                <Link href="/" className="transition hover:text-yellow-300">
                  Главная
                </Link>
              </li>
           
              <li>
                <Link href="/basket" className="group relative inline-flex items-center gap-2 transition hover:text-yellow-300">
                  <span>Корзина</span>
                  {cartCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-300 px-2 text-xs font-bold text-black transition group-hover:scale-105">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="transition hover:text-yellow-300">
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="transition hover:text-yellow-300">
                  Контакты
                </Link>
              </li>
              <li>
                {isAuthed ? (
                  <div className="flex items-center gap-3">
                    {userId && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                        {userId}
                      </span>
                    )}
                    <button
                      onClick={handleLogout}
                      className="rounded-full border border-white/40 px-4 py-1 text-xs font-semibold uppercase tracking-wide transition hover:border-yellow-300 hover:text-yellow-300"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <Link href="/signin" className="transition hover:text-yellow-300">
                    Войти
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>

        <div className="max-w-lg space-y-2 text-left uppercase leading-tight">
          <p className="text-2xl font-extrabold md:text-3xl lg:text-4xl">
            {company?.text || 'Брендовые ботинки'}
          </p>
          <p className="text-xl font-bold md:text-2xl lg:text-3xl text-yellow-300">
            {company?.city && company?.base && `${company.city}, ${company.base}`}
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header