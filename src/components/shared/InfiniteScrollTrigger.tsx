'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
    onTrigger: () => void
    hasMore: boolean
    isLoading: boolean
}

export function InfiniteScrollTrigger({ onTrigger, hasMore, isLoading }: InfiniteScrollTriggerProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!hasMore || isLoading) return
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) onTrigger()
            },
            { threshold: 0.1 },
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [hasMore, isLoading, onTrigger])

    if (!hasMore) return null

    return (
        <div ref={ref} className="flex justify-center py-6">
            {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
        </div>
    )
}
