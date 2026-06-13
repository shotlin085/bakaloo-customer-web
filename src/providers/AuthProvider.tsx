'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useStoreContext } from '@/store/store.context'
import { authService } from '@/services/auth.service'

/**
 * Hydrates the auth state on mount.
 *
 * Multi-vendor flow on login:
 * 1. GET /users/me  → get user
 * 2. guardUserChange → clear stale store context if a different user logged in
 * 3. POST /allocation/auto-assign → backend assigns the nearest shop from the
 *    user's default saved address. Safe to call every login (idempotent).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading, logout } = useAuthStore()
    const { guardUserChange, autoAssign } = useStoreContext()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            setLoading(false)
            return
        }

        authService
            .getProfile()
            .then(async (user) => {
                setUser(user)

                // Detect cross-user contamination — clear stale store context
                guardUserChange(user.id)

                // Auto-assign shop from saved default address (idempotent)
                try {
                    await autoAssign()
                } catch {
                    // Non-fatal — user can set location manually via LocationModal
                }
            })
            .catch(() => {
                logout()
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount

    return <>{children}</>
}
