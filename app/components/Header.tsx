'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import logo from '../utils/logo.jpg'
import Loading from './ui/Loading'
import { getCatalogs, Catalog } from '../service/CatalogService'

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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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

    const fetchCatalogs = async () => {
      try {
        const data = await getCatalogs()
        setCatalogs(data)
      } catch (error) {
        console.error('Error fetching catalogs:', error)
      }
    }

    fetchCompany()
    fetchCatalogs()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCatalogDropdown(false)
      }
    }

    if (showCatalogDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCatalogDropdown])

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
    if (typeof window === 'undefined') return () => { }
    const handler = () => listener()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }

  const { isAuthed, userId, cartCount } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Artificial delay for "liveness"
    await new Promise(resolve => setTimeout(resolve, 3000))

    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('cartCount')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
    setIsLoggingOut(false)
    window.location.href = '/'
  }

  return (
    <>
      {isLoggingOut && <Loading fullScreen />}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        {/* Top Bar - decorative or utility */}
        <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center tracking-wide uppercase">
          <p>{company?.text || 'Premium Handcrafted Boots'}</p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg shadow-inner ring-1 ring-stone-900/10">
                  {company?.photoURL ? (
                    <img
                      src={normalizePhoto(company.photoURL)}
                      alt='Company Logo'
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full bg-orange-600 flex items-center justify-center text-white font-bold">AB</div>
                  )}
                </div>
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-orange-700 transition-colors">
                  {company?.name || 'ALTAY BOOTS'}
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors">
                Главная
              </Link>

              {/* Catalog Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowCatalogDropdown(!showCatalogDropdown)}
                  onMouseEnter={() => setShowCatalogDropdown(true)}
                  className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors flex items-center gap-1"
                >
                  Каталоги
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${showCatalogDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showCatalogDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setShowCatalogDropdown(false)}
                  >
                    {catalogs.length > 0 ? (
                      <ul className="py-2">
                        {catalogs.map((catalog) => (
                          <li key={catalog.catalog_id}>
                            <Link
                              href={`/catalog/${catalog.catalog_id}`}
                              className="block px-6 py-3 hover:bg-orange-50 transition-colors group"
                              onClick={() => setShowCatalogDropdown(false)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white group-hover:scale-110 transition-transform">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                                    {catalog.name}
                                  </p>
                                  <p className="text-xs text-stone-500">Нажмите для просмотра товаров</p>
                                </div>
                                <svg className="w-4 h-4 text-stone-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-6 py-8 text-center text-stone-500">
                        <p className="text-sm">Каталоги пока не добавлены</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/my-orders" className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors">
                Мои заказы
              </Link>
              <Link href="/contacts" className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors">
                Контакты
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-6">
              <Link href="/basket" className="group relative flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors">
                <span className="sr-only">Корзина</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="border-l border-stone-200 h-6 mx-1"></div>

              {isAuthed ? (
                <div className="flex items-center gap-3">
                  {userId && (
                    <span className="hidden lg:block text-xs font-medium text-stone-400">
                      {userId}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold text-stone-900 hover:text-orange-600 transition-colors"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <Link href="/signin" className="text-sm font-semibold text-stone-900 hover:text-orange-600 transition-colors">
                  Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}


export default Header