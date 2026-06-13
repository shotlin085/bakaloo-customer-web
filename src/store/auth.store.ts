import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/user.types'

interface AuthState {
    user: User | null
    isLoggedIn: boolean
    isLoading: boolean
}

interface AuthActions {
    setUser: (user: User) => void
    updateUser: (partial: Partial<User>) => void
    logout: () => void
    setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            isLoading: true,

            setUser: (user) => set({ user, isLoggedIn: true, isLoading: false }),

            updateUser: (partial) =>
                set((s) => ({
                    user: s.user ? { ...s.user, ...partial } : null,
                })),

            logout: () => {
                try { localStorage.removeItem('accessToken') } catch { /* private browsing */ }
                try { localStorage.removeItem('refreshToken') } catch { /* private browsing */ }
                if (typeof document !== 'undefined') {
                    document.cookie = 'accessToken=; path=/; max-age=0'
                }
                set({ user: null, isLoggedIn: false, isLoading: false })
            },

            setLoading: (v) => set({ isLoading: v }),
        }),
        {
            name: 'bakaloo-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({ user: s.user, isLoggedIn: s.isLoggedIn }),
        },
    ),
)
