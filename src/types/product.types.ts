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

    // Multi-vendor fields — populated when fetching via /shop-products
    shop_id?: string | null
    shop_product_id?: string | null    // shopProductId — junction table PK
    shop_name?: string | null
    shop_price?: number | null         // Store-specific sale price
    shop_stock?: number | null         // Store-specific stock
    shop_is_active?: boolean | null

    // Product family / size options
    family_id?: string | null
    option_label?: string | null       // e.g. "500g", "1kg"
    option_count?: number | null       // How many options exist in the family
    net_quantity?: string | null       // Display label e.g. "500 g"
    avg_rating?: number | null
    rating_count?: number | null
}

/**
 * A product as returned by the /shop-products endpoint.
 * All multi-vendor fields are guaranteed non-null.
 */
export interface ShopProduct extends Product {
    shop_id: string
    shop_product_id: string
    shop_name: string
    shop_price: number | null
    shop_stock: number
    shop_is_active: boolean
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
    // Use shop_price if available (multi-vendor), else fall back to sale_price / salePrice
    const shopPrice = p.shop_price ?? null
    const salePrice = shopPrice ?? p.sale_price ?? p.salePrice ?? null
    const isOnSale = salePrice !== null && salePrice < p.price
    // Effective stock: use shop_stock when present, else product stock
    const effectiveStock = p.shop_stock != null ? p.shop_stock : p.stock_quantity
    return {
        ...p,
        sale_price: salePrice,
        isOnSale,
        displayPrice: isOnSale ? salePrice! : p.price,
        discountPercent: isOnSale ? Math.round(((p.price - salePrice!) / p.price) * 100) : null,
        inStock: effectiveStock > 0,
        isLowStock: effectiveStock > 0 && effectiveStock < 10,
    }
}
