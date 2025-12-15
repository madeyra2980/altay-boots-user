import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function PUT(request: Request) {
    try {
        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const body = await request.json()

        const response = await fetch(`${API_URL}/api/v1/user/edit-cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            return NextResponse.json(
                { error: text || `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const text = await response.text()
        return NextResponse.json({ success: true, message: text })
    } catch (error) {
        console.error('Error updating cart:', error)
        return NextResponse.json(
            { error: 'Failed to update cart' },
            { status: 500 }
        )
    }
}
