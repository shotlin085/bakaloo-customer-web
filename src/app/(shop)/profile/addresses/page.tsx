'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, MapPin, Pencil, Star, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { addressesService } from '@/services/addresses.service'
import { QUERY_KEYS } from '@/lib/constants'
import { AddressForm } from '@/components/profile/AddressForm'
import type { Address, CreateAddressPayload } from '@/types/address.types'

type SheetMode = 'create' | 'edit'

export default function ProfileAddressesPage() {
    const router = useRouter()
    const qc = useQueryClient()
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [sheetMode, setSheetMode] = useState<SheetMode>('create')
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.addresses,
        queryFn: addressesService.getAll,
    })

    const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })

    const createMutation = useMutation({
        mutationFn: (payload: CreateAddressPayload) => addressesService.create(payload),
        onSuccess: async () => {
            await invalidate()
            toast.success('Address added')
            closeSheet()
        },
        onError: () => toast.error('Could not add address'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CreateAddressPayload }) =>
            addressesService.update(id, payload),
        onSuccess: async () => {
            await invalidate()
            toast.success('Address updated')
            closeSheet()
        },
        onError: () => toast.error('Could not update address'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => addressesService.delete(id),
        onSuccess: async () => {
            await invalidate()
            toast.success('Address deleted')
        },
        onError: () => toast.error('Could not delete address'),
    })

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => addressesService.setDefault(id),
        onSuccess: async () => {
            await invalidate()
            toast.success('Default address updated')
        },
        onError: () => toast.error('Could not update default address'),
    })

    const openCreateSheet = () => {
        setSheetMode('create')
        setEditingAddress(null)
        setIsSheetOpen(true)
    }

    const openEditSheet = (address: Address) => {
        setSheetMode('edit')
        setEditingAddress(address)
        setIsSheetOpen(true)
    }

    const closeSheet = () => {
        setIsSheetOpen(false)
        setEditingAddress(null)
        setSheetMode('create')
    }

    const editingDefaultValues = useMemo(() => {
        if (!editingAddress) return undefined
        return {
            label: editingAddress.label,
            addressLine1: editingAddress.address_line1,
            addressLine2: editingAddress.address_line2,
            landmark: editingAddress.landmark,
            city: editingAddress.city,
            state: editingAddress.state,
            pincode: editingAddress.pincode,
            lat: editingAddress.lat,
            lng: editingAddress.lng,
            isDefault: editingAddress.is_default,
        }
    }, [editingAddress])

    const handleSubmit = async (payload: CreateAddressPayload) => {
        if (sheetMode === 'edit' && editingAddress) {
            await updateMutation.mutateAsync({ id: editingAddress.id, payload })
            return
        }
        await createMutation.mutateAsync(payload)
    }

    return (
        <div className="page-enter mx-auto max-w-lg px-6 py-6 pb-28">
            <div className="mb-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">My Addresses</h1>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-28 rounded-2xl" />
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-gray-700">No addresses yet</p>
                    <p className="mt-1 text-xs text-gray-500">Add an address to continue checkout faster.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map((address) => (
                        <article
                            key={address.id}
                            className={`rounded-2xl border bg-white p-4 ${address.is_default ? 'border-green-300' : 'border-gray-100'
                                }`}
                        >
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {address.label || 'Address'}
                                    </span>
                                    {address.is_default && (
                                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {!address.is_default && (
                                        <button
                                            type="button"
                                            onClick={() => setDefaultMutation.mutate(address.id)}
                                            className="inline-flex h-8 items-center gap-1 rounded-full border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-green-300 hover:text-green-600"
                                            disabled={setDefaultMutation.isPending}
                                        >
                                            <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => openEditSheet(address)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                                        aria-label="Edit address"
                                    >
                                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const shouldDelete = window.confirm(
                                                'Delete this address?',
                                            )
                                            if (shouldDelete) deleteMutation.mutate(address.id)
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                        aria-label="Delete address"
                                    >
                                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-gray-900">{address.address_line1}</p>
                            {address.address_line2 && (
                                <p className="mt-0.5 text-sm text-gray-600">{address.address_line2}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                {address.city}, {address.state} - {address.pincode}
                            </p>
                        </article>
                    ))}
                </div>
            )}

            <div className="fixed bottom-20 left-0 right-0 z-[180] px-6 lg:bottom-6">
                <button
                    type="button"
                    onClick={openCreateSheet}
                    className="mx-auto inline-flex h-12 w-full max-w-lg items-center justify-center rounded-xl bg-green-500 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(34,197,94,0.25)] transition-colors hover:bg-green-600"
                >
                    Add Address
                </button>
            </div>

            <AnimatePresence>
                {isSheetOpen && (
                    <motion.div
                        className="fixed inset-0 z-[260] bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSheet}
                    >
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 max-h-[86vh] overflow-y-auto rounded-t-[24px] bg-white p-5"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {sheetMode === 'edit' ? 'Edit Address' : 'Add New Address'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeSheet}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                    aria-label="Close address form"
                                >
                                    <X className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                            </div>

                            <AddressForm
                                defaultValues={editingDefaultValues}
                                onSubmit={handleSubmit}
                                isSubmitting={createMutation.isPending || updateMutation.isPending}
                                submitLabel={sheetMode === 'edit' ? 'Update Address' : 'Save Address'}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
