'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton'
import { EmptyStateCard, PageHeader, PageShell } from '@/components/shared'
import { ArrowUpDown, PackageSearch } from 'lucide-react'

import type { Product } from '@/types/product.types'

export default function CategoryPage({ params }: { params: { id: string } }) {
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState('popular')
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const observerRef = useRef<HTMLDivElement>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['category-products', params.id, page, sort],
        queryFn: () => categoriesService.getProducts(params.id, { page, sort }),
    })

    const { data: category } = useQuery({
        queryKey: ['category', params.id],
        queryFn: () => categoriesService.getById(params.id),
    })

    // Append new products
    useEffect(() => {
        if (data?.products) {
            if (page === 1) {
                setAllProducts(data.products)
            } else {
                setAllProducts((prev) => [...(prev ?? []), ...data.products])
            }
        }
    }, [data?.products, page])

    // Reset on sort change
    useEffect(() => {
        setPage(1)
        setAllProducts([])
    }, [sort])

    // Infinite scroll observer
    useEffect(() => {
        const el = observerRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    data?.pagination &&
                    page < data.pagination.totalPages
                ) {
                    setPage((p) => p + 1)
                }
            },
            { rootMargin: '300px' },
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [data?.pagination, page])

    return (
        <PageShell spacing="relaxed">
            <PageHeader
                eyebrow="Category"
                title={category?.name ?? 'Products'}
                subtitle={
                    data?.pagination
                        ? `${data.pagination.total} products available in this curated aisle.`
                        : 'Loading products in this category.'
                }
                actions={
                    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--shop-border)] bg-white/86 px-4 py-2 text-sm font-semibold text-[color:var(--shop-ink)] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                        <ArrowUpDown className="h-4 w-4 text-[color:var(--shop-primary)]" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-transparent pr-1 text-sm outline-none"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest</option>
                            <option value="price_low">Price: Low → High</option>
                            <option value="price_high">Price: High → Low</option>
                        </select>
                    </div>
                }
            />

            <section className="shop-surface-soft rounded-[30px] p-4 sm:p-5 lg:p-6">
                {category?.description ? (
                    <p className="mb-5 max-w-[760px] text-sm leading-6 text-[color:var(--shop-ink-muted)]">
                        {category.description}
                    </p>
                ) : null}

            {/* Product grid */}
            {isLoading && page === 1 ? (
                <ProductGridSkeleton count={12} />
            ) : allProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {(allProducts ?? []).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <EmptyStateCard
                    icon={PackageSearch}
                    title="No products in this category"
                    subtitle="This aisle does not have active products yet. Explore other categories for live inventory."
                    ctaLabel="Back to Categories"
                    ctaHref="/categories"
                />
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-10" />

            {/* Loading more indicator */}
            {isLoading && page > 1 && (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                </div>
            )}
            </section>
        </PageShell>
    )
}
