'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { keys, STALE } from '@/lib/queryKeys'
import { toast } from 'sonner'
import type { Cart } from '@/types/cart.types'

// Pending cross-store add — exposed so CartStoreSwitchDialog can consume it
export interface PendingCrossStoreAdd {
    shopProductId: string
    qty: number
    newStoreId: string
    newStoreName: string
}

export function useCart() {
    const qc = useQueryClient()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const cartStore = useCartStore()

    // Use the simple cart key — cart API is scoped by JWT, not by storeId
    // Using a stable key prevents double-fetching when allocatedStoreId changes
    const cartKey = keys.cartFallback()

    const { data: cart, isLoading } = useQuery({
        queryKey: cartKey,
        queryFn: cartService.get,
        enabled: isLoggedIn,   // always fetch if logged in — no storeId dependency
        staleTime: STALE.cart,
    })

    useEffect(() => {
        if (cart) {
            cartStore.setCount(cart.count)
            // Sync store affinity from backend cart on first load
            if (cart.storeId && !cartStore.storeId) {
                cartStore.setStore(cart.storeId, cart.storeName ?? '')
            }
        }
        if (!cart && !isLoggedIn) cartStore.setCount(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart, isLoggedIn])

    // ── Cross-store conflict state ──────────────────────────────────────────
    const [pendingCrossStore, setPendingCrossStore] =
        useState<PendingCrossStoreAdd | null>(null)

    // Called by CartStoreSwitchDialog on confirm
    const confirmStoreSwitchAndAdd = async () => {
        if (!pendingCrossStore) return
        await cartService.clear()
        cartStore.setStore(pendingCrossStore.newStoreId, pendingCrossStore.newStoreName)
        qc.invalidateQueries({ queryKey: keys.cartFallback() })
        addMutation.mutate({
            shopProductId: pendingCrossStore.shopProductId,
            qty: pendingCrossStore.qty,
        })
        setPendingCrossStore(null)
    }

    const cancelStoreSwitch = () => setPendingCrossStore(null)

    // ── Mutations ───────────────────────────────────────────────────────────
    const addMutation = useMutation({
        mutationFn: ({ shopProductId, qty }: { shopProductId: string; qty: number }) =>
            cartService.addItem(shopProductId, qty),

        onMutate: async ({ qty }) => {
            await qc.cancelQueries({ queryKey: cartKey })
            const prev = qc.getQueryData<Cart>(cartKey)
            cartStore.setCount((prev?.count ?? 0) + qty)
            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(cartKey, ctx.prev)
                cartStore.setCount(ctx.prev.count)
            }
            toast.error('Could not add item. Try again.')
        },

        onSuccess: (updatedCart) => {
            qc.setQueryData(cartKey, updatedCart)
            cartStore.setCount(updatedCart.count)
            if (updatedCart.storeId) {
                cartStore.setStore(updatedCart.storeId, updatedCart.storeName ?? '')
            }
            toast.success('Added to cart ✓')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ shopProductId, qty }: { shopProductId: string; qty: number }) =>
            cartService.updateQuantity(shopProductId, qty),

        onMutate: async ({ shopProductId, qty }) => {
            await qc.cancelQueries({ queryKey: cartKey })
            const prev = qc.getQueryData<Cart>(cartKey)
            qc.setQueryData<Cart>(cartKey, (old) => {
                if (!old) return old
                const item = old.items.find((i) => i.shopProductId === shopProductId)
                if (!item) return old
                const nextSubtotal = old.subtotal - item.subtotal + item.price * qty
                const nextCount = old.count - item.quantity + qty
                return {
                    ...old,
                    items: old.items.map((i) =>
                        i.shopProductId === shopProductId
                            ? { ...i, quantity: qty, subtotal: i.price * qty }
                            : i,
                    ),
                    subtotal: Number(nextSubtotal.toFixed(2)),
                    count: nextCount,
                }
            })
            if (prev) {
                const item = prev.items.find((i) => i.shopProductId === shopProductId)
                if (item) cartStore.setCount(prev.count - item.quantity + qty)
            }
            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) qc.setQueryData(cartKey, ctx.prev)
        },

        onSuccess: (updated) => {
            qc.setQueryData(cartKey, updated)
            cartStore.setCount(updated.count)
        },
    })

    const removeMutation = useMutation({
        mutationFn: (shopProductId: string) => cartService.removeItem(shopProductId),

        onMutate: async (shopProductId) => {
            await qc.cancelQueries({ queryKey: cartKey })
            const prev = qc.getQueryData<Cart>(cartKey)
            const removed = prev?.items.find((i) => i.shopProductId === shopProductId)

            qc.setQueryData<Cart>(cartKey, (old) => {
                if (!old) return old
                const items = old.items.filter((i) => i.shopProductId !== shopProductId)
                const newCount = Math.max(0, old.count - (removed?.quantity ?? 0))
                const newSubtotal = Math.max(0, old.subtotal - (removed?.subtotal ?? 0))
                cartStore.setCount(newCount)
                // If cart is now empty, clear store affinity
                if (items.length === 0) cartStore.clearStore()
                return { ...old, items, count: newCount, subtotal: Number(newSubtotal.toFixed(2)) }
            })

            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(cartKey, ctx.prev)
                cartStore.setCount(ctx.prev.count)
            }
        },

        onSuccess: () => qc.invalidateQueries({ queryKey: cartKey }),
    })

    // ── Public interface ────────────────────────────────────────────────────
    /**
     * Add a product to cart.
     * Checks for cross-store conflict. If conflict, opens the switch dialog
     * instead of adding immediately.
     */
    const addToCart = (
        shopProductId: string,
        qty = 1,
        itemStoreId?: string,
        itemStoreName?: string,
    ) => {
        const currentStoreId = cartStore.storeId

        // Cross-store conflict: cart is non-empty and belongs to a different store
        if (
            currentStoreId &&
            itemStoreId &&
            currentStoreId !== itemStoreId &&
            (cart?.count ?? 0) > 0
        ) {
            setPendingCrossStore({
                shopProductId,
                qty,
                newStoreId: itemStoreId,
                newStoreName: itemStoreName ?? '',
            })
            return
        }

        // Same store (or cart is empty) — set store if needed and add
        if (itemStoreId && itemStoreName && !currentStoreId) {
            cartStore.setStore(itemStoreId, itemStoreName)
        }

        addMutation.mutate({ shopProductId, qty })
    }

    return {
        cart,
        isLoading,
        addToCart,
        isAdding: addMutation.isPending,
        updateQty: (shopProductId: string, qty: number) =>
            updateMutation.mutate({ shopProductId, qty }),
        isUpdating: updateMutation.isPending,
        removeFromCart: (shopProductId: string) => removeMutation.mutate(shopProductId),
        isRemoving: removeMutation.isPending,
        getQty: (productOrShopProductId: string) =>
            cart?.items.find((i) => i.shopProductId === productOrShopProductId || i.productId === productOrShopProductId)?.quantity ?? 0,
        isInCart: (productOrShopProductId: string) =>
            (cart?.items.findIndex((i) => i.shopProductId === productOrShopProductId || i.productId === productOrShopProductId) ?? -1) >= 0,

        // Cross-store switch dialog
        pendingCrossStore,
        confirmStoreSwitchAndAdd,
        cancelStoreSwitch,
    }
}
