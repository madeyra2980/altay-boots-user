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
        const data = await res.json()
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company data:', error)
      }
    }

    fetchCompany()
  }, [])

  return (
    <footer className="relative bg-stone-950 text-stone-400 overflow-hidden">
      {/* Decorative Top Border with Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.3)]" />

      {/* Subtle Background Accent */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-stone-100/5 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-12">

          {/* Brand Column */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                {company?.name ? company.name.replace('-boots', '') : 'Altay'}
                <span className="text-orange-600 not-italic">.</span>
                <span className="text-lg font-light tracking-widest text-stone-500 not-italic ml-1">BOOTS</span>
              </span>
            </div>

            <p className="text-base text-stone-400 leading-relaxed font-light">
              {company?.text || 'Создаем обувь, которая соединяет древние традиции качества с современным комфортом и стилем.'}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="h-10 w-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-white hover:text-orange-500 hover:border-orange-500/50 transition-all cursor-pointer group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </div>
              <div className="h-10 w-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-white hover:text-orange-500 hover:border-orange-500/50 transition-all cursor-pointer group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </div>
            </div>
          </div>

          {/* Links Grid - Balanced 4 Columns */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 xl:col-span-3 xl:mt-0">

            <div className="space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] relative inline-block">
                Навигация
                <span className="absolute -bottom-2 left-0 w-8 h-px bg-orange-600"></span>
              </h3>
              <ul className="space-y-4 pt-2">
                <li>
                  <Link href="/" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Главная</Link>
                </li>
                <li>
                  <Link href="/my-orders" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Мои заказы</Link>
                </li>
                <li>
                  <Link href="/catalogs" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Каталог</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] relative inline-block">
                Аккаунт
                <span className="absolute -bottom-2 left-0 w-8 h-px bg-orange-600"></span>
              </h3>
              <ul className="space-y-4 pt-2">
                <li>
                  <Link href="/signin" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Войти</Link>
                </li>
                <li>
                  <Link href="/signup" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Регистрация</Link>
                </li>
                <li>
                  <Link href="/basket" className="text-sm border-b border-transparent hover:border-orange-500 hover:text-white transition-all duration-300 pb-1">Корзина</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] relative inline-block">
                О бренде
                <span className="absolute -bottom-2 left-0 w-8 h-px bg-orange-600"></span>
              </h3>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                  <span className="text-sm text-stone-500 group-hover:text-stone-300 transition-colors">Собственное производство</span>
                </li>
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                  <span className="text-sm text-stone-500 group-hover:text-stone-300 transition-colors">Эко-материалы</span>
                </li>
                <li className="flex items-center gap-2 group cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                  <span className="text-sm text-stone-500 group-hover:text-stone-300 transition-colors">Гарантия качества</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] relative inline-block">
                Контакты
                <span className="absolute -bottom-2 left-0 w-8 h-px bg-orange-600"></span>
              </h3>
              <ul className="space-y-5 pt-2">
                <li className="flex flex-col gap-0.5 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <span className="text-[9px] uppercase tracking-widest text-stone-600 font-bold">Телефон</span>
                  <a href="tel:+77770000000" className="text-sm font-bold text-stone-300 hover:text-orange-500 transition-colors">
                    +7 777 000 00 00
                  </a>
                </li>
                <li className="flex flex-col gap-0.5 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <span className="text-[9px] uppercase tracking-widest text-stone-600 font-bold">Showroom</span>
                  <span className="text-sm font-bold text-stone-300">
                    {company?.city ? `${company.city}, ${company.base}` : 'Ayagoz, Semey'}
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-stone-900/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.3em]">
              &copy; {year} {company?.name || 'Altay Boots'}
            </p>
            <p className="text-[9px] text-stone-700 uppercase tracking-widest">
              Все права защищены. Сделано с любовью к качеству.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-600 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest group-hover:text-stone-300 transition-colors">Зимняя коллекция</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-600 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest group-hover:text-stone-300 transition-colors">Доставка по Казахстану</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-600 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest group-hover:text-stone-300 transition-colors">Ручная работа</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
