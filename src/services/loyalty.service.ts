import api from '@/lib/api'

export const loyaltyService = {
    getInfo: async () => {
        const { data } = await api.get('/loyalty')
        return data.data
    },
    getHistory: async () => {
        const { data } = await api.get('/loyalty/history')
        return data.data
    },
}
