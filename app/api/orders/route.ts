import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
        return NextResponse.json(
            { message: 'Необходима авторизация' },
            { status: 401 }
        )
    }

    try {
        console.log('[Orders API] Fetching all orders')
        console.log('[Orders API] Auth header present:', !!authHeader)

        const response = await fetch(
            `${API_URL}/api/v1/user/orders`,
            {
                headers: {
                    accept: '*/*',
                    Authorization: authHeader,
                },
            }
        )

        console.log('[Orders API] Response status:', response.status)

        const data = await response.json().catch(() => ({}))

        console.log('[Orders API] Response data:', JSON.stringify(data, null, 2))

        if (!response.ok) {
            console.error('[Orders API] Error response:', data)
            return NextResponse.json(
                { message: data.message || 'Не удалось получить список заказов' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json(
            { message: 'Ошибка сервера' },
            { status: 500 }
        )
    }
}
