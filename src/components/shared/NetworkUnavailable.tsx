'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

/**
 * Persistent banner shown when the device goes offline.
 * Listens to `navigator.onLine` and `online`/`offline` events.
 * Automatically hides when connectivity is restored.
 *
 * Requirements: REQ-12.4
 */
export function NetworkUnavailable() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        // Set initial state — only runs client-side
        setIsOffline(!navigator.onLine)

        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div
            role="alert"
            aria-live="assertive"
            className="flex items-center justify-center gap-2 bg-gray-900 px-4 py-2.5 text-sm text-white"
        >
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="font-medium">You&apos;re offline.</span>
            <span className="text-gray-300">Check your connection and try again.</span>
        </div>
    )
}
