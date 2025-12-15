import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        const headers: HeadersInit = {
            'accept': '*/*',
        }

        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const response = await fetch(`${API_URL}/api/v1/auth/product/${id}`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        // Если 403, попробуем без токена (публичный доступ)
        if (response.status === 403) {
            // Возвращаем данные из общего списка продуктов
            const productsResponse = await fetch(`${API_URL}/api/v1/auth/products`, {
                method: 'GET',
                headers: { 'accept': '*/*' },
                cache: 'no-store',
            })

            if (productsResponse.ok) {
                const products = await productsResponse.json()
                const product = products.find((p: any) => p.product_id === parseInt(id))
                if (product) {
                    return NextResponse.json(product)
                }
            }

            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const text = await response.text()
        if (!text) {
            // Если пустой ответ, ищем в списке продуктов
            const productsResponse = await fetch(`${API_URL}/api/v1/auth/products`, {
                method: 'GET',
                headers: { 'accept': '*/*' },
                cache: 'no-store',
            })

            if (productsResponse.ok) {
                const products = await productsResponse.json()
                const product = products.find((p: any) => p.product_id === parseInt(id))
                if (product) {
                    return NextResponse.json(product)
                }
            }

            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        const data = JSON.parse(text)
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}
