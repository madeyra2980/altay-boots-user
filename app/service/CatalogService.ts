const API_URL = ''

export type Catalog = {
    catalog_id: number
    name: string
}

export type CatalogProduct = {
    product_id: number
    catalog_id: number
    name: string
    description?: string
    text?: string
    price?: number
    oldPrice?: number
    photos?: string[]
}

export async function getCatalogs(): Promise<Catalog[]> {
    try {
        const res = await fetch(`/api/catalogs`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
        })

        // Безопасный парсинг JSON (защита от пустого ответа)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
            throw new Error(`Failed to fetch catalogs: ${res.statusText}`)
        }

        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Error fetching catalogs:', error)
        return []
    }
}

export async function getCatalogProducts(catalogId: number): Promise<CatalogProduct[]> {
    try {
        const res = await fetch(`/api/catalog-products/${catalogId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
        })

        // Безопасный парсинг JSON (защита от пустого ответа)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
            throw new Error(`Failed to fetch catalog products: ${res.statusText}`)
        }

        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Error fetching catalog products:', error)
        return []
    }
}
