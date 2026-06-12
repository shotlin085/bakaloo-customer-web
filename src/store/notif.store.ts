import { create } from 'zustand'

interface NotifState {
    unreadCount: number
    setUnreadCount: (n: number) => void
    decrement: () => void
    incrementUnread: () => void
    incrementBy: (n: number) => void
}

export const useNotifStore = create<NotifState>((set) => ({
    unreadCount: 0,
    setUnreadCount: (n) => set({ unreadCount: n }),
    decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
    incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
    incrementBy: (n) => set((s) => ({ unreadCount: s.unreadCount + n })),
}))
