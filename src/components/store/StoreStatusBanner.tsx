'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useStoreContext } from '@/store/store.context'

/**
 * Sticky banner shown when the allocated store is closed.
 * Informs customers they are browsing but cannot place orders.
 * Dismissible per session (not persisted).
 */
export function StoreStatusBanner() {
    const storeStatus = useStoreContext((s) => s.storeStatus)
    const storeName = useStoreContext((s) => s.allocatedStoreName)
    const [dismissed, setDismissed] = useState(false)

    if (storeStatus === 'OPEN' || storeStatus === null || dismissed) {
        return null
    }

    const message =
        storeStatus === 'TEMPORARILY_CLOSED'
            ? `${storeName ?? 'The store'} is temporarily closed. You can browse, but ordering is paused.`
            : `${storeName ?? 'The store'} is currently closed. You can browse, but orders are not accepted.`

    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900"
        >
            <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs font-medium leading-snug">{message}</p>
            </div>
            <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss banner"
                className="shrink-0 rounded p-1 hover:bg-amber-100 transition-colors"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
