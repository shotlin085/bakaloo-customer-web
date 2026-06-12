'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STALE_TIMES } from '@/lib/constants'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { notificationsService } from '@/services/notifications.service'
import { useNotifStore } from '@/store/notif.store'

export function useNotifications() {
    const qc = useQueryClient()
    const { setUnreadCount } = useNotifStore()

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.notifications(),
        queryFn: () => notificationsService.getAll(),
        staleTime: STALE_TIMES.notifications,
    })

    const notifications = Array.isArray(data?.notifications) ? data.notifications : []
    const unreadCount = Number(data?.unreadCount ?? notifications.filter((notification) => !notification.is_read).length)

    useEffect(() => {
        setUnreadCount(unreadCount)
    }, [unreadCount, setUnreadCount])

    const markReadMut = useMutation({
        mutationFn: (id: string) => notificationsService.markRead(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() })
        },
    })

    const markAllReadMut = useMutation({
        mutationFn: () => notificationsService.markAllRead(),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() })
            setUnreadCount(0)
        },
    })

    return {
        notifications,
        isLoading,
        unreadCount,
        markRead: markReadMut.mutate,
        markAllRead: markAllReadMut.mutate,
        isMarkingAllRead: markAllReadMut.isPending,
    }
}
