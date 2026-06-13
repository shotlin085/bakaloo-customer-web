/**
 * StoreContext — canonical Zustand store for multi-vendor shop allocation.
 *
 * How the backend works:
 *  - Product scoping is JWT-based (no storeId param needed on /products)
 *  - Allocation = which shop serves the customer's delivery location
 *  - GET  /allocation/my-shops      → read current allocation
 *  - POST /allocation/auto-assign   → assign from saved default address (call on login)
 *  - POST /allocation/recompute     → assign from lat/lng/pincode (call when address changes)
 *
 * This store holds the resolved primary shop so the UI can display
 * store name, ETA, status, and prompt for location when not set.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storesService, primaryShopToAllocation } from '@/services/stores.service'
import type { StoreAllocation, StoreStatus } from '@/types/store.types'

// ── Cache-invalidation callback ──────────────────────────────────────────────
let _invalidateStoreQueries: ((storeId: string) => void) | null = null

export function registerStoreQueryInvalidator(fn: (storeId: string) => void) {
    _invalidateStoreQueries = fn
}

// ── State shape ──────────────────────────────────────────────────────────────
interface StoreContextState {
    // Primary allocated shop (the one whose products appear in catalog)
    allocatedStoreId: string | null
    allocatedStoreName: string | null
    allocatedStoreSlug: string | null
    storeLogo: string | null         // session-only — NOT persisted (REQ-1.7)
    storeStatus: StoreStatus | null

    // Delivery context (from allocation + cart/summary)
    deliveryEta: number | null
    deliveryDistance: number | null
    minimumOrder: number | null
    selectedPincode: string | null
    selectedAddressId: string | null

    // GPS coords — session-only, NOT persisted (REQ-1.7)
    lat: number | null
    lng: number | null

    // Serviceability
    serviceable: boolean
    availabilityReason: string | null

    // Resolution metadata
    lastResolvedAt: number | null
    isResolving: boolean             // session-only — NOT persisted (REQ-1.7)
    resolutionError: string | null   // session-only — NOT persisted (REQ-1.7)

    // Cross-user contamination guard (REQ-9.3, REQ-9.4)
    persistedUserId: string | null
    /** Canonical alias used by downstream hooks (REQ-9.4) */
    userId: string | null
}

interface StoreContextActions {
    /**
     * Auto-assign allocation from the user's saved default address.
     * Safe to call on every login.
     */
    autoAssign: () => Promise<void>

    /**
     * Recompute allocation for a specific address (after address change).
     * Requires coordinates + pincode.
     */
    recomputeFromAddress: (address: {
        lat: number
        lng: number
        pincode: string
    }) => Promise<void>

    /**
     * Spec-aligned alias: resolve store from pincode or GPS coords.
     * Routes to recomputeFromAddress or autoAssign depending on arguments.
     * REQ-1.1, REQ-1.2
     */
    resolveStore: (pincode?: string, lat?: number, lng?: number) => Promise<void>

    /**
     * Spec-aligned alias: resolve store from a saved address ID.
     * REQ-1.4
     */
    resolveFromAddress: (addressId: string) => Promise<void>

    /** Apply a pre-resolved allocation directly (e.g. from my-shops response). */
    setStoreFromAllocation: (allocation: StoreAllocation) => void

    /** Clear all store context — called on logout or user change. */
    clearStore: () => void

    /** Called on login — clears if userId changed, returns true if it changed. */
    guardUserChange: (userId: string) => boolean
}

type StoreContextStore = StoreContextState & StoreContextActions

const INITIAL_STATE: StoreContextState = {
    allocatedStoreId: null,
    allocatedStoreName: null,
    allocatedStoreSlug: null,
    storeLogo: null,
    storeStatus: null,
    deliveryEta: null,
    deliveryDistance: null,
    minimumOrder: null,
    selectedPincode: null,
    selectedAddressId: null,
    lat: null,
    lng: null,
    serviceable: false,
    availabilityReason: null,
    lastResolvedAt: null,
    isResolving: false,
    resolutionError: null,
    persistedUserId: null,
    userId: null,
}

