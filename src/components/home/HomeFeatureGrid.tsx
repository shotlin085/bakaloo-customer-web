import { HomeSectionHeader } from './HomeSectionHeader'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types/product.types'

export function HomeFeatureGrid({
  products,
  title = 'Featured Premium Groceries',
  subtitle = 'Refined staples and high-conviction picks designed to lead the storefront.',
}: {
  products: Product[]
  title?: string
  subtitle?: string
}) {
  if (products.length === 0) return null

  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-9">
      <HomeSectionHeader title={title} subtitle={subtitle} viewAllHref="/products" eyebrow="Featured" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  )
}

export function HomeFeatureGridSkeleton() {
  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-9">
      <div className="mb-5 h-12 w-80 rounded skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[24px]">
            <div className="h-[320px] rounded-[24px] skeleton-shimmer" />
          </div>
        ))}
      </div>
    </section>
  )
}
