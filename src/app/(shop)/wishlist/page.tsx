'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { wishlistService } from '@/services/wishlist.service'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useWishlistStore } from '@/store/wishlist.store'

export default function WishlistPage() {
    const qc = useQueryClient()
    const setCount = useWishlistStore((state) => state.setCount)

    useEffect(() => {
        document.title = 'My Wishlist — Bakaloo'
    }, [])

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.wishlist(),
        queryFn: wishlistService.get,
    })

    const products = Array.isArray(data) ? data : []

    useEffect(() => {
        setCount(products.length)
    }, [products.length, setCount])

    const clearMutation = useMutation({
        mutationFn: wishlistService.clear,
        onSuccess: () => {
            setCount(0)
            qc.invalidateQueries({ queryKey: QUERY_KEYS.wishlist() })
            toast.success('Wishlist cleared')
        },
    })

    if (isLoading) {
        return <div className="px-6 py-6"><ProductGridSkeleton count={8} /></div>
    }

    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 page-enter">
                <Heart className="w-16 h-16 text-gray-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-sm text-gray-500 mb-6">Save items you love to buy later</p>
                <Link href="/">
                    <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-6">
                        Browse Products
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="px-6 py-6 page-enter">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Wishlist
                    <span className="ml-2 text-base font-normal text-gray-400">{products.length} items</span>
                </h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearMutation.mutate()}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    disabled={clearMutation.isPending}
                >
                    <Trash2 className="w-4 h-4 mr-1" /> Clear All
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
