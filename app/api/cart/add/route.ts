import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function POST(request: Request) {
    try {
        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        console.log('[Add to Cart] Auth header present:', !!authHeader)
        console.log('[Add to Cart] Auth header value (first 50 chars):', authHeader?.substring(0, 50))

        if (!authHeader) {
            console.log('[Add to Cart] ERROR: No auth header')
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const body = await request.json()
        console.log('[Add to Cart] Request body:', body)

        const response = await fetch(`${API_URL}/api/v1/user/add-product-to-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
        })

        console.log('[Add to Cart] Backend response status:', response.status)

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            console.log('[Add to Cart] Backend error response:', text)
            return NextResponse.json(
                { error: text || `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const text = await response.text()
        console.log('[Add to Cart] Backend success response:', text)
        return NextResponse.json({ success: true, message: text })
    } catch (error) {
        console.error('[Add to Cart] Exception:', error)
        return NextResponse.json(
            { error: 'Failed to add to cart' },
            { status: 500 }
        )
    }
}
