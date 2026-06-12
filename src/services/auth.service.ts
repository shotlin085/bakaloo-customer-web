import api from '@/lib/api'
import type { User } from '@/types/user.types'

interface AuthResult {
    accessToken: string
    refreshToken: string
    user: User
    isNewUser: boolean
}

export const authService = {
    sendOtp: async (phone: string): Promise<void> => {
        await api.post('/auth/send-otp', { phone })
    },

    verifyOtp: async (phone: string, otp: string): Promise<AuthResult> => {
        const { data } = await api.post('/auth/verify-otp', { phone, otp })
        // Backend uses success() helper which wraps in { success, message, data: {...} }
        return data.data ?? data
    },

    refreshToken: async (refreshToken: string) => {
        const { data } = await api.post('/auth/refresh-token', { refreshToken })
        return data as { accessToken: string; refreshToken: string }
    },

    getProfile: async (): Promise<User> => {
        const { data } = await api.get('/users/me')
        return data.data
    },

    updateProfile: async (payload: { name?: string; email?: string; birthday?: string }): Promise<User> => {
        const { data } = await api.put('/users/me', payload)
        return data.data
    },

    uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.put('/users/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data.data
    },

    getStats: async () => {
        const { data } = await api.get('/users/me/stats')
        return data.data as { total_orders: number; total_spent: number; loyalty_points: number }
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout')
    },

    deleteAccount: async (): Promise<void> => {
        await api.delete('/auth/account')
    },
}
