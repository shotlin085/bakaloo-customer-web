'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bakaloo-recent'
const MAX_ITEMS = 10

export function useRecentlyViewed() {
    const [ids, setIds] = useState<string[]>([])

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (!stored) return
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
                setIds(parsed.filter((entry): entry is string => typeof entry === 'string'))
            }
        } catch {
            // Ignore malformed storage.
        }
    }, [])

    const addViewed = useCallback((productId: string) => {
        if (!productId) return
        setIds((prev) => {
            const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS)
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {
                // Ignore storage write errors.
            }
            return next
        })
    }, [])

    return { recentlyViewedIds: ids, addViewed }
}
