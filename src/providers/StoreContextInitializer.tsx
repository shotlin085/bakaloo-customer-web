'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { registerStoreQueryInvalidator } from '@/store/store.context'

/**
 * Wires the TanStack Query cache-invalidation callback into the Zustand store
 * context so that when the allocated store changes, all store-scoped queries
 * are automatically invalidated.
 *
 * Must be mounted inside QueryClientProvider.
 */
export function StoreContextInitializer() {
    const queryClient = useQueryClient()

    useEffect(() => {
        registerStoreQueryInvalidator((storeId) => {
            // Invalidate all store-scoped query families
            queryClient.invalidateQueries({ queryKey: ['categories', storeId] })
            queryClient.invalidateQueries({ queryKey: ['banners', storeId] })
            queryClient.invalidateQueries({ queryKey: ['products', storeId] })
            queryClient.invalidateQueries({ queryKey: ['search', storeId] })
            queryClient.invalidateQueries({ queryKey: ['categoryProducts', storeId] })
            queryClient.invalidateQueries({ queryKey: ['product-options', storeId] })
            queryClient.invalidateQueries({ queryKey: ['product-related', storeId] })
            queryClient.invalidateQueries({ queryKey: ['fees', storeId] })
            queryClient.invalidateQueries({ queryKey: ['coupons', storeId] })
            queryClient.invalidateQueries({ queryKey: ['delivery-slots', storeId] })
            queryClient.invalidateQueries({ queryKey: ['store', storeId] })
            // Cart is invalidated separately by useCart when store switches
        })
    }, [queryClient])

    return null
}
