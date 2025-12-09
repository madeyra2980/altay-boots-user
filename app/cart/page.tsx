'use client'

import Link from 'next/link'

export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
          <p className="text-sm text-gray-600">Добавляйте товары из каталога</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-rose-500 hover:text-rose-600"
        >
          ← Вернуться к каталогу
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-gray-600">
          Корзина пока пустая. Перейдите в каталог и нажмите «добавить в корзину».
        </p>
      </div>
    </section>
  )
}

