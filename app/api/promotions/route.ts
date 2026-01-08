import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET(request: Request) {
    try {
        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        const headers: HeadersInit = {
            'accept': '*/*',
        }

        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const response = await fetch(`${API_URL}/api/v1/auth/promotions`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        // Если 403, попробуем без токена (публичный доступ)
        if (response.status === 403) {
            const publicResponse = await fetch(`${API_URL}/api/v1/auth/promotions`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                },
                cache: 'no-store',
            })

            if (publicResponse.ok) {
                const text = await publicResponse.text()
                const data = text ? JSON.parse(text) : []
                return NextResponse.json(data)
            }

            // Если даже без токена 403 (как сейчас на бэкенде для акций), 
            // возвращаем пустой список вместо ошибки, чтобы не ломать фронтенд
            return NextResponse.json([])
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const text = await response.text()
        const data = text ? JSON.parse(text) : []
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching promotions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        )
    }
}
