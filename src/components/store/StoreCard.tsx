'use client'

import Image from 'next/image'
import { Clock, MapPin, ShoppingBag } from 'lucide-react'

interface StoreCardProps {
    name: string
    logoUrl?: string | null
    etaMinutes?: number | null
    distanceKm?: number | null
    minimumOrder?: number | null
    isSelected?: boolean
    onClick?: () => void
}

/**
 * Compact card displaying a store's key delivery info.
 * Used in LocationModal when multiple stores are available for a pincode.
 */
export function StoreCard({
    name,
    logoUrl,
    etaMinutes,
    distanceKm,
    minimumOrder,
    isSelected = false,
    onClick,
}: StoreCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all min-h-[44px]',
                isSelected
                    ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50',
            ].join(' ')}
        >
            {/* Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    {etaMinutes != null && (
                        <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {etaMinutes} min
                        </span>
                    )}
                    {distanceKm != null && (
                        <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {distanceKm.toFixed(1)} km
                        </span>
                    )}
                    {minimumOrder != null && minimumOrder > 0 && (
                        <span className="flex items-center gap-0.5">
                            <ShoppingBag className="h-3 w-3" />
                            Min ₹{minimumOrder}
                        </span>
                    )}
                </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
            )}
        </button>
    )
}
