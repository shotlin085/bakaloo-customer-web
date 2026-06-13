/**
 * Store / Allocation service
 *
 * The backend resolves multi-vendor scoping automatically via JWT —
 * no storeId param is needed on product endpoints.
 *
 * Allocation flow:
 *   Anonymous   → no allocation needed (backend shows full catalog)
 *   Logged-in   → POST /allocation/auto-assign on login (backend sets allocation from default address)
 *   New address → POST /allocation/recompute with { address: { lat, lng, pincode } }
 *   Read shops  → GET  /allocation/my-shops
 */

import api from '@/lib/api'
import type { StoreAllocation } from '@/types/store.types'

export interface AllocatedShop {
    id: string            // allocation row id
    shop_id: string       // actual shop UUID
    name: string
    distance_km: number | null
    matched_pincode: string | null
    is_primary: boolean
}

export interface AllocationResult {
    shops: AllocatedShop[]
}

export const storesService = {
    /**
     * Get the shops allocated to the currently logged-in user.
     * GET /allocation/my-shops
     *
     * The primary shop (is_primary: true) is the one whose products
     * appear in the catalog.
     */
    getMyShops: async (): Promise<AllocationResult> => {
        const { data } = await api.get('/allocation/my-shops')
        return data.data ?? { shops: [] }
    },

    /**
     * Recompute allocation for the user using a specific address.
     * POST /allocation/recompute
     *
     * Call this after a user saves a new delivery address or changes location.
     * Requires: lat, lng, pincode (all three mandatory).
     */
    recompute: async (address: {
        lat: number
        lng: number
        pincode: string
        userId?: string
    }): Promise<AllocationResult> => {
        const { data } = await api.post('/allocation/recompute', { address })
        return data.data ?? { shops: [] }
    },

    /**
     * Auto-assign allocation from the user's default saved address.
     * POST /allocation/auto-assign
     *
     * Safe to call on every login — the backend returns early if allocation
     * already exists (alreadyAllocated: true).
     */
    autoAssign: async (): Promise<{
        shopCount: number
        shops: AllocatedShop[]
        alreadyAllocated: boolean
    }> => {
        const { data } = await api.post('/allocation/auto-assign')
        return data.data ?? { shopCount: 0, shops: [], alreadyAllocated: false }
    },
}

/** Convert the primary allocated shop into the StoreAllocation shape used by StoreContext. */
export function primaryShopToAllocation(result: AllocationResult): StoreAllocation | null {
    const primary = result.shops.find((s) => s.is_primary) ?? result.shops[0] ?? null
    if (!primary) return null
    return {
        storeId: primary.shop_id,
        storeName: primary.name,
        storeSlug: '',         // not returned by allocation API — set from product responses
        storeLogo: null,
        storeStatus: 'OPEN',   // default — store status resolved separately
        serviceable: true,
        deliveryEta: 30,       // default — real ETA from cart/summary
        deliveryDistance: primary.distance_km ?? 0,
        minimumOrder: 0,       // resolved from fee_settings
    }
}
