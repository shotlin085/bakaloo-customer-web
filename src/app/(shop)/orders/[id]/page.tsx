'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersService } from '@/services/orders.service'
import { ORDER_STATUS_CONFIG, QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { formatINR, formatDateTime, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { OrderTracking } from '@/components/order/OrderTracking'
import { CancelOrderDialog } from '@/components/order/CancelOrderDialog'
import { ReviewForm } from '@/components/product/ReviewForm'
import { PageHeader, PageShell, TrustRow } from '@/components/shared'
import { Check, ArrowLeft, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import type { OrderStatus } from '@/types/order.types'

const STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [showCancel, setShowCancel] = useState(false)
    const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string } | null>(null)
    const { data: order, isLoading } = useQuery({
        queryKey: QUERY_KEYS.order(params.id),
        queryFn: () => ordersService.getById(params.id),
        staleTime: STALE_TIMES.orders,
        refetchInterval: 30_000,
    })

    useEffect(() => {
        document.title = `Order #${order?.order_number ?? params.id} — Bakaloo`
    }, [order?.order_number, params.id])

    if (isLoading) {
        return (
            <div className="px-6 py-6 space-y-4">
                <Skeleton className="h-8 w-64 rounded" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-60 w-full rounded-xl" />
            </div>
        )
    }

    if (!order) return null

    const config = ORDER_STATUS_CONFIG[order.status]
    const currentIndex = STEPS.indexOf(order.status)
    const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

    return (
        <PageShell spacing="relaxed">
            {/* Header */}
            <PageHeader
                eyebrow="Order detail"
                title={`Order #${order.order_number}`}
                subtitle={formatDateTime(order.created_at)}
                actions={
                    <>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--shop-border)] bg-white text-[color:var(--shop-ink-muted)] transition-colors hover:bg-gray-50"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ color: config.color, backgroundColor: config.bg }}>
                            {config.label}
                        </div>
                    </>
                }
            />

            {/* Timeline */}
            {!isCancelled && (
                <div className="shop-surface-soft rounded-[28px] p-5">
                    <h3 className="mb-4 text-sm font-semibold text-[color:var(--shop-ink)]">Order Progress</h3>
                    <div className="relative">
                        {STEPS.map((step, i) => {
                            const completed = i < currentIndex
                            const active = i === currentIndex
                            const stepConfig = ORDER_STATUS_CONFIG[step]
                            return (
                                <div key={step} className="flex items-start gap-4 pb-5 relative">
                                    {i < STEPS.length - 1 && (
                                        <div className={cn('absolute left-3.5 top-7 w-0.5 h-full', completed ? 'bg-brand-400' : 'bg-gray-200')} />
                                    )}
                                    <div className={cn(
                                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                                        completed && 'bg-brand-500',
                                        active && 'bg-brand-500 ring-4 ring-brand-100',
                                        !completed && !active && 'bg-gray-200',
                                    )}>
                                        {completed ? <Check className="w-3.5 h-3.5 text-white" /> : active ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                                    </div>
                                    <div>
                                        <p className={cn('text-sm font-medium', active ? 'text-brand-600' : completed ? 'text-gray-700' : 'text-gray-400')}>
                                            {stepConfig.label}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
                <OrderTracking
                    orderId={order.id}
                    riderName={order.rider?.name}
                    riderPhone={order.rider?.phone}
                    deliveryOtp={order.delivery_otp ?? undefined}
                    estimatedMinutes={order.estimated_minutes ?? undefined}
                />
            )}

            {/* Order items */}
            <div className="shop-surface-soft rounded-[28px] p-5">
                <h3 className="mb-4 text-sm font-semibold text-[color:var(--shop-ink)]">Items ({order.items.length})</h3>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
                                {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="48px" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{formatINR(item.total)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price breakdown */}
            <div className="shop-surface-soft space-y-2 rounded-[28px] p-5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span>{order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}</span></div>
                {order.discount_amount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-brand-500">-{formatINR(order.discount_amount)}</span></div>}
                <div className="border-t border-gray-100 pt-2 flex justify-between"><span className="font-bold">Total</span><span className="font-extrabold text-brand-500">{formatINR(order.total_amount)}</span></div>
            </div>

            <TrustRow />

            {order.status === 'DELIVERED' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-amber-800">How was your order?</p>
                    <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item) => (
                            <button
                                key={item.productId}
                                onClick={() => setReviewProduct({ id: item.productId, name: item.name })}
                                className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs transition-colors hover:border-amber-400"
                            >
                                Rate {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                    <Button
                        variant="outline"
                        onClick={() => setShowCancel(true)}
                        className="flex-1 border-red-200 text-red-500 hover:bg-red-50 rounded-xl"
                    >
                        Cancel Order
                    </Button>
                )}
                {order.status === 'DELIVERED' && (
                    <Button
                        onClick={async () => {
                            try { await ordersService.reorder(order.id); router.push('/cart'); toast.success('Items added to cart!') } catch { toast.error('Could not reorder') }
                        }}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Reorder
                    </Button>
                )}
            </div>

            <CancelOrderDialog
                isOpen={showCancel}
                onClose={() => setShowCancel(false)}
                orderId={order.id}
                onCancelled={() => {
                    setShowCancel(false)
                    router.refresh()
                }}
            />

            {reviewProduct && (
                <ReviewForm
                    isOpen={!!reviewProduct}
                    onClose={() => setReviewProduct(null)}
                    productId={reviewProduct.id}
                    productName={reviewProduct.name}
                    orderId={order.id}
                />
            )}
        </PageShell>
    )
}
