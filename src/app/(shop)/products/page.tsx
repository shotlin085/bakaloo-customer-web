'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { FilterBar } from '@/components/product/FilterBar'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts'
import type { Product } from '@/types/product.types'

type SortValue = 'relevance' | 'newest' | 'price_asc' | 'price_desc'

const VALID_SORTS: SortValue[] = ['relevance', 'newest', 'price_asc', 'price_desc']

export default function ProductsPage() {
    useEffect(() => {
        document.title = 'Products — Bakaloo'
    }, [])

    return (
        <Suspense
            fallback={
                <div className="px-6 py-6 page-enter">
                    <div className="mb-5 space-y-2">
                        <div className="h-8 w-48 rounded bg-gray-200/70" />
                        <div className="h-4 w-28 rounded bg-gray-200/70" />
                    </div>
                    <div className="mb-5 h-[74px] rounded-[20px] bg-gray-200/70" />
                    <ProductGridSkeleton count={10} />
                </div>
            }
        >
            <ProductsPageContent />
        </Suspense>
    )
}

function ProductsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const sortParam = searchParams.get('sort') ?? 'relevance'
    const sort = (VALID_SORTS.includes(sortParam as SortValue)
        ? sortParam
        : 'relevance') as SortValue
    const inStock = searchParams.get('inStock') === 'true'
    const categoryId = searchParams.get('categoryId') ?? undefined
    const search = searchParams.get('q') ?? undefined

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteProducts({
        categoryId,
        search,
        sort,
        inStock,
    })

    const { ref: loadMoreRef, inView } = useInView({
        rootMargin: '320px 0px',
        threshold: 0,
    })

    useEffect(() => {
        if (!inView || !hasNextPage || isFetchingNextPage) return
        fetchNextPage()
    }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage])

    const products = useMemo(
        () => data?.pages.flatMap((page) => page.products ?? []) ?? [],
        [data?.pages],
    )

    const sortedProducts = useMemo(() => {
        const list = [...products]

        if (sort === 'newest') {
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            return list
        }

        if (sort === 'price_asc') {
            list.sort((a, b) => {
                const aPrice = a.sale_price ?? a.salePrice ?? a.price
                const bPrice = b.sale_price ?? b.salePrice ?? b.price
                return aPrice - bPrice
            })
            return list
        }

        if (sort === 'price_desc') {
            list.sort((a, b) => {
                const aPrice = a.sale_price ?? a.salePrice ?? a.price
                const bPrice = b.sale_price ?? b.salePrice ?? b.price
                return bPrice - aPrice
            })
            return list
        }

        return list
    }, [products, sort])

    const totalCount = data?.pages?.[0]?.pagination?.total ?? sortedProducts.length

    const updateSearchParams = (updates: Record<string, string | null>) => {
        const nextParams = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (!value) {
                nextParams.delete(key)
            } else {
                nextParams.set(key, value)
            }
        })

        const query = nextParams.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }

    const handleSortChange = (nextSort: string) => {
        updateSearchParams({ sort: nextSort === 'relevance' ? null : nextSort })
    }

    const handleInStockChange = (value: boolean) => {
        updateSearchParams({ inStock: value ? 'true' : null })
    }

    return (
        <div className="px-6 py-6 page-enter">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">All Products</h1>
                <p className="mt-1 text-sm text-[#8A9199]">{totalCount} products</p>
            </div>

            <FilterBar
                sort={sort}
                onSortChange={handleSortChange}
                inStock={inStock}
                onInStockChange={handleInStockChange}
                resultCount={totalCount}
            />

            {isLoading ? (
                <ProductGridSkeleton count={10} />
            ) : isError ? (
                <div className="rounded-[24px] border border-red-200 bg-white p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
                    <p className="text-sm font-medium text-[#374151]">
                        {error instanceof Error ? error.message : 'Could not load products.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 rounded-full bg-[#111827] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1F2937]"
                    >
                        Retry
                    </button>
                </div>
            ) : sortedProducts.length === 0 ? (
                <div className="rounded-[24px] border border-black/5 bg-white py-16 text-center">
                    <p className="text-base font-semibold text-[#1F2937]">No products found</p>
                    <p className="mt-1 text-sm text-[#8A9199]">
                        Try changing sort/filter options and check again.
                    </p>
                </div>
            ) : (
                <>
                    <ProductGrid>
                        {sortedProducts.map((product: Product, index) => (
                            <ProductCard key={product.id} product={product} priority={index < 5} />
                        ))}
                    </ProductGrid>

                    <div ref={loadMoreRef} className="h-3" aria-hidden="true" />

                    {isFetchingNextPage && (
                        <div className="mt-4">
                            <ProductGridSkeleton count={5} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
