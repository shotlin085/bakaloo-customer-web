import api from '@/lib/api'

export const referralService = {
    getCode: async () => {
        const { data } = await api.get('/referral/code')
        return data.data
    },
    applyCode: async (code: string) => {
        const { data } = await api.post('/referral/apply', { code })
        return data.data
    },
    getStats: async () => {
        const { data } = await api.get('/referral/stats')
        return data.data
    },
}
