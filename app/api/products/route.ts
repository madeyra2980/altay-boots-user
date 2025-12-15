import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

export async function GET() {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/products`, {
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
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
