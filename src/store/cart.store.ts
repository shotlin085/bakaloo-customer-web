import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CartState {
    count: number
    // Multi-vendor: which store this cart belongs to
    storeId: string | null
    storeName: string | null
}

interface CartActions {
    setCount: (n: number) => void
    setStore: (storeId: string, storeName: string) => void
    clearStore: () => void
}

// Only stores badge count + store affinity — actual cart data lives in TanStack Query cache
export const useCartStore = create<CartState & CartActions>()(
    persist(
        (set) => ({
            count: 0,
            storeId: null,
            storeName: null,

            setCount: (n) => set({ count: n }),

            setStore: (storeId, storeName) => set({ storeId, storeName }),

            clearStore: () => set({ count: 0, storeId: null, storeName: null }),
        }),
        {
            name: 'bakaloo-cart',
            storage: createJSONStorage(() => localStorage),
            // Persist store affinity so cross-store detection works after page reload
            partialize: (s) => ({
                count: s.count,
                storeId: s.storeId,
                storeName: s.storeName,
            }),
        },
    ),
)
