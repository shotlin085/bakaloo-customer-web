import api from '@/lib/api'
import type { Notification, NotificationPreferences } from '@/types/notification.types'
import type { Pagination } from '@/types/api.types'

interface NotificationsListResponse {
    notifications: Notification[]
    unreadCount: number
    pagination: Pagination
}

export const notificationsService = {
    getAll: async (page = 1, unreadOnly?: boolean): Promise<NotificationsListResponse> => {
        const { data } = await api.get('/notifications', { params: { page, limit: 20, unreadOnly } })
        const payload = data.data

        return {
            notifications: (payload?.notifications ?? payload ?? []) as Notification[],
            unreadCount: Number(payload?.unreadCount ?? 0),
            pagination: (payload?.pagination ?? data.pagination) as Pagination,
        }
    },

    markRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`)
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`)
    },

    markAllRead: async (): Promise<void> => {
        await api.patch('/notifications/read-all')
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/notifications/${id}`)
    },

    getPreferences: async (): Promise<NotificationPreferences> => {
        const { data } = await api.get('/notifications/preferences')
        return data.data
    },

    updatePreferences: async (prefs: Partial<NotificationPreferences>): Promise<void> => {
        await api.put('/notifications/preferences', prefs)
    },

    registerFcmToken: async (token: string, platform: 'ios' | 'android' | 'web'): Promise<void> => {
        await api.post('/notifications/tokens', { token, platform })
    },
}
