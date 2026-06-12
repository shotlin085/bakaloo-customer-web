'use client'

import { useRouter } from 'next/navigation'
import { Loader2, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/store/auth.store'

interface AddToCartButtonProps {
    productId: string
    stockQty: number
    maxQty?: number | null
    className?: string
}

export function AddToCartButton({ productId, stockQty, maxQty, className }: AddToCartButtonProps) {
    const router = useRouter()
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
    const { getQty, addToCart, updateQty, removeFromCart, isAdding } = useCart()
    const qty = getQty(productId)
    const limit = Math.min(maxQty ?? 10, stockQty)

    const handleAdd = () => {
        if (!isLoggedIn) {
            router.push('/login')
            return
        }
        if (stockQty <= 0) {
            toast.error('Out of stock')
            return
        }
        addToCart(productId, 1)
    }

    if (qty === 0) {
        return (
            <button
                onClick={handleAdd}
                disabled={stockQty <= 0 || isAdding}
                className={cn(
                    'flex items-center justify-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50',
                    className,
                )}
                type="button"
            >
                {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Plus className="h-4 w-4" /> Add
                    </>
                )}
            </button>
        )
    }

    return (
        <div className={cn('inline-flex items-center gap-0.5 rounded-lg border border-green-200 bg-green-50', className)}>
            <button
                onClick={() => (qty <= 1 ? removeFromCart(productId) : updateQty(productId, qty - 1))}
                className="rounded-l-lg text-green-600 hover:bg-green-100 flex h-8 w-8 items-center justify-center"
                type="button"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-bold text-green-700">{qty}</span>
            <button
                onClick={() => updateQty(productId, qty + 1)}
                disabled={qty >= limit}
                className="rounded-r-lg text-green-600 hover:bg-green-100 disabled:opacity-40 flex h-8 w-8 items-center justify-center"
                type="button"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
