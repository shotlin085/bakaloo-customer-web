/**
 * Canonical query key factory for TanStack Query.
 *
 * Rules:
 * - Every key for store-dependent data MUST include storeId.
 * - User-scoped data (wallet, addresses, orders, etc.) does NOT include storeId.
 * - Never hand-write query key arrays — always use this factory.
 * - All store-dependent queries must set `enabled: !!storeId`.
 */
export const keys = {
    // ── Auth / User (not store-scoped) ────────────────────────────────────
    user: () => ['user'] as const,
    userStats: () => ['user', 'stats'] as const,

    // ── Store resolution ───────────────────────────────────────────────────
    serviceability: (pincode: string) => ['serviceability', pincode] as const,
    store: (storeId: string) => ['store', storeId] as const,
    stores: (pincode: string) => ['stores', pincode] as const,

    // ── Store-scoped catalog ───────────────────────────────────────────────
    categories: (storeId: string) => ['categories', storeId] as const,
    category: (storeId: string, categoryId: string) =>
        ['category', storeId, categoryId] as const,
    categoryProducts: (storeId: string, categoryId: string, page: number) =>
        ['categoryProducts', storeId, categoryId, page] as const,

    banners: (storeId: string) => ['banners', storeId] as const,

    // ── Products — ALL must include storeId ───────────────────────────────
    products: (storeId: string, filters: Record<string, unknown> = {}) =>
        ['products', storeId, filters] as const,
    featuredProducts: (storeId: string) =>
        ['products', storeId, 'featured'] as const,
    dealsProducts: (storeId: string) =>
        ['products', storeId, 'deals'] as const,
    newArrivals: (storeId: string) =>
        ['products', storeId, 'new-arrivals'] as const,
    product: (storeId: string, slug: string) =>
        ['product', storeId, slug] as const,
    productOptions: (storeId: string, familyId: string) =>
        ['product-options', storeId, familyId] as const,
    relatedProducts: (storeId: string, productId: string) =>
        ['product-related', storeId, productId] as const,
    search: (storeId: string, query: string, page: number) =>
        ['search', storeId, query, page] as const,

    // ── Cart — user + store scoped ─────────────────────────────────────────
    cart: (userId: string, storeId: string) =>
        ['cart', userId, storeId] as const,
    // Fallback key for unauthenticated / pre-store-resolution reads
    cartFallback: () => ['cart'] as const,

    // ── Fees / Delivery ────────────────────────────────────────────────────
    fees: (storeId: string, addressId: string) =>
        ['fees', storeId, addressId] as const,
    deliverySlots: (storeId: string, date: string) =>
        ['delivery-slots', storeId, date] as const,

    // ── Orders — user scoped (order belongs to store but query is per user) ─
    orders: (filters: Record<string, unknown> = {}) =>
        ['orders', filters] as const,
    activeOrders: () => ['orders', 'active'] as const,
    order: (orderId: string) => ['order', orderId] as const,

    // ── User data (not store-scoped) ───────────────────────────────────────
    addresses: () => ['addresses'] as const,
    wallet: () => ['wallet'] as const,
    walletTransactions: (filters: Record<string, unknown> = {}) =>
        ['wallet-transactions', filters] as const,
    coupons: (storeId: string) => ['coupons', storeId] as const,
    notifications: (filters: Record<string, unknown> = {}) =>
        ['notifications', filters] as const,
    wishlist: () => ['wishlist'] as const,
    reviews: (productId: string, page: number) =>
        ['reviews', productId, page] as const,
    reviewEligibility: (productId: string, userId: string) =>
        ['review-eligibility', productId, userId] as const,
    myReviews: () => ['my-reviews'] as const,
    loyalty: () => ['loyalty'] as const,
    referral: () => ['referral'] as const,
} as const

// Stale times (ms) — kept here alongside keys for co-location
export const STALE = {
    store: 60_000,           // 1 min — reacts quickly to store status changes
    banners: 5 * 60_000,     // 5 min — dashboard changes appear promptly
    categories: 5 * 60_000,  // 5 min
    products: 5 * 60_000,    // 5 min
    cart: 0,                 // Always fresh
    orders: 30_000,          // 30 sec
    wallet: 0,               // Always fresh
    notifications: 0,        // Real-time
    user: 15 * 60_000,       // 15 min
    addresses: 10 * 60_000,  // 10 min
    fees: 30_000,            // 30 sec — reacts to coupon/quantity changes
    coupons: 60_000,         // 1 min
} as const
