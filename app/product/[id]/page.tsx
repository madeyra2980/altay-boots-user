'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, type SVGProps } from 'react'

type Product = {
  id?: number
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

        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Не удалось загрузить товар')
        setProduct(data as Product)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки товара')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const mainPhoto = product?.photos?.[0] ? normalizePhoto(product.photos[0]) : ''
  const extraPhotos = product?.photos?.slice(1) ?? []

  const handleAddToCart = async () => {
    setAddStatus(null)
    setError(null)
    const numericId = Number(product?.id ?? productId)
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

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string })?.message || 'Не удалось добавить в корзину'
        throw new Error(message)
      }
      setAddStatus('Товар добавлен в корзину')
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
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={product.name}
                className="h-80 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                Нет фото
              </div>
            )}

            {extraPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {extraPhotos.map((photo, idx) => (
                  <img
                    key={`${photo}-${idx}`}
                    src={normalizePhoto(photo)}
                    alt={`${product.name} — фото ${idx + 2}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
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
        <div className="rounded-lg bg-white p-4 text-sm text-gray-600 shadow">
          Товар не найден.
        </div>
      )}
    </section>
  )
}

