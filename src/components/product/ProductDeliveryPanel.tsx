'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, MapPin, PackageCheck, Store, Truck, XCircle } from 'lucide-react'
import { addressesService } from '@/services/addresses.service'
import { Button } from '@/components/ui/button'

type DeliveryStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error'

export function ProductDeliveryPanel() {
    const [pincode, setPincode] = useState('')
    const [status, setStatus] = useState<DeliveryStatus>('idle')
    const [message, setMessage] = useState('')

    const handleCheck = async () => {
        const normalized = pincode.trim()

        if (!/^[1-9][0-9]{5}$/.test(normalized)) {
            setStatus('error')
            setMessage('Enter a valid 6-digit pincode.')
            return
        }

        try {
            setStatus('checking')
            const result = await addressesService.validatePincode(normalized)

            if (result.available) {
                setStatus('available')
                setMessage(
                    `Delivery available in ${result.estimatedMin ?? 30} min for ₹${result.deliveryFee ?? 29}.`,
                )
                return
            }

            setStatus('unavailable')
            setMessage("Sorry, we don't deliver to this pincode yet.")
        } catch {
            setStatus('error')
            setMessage('Could not validate pincode right now.')
        }
    }

    return (
        <div className="space-y-4 border-t border-[color:var(--shop-border)] pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-green-50/80 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">
                            <Truck className="h-5 w-5" strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[color:var(--shop-ink)]">Delivery</p>
                            <p className="mt-1 text-xs leading-relaxed text-[color:var(--shop-ink-muted)]">
                                Today, as soon as 30 min
                            </p>
                            <p className="mt-2 text-xs font-semibold text-green-700">Recommended for fastest arrival</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--shop-border)] bg-white/85 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-sm">
                            <Store className="h-5 w-5" strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[color:var(--shop-ink)]">Store pickup</p>
                            <p className="mt-1 text-xs leading-relaxed text-[color:var(--shop-ink-muted)]">
                                Collect tomorrow morning with zero delivery fee
                            </p>
                            <p className="mt-2 text-xs font-semibold text-orange-600">Good for planned shopping runs</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--shop-border)] bg-white/90 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--shop-ink)]">
                    <MapPin className="h-4 w-4 text-[color:var(--shop-primary)]" strokeWidth={1.8} />
                    Check delivery to your pincode
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                        value={pincode}
                        onChange={(event) => {
                            setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))
                            if (status !== 'idle') {
                                setStatus('idle')
                                setMessage('')
                            }
                        }}
                        inputMode="numeric"
                        placeholder="6-digit pincode"
                        className="h-11 w-full rounded-xl border border-[color:var(--shop-border)] bg-white px-4 text-sm text-[color:var(--shop-ink)] outline-none transition-colors focus:border-[color:var(--shop-primary)]"
                    />
                    <Button
                        type="button"
                        size="lg"
                        onClick={handleCheck}
                        disabled={status === 'checking'}
                        className="h-11 rounded-xl bg-[color:var(--shop-ink)] px-5 text-sm font-semibold text-white hover:bg-[#1f2937]"
                    >
                        {status === 'checking' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Check'
                        )}
                    </Button>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--shop-surface)] px-3 py-2.5 text-xs text-[color:var(--shop-ink-muted)]">
                    {status === 'available' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" strokeWidth={1.8} />
                    ) : status === 'unavailable' || status === 'error' ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={1.8} />
                    ) : (
                        <PackageCheck
                            className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--shop-primary)]"
                            strokeWidth={1.8}
                        />
                    )}
                    <span>
                        {message ||
                            'We will confirm delivery availability, fee, and expected arrival before checkout.'}
                    </span>
                </div>
            </div>
        </div>
    )
}
