'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, ShoppingCart, Loader2, Heart, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatINR } from '@/lib/utils'
import type { Product } from '@/types/product.types'

export function AddToCartSection({ product }: { product: Product }) {
    const { addToCart, updateQty, removeFromCart, getQty, isAdding, isUpdating } = useCart()
    const qty = getQty(product.id)
    const max = product.max_order_qty ?? Math.min(product.stock_quantity, 10)
    const outOfStock = product.stock_quantity === 0

    const [selectedQty, setSelectedQty] = useState(1)
    const displayPrice = product.sale_price ?? product.salePrice ?? product.price
    const lowStockMessage =
        product.stock_quantity <= 1
            ? 'Last one left'
            : product.stock_quantity < 5
              ? `Only ${product.stock_quantity} left`
              : null

    if (outOfStock) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Currently out of stock</p>
                <Button variant="outline" size="sm" className="mt-3">
                    <Heart className="mr-2 h-4 w-4" /> Notify When Available
                </Button>
            </div>
        )
    }

    if (qty > 0) {
        return (
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <button
                            type="button"
                            onClick={() => (qty === 1 ? removeFromCart(product.id) : updateQty(product.id, qty - 1))}
                            disabled={isUpdating}
                            className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-gray-50"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-lg font-bold text-gray-900">{qty}</span>
                        <button
                            type="button"
                            onClick={() => qty < max && updateQty(product.id, qty + 1)}
                            disabled={isUpdating || qty >= max}
                            className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-40"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                            In cart · {formatINR(displayPrice * qty)}
                        </p>
                        <p className="text-xs text-gray-500">Adjust quantity here or review everything in cart.</p>
                    </div>
                </div>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl text-sm font-semibold">
                    <Link href="/cart">View cart</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--shop-ink)]">Quantity</p>
                {lowStockMessage && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />
                        {lowStockMessage}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-gray-50"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-gray-900">{selectedQty}</span>
                    <button
                        type="button"
                        onClick={() => setSelectedQty((q) => Math.min(max, q + 1))}
                        disabled={selectedQty >= max}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-xs text-gray-500">Selected total: {formatINR(displayPrice * selectedQty)}</p>
            </div>

            <Button
                size="lg"
                className="h-12 w-full rounded-xl bg-[color:var(--shop-ink)] text-base font-semibold text-white hover:bg-[#1f2937]"
                onClick={() => addToCart(product.id, selectedQty)}
                disabled={isAdding}
            >
                {isAdding ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add {selectedQty} to cart •{' '}
                        {formatINR(displayPrice * selectedQty)}
                    </>
                )}
            </Button>
        </div>
    )
}
