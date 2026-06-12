import api from '@/lib/api'
import type { Address, CreateAddressPayload } from '@/types/address.types'

interface PincodeCheck {
    available: boolean
    deliveryFee?: number
    estimatedMin?: number
}

export const addressesService = {
    getAll: async (): Promise<Address[]> => {
        const { data } = await api.get('/addresses')
        const raw = Array.isArray(data.data) ? data.data : []
        return raw.map(normalizeAddress)
    },

    create: async (payload: CreateAddressPayload): Promise<Address> => {
        const { data } = await api.post('/addresses', payload)
        return normalizeAddress(data.data)
    },

    update: async (id: string, payload: Partial<CreateAddressPayload>): Promise<Address> => {
        const { data } = await api.put(`/addresses/${id}`, payload)
        return normalizeAddress(data.data)
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/addresses/${id}`)
    },

    setDefault: async (id: string): Promise<void> => {
        await api.put(`/addresses/${id}/default`)
    },

    validatePincode: async (pincode: string): Promise<PincodeCheck> => {
        const { data } = await api.post('/addresses/validate-pincode', { pincode })
        return data.data
    },
}

function normalizeAddress(raw: Record<string, unknown>): Address {
    return {
        id: String(raw.id ?? ''),
        label: String(raw.label ?? 'Home'),
        address_line1: String(raw.address_line1 ?? raw.addressLine1 ?? ''),
        address_line2: raw.address_line2 ?? raw.addressLine2 ? String(raw.address_line2 ?? raw.addressLine2) : undefined,
        landmark: raw.landmark ? String(raw.landmark) : undefined,
        city: String(raw.city ?? ''),
        state: String(raw.state ?? ''),
        pincode: String(raw.pincode ?? ''),
        lat: raw.lat != null ? Number(raw.lat) : undefined,
        lng: raw.lng != null ? Number(raw.lng) : undefined,
        is_default: Boolean(raw.is_default ?? raw.isDefault),
    }
}
