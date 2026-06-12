'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ShopError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Shop error:', error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-10 w-10 text-red-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-2 max-w-[300px] text-sm text-gray-500">
                We encountered an unexpected error. Please try again.
            </p>
            <button
                onClick={reset}
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-green-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
                Try Again
            </button>
        </div>
    )
}
