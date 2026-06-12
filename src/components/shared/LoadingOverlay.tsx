'use client'

import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
    message?: string
}

export function LoadingOverlay({ message = 'Processing payment…' }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center rounded-2xl bg-white px-10 py-8 shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                <p className="mt-4 text-sm font-semibold text-gray-700">{message}</p>
                <p className="mt-1 text-xs text-gray-400">Please do not close this page</p>
            </div>
        </div>
    )
}
