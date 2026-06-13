import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductDeliveryPanel } from '@/components/product/ProductDeliveryPanel'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductDetailsSection } from '@/components/product/ProductDetailsSection'
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { RecentlyViewedSection } from '@/components/product/RecentlyViewedSection'
import { PageShell, SectionHeader } from '@/components/shared'
import type { Product } from '@/types/product.types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

interface Params {
    params: { slug: string }
}

interface ReviewSummary {
    averageRating: number
    totalReviews: number
}

function normalizeProduct(raw: Record<string, unknown> | null): Product | null {
    if (!raw || !raw.id || !raw.name || !raw.slug) return null

    const salePriceRaw = raw.sale_price ?? raw.salePrice
    const salePrice = salePriceRaw != null ? Number(salePriceRaw) : null

    return {
        id: String(raw.id),
        name: String(raw.name),
        slug: String(raw.slug),
        description: raw.description != null ? String(raw.description) : null,
        price: Number(raw.price) || 0,
        sale_price: salePrice,
        salePrice: salePrice,
        stock_quantity: Number(raw.stock_quantity) || 0,
        unit: (raw.unit as Product['unit']) ?? 'piece',
        category_id: raw.category_id != null ? String(raw.category_id) : '',
        category_name: (raw.category_name as string) ?? null,
        images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
        thumbnail_url: raw.thumbnail_url != null ? String(raw.thumbnail_url) : null,
        is_featured: Boolean(raw.is_featured),
        total_sold: Number(raw.total_sold) || 0,
        max_order_qty: raw.max_order_qty != null ? Number(raw.max_order_qty) : null,
        tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
        ingredients: (raw.ingredients as string) ?? null,
        allergen_info: (raw.allergen_info as string) ?? null,
        shelf_life: (raw.shelf_life as string) ?? null,
        storage_instructions: (raw.storage_instructions as string) ?? null,
        certifications: Array.isArray(raw.certifications) ? (raw.certifications as string[]) : null,
        nutrition_info: (raw.nutrition_info as Record<string, string>) ?? null,
        variants: (raw.variants as Product['variants']) ?? null,
        created_at: raw.created_at != null ? String(raw.created_at) : new Date().toISOString(),
        // Multi-vendor shop fields
        shop_id: raw.shop_id != null ? String(raw.shop_id) : null,
        shop_product_id: raw.shop_product_id != null ? String(raw.shop_product_id) : null,
        shop_name: raw.shop_name != null ? String(raw.shop_name) : null,
        shop_price: raw.shop_price != null ? Number(raw.shop_price) : null,
        shop_stock: raw.shop_stock != null ? Number(raw.shop_stock) : null,
        family_id: raw.family_id != null ? String(raw.family_id) : null,
        option_label: raw.option_label != null ? String(raw.option_label) : null,
        net_quantity: raw.net_quantity != null ? String(raw.net_quantity) : null,
        avg_rating: raw.avg_rating != null ? Number(raw.avg_rating) : null,
        rating_count: raw.rating_count != null ? Number(raw.rating_count) : null,
    }
}

function normalizeReviewSummary(raw: unknown): ReviewSummary {
    if (!raw || typeof raw !== 'object') {
        return { averageRating: 0, totalReviews: 0 }
    }

    const record = raw as Record<string, unknown>
    const pagination = (record.pagination as Record<string, unknown> | undefined) ?? undefined

    return {
        averageRating: Number(record.averageRating ?? record.average_rating ?? 0) || 0,
        totalReviews: Number(pagination?.total ?? 0) || 0,
    }
}

function hasProductDetails(product: Product) {
    return Boolean(
        product.ingredients ||
            product.allergen_info ||
            product.shelf_life ||
            product.storage_instructions ||
            (product.certifications?.filter(Boolean).length ?? 0) > 0 ||
            (product.nutrition_info && Object.keys(product.nutrition_info).length > 0),
    )
}

async function parseJson<T>(res: Response): Promise<T | null> {
    try {
        return (await res.json()) as T
    } catch {
        return null
    }
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) return null

        const json = await parseJson<{ data?: Record<string, unknown> } & Record<string, unknown>>(res)
        const raw = json?.data ?? (json as Record<string, unknown> | undefined)
        return normalizeProduct(raw ?? null)
    } catch {
        return null
    }
}

async function getInitialReviews(productId: string): Promise<unknown> {
    const endpoints = [
        `${API_URL}/products/${productId}/reviews?page=1&limit=6`,
        `${API_URL}/reviews/products/${productId}?page=1&limit=6`,
    ]

    for (const url of endpoints) {
        try {
            const res = await fetch(url, { next: { revalidate: 120 } })
            if (!res.ok) continue
            const json = await parseJson<Record<string, unknown>>(res)
            if (!json) continue
            return json.data ?? json
        } catch {
            // Continue to fallback endpoint.
        }
    }

    return null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const product = await getProduct(params.slug)
    if (!product) {
        return { title: 'Product Not Found — Bakaloo' }
    }

    const price = product.shop_price ?? product.sale_price ?? product.salePrice ?? product.price
    const image = product.images?.[0] || product.thumbnail_url || '/og-default.png'

    return {
        title: `${product.name} — ₹${price} | Bakaloo`,
        description:
            product.description?.slice(0, 160) ||
            `Buy ${product.name} at best price on Bakaloo. Fresh quality guaranteed.`,
        openGraph: {
            title: product.name,
            description:
                product.description?.slice(0, 160) || `Buy ${product.name} on Bakaloo`,
            images: [{ url: image, width: 1200, height: 630 }],
            type: 'website',
            locale: 'en_IN',
            siteName: 'Bakaloo',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            images: [image],
        },
    }
}

function ProductJsonLd({ product }: { product: Product }) {
    const price = product.shop_price ?? product.sale_price ?? product.salePrice ?? product.price
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images?.length ? product.images : [product.thumbnail_url],
        description: product.description,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price,
            availability:
                product.stock_quantity > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

export default async function ProductDetailPage({ params }: Params) {
    const product = await getProduct(params.slug)
    if (!product) notFound()

    const initialReviews = await getInitialReviews(product.id)
    const reviewSummary = normalizeReviewSummary(initialReviews)
    const showDetails = hasProductDetails(product)

    return (
        <>
            <ProductJsonLd product={product} />
            <PageShell spacing="relaxed">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-8">
                    <div className="shop-surface-soft rounded-[30px] p-4 sm:p-5 lg:p-6">
                        <ProductGallery product={product} />
                    </div>
                    <div className="shop-surface-soft space-y-5 rounded-[30px] p-5 sm:p-6">
                        <ProductInfo product={product} reviewSummary={reviewSummary} />
                        <ProductDeliveryPanel product={product} />
                    </div>
                </div>
                {showDetails && (
                    <div className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                        <ProductDetailsSection product={product} />
                    </div>
                )}
                <div className="shop-surface-soft rounded-[30px] p-5 sm:p-6" id="reviews">
                    <SectionHeader
                        title="Ratings & Reviews"
                        subtitle="Read verified feedback and see how this product performs over time."
                    />
                    <div className="mt-5">
                        <ProductReviewsSection productId={product.id} initialData={initialReviews} />
                    </div>
                </div>
                <div className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                    <SectionHeader
                        title="Related Products"
                        subtitle="More curated picks from the same shopping mission."
                    />
                    <div className="mt-5">
                        <RelatedProducts productId={product.id} />
                    </div>
                </div>
                <div className="shop-surface-soft rounded-[30px] p-5 sm:p-6">
                    <RecentlyViewedSection currentProductId={product.id} />
                </div>
            </PageShell>
        </>
    )
}
