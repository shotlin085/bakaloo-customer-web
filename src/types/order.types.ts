export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'PACKED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED'

export type PaymentMethod = 'COD' | 'ONLINE' | 'WALLET'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
    productId: string
    name: string
    price: number
    quantity: number
    total: number
    image?: string
}

export interface Order {
    id: string
    order_number: string
    status: OrderStatus
    items: OrderItem[]
    subtotal: number
    discount_amount: number
    delivery_fee: number
    platform_fee: number
    total_amount: number
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    delivery_otp?: string | null
    estimated_minutes?: number | null
    loyalty_points_earned?: number
    delivery_notes: string | null
    estimated_delivery: string | null
    address: OrderAddress | null
    rider: OrderRider | null
    created_at: string
    updated_at: string
}

export interface OrderAddress {
    address_line1: string
    address_line2?: string
    city: string
    pincode: string
    lat?: number
    lng?: number
}

export interface OrderRider {
    id: string
    name: string
    phone: string
    photo_url?: string
    rating?: number
}

export interface PlaceOrderPayload {
    addressId: string
    paymentMethod: PaymentMethod
    couponCode?: string
    deliveryNotes?: string
}
