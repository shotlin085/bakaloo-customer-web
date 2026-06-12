'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag } from 'lucide-react'

interface CheckoutSuccessProps {
    orderNumber?: string
    orderId?: string
    total?: number
    estimatedTime?: string
}

export function CheckoutSuccess({ orderNumber, orderId, estimatedTime }: CheckoutSuccessProps) {
    useEffect(() => {
        document.title = 'Order Placed! - Bakaloo'
    }, [])

    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
            >
                <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900"
            >
                Order Placed! 🎉
            </motion.h1>

            {orderNumber && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-2 font-mono text-sm text-gray-500"
                >
                    {orderNumber}
                </motion.p>
            )}

            {estimatedTime && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="mt-1 text-sm text-gray-500"
                >
                    {estimatedTime}
                </motion.p>
            )}

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
                {orderId && (
                    <Link
                        href={`/orders/${orderId}`}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-semibold text-white hover:bg-green-600"
                    >
                        <ArrowRight className="h-4 w-4" />
                        Track Order
                    </Link>
                )}

                <Link
                    href="/"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                </Link>
            </motion.div>
        </div>
    )
}
