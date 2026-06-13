'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, ShoppingBag, Clock, Package } from 'lucide-react'
import { ordersService } from '@/services/orders.service'
import { keys } from '@/lib/queryKeys'
import { formatDateTime, formatINR } from '@/lib/utils'
import { ShareButton } from '@/components/shared/ShareButton'

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams()
    const queryClient = useQueryClient()
    const orderId = searchParams.get('orderId') ?? ''

    useEffect(() => {
        document.title = 'Order Success — Bakaloo'
    }, [])

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: keys.cartFallback() })
    }, [queryClient])

    const { data: order, isLoading } = useQuery({
        queryKey: keys.order(orderId || 'unknown'),
        queryFn: () => ordersService.getById(orderId),
        enabled: Boolean(orderId),
        staleTime: 60 * 1000,
    })

    const itemCount = useMemo(
        () => order?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
        [order?.items],
    )

    const estimatedDelivery = order?.estimated_delivery
        ? formatDateTime(order.estimated_delivery)
        : 'Estimated in 30-45 min'

    return (
        <div className="page-enter mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-8 text-center">
            <motion.div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <CheckCircle2 className="h-11 w-11 text-green-500" strokeWidth={1.5} />
            </motion.div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Placed Successfully</h1>
            <p className="mb-6 max-w-sm text-sm text-gray-500">
                Your order is confirmed. We&apos;ll keep you updated at every step.
            </p>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-5 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="skeleton-shimmer mb-3 h-5 w-40 rounded-md" />
                        <div className="skeleton-shimmer mb-2 h-4 w-24 rounded-md" />
                        <div className="skeleton-shimmer h-4 w-32 rounded-md" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-5 text-left"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-3">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Order Number</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {order?.order_number || (orderId ? `#${orderId.slice(0, 8)}` : 'N/A')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="text-base font-bold text-green-600">
                                    {formatINR(order?.total_amount ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-gray-400">Items</p>
                                <p className="text-base font-bold text-gray-900">{itemCount}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-3">
                                <p className="text-xs text-gray-400">Status</p>
                                <p className="text-base font-bold text-gray-900">{order?.status ?? 'CONFIRMED'}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                            <Clock className="h-4 w-4" strokeWidth={1.5} />
                            <span>{estimatedDelivery}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {order?.loyalty_points_earned && order.loyalty_points_earned > 0 && (
                <motion.div
                    className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-lg">🪙</span>
                    <span className="text-sm font-semibold text-amber-800">
                        +{order.loyalty_points_earned} loyalty points earned!
                    </span>
                </motion.div>
            )}

            <div className="flex w-full flex-col gap-3 sm:flex-row">
                {orderId && (
                    <Link
                        href={`/orders/${orderId}#tracking`}
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                    >
                        <Package className="h-4 w-4" strokeWidth={1.5} />
                        Track Order
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                )}

                <Link
                    href="/"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    Continue Shopping
                </Link>

                {orderId && (
                    <ShareButton
                        title="My Bakaloo order"
                        text="I just placed an order on Bakaloo."
                        url={`/orders/${orderId}`}
                        className="h-12 w-12 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    />
                )}
            </div>
        </div>
    )
}
