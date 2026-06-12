import { create } from 'zustand'

interface WalletState {
    balance: number | null
    setBalance: (b: number) => void
}

export const useWalletStore = create<WalletState>((set) => ({
    balance: null,
    setBalance: (b) => set({ balance: b }),
}))
