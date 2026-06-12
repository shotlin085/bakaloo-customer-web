export interface Address {
    id: string
    label: string
    address_line1: string
    address_line2?: string
    landmark?: string
    city: string
    state: string
    pincode: string
    lat?: number
    lng?: number
    is_default: boolean
}

export interface PincodeValidation {
    available: boolean
    deliveryFee?: number
    estimatedMin?: number
}

export interface CreateAddressPayload {
    addressLine1: string
    city: string
    pincode: string
    state: string
    lat: number
    lng: number
    label?: string
    addressLine2?: string
    landmark?: string
    isDefault?: boolean
}
