import Link from 'next/link'
import Image from 'next/image'
import { Package2 } from 'lucide-react'
import { HomeSectionHeader } from './HomeSectionHeader'
import type { Category } from '@/types/product.types'

function categoryTint(name: string) {
  const value = name.toLowerCase()
  if (value.includes('fruit')) return 'from-[#E9F6EC] to-[#D9EEDF]'
  if (value.includes('vegetable') || value.includes('green')) return 'from-[#E4F6EA] to-[#D4EBD8]'
  if (value.includes('dairy') || value.includes('egg')) return 'from-[#EEF1FD] to-[#DCE5FB]'
  if (value.includes('snack') || value.includes('chips')) return 'from-[#FBF0DF] to-[#F0E1C0]'
  if (value.includes('baby')) return 'from-[#F7EAF6] to-[#EDDDF2]'
  return 'from-[#F6F1E8] to-[#EDE4D8]'
}

export function HomeCategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null

  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-9">
      <HomeSectionHeader
        title="Shop by Category"
        subtitle="Quick entry points into the premium aisles customers use most."
        viewAllHref="/categories"
        eyebrow="Discover"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group flex flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white/86 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(76,29,149,0.12)]"
          >
            <div
              className={`relative flex aspect-[1.04/1] items-center justify-center overflow-hidden bg-gradient-to-br ${categoryTint(category.name)}`}
            >
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  priority={index < 6}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/72 text-[color:var(--shop-primary)] shadow-[0_10px_24px_rgba(76,29,149,0.10)]">
                  <Package2 className="h-7 w-7" />
                </span>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.00)_0%,rgba(17,24,39,0.10)_100%)]" />
            </div>

            <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-3">
              <h3 className="line-clamp-2 text-[16px] font-semibold leading-[1.25] tracking-tight text-[color:var(--shop-ink)] sm:text-[17px]">
                {category.name}
              </h3>
              <p className="mt-2 text-[12px] font-medium text-[color:var(--shop-ink-muted)]">
                {category.product_count}+ products
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function HomeCategoryGridSkeleton() {
  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-9">
      <div className="mb-5 h-12 w-72 rounded skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[24px]">
            <div className="aspect-[1.04/1] skeleton-shimmer" />
            <div className="mt-3 h-5 w-3/4 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </section>
  )
}
