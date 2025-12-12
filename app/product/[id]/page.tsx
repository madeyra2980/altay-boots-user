'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, type SVGProps } from 'react'

type Product = {
  product_id?: number
  catalog_id?: number
  name: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: string[]
}

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/product'

const normalizePhoto = (url?: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://185.146.3.132:8080${url}`
}

const CartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M4 5h2l1.5 12h9L18 8H7.4" />
    <circle cx="9" cy="19" r="1.2" />
    <circle cx="16" cy="19" r="1.2" />
  </svg>
)

export default function ProductPage() {
  const params = useParams()
  const productId = useMemo(() => {
    if (!params?.id) return ''
    return Array.isArray(params.id) ? params.id[0] : params.id
  }, [params])

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [addStatus, setAddStatus] = useState<string | null>(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${API_URL}/${productId}`, {
          headers: {
            accept: '*/*',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        // Получаем текст ответа
        const text = await res.text()
        
        // Логируем для отладки
        console.log('Product fetch:', {
          productId,
          status: res.status,
          statusText: res.statusText,
          textLength: text.length,
          hasToken: !!token,
          url: `${API_URL}/${productId}`,
          textPreview: text.substring(0, 100)
        })
        
        if (!res.ok) {
          // Пробуем распарсить как JSON для ошибки
          if (text && text.trim()) {
            try {
              const errorData = JSON.parse(text)
              const message = (errorData as { message?: string })?.message || 'Не удалось загрузить товар'
              throw new Error(res.status === 403 
                ? 'Доступ запрещен. Возможно, необходимо войти в аккаунт.'
                : message)
            } catch (err) {
              // Если не JSON, показываем ошибку по статусу
              if (err instanceof SyntaxError || !(err instanceof Error)) {
                const statusText = res.status === 403 
                  ? 'Доступ запрещен. Возможно, необходимо войти в аккаунт.'
                  : res.statusText || 'Не удалось загрузить товар'
                throw new Error(`Ошибка ${res.status}: ${statusText}`)
              }
              throw err
            }
          } else {
            // Пустой ответ при ошибке
            const statusText = res.status === 403 
              ? 'Доступ запрещен. Возможно, необходимо войти в аккаунт.'
              : res.status === 404
              ? 'Товар не найден'
              : res.statusText || 'Не удалось загрузить товар'
            throw new Error(`Ошибка ${res.status}: ${statusText}`)
          }
        }
        
        // Успешный ответ - проверяем наличие данных
        if (!text || text.trim() === '') {
          // Если статус 200, но тело пустое - это проблема бэкенда
          // Правильное поведение: 404 если товар не найден, 403 если нет доступа
          console.error('Бэкенд вернул статус 200, но пустое тело. Это проблема сервера.')
          throw new Error(`Товар с ID ${productId} не найден или недоступен. Сервер вернул пустой ответ (статус 200). Возможно, проблема на стороне сервера.`)
        }
        
        try {
          const data = JSON.parse(text) as Product
          // Проверяем, что данные не пустые
          if (!data || (!data.name && !data.product_id)) {
            throw new Error('Товар не найден. Сервер вернул пустые данные.')
          }
          setProduct(data)
        } catch (err) {
          // Если не удалось распарсить, показываем ошибку
          if (err instanceof SyntaxError) {
            console.error('Ошибка парсинга JSON:', err, 'Текст ответа:', text.substring(0, 200))
            throw new Error('Не удалось обработать данные товара. Сервер вернул неверный формат.')
          }
          throw err
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки товара')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Reset slide when product changes
  useEffect(() => {
    setActivePhotoIndex(0)
  }, [productId])

  const allPhotos = product?.photos?.map(normalizePhoto) ?? []

  const handleAddToCart = async () => {
    setAddStatus(null)
    setError(null)
    const numericId = Number(product?.product_id ?? productId)
    if (!numericId || Number.isNaN(numericId)) {
      setAddStatus('Неизвестный товар')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setAddStatus('Сначала войдите в аккаунт')
      return
    }

    try {
      setAdding(true)
      const res = await fetch('http://185.146.3.132:8080/api/v1/user/add-product-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: numericId, quantity: 1 }),
      })

      if (!res.ok) {
        try {
          const errorData = await res.json()
          throw new Error((errorData as { message?: string })?.message || 'Не удалось добавить в корзину')
        } catch (e) {
          // Если тело ответа не JSON или пустое, выбрасываем общую ошибку
          throw new Error(`Ошибка ${res.status}: ${res.statusText || 'Не удалось добавить в корзину'}`)
        }
      }

      setAddStatus('Товар добавлен в корзину')
      if (typeof window !== 'undefined') {
        const current = Number(localStorage.getItem('cartCount') || '0') || 0
        const next = current + 1
        localStorage.setItem('cartCount', String(next))
        window.dispatchEvent(new Event('storage'))
      }
    } catch (err) {
      setAddStatus(err instanceof Error ? err.message : 'Ошибка добавления')
    } finally {
      setAdding(false)
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

      {loading && <div className="rounded-lg bg-white p-4 shadow">Загрузка товара...</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      {!loading && !error && product && (
        <div className="grid gap-8 rounded-2xl bg-white p-6 shadow md:grid-cols-2">
          <div className="space-y-4">
            {/* Main Photo Slider */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              {allPhotos.length > 0 ? (
                <div className="relative aspect-square w-full sm:aspect-[4/3]">
                  <img
                    src={allPhotos[activePhotoIndex]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  
                  {/* Arrows */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur transition hover:bg-white"
                      >
                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                      </button>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev + 1) % allPhotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur transition hover:bg-white"
                      >
                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-gray-400 sm:aspect-[4/3]">
                  Нет фото
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activePhotoIndex === idx ? 'border-rose-600 ring-2 ring-rose-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
              {product.description && (
                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
              )}
            </div>

            {(product.price !== undefined || product.oldPrice !== undefined) && (
              <div className="flex items-center gap-3">
                {product.price !== undefined && (
                  <span className="text-3xl font-bold text-rose-600">{product.price} ₸</span>
                )}
                {product.oldPrice !== undefined && (
                  <span className="text-lg text-gray-400 line-through">{product.oldPrice} ₸</span>
                )}
              </div>
            )}

            {product.text && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Описание</h3>
                <p className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                  {product.text}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex w-fit items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {adding ? 'Добавление...' : 'Добавить в корзину'}
                <CartIcon className="h-4 w-4" />
              </button>
              {addStatus && (
                <p className="text-sm text-gray-600">
                  {addStatus}
                  {addStatus === 'Товар добавлен в корзину' && (
                    <>
                      {' '}
                      <Link href="/basket" className="text-rose-600 underline">
                        Открыть корзину
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !product && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-gray-500">Товар не найден</p>
          <Link href="/" className="mt-4 text-rose-600 hover:underline">
            Вернуться на главную
          </Link>
        </div>
      )}
    </section>
  )
}
