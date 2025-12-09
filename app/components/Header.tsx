'use client'

import Link from 'next/link'
import React, { useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'
import logo from '../utils/logo.jpg'

const Header = () => {
  const serverSnapshot = { isAuthed: false, userName: '' }

  const snapshotRef = useRef(serverSnapshot)

  const getClientSnapshot = () => {
    if (typeof window === 'undefined') return serverSnapshot

    const next = {
      isAuthed: Boolean(localStorage.getItem('token')),
      userName: localStorage.getItem('userName') || '',
    }

    const cached = snapshotRef.current
    if (
      cached.isAuthed !== next.isAuthed ||
      cached.userName !== next.userName
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

  const { isAuthed, userName } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    // force re-render by touching storage event: update dummy key
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  }

  return (
    <header className="relative w-full overflow-hidden text-white bg-gradient-to-r from-[#b7002b]/90 via-[#e00035]/85 to-[#ff0040]/80">
      <div className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-multiply bg-[url('https://www.shutterstock.com/image-photo/man-boots-deep-snow-winter-260nw-2341564623.jpg')]" />
      <div className="absolute inset-0" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        {/* Top row: logo + brand, navigation */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
          <div className="flex h-36 w-36 items-center justify-center rounded-full">
              <Image
                src={logo}
                alt="Altay Boots"

                className="h-full w-full border-2  rounded-full"
              />
            </div>
            <div className="flex flex-col">
     
              <span className="text-2xl font-extrabold leading-tight md:text-3xl">
                ALTAY <span className="block md:inline">BOOTS</span>
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
                <Link href="/aboutus" className="transition hover:text-yellow-300">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/basket" className="transition hover:text-yellow-300">
                  Корзина
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
                    {userName && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                        {userName}
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
            Брендовые ботинки
          </p>
          <p className="text-2xl font-extrabold md:text-3xl lg:text-4xl">
            <span className="text-yellow-300">Лучшее</span>{' '}
            <span className="text-yellow-300">качество</span>
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header