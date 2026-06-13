'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersService } from '@/services/orders.service'
import { formatINR, formatDate, cn } from '@/lib/utils'
import { ORDER_STATUS_CONFIG } from '@/lib/constants'
import { keys, STALE } from '@/lib/queryKeys'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyStateCard, PageHeader, PageShell } from '@/components/shared'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types/order.types'

type Tab = 'active' | 'past' | 'cancelled'

export default function OrdersPage() {
    const [tab, setTab] = useState<Tab>('active')

    useEffect(() => {
        document.title = 'My Orders — Bakaloo'
    }, [])


    const { data, isLoading } = useQuery({
        queryKey: keys.orders({}),
        queryFn: () => ordersService.getAll({ limit: 50 }),
        staleTime: STALE.orders,
    })

    const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY']
    const PAST_STATUSES = ['DELIVERED', 'REFUNDED']
    const CANCELLED_STATUSES = ['CANCELLED']

    const allOrders: Order[] = data?.orders ?? []
    const orders = allOrders.filter((o: Order) => {
        if (tab === 'active') return ACTIVE_STATUSES.includes(o.status)
        if (tab === 'cancelled') return CANCELLED_STATUSES.includes(o.status)
        return PAST_STATUSES.includes(o.status)
    })

    return (
        <PageShell spacing="relaxed">
            <PageHeader
                eyebrow="Order history"
                title="My Orders"
                subtitle="Track active deliveries, revisit past purchases, and monitor every order status."
            />

            {/* Tabs */}
            <div className="shop-surface-soft flex gap-1 rounded-[22px] p-1.5">
                {(['active', 'past', 'cancelled'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                            tab === t ? 'bg-white text-[color:var(--shop-ink)] shadow-sm' : 'text-[color:var(--shop-ink-muted)] hover:text-[color:var(--shop-ink)]',
                        )}
                    >
                        {t === 'active' ? 'Active' : t === 'past' ? 'Past' : 'Cancelled'}
                    </button>
                ))}
            </div>

            {/* Orders list */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyStateCard
                    icon={Package}
                    title={tab === 'active' ? 'No active orders' : tab === 'past' ? 'No completed orders' : 'No cancelled orders'}
                    subtitle="When you place orders, they will appear here with live status and pricing details."
                    ctaLabel="Start Shopping"
                    ctaHref="/"
                />
            ) : (
                <div className="space-y-3">
                    {orders.map((order: Order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </PageShell>
    )
}

function OrderCard({ order }: { order: Order }) {
    const config = ORDER_STATUS_CONFIG[order.status]
    return (
        <Link
            href={`/orders/${order.id}`}
            className="block rounded-[24px] border border-[color:var(--shop-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,239,0.98)_100%)] p-5 transition-shadow hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-sm font-bold text-[color:var(--shop-ink)]">#{order.order_number}</p>
                    <p className="mt-0.5 text-xs text-[color:var(--shop-ink-muted)]">{formatDate(order.created_at)}</p>
                </div>
                <div
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ color: config.color, backgroundColor: config.bg }}
                >
                    {config.label}
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[color:var(--shop-ink-muted)]">{order.items.length} items</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm font-bold text-[color:var(--shop-ink)]">{formatINR(order.total_amount)}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[color:var(--shop-ink-muted)]" />
            </div>
        </Link>
    )
}
