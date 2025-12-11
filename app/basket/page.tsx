'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type CartItem = {
  cart_item_id?: number
  productId?: number
  productName?: string
  quantity?: number
  productPrice?: number
}

type CartResponse = {
  cartId?: number
  items?: CartItem[]
  totalPrice?: number
}

const CART_URL = 'http://185.146.3.132:8080/api/v1/user/cart'

export default function BasketPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const total = useMemo(() => {
    if (totalPrice) return totalPrice
    return items.reduce((sum, item) => {
      const price = item.productPrice ?? 0
      const qty = item.quantity ?? 0
      return sum + price * qty
    }, 0)
  }, [items, totalPrice])

  useEffect(() => {
    const fetchCart = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setError('Войдите, чтобы увидеть корзину')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        console.log('Fetching cart with token:', token ? 'Token exists' : 'No token')
        
        const res = await fetch(CART_URL, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Cart response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries())
        })

        if (!res.ok) {
          if (res.status === 403) {
            // Токен неверный или истек
            console.error('403 Forbidden - token invalid or expired')
            // Очищаем неверный токен
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('userName')
              // Триггерим событие для обновления Header
              window.dispatchEvent(new Event('storage'))
            }
            setError('Доступ запрещен. Ваш токен истек или неверный. Пожалуйста, войдите заново.')
            setLoading(false)
            return
          }
          
          const text = await res.text().catch(() => '')
          let message = 'Не удалось загрузить корзину'
          if (text && text.trim()) {
            try {
              const errorData = JSON.parse(text)
              message = (errorData as { message?: string })?.message || message
            } catch {
              // Если не JSON, используем общее сообщение
            }
          }
          throw new Error(message)
        }
        
        const text = await res.text()
        console.log('Cart response text:', text.substring(0, 200))
        
        if (!text || text.trim() === '') {
          console.warn('Empty cart response')
          setItems([])
          setTotalPrice(0)
          setLoading(false)
          return
        }
        
        const data = JSON.parse(text) as CartResponse
        console.log('Parsed cart data:', data)

        setItems(Array.isArray(data.items) ? data.items : [])
        setTotalPrice(data.totalPrice ?? 0)
      } catch (err) {
        console.error('Error fetching cart:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки корзины')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
          <p className="text-sm text-gray-600">Товары, добавленные из каталога</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-rose-500 hover:text-rose-600"
        >
          ← Вернуться к каталогу
        </Link>
      </div>

      {loading && <div className="rounded-lg bg-white p-4 shadow">Загрузка корзины...</div>}
      {error && (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          <p>{error}</p>
          {error.includes('Доступ запрещен') || error.includes('войдите') ? (
            <Link
              href="/signin"
              className="inline-block rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Войти в аккаунт
            </Link>
          ) : null}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {!items.length && (
            <div className="rounded-2xl bg-white p-6 text-gray-600 shadow">
              Корзина пустая. Добавьте товары со страницы товара.
            </div>
          )}

          {!!items.length && (
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow">
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  return (
                    <div key={item.cart_item_id ?? `${item.productId}-${item.productName}`} className="flex gap-4 py-4">
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.productName || `Товар #${item.productId}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {item.productId ?? '—'}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-rose-600">
                            {item.productPrice !== undefined ? `${item.productPrice} ₸` : '—'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Количество: {item.quantity ?? 1}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Итого</span>
                <span className="text-xl font-bold text-gray-900">{total} ₸</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
