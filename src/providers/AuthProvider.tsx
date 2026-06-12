'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading, logout } = useAuthStore()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            setLoading(false)
            return
        }

        authService
            .getProfile()
            .then((user) => setUser(user))
            .catch(() => {
                logout()
            })
    }, [setUser, setLoading, logout])

    return <>{children}</>
}
