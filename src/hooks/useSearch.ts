'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import { productsService } from '@/services/products.service'
import { useSearchStore } from '@/store/search.store'

export function useSearch() {
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { recentSearches, addSearch, clearSearches } = useSearchStore()

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS)
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [query])

    const { data: results, isLoading } = useQuery({
        queryKey: QUERY_KEYS.products({ search: debouncedQuery, mode: 'instant' }),
        queryFn: () => productsService.search(debouncedQuery, 1),
        enabled: debouncedQuery.length >= 1,
        staleTime: 60_000,
    })

    const submitSearch = useCallback(
        (value: string) => {
            const trimmed = value.trim()
            if (trimmed) addSearch(trimmed)
        },
        [addSearch],
    )

    return {
        query,
        setQuery,
        results: results?.products?.slice(0, 5) ?? [],
        isLoading,
        recentSearches,
        clearSearches,
        submitSearch,
    }
}
