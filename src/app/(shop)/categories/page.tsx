'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { EmptyStateCard, PageHeader, PageShell } from '@/components/shared'
import type { Category } from '@/types/product.types'
import { useEffect } from 'react'
import { LayoutGrid } from 'lucide-react'

// ── Gradient + emoji map ──
const CATEGORY_STYLES: Record<string, { gradient: string; emoji: string }> = {
    fruits: { gradient: 'from-orange-100 to-orange-200', emoji: '🍎' },
    vegetables: { gradient: 'from-green-100 to-green-200', emoji: '🥦' },
    dairy: { gradient: 'from-blue-100 to-blue-200', emoji: '🥛' },
    snacks: { gradient: 'from-yellow-100 to-amber-100', emoji: '🍫' },
    drinks: { gradient: 'from-sky-100 to-blue-100', emoji: '🥤' },
    beverages: { gradient: 'from-sky-100 to-blue-100', emoji: '🥤' },
    coffee: { gradient: 'from-amber-100 to-orange-200', emoji: '☕' },
    meat: { gradient: 'from-rose-100 to-pink-100', emoji: '🥩' },
    bakery: { gradient: 'from-amber-50 to-amber-100', emoji: '🍞' },
    frozen: { gradient: 'from-blue-50 to-blue-100', emoji: '🧊' },
    personal: { gradient: 'from-violet-100 to-purple-100', emoji: '🧴' },
    household: { gradient: 'from-teal-50 to-sky-100', emoji: '🏠' },
    organic: { gradient: 'from-emerald-100 to-green-100', emoji: '🌿' },
    spices: { gradient: 'from-orange-100 to-red-100', emoji: '🌶️' },
    rice: { gradient: 'from-yellow-50 to-amber-50', emoji: '🍚' },
    oil: { gradient: 'from-yellow-100 to-amber-100', emoji: '🫒' },
    fish: { gradient: 'from-blue-100 to-cyan-100', emoji: '🐟' },
    baby: { gradient: 'from-pink-100 to-rose-100', emoji: '👶' },
    default: { gradient: 'from-gray-100 to-gray-200', emoji: '🛒' },
}

function getStyle(name: string) {
    const lower = name.toLowerCase()
    for (const [key, val] of Object.entries(CATEGORY_STYLES)) {
        if (lower.includes(key)) return val
    }
    return CATEGORY_STYLES['default']!
}

export default function CategoriesPage() {
    useEffect(() => {
        document.title = 'Categories — Bakaloo'
    }, [])

    const { data: allCategories = [], isLoading } = useQuery({
        queryKey: QUERY_KEYS.categories,
        queryFn: categoriesService.getAll,
        staleTime: STALE_TIMES.categories,
    })

    const categories = allCategories.filter(
        (c: Category) => c.is_active && !c.parent_id,
    )

    return (
        <PageShell spacing="relaxed">
            <PageHeader
                eyebrow="Browse"
                title="All Categories"
                subtitle={
                    isLoading
                        ? 'Loading curated aisles...'
                        : `${categories.length} curated categories available for faster discovery.`
                }
            />

            <section className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-ink-muted)]">
                            Curated aisles
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--shop-ink-muted)]">
                            Explore fresh produce, pantry staples, and household essentials.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--shop-border)] bg-white/86 px-4 py-2 text-sm font-semibold text-[color:var(--shop-ink)] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                        <LayoutGrid className="h-4 w-4 text-[color:var(--shop-primary)]" />
                        {isLoading ? 'Loading' : `${categories.length} categories`}
                    </div>
                </div>

            {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="skeleton-shimmer h-[132px] rounded-[24px]" />
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <EmptyStateCard
                        icon={LayoutGrid}
                        title="No categories yet"
                        subtitle="The merchandising team has not published categories yet. Check back soon."
                        ctaLabel="Return Home"
                        ctaHref="/"
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {categories.map((cat, i) => {
                            const style = getStyle(cat.name)
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/categories/${cat.id}`}
                                    className={`group relative h-[132px] overflow-hidden rounded-[24px] bg-gradient-to-br ${style.gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] active:scale-[0.98]`}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(17,24,39,0.04)_100%)]" />
                                    <div className="relative flex h-full flex-col justify-between p-4">
                                        <div>
                                            <p className="text-[16px] font-bold text-[color:var(--shop-ink)] transition-colors group-hover:text-[color:var(--shop-primary)]">
                                                {cat.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[color:var(--shop-ink-muted)]">
                                                {cat.product_count ?? 0} items
                                            </p>
                                        </div>
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt={cat.name}
                                                width={40}
                                                height={40}
                                                className="object-contain"
                                            />
                                        ) : null}
                                    </div>
                                    <span className="pointer-events-none absolute -bottom-3 -right-3 rotate-[15deg] select-none text-[80px] leading-none opacity-15">
                                        {style.emoji}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>
        </PageShell>
    )
}
