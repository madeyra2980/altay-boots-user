'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type OrderItem = {
  productId?: number
  quantity?: number
  productInfo?: {
    productId?: number
    productName?: string
    productPrice?: number
    catalogName?: string
  }
}

type Order = {
  order_id?: number
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

      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('user_id') || localStorage.getItem('userId') || '7'
        : '7'

      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${ORDERS_URL}`, {
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

  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)

  const confirmDelete = (orderId: number) => {
    setDeletingOrderId(orderId)
  }

  const handleDelete = async () => {
    if (!deletingOrderId) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Вы не авторизованы')
      setDeletingOrderId(null)
      return
    }

    try {
      const res = await fetch(`http://185.146.3.132:8080/api/v1/user/delete-order/${deletingOrderId}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Не удалось удалить заказ')
      }

      setOrders((prev) => prev.filter((o) => o.order_id !== deletingOrderId))
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Ошибка при удалении заказа')
    } finally {
      setDeletingOrderId(null)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
              <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-rose-500 hover:text-rose-600"
        >
          ← Каталог
        </Link>
        
        </div>
    
      </div>

      {/* Confirmation Modal */}
      {deletingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            
            <h3 className="text-lg font-semibold text-gray-900">Удалить заказ?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Вы уверены, что хотите удалить заказ #{deletingOrderId}? Это действие нельзя отменить.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingOrderId(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

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
            const orderId = order.order_id ?? idx + 1

            return (
              <div key={`${order.orderStartDate}-${idx}`} className="space-y-3 rounded-2xl bg-white p-6 shadow">
                
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Заказ #{orderId}</p>
                    <p className="text-sm text-gray-500">Дата: {date}</p>
                    <p className="text-sm text-gray-500">Статус оплаты: 
                      {status === 'PAID' ? ' Оплачено' : ' Не оплачено'}
                    </p>
                  </div>
                   {order.order_id && (
                    <button
                      onClick={() => confirmDelete(order.order_id!)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  {order.items && order.items.length ? (
                    <ul className="space-y-2">
                      {order.items.map((item, iIdx) => {
                        const info = item.productInfo
                        const name = info?.productName ?? `Товар #${info?.productId ?? item.productId ?? '—'}`
                        const price = info?.productPrice
                        return (
                          <li
                            key={`${info?.productId ?? item.productId}-${iIdx}`}
                            className="flex items-center justify-between text-sm text-gray-800"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-gray-900">{name}</span>
                              {info?.catalogName && (
                                <p className="text-xs text-gray-500">Категория: {info.catalogName}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-700">
                              {price !== undefined && <p className="font-semibold text-rose-600">{price} ₸</p>}
                              <p className="text-xs text-gray-500">Количество: {item.quantity ?? 1}</p>
                            </div>
                          </li>
                        )
                      })}
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

