'use client'

import { useState } from 'react'
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
import { LocationModal } from '@/components/store/LocationModal'
import { keys, STALE } from '@/lib/queryKeys'
import { useStoreContext } from '@/store/store.context'
import { getHomepageCategoryGrid, getTrendingProducts } from '@/lib/shopfront/shopfront-home.utils'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin } from 'lucide-react'
import type { Category, Product } from '@/types/product.types'

export default function HomePage() {
  const storeId = useStoreContext((s) => s.allocatedStoreId)
  const storeName = useStoreContext((s) => s.allocatedStoreName)
  const isResolving = useStoreContext((s) => s.isResolving)
  const hasStore = Boolean(storeId)
  const [locationModalOpen, setLocationModalOpen] = useState(false)

  // Always fetch — backend auto-scopes by JWT/allocation when available, global otherwise
  const { data: banners = [], isLoading: loadingBanners } = useQuery({
    queryKey: keys.banners(storeId ?? 'global'),
    queryFn: () => bannersService.getForStore(),
    staleTime: STALE.banners,
  })

  const { data: allCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: keys.categories(storeId ?? 'global'),
    queryFn: () => categoriesService.getForStore(),
    staleTime: STALE.categories,
  })

  const categories = getHomepageCategoryGrid(allCategories as Category[], 6)

  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: keys.featuredProducts(storeId ?? 'global'),
    queryFn: () => productsService.getFeatured(8),
    staleTime: STALE.products,
  })

  const { data: newArrivals = [], isLoading: loadingNewArrivals } = useQuery({
    queryKey: keys.newArrivals(storeId ?? 'global'),
    queryFn: () => productsService.getNewArrivals(8),
    staleTime: STALE.products,
  })

  const { data: dealProducts = [], isLoading: loadingDeals } = useQuery({
    queryKey: keys.dealsProducts(storeId ?? 'global'),
    queryFn: () => productsService.getDeals(8),
    staleTime: STALE.products,
  })

  const trendingProducts = getTrendingProducts({
    featured: featuredProducts,
    deals: dealProducts,
    newArrivals,
    excludeIds: featuredProducts.slice(0, 6).map((product) => product.id),
  })

  return (
    <div className="pb-8">
      {/* Location nudge — shown when no store is allocated (non-blocking) */}
      {!hasStore && !isResolving && (
        <div className="mx-3 mt-3 sm:mx-4 lg:mx-6">
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 text-left transition-colors hover:border-purple-200"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">Set your delivery location</p>
              <p className="text-xs text-gray-500">Get products available near you — tap to set your pincode</p>
            </div>
            <span className="shrink-0 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white">
              Set
            </span>
          </button>
        </div>
      )}

      {hasStore && storeName && (
        <div className="mx-3 mt-3 sm:mx-4 lg:mx-6">
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-xs font-medium text-green-800">
              Products from <span className="font-bold">{storeName}</span>
            </p>
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="ml-auto text-xs text-green-700 underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

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
        <HomeFeatureGrid products={featuredProducts.slice(0, 8)} />
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
            subtitle="Current-value products pulled from the live deals feed."
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

      <LocationModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  )
}

function AllProductsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'all-home'],
    queryFn: () => productsService.getAll({ limit: 20 }),
    staleTime: STALE.products,
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
        subtitle="Explore our full catalog of fresh groceries."
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
