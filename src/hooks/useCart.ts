'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { toast } from 'sonner'
import type { Cart } from '@/types/cart.types'

export function useCart() {
    const qc = useQueryClient()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const setCount = useCartStore((s) => s.setCount)

    const { data: cart, isLoading } = useQuery({
        queryKey: QUERY_KEYS.cart,
        queryFn: cartService.get,
        enabled: isLoggedIn,
        staleTime: STALE_TIMES.cart,
    })

    useEffect(() => {
        if (cart) setCount(cart.count)
        if (!cart && !isLoggedIn) setCount(0)
    }, [cart, isLoggedIn, setCount])

    const addMutation = useMutation({
        mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
            cartService.addItem(productId, qty),

        onMutate: async ({ qty }) => {
            await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
            const prev = qc.getQueryData<Cart>(QUERY_KEYS.cart)
            setCount((prev?.count ?? 0) + qty)
            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(QUERY_KEYS.cart, ctx.prev)
                setCount(ctx.prev.count)
            }
            toast.error('Could not add item. Try again.')
        },

        onSuccess: (updatedCart) => {
            qc.setQueryData(QUERY_KEYS.cart, updatedCart)
            setCount(updatedCart.count)
            toast.success('Added to cart ✓')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
            cartService.updateQuantity(productId, qty),

        onMutate: async ({ productId, qty }) => {
            await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
            const prev = qc.getQueryData<Cart>(QUERY_KEYS.cart)
            qc.setQueryData<Cart>(QUERY_KEYS.cart, (old) => {
                if (!old) return old
                const currentItem = old.items.find((item) => item.productId === productId)
                if (!currentItem) return old

                const nextSubtotal = old.subtotal - currentItem.subtotal + currentItem.price * qty
                const nextCount = old.count - currentItem.quantity + qty

                return {
                    ...old,
                    items: old.items.map((i) =>
                        i.productId === productId ? { ...i, quantity: qty, subtotal: i.price * qty } : i,
                    ),
                    subtotal: Number(nextSubtotal.toFixed(2)),
                    count: nextCount,
                }
            })
            if (prev) {
                const currentItem = prev.items.find((item) => item.productId === productId)
                if (currentItem) {
                    setCount(prev.count - currentItem.quantity + qty)
                }
            }
            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) qc.setQueryData(QUERY_KEYS.cart, ctx.prev)
        },

        onSuccess: (updated) => {
            qc.setQueryData(QUERY_KEYS.cart, updated)
            setCount(updated.count)
        },
    })

    const removeMutation = useMutation({
        mutationFn: (productId: string) => cartService.removeItem(productId),

        onMutate: async (productId) => {
            await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
            const prev = qc.getQueryData<Cart>(QUERY_KEYS.cart)
            const removed = prev?.items.find((i) => i.productId === productId)

            qc.setQueryData<Cart>(QUERY_KEYS.cart, (old) => {
                if (!old) return old
                const items = old.items.filter((i) => i.productId !== productId)
                const newCount = Math.max(0, old.count - (removed?.quantity ?? 0))
                const newSubtotal = Math.max(0, old.subtotal - (removed?.subtotal ?? 0))
                setCount(newCount)
                return { ...old, items, count: newCount, subtotal: Number(newSubtotal.toFixed(2)) }
            })

            return { prev }
        },

        onError: (_e, _v, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(QUERY_KEYS.cart, ctx.prev)
                setCount(ctx.prev.count)
            }
        },

        onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.cart }),
    })

    return {
        cart,
        isLoading,
        addToCart: (productId: string, qty = 1) => addMutation.mutate({ productId, qty }),
        isAdding: addMutation.isPending,
        updateQty: (productId: string, qty: number) => updateMutation.mutate({ productId, qty }),
        isUpdating: updateMutation.isPending,
        removeFromCart: (productId: string) => removeMutation.mutate(productId),
        isRemoving: removeMutation.isPending,
        getQty: (productId: string) =>
            cart?.items.find((i) => i.productId === productId)?.quantity ?? 0,
        isInCart: (productId: string) =>
            (cart?.items.findIndex((i) => i.productId === productId) ?? -1) >= 0,
    }
}
