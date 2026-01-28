import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: orderId } = await params
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
        return NextResponse.json(
            { message: 'Необходима авторизация' },
            { status: 401 }
        )
    }

    try {
        console.log('[Order API] Fetching order ID:', orderId)
        console.log('[Order API] Auth header present:', !!authHeader)

        const response = await fetch(
            `http://185.146.3.132:8080/api/v1/user/order/${orderId}`,
            {
                headers: {
                    accept: '*/*',
                    Authorization: authHeader,
                },
            }
        )

        console.log('[Order API] Response status:', response.status)

        const data = await response.json().catch(() => ({}))

        console.log('[Order API] Response data:', JSON.stringify(data, null, 2))

        if (!response.ok) {
            console.error('[Order API] Error response:', data)
            return NextResponse.json(
                { message: data.message || 'Не удалось получить данные заказа' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching order:', error)
        return NextResponse.json(
            { message: 'Ошибка сервера' },
            { status: 500 }
        )
    }
}
