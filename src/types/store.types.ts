// Store types for multi-vendor architecture.
// The backend is the source of truth for all store/serviceability data.

export type StoreStatus = 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED'

export interface Store {
    id: string
    name: string
    slug: string
    logo_url: string | null
    status: StoreStatus
    description: string | null
    address: string | null
    phone: string | null
    minimum_order: number
    delivery_eta: number           // minutes
    delivery_distance: number      // km
    free_delivery_threshold: number
    delivery_fee: number
    platform_fee: number
    handling_fee: number
    rating: number | null
    total_orders: number
}

export interface ServiceabilityResult {
    serviceable: boolean
    reason: string | null
    store?: StoreAllocation        // Primary allocated store for this location
    stores: Store[]                // All serviceable stores (may be multiple)
    pincode: string
}

/** Flat projection of Store used by StoreContext — easier to spread/persist */
export interface StoreAllocation {
    storeId: string
    storeName: string
    storeSlug: string
    storeLogo: string | null
    storeStatus: StoreStatus
    serviceable: boolean
    availabilityReason: string | null
    deliveryEta: number
    deliveryDistance: number
    minimumOrder: number
}

/** Fee breakdown returned by GET /stores/:storeId/fees?addressId= */
export interface FeeSummary {
    subtotal: number
    item_discount: number
    coupon_discount: number
    delivery_fee: number
    handling_fee: number
    platform_fee: number
    small_cart_fee: number
    total_savings: number
    payable_total: number
    free_delivery_threshold: number
    free_delivery_remaining: number
    distance_km: number
    eta_minutes: number
}

/** Delivery slot returned by GET /stores/:storeId/delivery-slots?date= */
export interface DeliverySlot {
    id: string
    label: string          // e.g. "10:00 AM – 12:00 PM"
    start_time: string     // ISO
    end_time: string       // ISO
    available: boolean
    max_orders: number
    current_orders: number
}
