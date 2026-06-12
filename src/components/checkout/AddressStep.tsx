'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { QUERY_KEYS } from '@/lib/constants'
import { addressesService } from '@/services/addresses.service'
import { AddressForm } from '@/components/profile/AddressForm'
import type { Address, CreateAddressPayload } from '@/types/address.types'
import { AddressCard } from './AddressCard'

interface AddressStepProps {
    selectedId: string | null
    onSelect: (addr: Address) => void
}

export function AddressStep({ selectedId, onSelect }: AddressStepProps) {
    const qc = useQueryClient()
    const [showForm, setShowForm] = useState(false)

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.addresses,
        queryFn: () => addressesService.getAll(),
    })

    const createAddress = useMutation({
        mutationFn: (payload: CreateAddressPayload) => addressesService.create(payload),
        onSuccess: (address) => {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
            onSelect(address)
            setShowForm(false)
        },
    })

    useEffect(() => {
        if (selectedId || addresses.length === 0) return
        onSelect(addresses[0]!)
    }, [addresses, onSelect, selectedId])

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((item) => (
                    <div
                        key={item}
                        className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                    >
                        <div className="skeleton-shimmer h-4 w-24 rounded-full" />
                        <div className="mt-4 skeleton-shimmer h-4 w-3/4 rounded-full" />
                        <div className="mt-2 skeleton-shimmer h-3 w-1/2 rounded-full" />
                    </div>
                ))}
            </div>
        )
    }

    if (addresses.length === 0 || showForm) {
        return (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-950">Add delivery address</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Save an address once and use it for future orders.
                        </p>
                    </div>

                    {addresses.length > 0 && (
                        <button
                            onClick={() => setShowForm(false)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    )}
                </div>

                <AddressForm
                    onSubmit={async (payload) => {
                        await createAddress.mutateAsync(payload)
                    }}
                    isSubmitting={createAddress.isPending}
                    submitLabel="Save Address"
                />

                {createAddress.isPending && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving your address...
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-950">Select delivery address</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Choose where you want this order delivered.
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {addresses.length} saved
                </span>
            </div>

            {addresses.map((address) => (
                <AddressCard
                    key={address.id}
                    address={address}
                    selected={address.id === selectedId}
                    onSelect={() => onSelect(address)}
                />
            ))}

            <button
                onClick={() => setShowForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-slate-300 bg-white py-5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500 hover:text-green-700 hover:shadow-[0_16px_28px_rgba(15,23,42,0.06)]"
                type="button"
            >
                <Plus className="h-4 w-4" /> Add New Delivery Address
            </button>
        </div>
    )
}
