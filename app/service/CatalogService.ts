const API_URL = 'http://185.146.3.132:8080'

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
        const res = await fetch(`${API_URL}/api/v1/auth/catalogs`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch catalogs: ${res.statusText}`)
        }

        const data = await res.json()
        return data
    } catch (error) {
        console.error('Error fetching catalogs:', error)
        return []
    }
}

export async function getCatalogProducts(catalogId: number): Promise<CatalogProduct[]> {
    try {
        const res = await fetch(`${API_URL}/api/v1/auth/catalog-products/${catalogId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch catalog products: ${res.statusText}`)
        }

        const data = await res.json()
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Error fetching catalog products:', error)
        return []
    }
}
