/**
 * Fees & bill summary service.
 *
 * The backend computes all fees server-side via GET /cart/summary.
 * This is the ONLY authoritative source — never calculate fees client-side.
 *
 * Response shape (BillSummaryService):
 *  - itemTotal.discounted    → item subtotal
 *  - deliveryFee.amount      → delivery fee
 *  - handlingFee.amount      → handling fee
 *  - platformFee.amount      → platform fee
 *  - smallCartFee.amount     → small cart fee
 *  - couponDiscount          → coupon discount (0 before checkout)
 *  - toPay.final             → total payable
 *  - savings.total           → total savings
 *  - deliveryFee.freeIn      → amount to add for free delivery
 *  - freeDelivery.threshold  → free delivery threshold
 *  - deliveryEstimate.minutes → ETA
 *  - fees[]                  → line-item fee breakdown array
 */

import api from '@/lib/api'

export interface CartBillSummary {
    // Item totals
    itemTotal: { original: number; discounted: number }
    // Fees
    deliveryFee: {
        amount: number
        isFree: boolean
        freeIn: number
        originalAmount: number
        waiverReason: string | null
    }
    handlingFee: { amount: number; isFree: boolean; savedAmount: number }
    platformFee: { amount: number; isFree: boolean }
    smallCartFee: { amount: number; isFree: boolean }
    // Totals
    couponDiscount: number
    tipAmount: number
    toPay: { original: number; final: number }
    totalPayable: number
    savings: { total: number; breakdown: Array<{ type: string; label: string; amount: number }> }
    // Delivery
    deliveryEstimate: { minutes: number; label: string }
    // Free delivery
    freeDelivery: {
        enabled: boolean
        threshold: number | null
        unlocked: boolean
        amountToUnlock: number
    }
    // Item count
    itemCount: number
    // Line-item fee array (for itemised display)
    fees: Array<{
        code: string
        label: string
        amount: number
        originalAmount: number
        waived: boolean
        description: string
    }>
}

export const feesService = {
    /**
     * GET /cart/summary — full bill breakdown for the current cart.
     * Requires auth. Backend calculates distance-based delivery fee from
     * the user's saved default address.
     */
    getCartSummary: async (): Promise<CartBillSummary> => {
        const { data } = await api.get('/cart/summary')
        return data.data ?? data
    },
}
