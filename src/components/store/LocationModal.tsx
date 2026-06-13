'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStoreContext } from '@/store/store.context'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { addressesService } from '@/services/addresses.service'
import { keys } from '@/lib/queryKeys'
import { MapPin, Loader2, Navigation, CheckCircle, XCircle } from 'lucide-react'
import { Unserviceable } from '@/components/shared/Unserviceable'
import { storesService, primaryShopToAllocation } from '@/services/stores.service'

interface LocationModalProps {
    open: boolean
    onClose: () => void
}

type ModalState = 'idle' | 'gps-requesting' | 'resolving' | 'serviceable' | 'unserviceable'

export function LocationModal({ open, onClose }: LocationModalProps) {
    const [state, setState] = useState<ModalState>('idle')
    const [pincode, setPincode] = useState('')
    const [pincodeError, setPincodeError] = useState('')
    const [unserviceableReason, setUnserviceableReason] = useState<string | null>(null)

    const { setStoreFromAllocation } = useStoreContext()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

    const { data: addresses } = useQuery({
        queryKey: keys.addresses(),
        queryFn: addressesService.getAll,
        enabled: isLoggedIn && open,
        staleTime: 10 * 60_000,
    })

    const resolveByPincode = async (pc: string) => {
        setState('resolving')
        try {
            const result = await storesService.recompute({ lat: 0, lng: 0, pincode: pc })
            const allocation = primaryShopToAllocation(result)
            if (allocation) {
                setStoreFromAllocation(allocation)
                setState('serviceable')
                setTimeout(onClose, 700)
            } else {
                setUnserviceableReason('Delivery is not available in this pincode yet.')
                setState('unserviceable')
            }
        } catch {
            setState('idle')
            setPincodeError('Could not check delivery. Please try again.')
        }
    }

    const handlePincodeSubmit = async () => {
        const trimmed = pincode.trim()
        if (!/^\d{6}$/.test(trimmed)) {
            setPincodeError('Please enter a valid 6-digit pincode.')
            return
        }
        setPincodeError('')
        await resolveByPincode(trimmed)
    }

    const handleGps = () => {
        setState('gps-requesting')
        if (!navigator.geolocation) { setState('idle'); return }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setState('resolving')
                try {
                    const result = await storesService.recompute({ lat: pos.coords.latitude, lng: pos.coords.longitude, pincode: '' })
                    const allocation = primaryShopToAllocation(result)
                    if (allocation) {
                        setStoreFromAllocation(allocation)
                        setState('serviceable')
                        setTimeout(onClose, 700)
                    } else {
                        setUnserviceableReason('No stores deliver to your current location.')
                        setState('unserviceable')
                    }
                } catch { setState('idle') }
            },
            () => setState('idle'),
        )
    }

    const showForm = (state === 'idle' || state === 'gps-requesting')

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-purple-500" />
                        Set delivery location
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1 pb-2">
                    {state === 'resolving' && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            <p className="text-sm text-gray-500">Checking delivery availability…</p>
                        </div>
                    )}

                    {state === 'serviceable' && (
                        <div className="flex flex-col items-center gap-2 py-8">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <p className="text-sm font-semibold text-green-700">Delivery available! ✓</p>
                        </div>
                    )}

                    {state === 'unserviceable' && (
                        <Unserviceable
                            reason={unserviceableReason}
                            pincode={pincode}
                            onTryDifferent={() => { setState('idle'); setPincode(''); setUnserviceableReason(null) }}
                        />
                    )}

                    {showForm && (
                        <>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 min-h-[44px]"
                                onClick={handleGps}
                                disabled={state === 'gps-requesting'}
                            >
                                {state === 'gps-requesting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 text-purple-500" />}
                                <span className="text-sm">Use my current location</span>
                            </Button>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span>or enter pincode</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={pincode}
                                        onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeError('') }}
                                        placeholder="Enter 6-digit pincode"
                                        inputMode="numeric"
                                        maxLength={6}
                                        className="min-h-[44px]"
                                        onKeyDown={(e) => { if (e.key === 'Enter') void handlePincodeSubmit() }}
                                    />
                                    <Button
                                        onClick={() => void handlePincodeSubmit()}
                                        disabled={pincode.length !== 6}
                                        className="min-h-[44px] shrink-0 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Check
                                    </Button>
                                </div>
                                {pincodeError && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <XCircle className="h-3.5 w-3.5" />{pincodeError}
                                    </p>
                                )}
                            </div>

                            {isLoggedIn && addresses && addresses.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500">Saved addresses</p>
                                    <div className="space-y-2 max-h-44 overflow-y-auto">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => void resolveByPincode(addr.pincode)}
                                                className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-left text-sm hover:bg-purple-50 hover:border-purple-200 transition-colors min-h-[44px]"
                                            >
                                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{addr.label}</p>
                                                    <p className="text-xs text-gray-500 truncate">{addr.address_line1}, {addr.city} — {addr.pincode}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
