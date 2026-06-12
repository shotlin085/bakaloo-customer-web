'use client'

import { useQuery } from '@tanstack/react-query'
import { bannersService } from '@/services/banners.service'
import { categoriesService } from '@/services/categories.service'
import { productsService } from '@/services/products.service'
import { BestSellersShowcase, BestSellersShowcaseSkeleton } from '@/components/home/BestSellersShowcase'
import { HomeFeatureGrid, HomeFeatureGridSkeleton } from '@/components/home/HomeFeatureGrid'
import { HomeCategoryGrid, HomeCategoryGridSkeleton } from '@/components/home/HomeCategoryGrid'
import { HomeHeroMosaic, HomeHeroMosaicSkeleton } from '@/components/home/HomeHeroMosaic'
import { HomePromiseBanner } from '@/components/home/HomePromiseBanner'
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader'
import { HomeTrendingGrid } from '@/components/home/HomeTrendingGrid'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { getHomepageCategoryGrid, getTrendingProducts } from '@/lib/shopfront/shopfront-home.utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category, Product } from '@/types/product.types'

export default function HomePage() {
  const { data: banners = [], isLoading: loadingBanners } = useQuery({
    queryKey: QUERY_KEYS.banners,
    queryFn: bannersService.getActive,
    staleTime: STALE_TIMES.banners,
  })

  const { data: allCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: categoriesService.getAll,
    staleTime: STALE_TIMES.categories,
  })

  const categories = getHomepageCategoryGrid(allCategories as Category[], 6)

  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeatured(12),
    staleTime: STALE_TIMES.products,
  })

  const { data: newArrivals = [], isLoading: loadingNewArrivals } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productsService.getNewArrivals(12),
    staleTime: STALE_TIMES.products,
  })

  const { data: dealProducts = [], isLoading: loadingDeals } = useQuery({
    queryKey: ['products', 'deals'],
    queryFn: () => productsService.getDeals(12),
    staleTime: STALE_TIMES.products,
  })

  const trendingProducts = getTrendingProducts({
    featured: featuredProducts,
    deals: dealProducts,
    newArrivals,
    excludeIds: featuredProducts.slice(0, 6).map((product) => product.id),
  })

  return (
    <div className="pb-8">
      {loadingBanners ? (
        <HomeHeroMosaicSkeleton />
      ) : banners.length > 0 ? (
        <HomeHeroMosaic banners={banners} />
      ) : null}

      {loadingCategories ? (
        <HomeCategoryGridSkeleton />
      ) : categories.length > 0 ? (
        <HomeCategoryGrid categories={categories} />
      ) : null}

      {loadingFeatured ? (
        <HomeFeatureGridSkeleton />
      ) : featuredProducts.length > 0 ? (
        <HomeFeatureGrid products={featuredProducts.slice(0, 12)} />
      ) : null}

      {loadingFeatured ? (
        <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
          <BestSellersShowcaseSkeleton />
        </section>
      ) : featuredProducts.length > 0 ? (
        <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
          <BestSellersShowcase products={featuredProducts} />
        </section>
      ) : null}

      {!loadingDeals && trendingProducts.length > 0 && <HomeTrendingGrid products={trendingProducts} />}

      <HomePromiseBanner />

      {!loadingNewArrivals && newArrivals.length > 0 && (
        <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
          <HomeSectionHeader
            title="New Arrivals"
            subtitle="Freshly added products that deserve visibility before they become routine."
            viewAllHref="/products"
            eyebrow="New In"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {newArrivals.slice(0, 6).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
                showNewBadge
              />
            ))}
          </div>
        </section>
      )}

      {!loadingDeals && dealProducts.length > 0 && (
        <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
          <HomeSectionHeader
            title="Weekly Picks"
            subtitle="Current-value products pulled from the live deals feed without crowding the main merchandising."
            viewAllHref="/products"
            eyebrow="Deals"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {dealProducts.slice(0, 6).map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        </section>
      )}

      {!loadingFeatured && featuredProducts.length === 0 && <AllProductsSection />}
    </div>
  )
}

function AllProductsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'all-home'],
    queryFn: () => productsService.getAll({ limit: 20 }),
    staleTime: STALE_TIMES.products,
  })

  const products = data?.products ?? []

  if (isLoading) {
    return (
      <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
        <Skeleton className="mb-4 h-6 w-32 rounded" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/70 bg-white/72 py-20 shadow-[0_16px_36px_rgba(42,28,92,0.06)]">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(104,72,198,0.08)]">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="mb-1 text-lg font-bold text-[#1F2937]">No products yet</h2>
          <p className="max-w-[300px] text-center text-sm text-[#6B7280]">
            Check back soon for fresh groceries.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-3 home-section-spacing sm:px-4 lg:px-6">
      <HomeSectionHeader
        title="All Products"
        subtitle="Fallback live catalog rendering when primary featured merchandising is unavailable."
        eyebrow="Catalog"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
