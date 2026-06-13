'use client'

import { PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnserviceableProps {
    reason?: string | null
    pincode?: string | null
    onTryDifferent?: () => void
}

/**
 * Shown when the selected pincode/location is not served by any store.
 */
export function Unserviceable({ reason, pincode, onTryDifferent }: UnserviceableProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <PackageX className="h-8 w-8 text-orange-400" />
            </div>
            <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-900">
                    We don&apos;t deliver here yet
                </h3>
                {pincode && (
                    <p className="text-sm font-medium text-gray-700">Pincode: {pincode}</p>
                )}
                <p className="text-sm text-gray-500 max-w-xs">
                    {reason ?? 'Delivery is not available in this area right now.'}
                </p>
            </div>
            {onTryDifferent && (
                <Button variant="outline" onClick={onTryDifferent} className="mt-2">
                    Try a Different Location
                </Button>
            )}
        </div>
    )
}
