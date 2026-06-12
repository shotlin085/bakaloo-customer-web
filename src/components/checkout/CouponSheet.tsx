'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Tag, X } from 'lucide-react'
import { couponsService } from '@/services/coupons.service'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { formatDate, formatINR } from '@/lib/utils'

interface CouponSheetProps {
    isOpen: boolean
    onClose: () => void
    onApply: (code: string) => void
    appliedCode: string | null
    isValidating: boolean
    onRemove?: () => void
}

interface CouponItem {
    id: string
    code: string
    discountType?: 'PERCENTAGE' | 'FLAT' | 'FIXED' | string
    discountValue?: number
    minOrderAmount?: number
    validUntil?: string | null
    description?: string | null
}

function getCouponDescription(coupon: CouponItem) {
    if (coupon.discountType === 'PERCENTAGE') {
        return `${coupon.discountValue ?? 0}% off`
    }
    return `${formatINR(coupon.discountValue ?? 0)} off`
}

export function CouponSheet({
    isOpen,
    onClose,
    onApply,
    appliedCode,
    isValidating,
    onRemove,
}: CouponSheetProps) {
    const [manualCode, setManualCode] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.coupons(),
        queryFn: couponsService.getAvailable,
        staleTime: 5 * 60 * 1000,
        enabled: isOpen,
    })

    const coupons = useMemo(() => (Array.isArray(data) ? (data as CouponItem[]) : []), [data])

    const applyCode = (code: string) => {
        const value = code.trim().toUpperCase()
        if (!value) return
        onApply(value)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white p-5"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Apply Coupon</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                aria-label="Close coupon sheet"
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        {appliedCode && (
                            <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                                <span className="text-sm font-semibold text-green-700">Applied: {appliedCode}</span>
                                {onRemove && (
                                    <button
                                        type="button"
                                        onClick={onRemove}
                                        className="text-xs font-semibold text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mb-4 flex gap-2">
                            <input
                                value={manualCode}
                                onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                                placeholder="ENTER COUPON CODE"
                                className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm font-semibold tracking-widest text-gray-900 uppercase outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => applyCode(manualCode)}
                                disabled={isValidating}
                                className="inline-flex h-12 items-center justify-center rounded-lg bg-green-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </button>
                        </div>

                        <div className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                            or choose from available
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="skeleton-shimmer h-[110px] rounded-xl" />
                                ))
                            ) : coupons.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                                    No coupons available right now.
                                </div>
                            ) : (
                                coupons.map((coupon) => (
                                    <article
                                        key={coupon.id}
                                        className="rounded-xl border border-dashed border-green-300 bg-white p-4"
                                    >
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div>
                                                <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-dashed border-green-400 bg-green-50 px-2 py-1 font-mono text-sm font-bold tracking-wide text-green-700">
                                                    <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                    {coupon.code}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {getCouponDescription(coupon)}
                                                </p>
                                                {coupon.description && (
                                                    <p className="mt-1 text-xs text-gray-500">{coupon.description}</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => applyCode(coupon.code)}
                                                disabled={isValidating}
                                                className="inline-flex h-10 items-center justify-center rounded-lg bg-green-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Apply
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                            <span>Min order: {formatINR(coupon.minOrderAmount ?? 0)}</span>
                                            {coupon.validUntil && (
                                                <span>Expires: {formatDate(coupon.validUntil)}</span>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
