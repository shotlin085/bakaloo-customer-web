import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CartState {
    count: number
    setCount: (n: number) => void
}

// Only stores badge count — actual cart data lives in TanStack Query cache
export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            count: 0,
            setCount: (n) => set({ count: n }),
        }),
        {
            name: 'bakaloo-cart',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
