import { NextResponse } from 'next/server'

const API_URL = 'http://185.146.3.132:8080'

// Helper function to normalize sizes from various formats
function normalizeSizes(product: any): string | null {
  // Try different field names
  let sizesValue = product.sizes || product.size || product.shoeSizes || product.shoe_size || product.shoeSize
  
  if (!sizesValue) {
    return null
  }
  
  // If it's already a string, return it
  if (typeof sizesValue === 'string') {
    return sizesValue.trim() || null
  }
  
  // If it's an array, join it
  if (Array.isArray(sizesValue)) {
    return sizesValue.filter(s => s != null).map(s => String(s)).join(', ')
  }
  
  // If it's an object, try to extract values
  if (typeof sizesValue === 'object') {
    const values = Object.values(sizesValue).filter(v => v != null)
    if (values.length > 0) {
      return values.map(v => String(v)).join(', ')
    }
  }
  
  return null
}

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

        const response = await fetch(`${API_URL}/api/v1/auth/products`, {
            method: 'GET',
            headers,
            cache: 'no-store',
        })

        // Если 403, попробуем без токена (публичный доступ)
        if (response.status === 403) {
            const publicResponse = await fetch(`${API_URL}/api/v1/auth/products`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                },
                cache: 'no-store',
            })

            if (publicResponse.ok) {
                const text = await publicResponse.text()
                const data = text ? JSON.parse(text) : []
                
                // Normalize the response data to ensure sizes field is properly mapped
                const normalizedData = Array.isArray(data) ? data.map((product: any) => ({
                  ...product, // Preserve all original fields
                  // Ensure sizes field is properly normalized
                  sizes: normalizeSizes(product),
                })) : []
                
                return NextResponse.json(normalizedData)
            }

            // Если даже без токена 403, возвращаем пустой список
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
        
        // Normalize the response data to ensure sizes field is properly mapped
        const normalizedData = Array.isArray(data) ? data.map((product: any) => ({
          ...product, // Preserve all original fields
          // Ensure sizes field is properly normalized
          sizes: normalizeSizes(product),
        })) : []
        
        return NextResponse.json(normalizedData)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
