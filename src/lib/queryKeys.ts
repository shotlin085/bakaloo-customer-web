export const QUERY_KEYS = {
    // Auth / User
    user: () => ['user'] as const,
    userStats: () => ['user', 'stats'] as const,

    // Products
    products: (params?: Record<string, unknown>) => ['products', params] as const,
    product: (slug: string) => ['product', slug] as const,
    productRelated: (id: string) => ['product', id, 'related'] as const,
    featured: () => ['products', 'featured'] as const,
    newArrivals: () => ['products', 'new-arrivals'] as const,
    deals: () => ['products', 'deals'] as const,
    search: (q: string, page: number) => ['products', 'search', q, page] as const,

    // Categories
    categories: () => ['categories'] as const,
    category: (id: string) => ['category', id] as const,
    categoryProducts: (id: string, p?: object) => ['category', id, 'products', p] as const,

    // Cart
    cart: () => ['cart'] as const,

    // Orders
    orders: (params?: object) => ['orders', params] as const,
    activeOrder: () => ['orders', 'active'] as const,
    order: (id: string) => ['order', id] as const,

    // Wallet
    wallet: () => ['wallet'] as const,
    walletTxns: (params?: object) => ['wallet', 'transactions', params] as const,

    // Wishlist
    wishlist: () => ['wishlist'] as const,

    // Addresses
    addresses: () => ['addresses'] as const,

    // Notifications
    notifications: (params?: object) => ['notifications', params] as const,

    // Reviews
    reviews: (productId: string, page: number) => ['reviews', productId, page] as const,
    reviewEligibility: (productId: string, userId: string | null) =>
        ['reviews', 'eligibility', productId, userId] as const,
    myReviews: () => ['my-reviews'] as const,

    // Banners
    banners: () => ['banners'] as const,

    // Coupons
    coupons: () => ['coupons', 'available'] as const,
} as const