export const useStoreContext = create<StoreContextStore>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,

            autoAssign: async () => {
                set({ isResolving: true, resolutionError: null })
                try {
                    const result = await storesService.autoAssign()
                    const allocation = primaryShopToAllocation(result)

                    if (allocation) {
                        const prevStoreId = get().allocatedStoreId
                        set({
                            allocatedStoreId: allocation.storeId,
                            allocatedStoreName: allocation.storeName,
                            allocatedStoreSlug: allocation.storeSlug,
                            storeLogo: allocation.storeLogo,
                            storeStatus: allocation.storeStatus,
                            serviceable: allocation.serviceable,
                            deliveryEta: allocation.deliveryEta,
                            deliveryDistance: allocation.deliveryDistance,
                            minimumOrder: allocation.minimumOrder,
                            lastResolvedAt: Date.now(),
                            availabilityReason: null,
                        })
                        if (prevStoreId && prevStoreId !== allocation.storeId) {
                            _invalidateStoreQueries?.(prevStoreId)
                        }
                    } else {
                        // No shops assigned — user may not have a saved address yet
                        set({
                            serviceable: false,
                            availabilityReason: result.shopCount === 0
                                ? 'Add a delivery address to see products near you'
                                : null,
                        })
                    }
                } catch {
                    set({ resolutionError: 'Could not load your store. Please set your delivery address.' })
                } finally {
                    set({ isResolving: false })
                }
            },

            recomputeFromAddress: async (address) => {
                set({ isResolving: true, resolutionError: null })
                try {
                    const result = await storesService.recompute(address)
                    const allocation = primaryShopToAllocation(result)

                    if (allocation) {
                        const prevStoreId = get().allocatedStoreId
                        set({
                            allocatedStoreId: allocation.storeId,
                            allocatedStoreName: allocation.storeName,
                            allocatedStoreSlug: allocation.storeSlug,
                            storeLogo: allocation.storeLogo,
                            storeStatus: allocation.storeStatus,
                            serviceable: allocation.serviceable,
                            deliveryEta: allocation.deliveryEta,
                            deliveryDistance: allocation.deliveryDistance,
                            minimumOrder: allocation.minimumOrder,
                            selectedPincode: address.pincode,
                            lastResolvedAt: Date.now(),
                            availabilityReason: null,
                        })
                        if (prevStoreId && prevStoreId !== allocation.storeId) {
                            _invalidateStoreQueries?.(prevStoreId)
                        }
                    } else {
                        set({
                            serviceable: false,
                            availabilityReason: 'Delivery is not available in this area yet',
                            selectedPincode: address.pincode,
                        })
                    }
                } catch {
                    set({ resolutionError: 'Unable to check delivery availability. Please try again.' })
                } finally {
                    set({ isResolving: false })
                }
            },

            setStoreFromAllocation: (allocation) => {
                const prevStoreId = get().allocatedStoreId
                set({
                    allocatedStoreId: allocation.storeId,
                    allocatedStoreName: allocation.storeName,
                    allocatedStoreSlug: allocation.storeSlug,
                    storeLogo: allocation.storeLogo,
                    storeStatus: allocation.storeStatus,
                    serviceable: allocation.serviceable,
                    deliveryEta: allocation.deliveryEta,
                    deliveryDistance: allocation.deliveryDistance,
                    minimumOrder: allocation.minimumOrder,
                    lastResolvedAt: Date.now(),
                })
                if (prevStoreId && prevStoreId !== allocation.storeId) {
                    _invalidateStoreQueries?.(prevStoreId)
                }
            },

            clearStore: () => {
                const storeId = get().allocatedStoreId
                set({ ...INITIAL_STATE, persistedUserId: get().persistedUserId })
                if (storeId) _invalidateStoreQueries?.(storeId)
            },

            guardUserChange: (userId) => {
                const { persistedUserId } = get()
                if (persistedUserId && persistedUserId !== userId) {
                    set({ ...INITIAL_STATE, persistedUserId: userId, userId })
                    return true
                }
                set({ persistedUserId: userId, userId })
                return false
            },

            // ── Spec-aligned aliases (REQ-1.1, REQ-1.2, REQ-1.4) ──────────────
            resolveStore: async (pincode?: string, lat?: number, lng?: number) => {
                if (lat !== undefined && lng !== undefined && pincode) {
                    set({ lat, lng })
                    await get().recomputeFromAddress({ lat, lng, pincode })
                } else if (pincode) {
                    // Pincode-only: store selectedPincode and trigger autoAssign
                    set({ selectedPincode: pincode })
                    await get().autoAssign()
                } else {
                    await get().autoAssign()
                }
            },

            resolveFromAddress: async (addressId: string) => {
                set({ selectedAddressId: addressId })
                await get().autoAssign()
            },
        }),
        {
            name: 'bakaloo-store-v2',   // bumped — old v1 keys are incompatible
            version: 1,
            storage: createJSONStorage(() => {
                if (typeof window === 'undefined') {
                    return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
                }
                return localStorage
            }),
            partialize: (s): Partial<StoreContextState> => ({
                allocatedStoreId: s.allocatedStoreId,
                allocatedStoreName: s.allocatedStoreName,
                allocatedStoreSlug: s.allocatedStoreSlug,
                storeStatus: s.storeStatus,
                serviceable: s.serviceable,
                availabilityReason: s.availabilityReason,
                deliveryEta: s.deliveryEta,
                deliveryDistance: s.deliveryDistance,
                minimumOrder: s.minimumOrder,
                selectedPincode: s.selectedPincode,
                selectedAddressId: s.selectedAddressId,
                lastResolvedAt: s.lastResolvedAt,
                persistedUserId: s.persistedUserId,
                userId: s.userId,
            }),
        },
    ),
)
