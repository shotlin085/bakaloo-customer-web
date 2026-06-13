'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStoreContext } from '@/store/store.context'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { addressesService } from '@/services/addresses.service'
import { keys } from '@/lib/queryKeys'
import { MapPin, Loader2, Navigation, CheckCircle, XCircle } from 'lucide-react'
import { Unserviceable } from '@/components/shared/Unserviceable'

interface LocationModalProps {
    open: boolean
    onClose: () => void
}

type ModalState =
    | 'idle'
    | 'pincode-input'
    | 'gps-requesting'
    | 'resolving'
    | 'serviceable'
    | 'unserviceable'
    | 'error'

/**
 * Location picker modal.
 * - Desktop: full Dialog
 * - Mobile: bottom Sheet
 */
export function LocationModal({ open, onClose }: LocationModalProps) {
    const [state, setState] = useState<ModalState>('idle')
    const [pincode, setPincode] = useState('')
    const [pincodeError, setPincodeError] = useState('')

    const { recomputeFromAddress, isResolving, availabilityReason, serviceable } =
        useStoreContext()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

    const { data: addresses } = useQuery({
        queryKey: keys.addresses(),
        queryFn: addressesService.getAll,
        enabled: isLoggedIn && open,
        staleTime: 10 * 60_000,
    })

    const handlePincodeSubmit = async () => {
        const trimmed = pincode.trim()
        if (!/^\d{6}$/.test(trimmed)) {
            setPincodeError('Please enter a valid 6-digit pincode.')
            return
        }
        setPincodeError('')
        setState('resolving')
        await recomputeFromAddress({ lat: 0, lng: 0, pincode: trimmed })
        if (serviceable) {
            setState('serviceable')
            setTimeout(onClose, 600) // Brief success flash before closing
        } else {
            setState('unserviceable')
        }
    }

    const handleGps = () => {
        setState('gps-requesting')
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setState('resolving')
                await recomputeFromAddress({ lat: pos.coords.latitude, lng: pos.coords.longitude, pincode: '' })
                if (serviceable) {
                    setState('serviceable')
                    setTimeout(onClose, 600)
                } else {
                    setState('unserviceable')
                }
            },
            () => {
                // GPS denied — fall back to pincode input
                setState('pincode-input')
            },
        )
    }

    const handleAddressSelect = async (addr: { id: string; pincode: string }) => {
        setState('resolving')
        await recomputeFromAddress({ lat: 0, lng: 0, pincode: addr.pincode })
        if (serviceable) {
            setState('serviceable')
            setTimeout(onClose, 600)
        } else {
            setState('unserviceable')
        }
    }

    const content = (
        <div className="space-y-5 pt-2">
            {/* State: resolving */}
            {(state === 'resolving' || isResolving) && (
                <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-sm text-gray-500">Checking delivery availability…</p>
                </div>
            )}

            {/* State: serviceable success flash */}
            {state === 'serviceable' && !isResolving && (
                <div className="flex flex-col items-center gap-2 py-8">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <p className="text-sm font-medium text-green-700">Delivery available!</p>
                </div>
            )}

            {/* State: unserviceable */}
            {state === 'unserviceable' && !isResolving && (
                <div className="py-4">
                    <Unserviceable
                        reason={availabilityReason}
                        pincode={pincode}
                        onTryDifferent={() => {
                            setState('pincode-input')
                            setPincode('')
                        }}
                    />
                </div>
            )}

            {/* Default: idle / pincode input / gps-requesting */}
            {(state === 'idle' || state === 'pincode-input' || state === 'gps-requesting') &&
                !isResolving && (
                    <>
                        {/* GPS button */}
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 min-h-[44px]"
                            onClick={handleGps}
                            disabled={state === 'gps-requesting'}
                        >
                            {state === 'gps-requesting' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Navigation className="h-4 w-4 text-purple-500" />
                            )}
                            <span className="text-sm">Use my current location</span>
                        </Button>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span>or enter pincode</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* Pincode input */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={pincode}
                                    onChange={(e) => {
                                        setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                        setPincodeError('')
                                    }}
                                    placeholder="Enter 6-digit pincode"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="min-h-[44px]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handlePincodeSubmit()
                                    }}
                                />
                                <Button
                                    onClick={handlePincodeSubmit}
                                    disabled={pincode.length !== 6}
                                    className="min-h-[44px] shrink-0"
                                >
                                    Check
                                </Button>
                            </div>
                            {pincodeError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {pincodeError}
                                </p>
                            )}
                        </div>

                        {/* Saved addresses (logged-in only) */}
                        {isLoggedIn && addresses && addresses.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500">Saved addresses</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {addresses.map((addr) => (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => handleAddressSelect(addr)}
                                            className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-left text-sm hover:bg-purple-50 hover:border-purple-200 transition-colors min-h-[44px]"
                                        >
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {addr.label}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {addr.address_line1}, {addr.city} — {addr.pincode}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
        </div>
    )

    // Desktop: Dialog; Mobile: Sheet (detected via CSS / tw responsive)
    return (
        <>
            {/* Desktop dialog */}
            <div className="hidden md:block">
                <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-500" />
                                Set delivery location
                            </DialogTitle>
                        </DialogHeader>
                        {content}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile bottom sheet */}
            <div className="md:hidden">
                <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
                    <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 max-h-[85vh] overflow-y-auto">
                        <SheetHeader className="mb-2">
                            <SheetTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-500" />
                                Set delivery location
                            </SheetTitle>
                        </SheetHeader>
                        {content}
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
