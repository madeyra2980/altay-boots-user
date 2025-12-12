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
    <section className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-stone-500 hover:text-stone-800 transition-colors mb-8 group"
        >
          <svg 
            className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Вернуться к каталогу
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
        </div>
      )}
      
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && product && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Photos Column */}
          <div className="space-y-6">
            {/* Main Photo Frame */}
            <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden shadow-sm group">
              {allPhotos.length > 0 ? (
                <>
                  <img
                    src={allPhotos[activePhotoIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transform transition duration-500 ease-in-out group-hover:scale-105"
                  />
                  
                  {/* Navigation Arrows */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                         <svg className="w-6 h-6 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                      </button>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev + 1) % allPhotos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                         <svg className="w-6 h-6 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <span className="text-lg">Нет фото</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      activePhotoIndex === idx 
                        ? 'border-stone-800 shadow-md ring-1 ring-stone-800/20' 
                        : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col pt-2 lg:pt-0">
            <div className="border-b border-stone-200 pb-8 mb-8">
              <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-4 tracking-tight">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-lg text-stone-600 leading-relaxed font-light">
                  {product.description}
                </p>
              )}
            </div>

            {(product.price !== undefined || product.oldPrice !== undefined) && (
              <div className="flex items-baseline gap-4 mb-8">
                {product.price !== undefined && (
                  <span className="text-3xl font-medium text-stone-900">
                    {product.price.toLocaleString()} ₸
                  </span>
                )}
                {product.oldPrice !== undefined && (
                  <span className="text-xl text-stone-400 line-through decoration-stone-400/60">
                    {product.oldPrice.toLocaleString()} ₸
                  </span>
                )}
              </div>
            )}

            <div className="space-y-8 flex-grow">
              {product.text && (
                <div className="prose prose-stone max-w-none text-stone-600">
                  <h3 className="text-stone-900 font-medium mb-2">Описание</h3>
                  <p className="whitespace-pre-line leading-relaxed">
                    {product.text}
                  </p>
                </div>
              )}

              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {adding ? (
                    'Добавление...'
                  ) : (
                    <>
                      Добавить в корзину
                      <CartIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                {addStatus && (
                  <div className={`text-sm text-center p-3 rounded-lg ${
                    addStatus === 'Товар добавлен в корзину' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    <span className="mr-1">{addStatus}</span>
                    {addStatus === 'Товар добавлен в корзину' && (
                      <Link href="/basket" className="font-medium underline hover:text-green-800 ml-1">
                        Открыть корзину
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !product && (
        <div className="text-center py-20">
          <p className="text-xl text-stone-500 mb-6">Товар не найден</p>
          <Link 
            href="/" 
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      )}
    </section>
  )
}
