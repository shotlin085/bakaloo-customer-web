export type NotificationType =
    | 'ORDER_STATUS'
    | 'PAYMENT'
    | 'PROMOTION'
    | 'DELIVERY'
    | 'ADMIN_BROADCAST'
    | 'SYSTEM'

export interface Notification {
    id: string
    title: string
    body: string
    type: NotificationType
    data?: Record<string, unknown>
    is_read: boolean
    created_at: string
}

export interface NotificationPreferences {
    orderUpdates: boolean
    promotions: boolean
    newProducts: boolean
    priceDrops: boolean
}
