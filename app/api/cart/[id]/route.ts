import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Получаем токен из заголовков запроса
        const authHeader = request.headers.get('Authorization')

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header required' },
                { status: 401 }
            )
        }

        const response = await fetch(`${API_URL}/api/v1/user/delete-cart-item/${id}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': authHeader,
            },
        })

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            return NextResponse.json(
                { error: text || `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting cart item:', error)
        return NextResponse.json(
            { error: 'Failed to delete cart item' },
            { status: 500 }
        )
    }
}
