import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order.types'

interface OrderStatusBadgeProps {
    status: OrderStatus | string
    className?: string
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    PREPARING: 'bg-orange-50 text-orange-700 border-orange-200',
    PACKED: 'bg-purple-50 text-purple-700 border-purple-200',
    OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-50 text-gray-700 border-gray-200',
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const config = ORDER_STATUS_CONFIG[status as OrderStatus]
    const label = config?.label ?? status
    const colorClass = STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                colorClass,
                className,
            )}
        >
            {label}
        </span>
    )
}
