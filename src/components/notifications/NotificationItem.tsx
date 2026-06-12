'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle, Bell, Megaphone, Package, ShoppingBag, Wallet } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types/notification.types'

const TYPE_ICONS: Record<string, { icon: typeof Bell; bg: string; color: string }> = {
    ORDER_STATUS: { icon: Package, bg: 'bg-blue-50', color: 'text-blue-500' },
    PAYMENT: { icon: Wallet, bg: 'bg-green-50', color: 'text-green-500' },
    DELIVERY: { icon: ShoppingBag, bg: 'bg-orange-50', color: 'text-orange-500' },
    PROMOTION: { icon: Megaphone, bg: 'bg-purple-50', color: 'text-purple-500' },
    SYSTEM: { icon: AlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' },
}
const DEFAULT_TYPE_ICON = { icon: AlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' } as const

type NotificationLike = Notification & {
    read?: boolean
    createdAt?: string
}

interface NotificationItemProps {
    notification: Notification
    onMarkRead?: (id: string) => void | Promise<void>
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
    const router = useRouter()
    const notificationData = notification as NotificationLike
    const typeConfig = TYPE_ICONS[notification.type] ?? DEFAULT_TYPE_ICON
    const Icon = typeConfig.icon
    const isRead = notificationData.is_read ?? notificationData.read ?? false

    const handleClick = async () => {
        if (!isRead && onMarkRead) {
            await Promise.resolve(onMarkRead(notification.id))
        }

        const data = notification.data as Record<string, unknown> | undefined
        const orderId = String(data?.orderId ?? data?.order_id ?? '')

        switch (notification.type) {
            case 'ORDER_STATUS':
            case 'DELIVERY':
                if (orderId) router.push(`/orders/${orderId}`)
                break
            case 'PAYMENT':
                router.push('/wallet')
                break
            case 'PROMOTION':
                router.push('/products?sort=popular')
                break
            default:
                break
        }
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors',
                isRead
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'border-l-[3px] border-l-green-500 bg-white hover:bg-green-50/30',
            )}
            type="button"
        >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', typeConfig.bg)}>
                <Icon className={cn('h-5 w-5', typeConfig.color)} strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1">
                <p className={cn('text-sm', isRead ? 'text-gray-600' : 'font-semibold text-gray-900')}>
                    {notification.title}
                </p>
                {notification.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">{notification.body}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">
                    {formatDateTime(notification.created_at ?? notificationData.createdAt ?? '')}
                </p>
            </div>

            {!isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-500" />}
        </button>
    )
}
