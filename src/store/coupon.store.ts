import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AppliedCoupon {
    code: string | null
    discount: number
    discountType: string | null
    discountValue: number
    minOrderAmount: number
    maxDiscount: number | null
    isValid: boolean
}

const INITIAL_COUPON: AppliedCoupon = {
    code: null,
    discount: 0,
    discountType: null,
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: null,
    isValid: false,
}

interface CouponState {
    coupon: AppliedCoupon
    setCoupon: (coupon: AppliedCoupon) => void
    clearCoupon: () => void
}

export const useCouponStore = create<CouponState>()(
    persist(
        (set) => ({
            coupon: INITIAL_COUPON,
            setCoupon: (coupon) => set({ coupon }),
            clearCoupon: () => set({ coupon: INITIAL_COUPON }),
        }),
        {
            name: 'bakaloo-coupon',
            storage: createJSONStorage(() => localStorage),
            version: 2,
            migrate: (persistedState) => {
                const state = persistedState as Partial<CouponState> | undefined
                const persistedCoupon = state?.coupon

                return {
                    coupon: {
                        ...INITIAL_COUPON,
                        ...persistedCoupon,
                        minOrderAmount: Number(persistedCoupon?.minOrderAmount) || 0,
                        maxDiscount:
                            persistedCoupon?.maxDiscount != null
                                ? Number(persistedCoupon.maxDiscount)
                                : null,
                    },
                }
            },
        },
    ),
)
