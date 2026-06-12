'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Clock3, Search, Sparkles, Trash2, X } from 'lucide-react'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { productsService } from '@/services/products.service'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { EmptyStateCard, PageHeader, PageShell, SectionHeader } from '@/components/shared'
import { useSearchStore } from '@/store/search.store'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { Product } from '@/types/product.types'

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchContent />
        </Suspense>
    )
}

function SearchContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const q = (searchParams.get('q') ?? '').trim()

    useEffect(() => {
        document.title = q ? `Search: ${q} — Bakaloo` : 'Search — Bakaloo'
    }, [q])

    const { recentSearches, addSearch, removeSearch, clearSearches } = useSearchStore()
    const { recentlyViewedIds } = useRecentlyViewed()

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.search(q, 1),
        queryFn: () => productsService.search(q, 1),
        enabled: q.length >= 1,
        staleTime: 3 * 60 * 1000,
    })

    const { data: recentlyViewedProducts = [], isLoading: loadingRecentlyViewed } = useQuery({
        queryKey: ['recently-viewed-products', recentlyViewedIds.slice(0, 6)],
        queryFn: async () => {
            const entries = await Promise.all(
                recentlyViewedIds.slice(0, 6).map((id) => productsService.getById(id).catch(() => null)),
            )
            return entries.filter((entry): entry is Product => entry !== null)
        },
        enabled: recentlyViewedIds.length > 0,
        staleTime: 5 * 60 * 1000,
    })

    const handleRecentSearchClick = (term: string) => {
        const value = term.trim()
        if (!value) return
        addSearch(value)
        router.push(`/search?q=${encodeURIComponent(value)}`)
    }

    return (
        <PageShell spacing="relaxed">
            <PageHeader
                eyebrow="Search"
                title={q ? `Results for “${q}”` : 'Search the store'}
                subtitle={
                    q
                        ? `${data?.pagination?.total ?? '...'} live matches across products and merchandising surfaces.`
                        : 'Search products, brands, or categories with live store inventory.'
                }
            />

            {q.length === 0 ? (
                <div className="space-y-6">
                    <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                        <SectionHeader
                            title="Recent Searches"
                            subtitle="Jump back into previous shopping intent without typing again."
                            action={
                                recentSearches.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={clearSearches}
                                        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--shop-border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--shop-ink-muted)] transition-colors hover:bg-gray-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        Clear all
                                    </button>
                                ) : null
                            }
                        />

                        <div className="mt-4">
                            <h2 className="sr-only">Recent Searches</h2>
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
                                <Clock3 className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                <span className="sr-only">Recent</span>
                            </div>
                            {recentSearches.length === 0 ? (
                                <p className="mt-3 text-sm text-[color:var(--shop-ink-muted)]">No recent searches yet.</p>
                            ) : (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {recentSearches.map((term) => (
                                        <div
                                            key={term}
                                            className="group inline-flex items-center rounded-full border border-gray-200 bg-white pr-1"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleRecentSearchClick(term)}
                                                className="px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-green-600"
                                            >
                                                {term}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeSearch(term)}
                                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                                aria-label={`Remove ${term} from recent searches`}
                                            >
                                                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                        <SectionHeader
                            title="Recently Viewed"
                            subtitle="Keep your momentum with products you already explored."
                        />
                        <h2 className="sr-only">Recently Viewed</h2>
                        <div className="mb-3 mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700">
                            <Sparkles className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                        </div>

                        {loadingRecentlyViewed ? (
                            <ProductGridSkeleton count={5} />
                        ) : recentlyViewedProducts.length === 0 ? (
                            <p className="text-sm text-gray-500">Your recently viewed products will show here.</p>
                        ) : (
                            <ProductGrid>
                                {recentlyViewedProducts.slice(0, 5).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </ProductGrid>
                        )}
                    </section>

                    <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                        <SectionHeader
                            title="Popular Categories"
                            subtitle="Jump into the highest-traffic aisles."
                        />
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Fruits', href: '/categories' },
                                { label: 'Vegetables', href: '/categories' },
                                { label: 'Dairy', href: '/categories' },
                                { label: 'Snacks', href: '/categories' },
                            ].map((entry) => (
                                <Link
                                    key={entry.label}
                                    href={entry.href}
                                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                                >
                                    {entry.label}
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            ) : isLoading ? (
                <ProductGridSkeleton count={12} />
            ) : (data?.products ?? []).length === 0 ? (
                <div className="space-y-8">
                    <EmptyStateCard
                        icon={Search}
                        title={`No results for “${q}”`}
                        subtitle="Try a different keyword or browse from one of the curated categories below."
                        ctaLabel="Browse Categories"
                        ctaHref="/categories"
                    />

                    {(data?.suggestions ?? []).length > 0 && (
                        <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                            <SectionHeader
                                title="You Might Be Looking For"
                                subtitle="Closest matches based on what you searched."
                            />
                            <div className="mt-5">
                                <ProductGrid>
                                    {(data?.suggestions ?? []).map((product: Product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </ProductGrid>
                            </div>
                        </section>
                    )}

                    {recentlyViewedProducts.length > 0 && (
                        <div className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                            <SectionHeader title="Recently Viewed" subtitle="Continue where you left off." />
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {recentlyViewedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                    <SectionHeader
                        title="Matching Products"
                        subtitle="Live inventory results ranked for fast decision-making."
                    />
                    <div className="mt-5">
                        <ProductGrid>
                            {(data?.products ?? []).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </ProductGrid>
                    </div>
                </section>
            )}
        </PageShell>
    )
}

function SearchPageSkeleton() {
    return (
        <div className="page-enter px-4 py-5 sm:px-5 lg:px-6">
            <div className="mb-2 h-8 w-48 rounded bg-gray-200/70" />
            <div className="mb-6 h-4 w-64 rounded bg-gray-200/70" />
            <ProductGridSkeleton count={12} />
        </div>
    )
}
