'use client'

import { useEffect, useState } from 'react'

type Product = {
  id?: number
  name: string
  description?: string
  text?: string
  price?: number
  oldPrice?: number
  photos?: string[]
}

const API_URL = 'http://185.146.3.132:8080/api/v1/auth/products'
const API_SINGLE_URL = 'http://185.146.3.132:8080/api/v1/auth/product'

// Компонент для отображения одного продукта по ID
function ProductItem({ id }: { id: number }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${API_SINGLE_URL}/${id}`, {
          headers: {
            accept: '*/*',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Не удалось загрузить продукт')
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) return <div>Загрузка продукта...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!product) return <div>Продукт не найден</div>

  return (
    <div className="rounded-xl bg-white p-4 shadow max-w-md mx-auto">
      {product.photos && product.photos[0] ? (
        <img
          src={product.photos[0]}
          alt={product.name}
          className="mb-3 h-64 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="mb-3 flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          Нет фото
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
      {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
      {product.text && <p className="mt-2 text-sm text-gray-500">{product.text}</p>}
      <div className="mt-3 flex items-center gap-2">
        {product.price !== undefined && (
          <span className="text-lg font-bold text-rose-600">{product.price} ₸</span>
        )}
        {product.oldPrice !== undefined && (
          <span className="text-sm text-gray-400 line-through">{product.oldPrice} ₸</span>
        )}
      </div>
    </div>
  )
}