'use client'

import { Phone, Clock, Activity } from 'lucide-react'
import { useOrderTracking } from '@/hooks/useOrderTracking'

interface OrderTrackingProps {
    orderId: string
    riderName?: string
    riderPhone?: string
    deliveryOtp?: string
    estimatedMinutes?: number
}

function formatStatusLabel(status: string | null) {
    if (!status) return 'Tracking live'
    return status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function OrderTracking({
    orderId,
    riderName,
    riderPhone,
    deliveryOtp,
    estimatedMinutes,
}: OrderTrackingProps) {
    const { liveStatus, riderLocation, isConnected } = useOrderTracking(orderId, true)

    return (
        <section className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    <h3 className="text-sm font-bold text-green-800">Your order is on its way!</h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isConnected ? 'Live' : 'Reconnecting'}
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                <span>
                    Arriving in ~{estimatedMinutes && estimatedMinutes > 0 ? estimatedMinutes : 20} min
                </span>
            </div>

            {(riderName || riderPhone) && (
                <div className="mb-4 rounded-xl border border-green-100 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs text-gray-500">Delivery Partner</p>
                            <p className="text-sm font-semibold text-gray-900">{riderName || 'Assigned rider'}</p>
                        </div>
                        {riderPhone && (
                            <a
                                href={`tel:${riderPhone}`}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-green-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                            >
                                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                                Call
                            </a>
                        )}
                    </div>
                </div>
            )}

            {deliveryOtp && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                    <p className="mb-1 text-xs font-medium text-amber-700">Share OTP with rider</p>
                    <p className="font-mono text-2xl font-bold tracking-[0.3em] text-amber-700">{deliveryOtp}</p>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-600">
                <Activity className="h-3.5 w-3.5 text-green-600" strokeWidth={1.5} />
                <span>{formatStatusLabel(liveStatus)}</span>
                {riderLocation && (
                    <span className="text-gray-400">
                        · {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
                    </span>
                )}
            </div>
        </section>
    )
}
