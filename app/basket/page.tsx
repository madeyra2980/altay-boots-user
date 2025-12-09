'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'

type CartItem = {
  id?: number
  productId?: number
  productName?: string
  quantity?: number
  price?: number
}

type CartResponse = {
  cartId?: number
  items?: CartItem[]
  totalPrice?: number
}

type OrderForm = {
  surName: string
  lastName: string
  region: string
  cityOrDistrict: string
  street: string
  houseOrApartment: string
  index: string
}

const defaultOrderForm: OrderForm = {
  surName: '',
  lastName: '',
  region: '',
  cityOrDistrict: '',
  street: '',
  houseOrApartment: '',
  index: '',
}

const CART_URL = 'http://185.146.3.132:8080/api/v1/user/cart'

export default function BasketPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderForm, setOrderForm] = useState<OrderForm>(defaultOrderForm)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [ordering, setOrdering] = useState(false)

  const total = useMemo(() => {
    if (totalPrice) return totalPrice
    return items.reduce((sum, item) => {
      const price = item.price ?? 0
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
        const res = await fetch(CART_URL, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        })

        const data = (await res.json().catch(() => ({}))) as CartResponse | { message?: string }
        if (!res.ok) {
          const message = (data as { message?: string })?.message || 'Не удалось загрузить корзину'
          throw new Error(message)
        }

        const body = data as CartResponse
        setItems(Array.isArray(body.items) ? body.items : [])
        setTotalPrice(body.totalPrice ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки корзины')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleInput = (field: keyof OrderForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setOrderForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCreateOrder = async () => {
    setOrderStatus(null)
    if (!items.length) {
      setOrderStatus('Добавьте товары в корзину')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setOrderStatus('Сначала войдите в аккаунт')
      return
    }

    const payload = {
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity ?? 1,
      })),
      ...orderForm,
    }

    // простая проверка обязательных полей
    if (
      !payload.surName ||
      !payload.lastName ||
      !payload.region ||
      !payload.cityOrDistrict ||
      !payload.street ||
      !payload.houseOrApartment ||
      !payload.index
    ) {
      setOrderStatus('Заполните все поля для оформления заказа')
      return
    }

    try {
      setOrdering(true)
      const res = await fetch('http://185.146.3.132:8080/api/v1/user/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string })?.message || 'Не удалось оформить заказ'
        throw new Error(message)
      }

      setOrderStatus('Заказ успешно оформлен')
      setOrderForm(defaultOrderForm)
    } catch (err) {
      setOrderStatus(err instanceof Error ? err.message : 'Ошибка оформления заказа')
    } finally {
      setOrdering(false)
    }
  }

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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          {error}
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
                    <div key={item.id ?? `${item.productId}-${item.productName}`} className="flex gap-4 py-4">
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
                            {item.price !== undefined ? `${item.price} ₸` : '—'}
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

              <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                <h2 className="text-lg font-semibold text-gray-900">Оформление заказа</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Фамилия"
                    value={orderForm.surName}
                    onChange={handleInput('surName')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Имя"
                    value={orderForm.lastName}
                    onChange={handleInput('lastName')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Регион"
                    value={orderForm.region}
                    onChange={handleInput('region')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Город / район"
                    value={orderForm.cityOrDistrict}
                    onChange={handleInput('cityOrDistrict')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Улица"
                    value={orderForm.street}
                    onChange={handleInput('street')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Дом / квартира"
                    value={orderForm.houseOrApartment}
                    onChange={handleInput('houseOrApartment')}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    placeholder="Индекс"
                    value={orderForm.index}
                    onChange={handleInput('index')}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCreateOrder}
                    disabled={ordering}
                    className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {ordering ? 'Отправляем...' : 'Оформить заказ'}
                  </button>
                  {orderStatus && <p className="text-sm text-gray-700">{orderStatus}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
