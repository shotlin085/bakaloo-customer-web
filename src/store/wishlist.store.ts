import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
    count: number
    setCount: (n: number) => void
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set) => ({
            count: 0,
            setCount: (n) => set({ count: n }),
        }),
        { name: 'bakaloo-wishlist' },
    ),
)
