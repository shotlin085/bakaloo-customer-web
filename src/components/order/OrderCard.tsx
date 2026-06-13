'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, RotateCcw, Store } from 'lucide-react'
import { formatDate, formatINR } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'
import { ordersService } from '@/services/orders.service'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Order, OrderItem } from '@/types/order.types'

interface OrderCardProps {
    order: Order
    onReorder?: (orderId: string) => void
}

type OrderItemExtended = OrderItem & {
    thumbnail_url?: string | null
}

type OrderExtended = Order & {
    total?: number
    createdAt?: string
}

export function OrderCard({ order, onReorder }: OrderCardProps) {
    const orderData = order as OrderExtended
    const items = order.items ?? []
    const displayItems = items.slice(0, 3)
    const moreCount = Math.max(0, items.length - 3)
    const total = orderData.total_amount ?? orderData.total ?? 0
    const createdAt = order.created_at || orderData.createdAt
    const [isReordering, setIsReordering] = useState(false)

    const handleReorder = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isReordering) return
        setIsReordering(true)
        try {
            await ordersService.reorder(order.id)
            toast.success('Items added to cart! 🛒')
            onReorder?.(order.id)
        } catch {
            toast.error('Could not reorder. Please try again.')
        } finally {
            setIsReordering(false)
        }
    }

    return (
        <Link
            href={`/orders/${order.id}`}
            className="block rounded-2xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-gray-400">
                        {order.order_number ?? `#${order.id.slice(0, 8)}`}
                    </p>
                    {order.shop_name && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {order.shop_name}
                        </p>
                    )}
                    <p className="mt-0.5 text-sm font-bold text-gray-900">
                        {formatINR(total)} · {items.length} item{items.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <OrderStatusBadge status={order.status} />
                    {/* Reorder button — highest retention feature for grocery */}
                    {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                        <button
                            type="button"
                            onClick={handleReorder}
                            disabled={isReordering}
                            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                        >
                            <RotateCcw className={`h-3 w-3 ${isReordering ? 'animate-spin' : ''}`} />
                            {isReordering ? 'Adding…' : 'Reorder'}
                        </button>
                    )}
                </div>
            </div>

            {displayItems.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                    {displayItems.map((item, i) => {
                        const product = item as OrderItemExtended
                        return (
                            <div
                                key={i}
                                className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                            >
                                <Image
                                    src={item.image || product.thumbnail_url || '/placeholder-product.svg'}
                                    alt={item.name || 'Product'}
                                    fill
                                    className="object-contain p-1"
                                    sizes="40px"
                                />
                            </div>
                        )
                    })}
                    {moreCount > 0 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
                            +{moreCount}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">{createdAt ? formatDate(createdAt) : ''}</p>
                <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
        </Link>
    )
}
