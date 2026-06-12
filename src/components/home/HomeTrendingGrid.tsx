import { HomeSectionHeader } from './HomeSectionHeader'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types/product.types'

export function HomeTrendingGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-9">
      <HomeSectionHeader
        title="What Others Are Buying"
        subtitle="Live demand signals from the products customers are adding fastest."
        viewAllHref="/products"
        eyebrow="Trending"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  )
}
