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
    <section >
      <div >
 
        <Link
          href="/"
          
        >
          ← Вернуться к каталогу
        </Link>
      </div>

      {loading && <div >Загрузка товара...</div>}
      {error && (
        <div >
          {error}
        </div>
      )}

      {!loading && !error && product && (
        <div >
          <div >
            {/* Main Photo Slider */}
            <div >
              {allPhotos.length > 0 ? (
                <div >
                  <img
                    src={allPhotos[activePhotoIndex]}
                    alt={product.name}
                    
                  />
                  
                  {/* Arrows */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                        
                      >
                         <svg  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                      </button>
                      <button
                        onClick={() => setActivePhotoIndex(prev => (prev + 1) % allPhotos.length)}
                        
                      >
                         <svg  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div >
                  Нет фото
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allPhotos.length > 1 && (
              <div >
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}

                  >
                    <img src={photo} alt=""  />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div >
            <div>
              <h2 >{product.name}</h2>
              {product.description && (
                <p >{product.description}</p>
              )}
            </div>

            {(product.price !== undefined || product.oldPrice !== undefined) && (
              <div >
                {product.price !== undefined && (
                  <span >{product.price} ₸</span>
                )}
                {product.oldPrice !== undefined && (
                  <span >{product.oldPrice} ₸</span>
                )}
              </div>
            )}

            {product.text && (
              <div >
                <h3 >Описание</h3>
                <p >
                  {product.text}
                </p>
              </div>
            )}

            <div >
              <button
                onClick={handleAddToCart}
                disabled={adding}
                
              >
                {adding ? 'Добавление...' : 'Добавить в корзину'}
                <CartIcon  />
              </button>
              {addStatus && (
                <p >
                  {addStatus}
                  {addStatus === 'Товар добавлен в корзину' && (
                    <>
                      {' '}
                      <Link href="/basket" >
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
        <div >
          <p >Товар не найден</p>
          <Link href="/" >
            Вернуться на главную
          </Link>
        </div>
      )}
    </section>
  )
}
