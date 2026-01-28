'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Loading from '../../components/ui/Loading'
import { normalizePhoto } from '../../utils/imageUtils'

type Photo = {
    photo_id?: number
    photoURL?: string
}

type Product = {
    product_id?: number
    name?: string
    description?: string
    price?: number
    oldPrice?: number
    active?: boolean
    catalogName?: string
    photos?: Photo[]
}

type OrderItem = {
    productId?: number
    order_item_id?: number
    quantity?: number
    active?: boolean
    productInfo?: {
        productId?: number
        productName?: string
        productPrice?: number
        catalogName?: string
        active?: boolean
        photo?: string | Photo[]
        photos?: Photo[]
    }
    product?: Product
}

type UserDetails = {
    user_id?: number
    name?: string
    surName?: string
    lastName?: string
    region?: string
    cityOrDistrict?: string
    street?: string
    houseOrApartment?: string
    indexPost?: string
}

type Order = {
    order_id?: number
    name?: string
    orderStartDate?: string
    paidStatus?: string
    active?: boolean
    userDetails?: UserDetails
    items?: OrderItem[]
}

export default function OrderDetailPage() {
    const params = useParams()
    const orderId = params?.id as string

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

            if (!token) {
                setError('Войдите, чтобы увидеть детали заказа')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)
            try {
                console.log('[Order Details] Fetching order:', orderId)
                console.log('[Order Details] Token present:', !!token)

                const res = await fetch(`/api/order/${orderId}`, {
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                })

                console.log('[Order Details] Response status:', res.status)

                const data = await res.json().catch(() => ({}))

                console.log('[Order Details] Response data:', data)

                if (!res.ok) {
                    const message = (data as { message?: string })?.message || 'Не удалось загрузить детали заказа'
                    console.error('[Order Details] Error:', message)
                    throw new Error(message)
                }

                console.log('[Order Details] Order loaded successfully:', data)
                setOrder(data as Order)
            } catch (err) {
                console.error('[Order Details] Fetch error:', err)
                setError(err instanceof Error ? err.message : 'Ошибка загрузки заказа')
            } finally {
                setLoading(false)
            }
        }

        if (orderId) {
            fetchOrderDetails()
        }
    }, [orderId])

    if (loading) {
        return <Loading fullScreen />
    }

    const isPaid = order?.paidStatus === 'PAID'
    const date =
        order?.orderStartDate && !Number.isNaN(Date.parse(order.orderStartDate))
            ? new Date(order.orderStartDate).toLocaleString()
            : '—'

    return (
        <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/my-orders"
                        className="group flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                    >
                        <svg className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Мои заказы
                    </Link>
                    <h1 className="text-3xl font-bold text-stone-900 border-l-4 border-orange-500 pl-4">
                        Заказ #{order?.order_id || orderId}
                    </h1>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-center mb-8">
                        <p className="text-red-800 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </p>
                    </div>
                )}

                {!loading && !error && order && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                        {/* Order Header */}
                        <div className="px-6 py-6 border-b border-stone-100 bg-stone-50/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-stone-900">Заказ #{order.order_id}</h2>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium 
                       ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {isPaid ? 'Оплачено' : 'Ожидает оплаты'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-500 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {date}
                                    </p>
                                </div>

                                {!isPaid && (
                                    <a
                                        href={`https://wa.me/77752794489?text=${encodeURIComponent(`Здравствуйте! Я хочу оплатить заказ №${order.order_id}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200 transition-colors"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Оплатить в WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-semibold text-stone-900 mb-4">Товары в заказе</h3>
                            {order.items && order.items.length ? (
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => {
                                        const product = item.product
                                        const info = item.productInfo
                                        const name = product?.name || info?.productName || `Товар #${product?.product_id || info?.productId || item.productId || '—'}`
                                        const price = product?.price || info?.productPrice

                                        // Handle photo - can be string, array, or Photo object array
                                        let photoUrl: string | undefined
                                        
                                        // Debug logging
                                        console.log('[Order Detail] Item data:', JSON.stringify(item, null, 2))
                                        console.log('[Order Detail] Product:', JSON.stringify(product, null, 2))
                                        console.log('[Order Detail] Info:', JSON.stringify(info, null, 2))
                                        
                                        if (product?.photos && product.photos.length > 0) {
                                            photoUrl = normalizePhoto(product.photos[0])
                                            console.log('[Order Detail] Found photo from product.photos:', photoUrl)
                                        } else if (info?.photos && Array.isArray(info.photos) && info.photos.length > 0) {
                                            photoUrl = normalizePhoto(info.photos[0])
                                            console.log('[Order Detail] Found photo from info.photos:', photoUrl)
                                        } else if (info?.photo) {
                                            if (typeof info.photo === 'string') {
                                                photoUrl = normalizePhoto(info.photo)
                                                console.log('[Order Detail] Found photo from info.photo (string):', photoUrl)
                                            } else if (Array.isArray(info.photo) && info.photo.length > 0) {
                                                photoUrl = normalizePhoto(info.photo[0])
                                                console.log('[Order Detail] Found photo from info.photo (array):', photoUrl)
                                            }
                                        }
                                        
                                        console.log('[Order Detail] Final photoUrl:', photoUrl)

                                        return (
                                            <div
                                                key={`${product?.product_id}-${idx}`}
                                                className="flex flex-col gap-4 p-5 rounded-xl bg-stone-50 border border-stone-100 hover:border-orange-200 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Product Photo */}
                                                    {photoUrl ? (
                                                        <div className="h-24 w-24 rounded-lg overflow-hidden border border-stone-200 flex-shrink-0">
                                                            <img
                                                                src={photoUrl}
                                                                alt={name}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    if (target.parentElement) {
                                                                        target.parentElement.classList.add('bg-stone-100', 'flex', 'items-center', 'justify-center');
                                                                        target.parentElement.innerHTML = `<svg class="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-24 w-24 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
                                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <h4 className="font-semibold text-stone-900 text-lg">{name}</h4>
                                                            <div className="text-right flex-shrink-0">
                                                                {product?.oldPrice !== undefined && (
                                                                    <p className="text-sm text-stone-400 line-through">{product.oldPrice} ₸</p>
                                                                )}
                                                                {price !== undefined && <p className="font-bold text-stone-900 text-xl">{price} ₸</p>}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 text-sm text-stone-600">
                                                            {product?.catalogName && (
                                                                <p className="flex items-center gap-1.5">
                                                                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                                    <span>Категория: <strong>{product.catalogName}</strong></span>
                                                                </p>
                                                            )}
                                                            <p className="flex items-center gap-1.5">
                                                                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                                                <span>Количество: <strong>{item.quantity ?? 1}</strong></span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Information */}
                                                {product?.description && (
                                                    <div className="pt-3 border-t border-stone-200">
                                                        <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">Описание</p>
                                                        <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-stone-500 italic text-sm text-center py-8">Нет товаров в заказе</p>
                            )}
                        </div>

                        {/* Order Total */}
                        {order.items && order.items.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-stone-900">Итого:</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {order.items.reduce((total, item) => {
                                            const price = item.product?.price ?? 0
                                            const quantity = item.quantity ?? 1
                                            return total + (price * quantity)
                                        }, 0)} ₸
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
