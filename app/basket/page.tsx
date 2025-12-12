'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Product = {
  product_id?: number
  catalog_id?: number
  name?: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: string[]
}

type CartItem = {
  cart_item_id?: number
  productId?: number
  productName?: string
  quantity?: number
  productPrice?: number
  product?: Product
}

type CartResponse = {
  cartId?: number
  items?: CartItem[]
  totalPrice?: number
}

type OrderPayload = {
  surName: string
  lastName: string
  region: string
  cityOrDistrict: string
  street: string
  houseOrApartment: string
  index: string
}

const CART_URL = 'http://185.146.3.132:8080/api/v1/user/cart'
const PRODUCT_URL = 'http://185.146.3.132:8080/api/v1/auth/product'
const ORDER_URL = 'http://185.146.3.132:8080/api/v1/user/create-order'

const normalizePhoto = (url?: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}

export default function BasketPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderMessage, setOrderMessage] = useState<string | null>(null)
  const [orderPayload, setOrderPayload] = useState<OrderPayload>({
    surName: '',
    lastName: '',
    region: '',
    cityOrDistrict: '',
    street: '',
    houseOrApartment: '',
    index: '',
  })
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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
          if (typeof window !== 'undefined') {
            localStorage.setItem('cartCount', '0')
            window.dispatchEvent(new Event('storage'))
          }
          setLoading(false)
          return
        }
        
        const data = JSON.parse(text) as CartResponse
        console.log('Parsed cart data:', data)

        const baseItems = Array.isArray(data.items) ? data.items : []

        const productIds = Array.from(
          new Set(
            baseItems
              .map((item) => item.productId)
              .filter((id): id is number => typeof id === 'number')
          )
        )

        const productMap = new Map<number, Product>()
        if (productIds.length) {
          await Promise.all(
            productIds.map(async (id) => {
              try {
                const productRes = await fetch(`${PRODUCT_URL}/${id}`, {
                  headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                  },
                })
                const productText = await productRes.text()

                if (!productRes.ok || !productText.trim()) {
                  console.warn('Skip product detail', { id, status: productRes.status })
                  return
                }

                const product = JSON.parse(productText) as Product
                productMap.set(id, product)
              } catch (productErr) {
                console.error('Failed to load product detail', id, productErr)
              }
            })
          )
        }

        const mergedItems = baseItems.map((item) => {
          const details = item.productId ? productMap.get(item.productId) : undefined
          return {
            ...item,
            product: details,
            productName: item.productName ?? details?.name,
            productPrice: item.productPrice ?? details?.price,
          }
        })

        setItems(mergedItems)
        setTotalPrice(data.totalPrice ?? 0)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cartCount', String(mergedItems.length))
          window.dispatchEvent(new Event('storage'))
        }
      } catch (err) {
        console.error('Error fetching cart:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки корзины')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleOrderSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setOrderMessage(null)
    setError(null)

    if (!items.length) {
      setOrderMessage('Корзина пуста. Добавьте товары перед оформлением.')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setOrderMessage('Сначала войдите в аккаунт.')
      return
    }

    setOrderLoading(true)
    try {
      const res = await fetch(ORDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      })

      const text = await res.text()
      if (!res.ok) {
        let message = 'Не удалось создать заказ'
        if (text) {
          try {
            const data = JSON.parse(text) as { message?: string }
            message = data.message || message
          } catch {
            message = text || message
          }
        }
        throw new Error(message)
      }

      setOrderMessage('Заказ успешно создан. Спасибо за покупку!')
      setItems([])
      setTotalPrice(0)
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartCount', '0')
        window.dispatchEvent(new Event('storage'))
      }
    } catch (err) {
      setOrderMessage(err instanceof Error ? err.message : 'Ошибка создания заказа')
    } finally {
      setOrderLoading(false)
    }
  }

  const handleDeleteItem = async (cartItemId?: number) => {
    if (!cartItemId) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('Вы не авторизованы')
      return
    }

    setDeletingId(cartItemId)
    try {
      const res = await fetch(`http://185.146.3.132:8080/api/v1/user/delete-cart-item/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Не удалось удалить товар')
      }

      // Успешно удалено — обновляем локальный стейт
      setItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId))
      
      // Обновляем каунтер в localStorage
      if (typeof window !== 'undefined') {
        const currentCount = Number(localStorage.getItem('cartCount') || '0')
        localStorage.setItem('cartCount', String(Math.max(0, currentCount - 1)))
        window.dispatchEvent(new Event('storage'))
      }
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Ошибка удаления')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdateQuantity = async (cartItemId: number | undefined, newQuantity: number) => {
    if (!cartItemId || newQuantity < 1) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('Вы не авторизованы')
      return
    }

    setUpdatingId(cartItemId)
    try {
      const res = await fetch('http://185.146.3.132:8080/api/v1/user/edit-cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      })

      if (!res.ok) {
        throw new Error('Не удалось изменить количество')
      }

      // Успешно обновлено — обновляем локальный стейт
      setItems((prev) =>
        prev.map((item) =>
          item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Ошибка обновления')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        
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
              <div>
          <h1 className="text-3xl font-bold text-gray-900">Корзина</h1>
          <p className="text-sm text-gray-600">Товары, добавленные из каталога</p>
        </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const mainPhoto = normalizePhoto(item.product?.photos?.[0])
                  const displayName = item.product?.name || item.productName || `Товар #${item.productId}`
                  const description = item.product?.description || item.product?.text
                  const price = item.productPrice ?? item.product?.price
                  return (
                    <div key={item.cart_item_id ?? `${item.productId}-${item.productName}`} className="flex gap-4 py-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {mainPhoto ? (
                          <img src={mainPhoto} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Нет фото</div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                            <p className="text-xs text-gray-500">ID: {item.productId ?? '—'}</p>
                            {description && <p className="text-xs text-gray-600 line-clamp-2">{description}</p>}
                          </div>
                          <span className="text-sm font-semibold text-rose-600">
                            {price !== undefined ? `${price} ₸` : '—'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.cart_item_id, (item.quantity ?? 1) - 1)}
                            disabled={updatingId === item.cart_item_id || (item.quantity ?? 1) <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-gray-900">
                            {updatingId === item.cart_item_id ? (
                               <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                            ) : (
                               item.quantity ?? 1
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.cart_item_id, (item.quantity ?? 1) + 1)}
                            disabled={updatingId === item.cart_item_id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteItem(item.cart_item_id)}
                        disabled={deletingId === item.cart_item_id}
                        className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Удалить из корзины"
                      >
                        {deletingId === item.cart_item_id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Итого</span>
                <span className="text-xl font-bold text-gray-900">{total} ₸</span>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Оформление заказа</h3>
                  {orderMessage && (
                    <span className="text-xs text-gray-700">{orderMessage}</span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Фамилия"
                    value={orderPayload.surName}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, surName: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Имя"
                    value={orderPayload.lastName}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, lastName: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Регион"
                    value={orderPayload.region}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, region: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Город или район"
                    value={orderPayload.cityOrDistrict}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, cityOrDistrict: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Улица"
                    value={orderPayload.street}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, street: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Дом / квартира"
                    value={orderPayload.houseOrApartment}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, houseOrApartment: e.target.value }))}
                    required
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Индекс"
                    value={orderPayload.index}
                    onChange={(e) => setOrderPayload((p) => ({ ...p, index: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {orderLoading ? 'Создание заказа...' : 'Создать заказ'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
