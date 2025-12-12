'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Loading from '../components/ui/Loading'

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
        const res = await fetch(CART_URL, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          if (res.status === 403) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('userName')
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
              // ignore
            }
          }
          throw new Error(message)
        }
        
        const text = await res.text()
        
        if (!text || text.trim() === '') {
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

      setOrderMessage('SUCCESS') // Trigger specialized UI
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
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 3000))

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

      setItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId))
      
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

  if (loading) {
     return <Loading fullScreen />
  }

  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-stone-900 border-l-4 border-orange-500 pl-4">Корзина</h1>
        </div>

        {error && (
            <div className="mb-8 rounded-lg bg-red-50 p-4 border border-red-200 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            {error.includes('Доступ запрещен') || error.includes('войдите') ? (
                <Link
                href="/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                Войти в аккаунт
                </Link>
            ) : null}
            </div>
        )}

        {!loading && !error && (
            <div>
            {!items.length ? (
                 orderMessage === 'SUCCESS' ? (
                     <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
                         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                         </div>
                         <h2 className="text-2xl font-bold text-stone-900 mb-2">Заказ успешно оформлен!</h2>
                         <p className="text-stone-500 max-w-md mx-auto mb-8">
                             Спасибо за покупку. Менеджер свяжется с вами в ближайшее время для подтверждения.
                         </p>
                         <Link href="/" className="inline-flex items-center px-6 py-3 bg-stone-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                             Продолжить покупки
                         </Link>
                     </div>
                 ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
                        <svg className="mx-auto h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="mt-4 text-xl font-bold text-stone-900">Ваша корзина пуста</h2>
                        <p className="mt-2 text-stone-500 mb-8">Посмотрите наш каталог, там много интересного!</p>
                        <Link href="/" className="inline-flex items-center px-6 py-3 bg-stone-900 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                            Перейти в каталог
                        </Link>
                    </div>
                )
            ) : (
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Cart Items */}
                    <div className="lg:col-span-7">
                        <div className="space-y-6">
                            {items.map((item) => {
                            const mainPhoto = normalizePhoto(item.product?.photos?.[0])
                            const displayName = item.product?.name || item.productName || `Товар #${item.productId}`
                            const description = item.product?.description || item.product?.text
                            const price = item.productPrice ?? item.product?.price
                            return (
                                <div key={item.cart_item_id ?? `${item.productId}-${item.productName}`} className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative">
                                    {/* Image */}
                                    <div className="sm:w-40 h-40 bg-stone-100 flex-shrink-0 relative">
                                        {mainPhoto ? (
                                        <img src={mainPhoto} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">Нет фото</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-stone-900 line-clamp-1">{displayName}</h3>
                                                <p className="text-sm text-stone-400 mb-2">ID: {item.productId ?? '—'}</p>
                                                {description && <p className="text-sm text-stone-500 line-clamp-2">{description}</p>}
                                            </div>
                                            <p className="text-lg font-bold text-stone-900 whitespace-nowrap">
                                                {price !== undefined ? `${price} ₸` : '—'}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between mt-4">
                                            <div className="flex items-center border border-stone-200 rounded-lg">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.cart_item_id, (item.quantity ?? 1) - 1)}
                                                    disabled={updatingId === item.cart_item_id || (item.quantity ?? 1) <= 1}
                                                    className="px-3 py-1 text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1 text-stone-900 font-medium min-w-[2rem] text-center bg-stone-50 border-x border-stone-100 h-full flex items-center justify-center">
                                                    {updatingId === item.cart_item_id ? (
                                                    <svg className="w-4 h-4 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    ) : (
                                                    item.quantity ?? 1
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.cart_item_id, (item.quantity ?? 1) + 1)}
                                                    disabled={updatingId === item.cart_item_id}
                                                    className="px-3 py-1 text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleDeleteItem(item.cart_item_id)}
                                                disabled={deletingId === item.cart_item_id}
                                                className="text-stone-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                                title="Удалить из корзины"
                                            >
                                                {deletingId === item.cart_item_id ? (
                                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                            })}
                        </div>
                    </div>

                    {/* Order Summary & Checkout */}
                    <div className="mt-16 bg-white rounded-2xl shadow-lg border border-stone-200 p-8 lg:col-span-5 lg:mt-0 sticky top-24">
                        <h2 className="text-xl font-bold text-stone-900 mb-6 pb-6 border-b border-stone-100">Итого</h2>
                        
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-stone-600">Сумма заказа</span>
                            <span className="text-2xl font-bold text-stone-900">{total} ₸</span>
                        </div>

                        <form onSubmit={handleOrderSubmit} className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Данные доставки</h3>
                                {orderMessage && orderMessage !== 'SUCCESS' && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{orderMessage}</div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="col-span-1 rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="Фамилия"
                                    value={orderPayload.surName}
                                    onChange={(e) => setOrderPayload((p) => ({ ...p, surName: e.target.value }))}
                                    required
                                />
                                <input
                                    className="col-span-1 rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="Имя"
                                    value={orderPayload.lastName}
                                    onChange={(e) => setOrderPayload((p) => ({ ...p, lastName: e.target.value }))}
                                    required
                                />
                            </div>

                            <input
                                className="w-full rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                placeholder="Регион / Область"
                                value={orderPayload.region}
                                onChange={(e) => setOrderPayload((p) => ({ ...p, region: e.target.value }))}
                                required
                            />
                            
                            <input
                                className="w-full rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                placeholder="Город или район"
                                value={orderPayload.cityOrDistrict}
                                onChange={(e) => setOrderPayload((p) => ({ ...p, cityOrDistrict: e.target.value }))}
                                required
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    className="col-span-2 rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="Улица"
                                    value={orderPayload.street}
                                    onChange={(e) => setOrderPayload((p) => ({ ...p, street: e.target.value }))}
                                    required
                                />
                                <input
                                    className="col-span-1 rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="Дом/Кв"
                                    value={orderPayload.houseOrApartment}
                                    onChange={(e) => setOrderPayload((p) => ({ ...p, houseOrApartment: e.target.value }))}
                                    required
                                />
                            </div>
                            
                            <input
                                className="w-full rounded-lg border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                                placeholder="Почтовый индекс"
                                value={orderPayload.index}
                                onChange={(e) => setOrderPayload((p) => ({ ...p, index: e.target.value }))}
                                required
                            />
                            
                            <button
                                type="submit"
                                disabled={orderLoading}
                                className="w-full mt-6 flex items-center justify-center rounded-xl bg-stone-900 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {orderLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Обработка...
                                    </span>
                                ) : 'Оформить заказ'}
                            </button>
                            <p className="text-xs text-center text-stone-400 mt-4">
                                Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
                            </p>
                        </form>
                    </div>
                </div>
            )}
            </div>
        )}
      </div>
    </section>
  )
}
