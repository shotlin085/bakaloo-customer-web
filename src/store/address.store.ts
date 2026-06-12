import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Address } from '@/types/address.types'

interface AddressState {
    activeAddressId: string | null
    activeAddress: Address | null
    setActiveAddress: (a: Address) => void
    clearAddress: () => void
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            activeAddressId: null,
            activeAddress: null,
            setActiveAddress: (a) => set({ activeAddressId: a.id, activeAddress: a }),
            clearAddress: () => set({ activeAddressId: null, activeAddress: null }),
        }),
        {
            name: 'bakaloo-address',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
