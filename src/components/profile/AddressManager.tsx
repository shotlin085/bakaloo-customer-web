'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit2, MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { addressesService } from '@/services/addresses.service'
import type { Address, CreateAddressPayload } from '@/types/address.types'
import { AddressForm } from './AddressForm'

function toDefaultValues(address: Address): Partial<CreateAddressPayload> {
    return {
        label: address.label,
        addressLine1: address.address_line1,
        addressLine2: address.address_line2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.is_default,
    }
}

export function AddressManager() {
    const qc = useQueryClient()
    const [editId, setEditId] = useState<string | null>(null)
    const [showAdd, setShowAdd] = useState(false)

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.addresses,
        queryFn: () => addressesService.getAll(),
    })

    const deleteMut = useMutation({
        mutationFn: (id: string) => addressesService.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
            toast.success('Address deleted')
        },
    })

    const setDefaultMut = useMutation({
        mutationFn: (id: string) => addressesService.setDefault(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
            toast.success('Default address updated')
        },
    })

    const createMut = useMutation({
        mutationFn: (payload: CreateAddressPayload) => addressesService.create(payload),
        onSuccess: async () => {
            setShowAdd(false)
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
            toast.success('Address added')
        },
    })

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAddressPayload> }) =>
            addressesService.update(id, payload),
        onSuccess: async () => {
            setEditId(null)
            await qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
            toast.success('Address updated')
        },
    })

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {addresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" strokeWidth={1.5} />
                            <div>
                                {address.label && (
                                    <span className="mb-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                                        {address.label}
                                    </span>
                                )}
                                <p className="text-sm font-medium text-gray-900">
                                    {address.address_line1}
                                    {address.address_line2 ? `, ${address.address_line2}` : ''}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setDefaultMut.mutate(address.id)}
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                                    address.is_default ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400',
                                )}
                                title="Set default"
                                type="button"
                            >
                                <Star className="h-4 w-4" fill={address.is_default ? 'currentColor' : 'none'} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={() => setEditId(address.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={() => deleteMut.mutate(address.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:text-red-500"
                                type="button"
                            >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    {editId === address.id && (
                        <div className="mt-3 border-t pt-3">
                            <AddressForm
                                defaultValues={toDefaultValues(address)}
                                onSubmit={async (payload) => {
                                    await updateMut.mutateAsync({ id: address.id, payload })
                                }}
                                isSubmitting={updateMut.isPending}
                                submitLabel="Update Address"
                            />
                            <button
                                onClick={() => setEditId(null)}
                                className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {showAdd ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <AddressForm
                        onSubmit={async (payload) => {
                            await createMut.mutateAsync(payload)
                        }}
                        isSubmitting={createMut.isPending}
                        submitLabel="Save Address"
                    />
                    <button
                        onClick={() => setShowAdd(false)}
                        className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 hover:border-green-400 hover:text-green-600"
                    type="button"
                >
                    <Plus className="h-4 w-4" /> Add New Address
                </button>
            )}
        </div>
    )
}
