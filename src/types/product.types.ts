export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    sale_price: number | null
    salePrice?: number | null
    stock_quantity: number
    unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'pack'
    category_id: string
    category_name?: string | null
    images: string[]
    thumbnail_url: string | null
    is_featured: boolean
    total_sold: number
    max_order_qty: number | null
    tags: string[]
    ingredients?: string | null
    allergen_info?: string | null
    shelf_life?: string | null
    storage_instructions?: string | null
    certifications?: string[] | null
    nutrition_info?: Record<string, string> | null
    variants?: ProductVariant[] | null
    created_at: string
}

export interface ProductVariant {
    id: string
    name: string
    sku?: string | null
    price: number
    sale_price?: number | null
    stock: number
    display_order: number
    is_active: boolean
}

export interface ProductWithHelpers extends Product {
    isOnSale: boolean
    displayPrice: number
    discountPercent: number | null
    inStock: boolean
    isLowStock: boolean
}

export interface Category {
    id: string
    name: string
    description: string | null
    image_url: string | null
    parent_id: string | null
    sort_order: number
    is_active: boolean
    product_count: number
}

export function enrichProduct(p: Product): ProductWithHelpers {
    const salePrice = p.sale_price ?? p.salePrice ?? null
    const isOnSale = salePrice !== null && salePrice < p.price
    return {
        ...p,
        sale_price: salePrice,
        isOnSale,
        displayPrice: isOnSale ? salePrice! : p.price,
        discountPercent: isOnSale ? Math.round(((p.price - salePrice!) / p.price) * 100) : null,
        inStock: p.stock_quantity > 0,
        isLowStock: p.stock_quantity > 0 && p.stock_quantity < 10,
    }
}
