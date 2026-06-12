import type { Banner } from '@/types/banner.types'
import type { Category, Product } from '@/types/product.types'
import { SHOPFRONT_CATEGORY_PREFERENCES } from './shopfront-content'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export function getTopLevelActiveCategories(categories: Category[]) {
  return [...categories]
    .filter((category) => category.is_active && !category.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order || b.product_count - a.product_count)
}

export function getHomepageCategoryNav(categories: Category[]) {
  const active = getTopLevelActiveCategories(categories)
  const used = new Set<string>()

  const matched = SHOPFRONT_CATEGORY_PREFERENCES.flatMap((pref) => {
    const category = active.find((entry) => {
      if (used.has(entry.id)) return false
      const haystack = `${entry.name} ${entry.description ?? ''}`.toLowerCase()
      return pref.keywords.some((keyword) => haystack.includes(keyword))
    })

    if (!category) return []
    used.add(category.id)

    return [{ ...category, navLabel: pref.label, iconKey: pref.icon }]
  })

  const fallback = active
    .filter((category) => !used.has(category.id))
    .slice(0, Math.max(0, 6 - matched.length))
    .map((category) => ({
      ...category,
      navLabel: category.name,
      iconKey: 'pantry' as const,
    }))

  return [...matched, ...fallback].slice(0, 6)
}

export function getHomepageCategoryGrid(categories: Category[], limit = 6) {
  return getTopLevelActiveCategories(categories).slice(0, limit)
}

export function getTrendingProducts(input: {
  featured: Product[]
  deals: Product[]
  newArrivals: Product[]
  excludeIds?: string[]
}) {
  const exclude = new Set(input.excludeIds ?? [])
  return uniqueById([...input.featured, ...input.deals, ...input.newArrivals])
    .filter((product) => !exclude.has(product.id))
    .sort((a, b) => {
      const soldDelta = (b.total_sold || 0) - (a.total_sold || 0)
      if (soldDelta !== 0) return soldDelta
      return (b.sale_price ? 1 : 0) - (a.sale_price ? 1 : 0)
    })
    .slice(0, 12)
}

export function getHeroBannerSet(banners: Banner[]) {
  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)
  return {
    hero: sorted[0] ?? null,
    secondary: sorted.slice(1, 3),
  }
}

export function getPromoBannerSet(banners: Banner[]) {
  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)
  const remaining = sorted.slice(3)

  return {
    cards: remaining.slice(0, 2),
    strip: remaining[2] ?? null,
  }
}

export function getBannerHeadline(banner: Banner | null | undefined) {
  if (!banner?.title) return ''
  return normalize(banner.title)
}
