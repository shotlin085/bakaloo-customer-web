'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { wishlistService } from '@/services/wishlist.service'
import { useAuthStore } from '@/store/auth.store'
import { useWishlistStore } from '@/store/wishlist.store'
import type { Product } from '@/types/product.types'

type WishlistEntry = Product | { id?: string; productId?: string }

function getWishlistItemId(item: WishlistEntry): string | null {
    if (typeof item !== 'object' || item === null) return null
    if ('productId' in item && typeof item.productId === 'string') return item.productId
    if ('id' in item && typeof item.id === 'string') return item.id
    return null
}

export function useWishlist() {
    const qc = useQueryClient()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const setCount = useWishlistStore((s) => s.setCount)
    const wishlistKey = QUERY_KEYS.wishlist()
    const [optimisticState, setOptimisticState] = useState<Record<string, boolean>>({})

    const { data: wishlist = [], isLoading } = useQuery({
        queryKey: wishlistKey,
        queryFn: () => wishlistService.get(),
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        if (!isLoggedIn) {
            setCount(0)
            return
        }

        setCount(Array.isArray(wishlist) ? wishlist.length : 0)
    }, [isLoggedIn, setCount, wishlist])

    const wishlistIds = useMemo(() => {
        const ids = new Set<string>()
        for (const item of wishlist as WishlistEntry[]) {
            const id = getWishlistItemId(item)
            if (id) ids.add(id)
        }
        return ids
    }, [wishlist])

    const setOptimisticValue = (productId: string, value: boolean) => {
        setOptimisticState((prev) => ({ ...prev, [productId]: value }))
    }

    const clearOptimisticValue = (productId?: string) => {
        if (!productId) return
        setOptimisticState((prev) => {
            const next = { ...prev }
            delete next[productId]
            return next
        })
    }

    const addMutation = useMutation({
        mutationFn: (productId: string) => wishlistService.addItem(productId),
        onMutate: async (productId) => {
            setOptimisticValue(productId, true)
            await qc.cancelQueries({ queryKey: wishlistKey })
            const prev = qc.getQueryData<WishlistEntry[]>(wishlistKey)
            setCount((prev?.length ?? 0) + 1)
            qc.setQueryData<WishlistEntry[]>(wishlistKey, (old = []) => {
                if (old.some((item) => getWishlistItemId(item) === productId)) return old
                if (old.length === 0 || old.some((item) => 'productId' in item)) {
                    return [...old, { productId }]
                }
                return old
            })
            return { prev, productId }
        },
        onError: (_error, _productId, ctx) => {
            if (ctx?.prev) qc.setQueryData(wishlistKey, ctx.prev)
            setCount(ctx?.prev?.length ?? 0)
            clearOptimisticValue(ctx?.productId)
            toast.error('Could not add to wishlist')
        },
        onSettled: (_data, _error, _productId, ctx) => {
            clearOptimisticValue(ctx?.productId)
            qc.invalidateQueries({ queryKey: wishlistKey })
        },
    })

    const removeMutation = useMutation({
        mutationFn: (productId: string) => wishlistService.removeItem(productId),
        onMutate: async (productId) => {
            setOptimisticValue(productId, false)
            await qc.cancelQueries({ queryKey: wishlistKey })
            const prev = qc.getQueryData<WishlistEntry[]>(wishlistKey)
            setCount(Math.max(0, (prev?.length ?? 0) - 1))
            qc.setQueryData<WishlistEntry[]>(wishlistKey, (old = []) =>
                old.filter((item) => getWishlistItemId(item) !== productId),
            )
            return { prev, productId }
        },
        onError: (_error, _productId, ctx) => {
            if (ctx?.prev) qc.setQueryData(wishlistKey, ctx.prev)
            setCount(ctx?.prev?.length ?? 0)
            clearOptimisticValue(ctx?.productId)
            toast.error('Could not remove from wishlist')
        },
        onSettled: (_data, _error, _productId, ctx) => {
            clearOptimisticValue(ctx?.productId)
            qc.invalidateQueries({ queryKey: wishlistKey })
        },
    })

    const isInWishlist = (productId: string) => {
        if (Object.prototype.hasOwnProperty.call(optimisticState, productId)) {
            return optimisticState[productId]
        }
        return wishlistIds.has(productId)
    }

    const toggleWishlist = (productId: string) => {
        if (!isLoggedIn) return false
        if (isInWishlist(productId)) {
            removeMutation.mutate(productId)
        } else {
            addMutation.mutate(productId)
            toast.success('Added to wishlist')
        }
        return true
    }

    return {
        wishlist,
        isLoading,
        toggleWishlist,
        isInWishlist,
        isPending: addMutation.isPending || removeMutation.isPending,
    }
}
