import api from '@/lib/api'
import type { Banner } from '@/types/banner.types'

export const bannersService = {
    getActive: async (): Promise<Banner[]> => {
        const { data } = await api.get('/banners')
        return data.data
    },
}
