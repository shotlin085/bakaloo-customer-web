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
}

export interface Cart {
    items: CartItem[]
    subtotal: number
    count: number
}
