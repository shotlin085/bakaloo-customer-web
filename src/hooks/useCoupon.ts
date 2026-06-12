'use client'

import { AxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { couponsService } from '@/services/coupons.service'
import { formatINR } from '@/lib/utils'
import { useCouponStore, type AppliedCoupon } from '@/store/coupon.store'

const EMPTY_COUPON: AppliedCoupon = {
    code: null,
    discount: 0,
    discountType: null,
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: null,
    isValid: false,
}

function calculateCouponDiscount(coupon: AppliedCoupon, subtotal: number) {
    if (!coupon.isValid) return 0

    let nextDiscount = 0

    if (coupon.discountType === 'PERCENTAGE') {
        nextDiscount = (subtotal * coupon.discountValue) / 100
        if (coupon.maxDiscount != null) {
            nextDiscount = Math.min(nextDiscount, coupon.maxDiscount)
        }
    } else {
        nextDiscount = coupon.discountValue
    }

    return parseFloat(Math.min(nextDiscount, subtotal).toFixed(2))
}

function couponErrorMessage(error: unknown) {
    if (error instanceof AxiosError) {
        const apiMessage = error.response?.data?.message
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
            return apiMessage
        }
    }

    return 'Could not validate coupon'
}

export function useCoupon(cartSubtotal: number) {
    const storedCoupon = useCouponStore((s) => s.coupon)
    const setStoredCoupon = useCouponStore((s) => s.setCoupon)
    const clearStoredCoupon = useCouponStore((s) => s.clearCoupon)
    const [isValidating, setIsValidating] = useState(false)

    const normalizedSubtotal = useMemo(() => Math.max(0, Number(cartSubtotal) || 0), [cartSubtotal])

    useEffect(() => {
        if (!storedCoupon.isValid || !storedCoupon.code) return

        const minOrderAmount = Number(storedCoupon.minOrderAmount) || 0

        if (normalizedSubtotal < minOrderAmount) {
            clearStoredCoupon()
            toast.error(`Coupon removed: minimum order ${formatINR(minOrderAmount)} required`)
            return
        }

        const nextDiscount = calculateCouponDiscount(storedCoupon, normalizedSubtotal)

        if (Math.abs(nextDiscount - storedCoupon.discount) > 0.01) {
            setStoredCoupon({
                ...storedCoupon,
                discount: nextDiscount,
            })
        }
    }, [clearStoredCoupon, normalizedSubtotal, setStoredCoupon, storedCoupon])

    const applyCoupon = useCallback(
        async (code: string) => {
            const normalizedCode = code.trim().toUpperCase()
            if (!normalizedCode) {
                toast.error('Enter a coupon code')
                return
            }

            setIsValidating(true)

            try {
                const result = await couponsService.validate(normalizedCode, normalizedSubtotal)
                if (!result.valid) {
                    toast.error(result.message ?? 'Invalid coupon code')
                    return
                }

                const discount = Math.max(0, Math.min(Number(result.discount) || 0, normalizedSubtotal))

                setStoredCoupon({
                    code: result.code ?? normalizedCode,
                    discount,
                    discountType: result.discountType ?? null,
                    discountValue: Number(result.discountValue) || 0,
                    minOrderAmount: Number(result.minOrderAmount) || 0,
                    maxDiscount:
                        result.maxDiscount != null ? Number(result.maxDiscount) : null,
                    isValid: true,
                })

                toast.success(`Coupon applied! You save ₹${discount}`)
            } catch (error) {
                toast.error(couponErrorMessage(error))
            } finally {
                setIsValidating(false)
            }
        },
        [normalizedSubtotal, setStoredCoupon],
    )

    const removeCoupon = useCallback(() => {
        clearStoredCoupon()
        toast('Coupon removed')
    }, [clearStoredCoupon])

    return {
        coupon: storedCoupon.isValid ? storedCoupon : EMPTY_COUPON,
        applyCoupon,
        removeCoupon,
        isValidating,
    }
}
