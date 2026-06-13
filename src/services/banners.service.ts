import api from '@/lib/api'
import type { Banner } from '@/types/banner.types'

export const bannersService = {
    /**
     * GET /banners — backend auto-scopes to user's shop via JWT (or shows global banners).
     */
    getForStore: async (): Promise<Banner[]> => {
        const { data } = await api.get('/banners')
        return data.data ?? data ?? []
    },

    getActive: async (): Promise<Banner[]> => {
        const { data } = await api.get('/banners')
        return data.data
    },
}
