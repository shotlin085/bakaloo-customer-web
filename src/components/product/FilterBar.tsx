'use client'

import { ArrowUpDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
    sort: string
    onSortChange: (sort: string) => void
    inStock: boolean
    onInStockChange: (v: boolean) => void
    resultCount?: number
}

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price Low→High' },
    { value: 'price_desc', label: 'Price High→Low' },
]

export function FilterBar({
    sort,
    onSortChange,
    inStock,
    onInStockChange,
    resultCount,
}: FilterBarProps) {
    const hasActiveFilters = inStock || sort !== 'relevance'

    return (
        <div className="sticky top-[88px] z-[50] mb-5">
            <div className="overflow-x-auto rounded-[20px] border border-black/[0.06] bg-white/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4">
                <div className="flex min-w-max items-center gap-2.5">
                    <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2">
                        <ArrowUpDown className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
                        <select
                            value={sort}
                            onChange={(event) => onSortChange(event.target.value)}
                            className="bg-transparent text-sm font-medium text-[#1F2937] outline-none"
                            aria-label="Sort products"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => onInStockChange(!inStock)}
                        className={cn(
                            'inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                            inStock
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        )}
                        aria-pressed={inStock}
                    >
                        In Stock
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                onSortChange('relevance')
                                onInStockChange(false)
                            }}
                            className="ml-1 text-sm font-semibold text-[#6B7280] transition-colors hover:text-[#111827]"
                        >
                            Clear all
                        </button>
                    )}

                    {typeof resultCount === 'number' && (
                        <div className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#F5F7F6] px-3 py-2 text-sm font-medium text-[#4B5563]">
                            <Sparkles className="h-4 w-4 text-[#22C55E]" strokeWidth={1.5} />
                            {resultCount} products
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
