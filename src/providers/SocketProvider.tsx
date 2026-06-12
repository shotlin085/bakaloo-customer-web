'use client'

import { useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useNotifStore } from '@/store/notif.store'
import { socketManager } from '@/lib/socket'

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const handleNotification = useCallback(() => {
        useNotifStore.getState().incrementUnread()
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            const token = localStorage.getItem('accessToken')
            if (token) {
                socketManager.connect(token)
                socketManager.on('notification', handleNotification)
            }
        } else {
            socketManager.off('notification', handleNotification)
            socketManager.disconnect()
        }

        return () => {
            socketManager.off('notification', handleNotification)
            socketManager.disconnect()
        }
    }, [handleNotification, isLoggedIn])

    return <>{children}</>
}
