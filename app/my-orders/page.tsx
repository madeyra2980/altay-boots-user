'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type OrderItem = {
  productId?: number
  quantity?: number
}

type Order = {
  orderStartDate?: string
  paidStatus?: string
  items?: OrderItem[]
}

const ORDERS_URL = 'http://185.146.3.132:8080/api/v1/user/orders'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const da = a.orderStartDate ? new Date(a.orderStartDate).getTime() : 0
      const db = b.orderStartDate ? new Date(b.orderStartDate).getTime() : 0
      return db - da
    })
  }, [orders])

  useEffect(() => {
    const fetchOrders = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setError('Войдите, чтобы увидеть заказы')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await fetch(ORDERS_URL, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message = (data as { message?: string })?.message || 'Не удалось загрузить заказы'
          throw new Error(message)
        }
        const list = Array.isArray(data) ? (data as Order[]) : []
        setOrders(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки заказов')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
          <p className="text-sm text-gray-600">Список оформленных заказов</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-rose-500 hover:text-rose-600"
        >
          ← Каталог
        </Link>
      </div>

      {loading && <div className="rounded-lg bg-white p-4 shadow">Загрузка заказов...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {!sortedOrders.length && (
            <div className="rounded-2xl bg-white p-6 text-gray-600 shadow">
              Заказы не найдены.
            </div>
          )}

          {sortedOrders.map((order, idx) => {
            const date =
              order.orderStartDate && !Number.isNaN(Date.parse(order.orderStartDate))
                ? new Date(order.orderStartDate).toLocaleString()
                : '—'
            const status = order.paidStatus || '—'

            return (
              <div key={`${order.orderStartDate}-${idx}`} className="space-y-3 rounded-2xl bg-white p-6 shadow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Дата: {date}</p>
                    <p className="text-sm text-gray-500">Статус оплаты: {status}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  {order.items && order.items.length ? (
                    <ul className="space-y-2">
                      {order.items.map((item, iIdx) => (
                        <li key={`${item.productId}-${iIdx}`} className="flex items-center justify-between text-sm text-gray-800">
                          <span>Товар #{item.productId ?? '—'}</span>
                          <span className="text-gray-600">Количество: {item.quantity ?? 1}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">Нет позиций в заказе</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

