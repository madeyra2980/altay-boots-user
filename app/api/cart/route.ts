import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET(request: Request) {
    try {
        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        console.log('[Get Cart] Auth header present:', !!authHeader)
        console.log('[Get Cart] Auth header value (first 50 chars):', authHeader?.substring(0, 50))

        if (!authHeader) {
            console.log('[Get Cart] ERROR: No auth header')
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/api/v1/user/cart`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': authHeader,
            },
            cache: 'no-store',
        })

        console.log('[Get Cart] Backend response status:', response.status)

        if (!response.ok) {
            console.log('[Get Cart] Backend returned error:', response.status)
            return NextResponse.json(
                { error: `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const text = await response.text()
        console.log('[Get Cart] Backend response body:', text || '(empty)')
        console.log('[Get Cart] Backend response body length:', text.length)

        if (!text || text.trim() === '') {
            // Пустая корзина
            console.log('[Get Cart] Empty cart response from backend')
            return NextResponse.json({ cartId: null, items: [], totalPrice: 0 })
        }

        const data = JSON.parse(text)
        console.log('[Get Cart] Parsed cart items count:', data.items?.length || 0)
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Get Cart] Exception:', error)
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        )
    }
}
