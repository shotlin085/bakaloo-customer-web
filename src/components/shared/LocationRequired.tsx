'use client'

import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LocationRequiredProps {
    onSetLocation?: () => void
    message?: string
}

/**
 * Shown when no delivery location is set and store-scoped content cannot be loaded.
 */
export function LocationRequired({
    onSetLocation,
    message = 'Set your delivery location to see products available near you.',
}: LocationRequiredProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
                <MapPin className="h-8 w-8 text-purple-500" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-900">
                    Set your delivery location
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">{message}</p>
            </div>
            {onSetLocation && (
                <Button onClick={onSetLocation} className="mt-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    Set Location
                </Button>
            )}
        </div>
    )
}
