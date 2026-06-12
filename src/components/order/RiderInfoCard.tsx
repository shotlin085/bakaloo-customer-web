'use client'

import { MessageCircle, Phone } from 'lucide-react'

interface RiderInfoCardProps {
    riderName?: string
    riderPhone?: string
    riderRating?: number
    estimatedMinutes?: number
    deliveryOtp?: string
}

export function RiderInfoCard({
    riderName = 'Your Rider',
    riderPhone,
    riderRating,
    estimatedMinutes,
    deliveryOtp,
}: RiderInfoCardProps) {
    const initial = riderName[0]?.toUpperCase() ?? 'R'

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                    {initial}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">{riderName}</p>
                    {riderRating && (
                        <p className="text-xs text-gray-500">⭐ {riderRating.toFixed(1)}</p>
                    )}
                    {estimatedMinutes && (
                        <p className="mt-0.5 text-xs font-medium text-green-600">
                            Arriving in ~{estimatedMinutes} min
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {riderPhone && (
                        <>
                            <a
                                href={`tel:${riderPhone}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
                                aria-label="Call rider"
                            >
                                <Phone className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
                            </a>
                            <a
                                href={`https://wa.me/91${riderPhone.replace(/^\+?91/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-green-50"
                                aria-label="WhatsApp rider"
                            >
                                <MessageCircle className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                            </a>
                        </>
                    )}
                </div>
            </div>

            {deliveryOtp && (
                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        Delivery OTP
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold tracking-[8px] text-amber-700">
                        {deliveryOtp}
                    </p>
                    <p className="mt-1 text-[10px] text-amber-500">
                        Share this with your rider
                    </p>
                </div>
            )}
        </div>
    )
}
