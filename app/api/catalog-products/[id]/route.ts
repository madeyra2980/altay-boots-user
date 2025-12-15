import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const response = await fetch(`${API_URL}/api/v1/auth/catalog-products/${id}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Server error: ${response.status}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching catalog products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch catalog products' },
            { status: 500 }
        )
    }
}
