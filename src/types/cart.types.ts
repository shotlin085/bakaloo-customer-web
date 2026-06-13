export interface CartItem {
    productId: string
    name: string
    price: number
    originalPrice?: number | null
    quantity: number
    unit: string
    image: string | null
    slug?: string
    subtotal: number
    inStock: boolean
    stockQuantity?: number

    // Multi-vendor fields — required for correct checkout
    shopProductId: string          // Junction table PK — used in cart API calls
    storeId: string                // Which store this item belongs to
    storeName: string              // For display and cross-store conflict detection
}

export interface Cart {
    items: CartItem[]
    subtotal: number
    count: number

    // Multi-vendor — which store owns this cart
    storeId: string | null
    storeName: string | null
}
