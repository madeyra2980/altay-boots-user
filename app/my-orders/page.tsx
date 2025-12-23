'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ConfirmAlert from '../components/ui/ConfirmAlert'
import Loading from '../components/ui/Loading'

type OrderItem = {
  productId?: number
  quantity?: number
  active?: boolean
  productInfo?: {
    productId?: number
    productName?: string
    productPrice?: number
    catalogName?: string
    active?: boolean
  }
}

type Order = {
  order_id?: number
  orderStartDate?: string
  paidStatus?: string
  active?: boolean
  items?: OrderItem[]
}

const ORDERS_URL = 'http://185.146.3.132:8080/api/v1/user/orders'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Delete handling
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const confirmDelete = (orderId: number) => {
    setDeletingOrderId(orderId)
    setIsConfirmOpen(true)
  }

  const handleSoftDelete = (orderId: number) => {
    setOrders(prev => prev.map(order => 
      order.order_id === orderId ? { ...order, active: false } : order
    ))
  }

  const handleDelete = async () => {
    if (!deletingOrderId) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Вы не авторизованы')
      setIsConfirmOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 3000))

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
      setIsConfirmOpen(false)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Ошибка при удалении заказа')
    } finally {
      setIsDeleting(false)
      setDeletingOrderId(null)
    }
  }

  if (loading) {
     return <Loading fullScreen />
  }

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="group flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Каталог
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 border-l-4 border-orange-500 pl-4">Мои заказы</h1>
        </div>

        {/* Confirmation Modal */}
        <ConfirmAlert 
           isOpen={isConfirmOpen}
           title="Удалить заказ?"
           message={`Вы уверены, что хотите удалить заказ #${deletingOrderId}? Это действие нельзя отменить.`}
           onConfirm={handleDelete}
           onCancel={() => setIsConfirmOpen(false)}
           isLoading={isDeleting}
           confirmText="Да, удалить"
           cancelText="Отмена"
           type="danger"
        />

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center mb-8">
            <p className="text-red-800 flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {!sortedOrders.length && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-stone-200">
                <svg className="mx-auto h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-stone-900">Нет заказов</h3>
                <p className="mt-1 text-sm text-stone-500">Начните делать покупки, чтобы увидеть историю заказов.</p>
                <div className="mt-6">
                  <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    Перейти в каталог
                  </Link>
                </div>
              </div>
            )}

            {sortedOrders.map((order, idx) => {
              const date =
                order.orderStartDate && !Number.isNaN(Date.parse(order.orderStartDate))
                  ? new Date(order.orderStartDate).toLocaleString()
                  : '—'
              const isPaid = order.paidStatus === 'PAID'
              const orderId = order.order_id ?? idx + 1
              const isActive = order.active !== false

              return (
                <div 
                   key={`${order.orderStartDate}-${idx}`} 
                   className={`bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-all duration-300 ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h3 className={`text-lg font-bold ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>Заказ #{orderId}</h3>
                         <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                           ${isActive 
                             ? (isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                             : 'bg-stone-100 text-stone-500'}`}>
                           {isPaid ? 'Оплачено' : 'Ожидает оплаты'}
                         </span>
                      </div>
                      <p className="text-sm text-stone-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {date}
                      </p>
                      {!isPaid && isActive && (
                        <div className="mt-2">
                           <a
                            href={`https://wa.me/7775279448?text=${encodeURIComponent(`Здравствуйте! Я хочу оплатить заказ №${orderId}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Оплатить в WhatsApp
                          </a>
                        </div>
                      ) || null}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.order_id && isActive && (
                        <button
                          onClick={() => handleSoftDelete(order.order_id!)}
                          className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Скрыть заказ"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Удалить
                        </button>
                      )}
                      
                      {order.order_id && (
                        <button
                          onClick={() => confirmDelete(order.order_id!)}
                          className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                          title="Полностью удалить заказ"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    {order.items && order.items.length ? (
                      <ul className="divide-y divide-stone-100">
                        {order.items.map((item, iIdx) => {
                          const info = item.productInfo
                          const name = info?.productName ?? `Товар #${info?.productId ?? item.productId ?? '—'}`
                          const price = info?.productPrice
                          return (
                            <li
                              key={`${info?.productId ?? item.productId}-${iIdx}`}
                              className="py-4 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                  <p className="font-medium text-stone-900 group-hover:text-orange-600 transition-colors cursor-default">{name}</p>
                                  {info?.catalogName && (
                                    <p className="text-xs text-stone-500">Категория: {info.catalogName}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {price !== undefined && <p className="font-bold text-stone-900">{price} ₸</p>}
                                <p className="text-sm text-stone-500">x{item.quantity ?? 1}</p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-stone-500 italic text-sm">Нет позиций в заказе</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
