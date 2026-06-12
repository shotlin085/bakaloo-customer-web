'use client'

import { useQuery } from '@tanstack/react-query'
import { Check, Clock, Tag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn, formatDate, formatINR } from '@/lib/utils'
import { couponsService } from '@/services/coupons.service'

type CouponLike = {
    id: string
    code: string
    discount_type: 'PERCENTAGE' | 'FIXED'
    discount_value: number
    min_order_amount?: number
    expires_at?: string
    valid_until?: string
}

interface AvailableCouponsSheetProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onApply: (code: string) => void
    appliedCode?: string | null
}

export function AvailableCouponsSheet({
    open,
    onOpenChange,
    onApply,
    appliedCode,
}: AvailableCouponsSheetProps) {
    const { data } = useQuery({
        queryKey: ['coupons', 'available'],
        queryFn: () => couponsService.getAvailable(),
        enabled: open,
    })

    const coupons = (data ?? []) as CouponLike[]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>Available Coupons</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 overflow-y-auto py-4">
                    {coupons.length === 0 && (
                        <p className="py-6 text-center text-sm text-gray-500">No coupons available right now</p>
                    )}
                    {coupons.map((coupon) => {
                        const isApplied = appliedCode === coupon.code
                        const expiry = coupon.expires_at ?? coupon.valid_until
                        return (
                            <div
                                key={coupon.id}
                                className={cn('rounded-xl border p-4', isApplied ? 'border-green-500 bg-green-50' : 'border-gray-100')}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                                        <span className="font-mono text-sm font-bold text-gray-900">{coupon.code}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onApply(coupon.code)
                                            onOpenChange(false)
                                        }}
                                        disabled={isApplied}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-semibold',
                                            isApplied ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600',
                                        )}
                                        type="button"
                                    >
                                        {isApplied ? (
                                            <>
                                                <Check className="mr-1 inline h-3 w-3" />
                                                Applied
                                            </>
                                        ) : (
                                            'Apply'
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-600">
                                    {coupon.discount_type === 'PERCENTAGE'
                                        ? `${coupon.discount_value}% off`
                                        : `${formatINR(coupon.discount_value)} off`}
                                    {(coupon.min_order_amount ?? 0) > 0 &&
                                        ` · Min order ${formatINR(coupon.min_order_amount ?? 0)}`}
                                </p>
                                {expiry && (
                                    <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock className="h-3 w-3" /> Expires {formatDate(expiry)}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}
