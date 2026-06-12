'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Apple,
  Baby,
  Cookie,
  Grid2x2,
  Headset,
  Milk,
  Package,
  PhoneCall,
  Sparkles,
  Sprout,
} from 'lucide-react'
import { categoriesService } from '@/services/categories.service'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { getHomepageCategoryNav } from '@/lib/shopfront/shopfront-home.utils'
import {
  SHOPFRONT_HEADER_HOTLINE,
  type CategoryIconKey,
} from '@/lib/shopfront/shopfront-content'

function CategoryIcon({ iconKey }: { iconKey: CategoryIconKey | 'default' }) {
  const className = 'h-[16px] w-[16px] stroke-[1.9]'

  switch (iconKey) {
    case 'vegetables':
      return <Sprout className={className} />
    case 'fruits':
      return <Apple className={className} />
    case 'dairy':
      return <Milk className={className} />
    case 'snacks':
      return <Cookie className={className} />
    case 'baby':
      return <Baby className={className} />
    case 'care':
      return <Sparkles className={className} />
    case 'pantry':
      return <Package className={className} />
    default:
      return <Grid2x2 className={className} />
  }
}

export function HeaderCategoryNav() {
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: categoriesService.getAll,
    staleTime: STALE_TIMES.categories,
  })

  const navCategories = getHomepageCategoryNav(categories).slice(0, 4)

  if (navCategories.length === 0) return null

  return (
    <div className="border-b border-[rgba(17,24,39,0.05)] bg-white">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto scrollbar-hide">
            {navCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[rgba(17,24,39,0.08)] bg-white px-4 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] transition-colors hover:border-[rgba(75,0,130,0.14)] hover:bg-[rgba(104,72,198,0.04)] hover:text-[color:var(--shop-primary)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(104,72,198,0.08)] text-[color:var(--shop-primary)]">
                  <CategoryIcon iconKey={category.iconKey} />
                </span>
                <span>{category.navLabel}</span>
              </Link>
            ))}

            <Link
              href="/categories"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[color:var(--shop-primary)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[color:var(--shop-primary-hover)]"
            >
              <Grid2x2 className="h-[16px] w-[16px] stroke-[2]" />
              <span>View All Categories</span>
            </Link>
          </div>

          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--shop-ink)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(54,150,110,0.10)] text-[color:var(--shop-success)]">
                <Headset className="h-[16px] w-[16px]" strokeWidth={1.9} />
              </span>
              <span>{SHOPFRONT_HEADER_HOTLINE.label}</span>
            </div>

            <div className="inline-flex items-center gap-3 rounded-[12px] bg-[color:var(--shop-primary)] px-4 py-3 text-white shadow-[0_8px_18px_rgba(76,29,149,0.14)]">
              <PhoneCall className="h-[18px] w-[18px]" strokeWidth={1.9} />
              <div className="leading-tight">
                <p className="text-[11px] font-medium text-white/80">{SHOPFRONT_HEADER_HOTLINE.phoneLabel}</p>
                <p className="text-[15px] font-bold leading-none">{SHOPFRONT_HEADER_HOTLINE.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
