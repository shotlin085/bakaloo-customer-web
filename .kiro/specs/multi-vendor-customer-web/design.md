# Technical Design — Bakaloo Customer Web: Single-Vendor → Multi-Vendor

## Phase 0 Audit Summary

### Current Architecture

```
Next.js 14 App Router · React 18 · TypeScript
API: https://api.bakaloo.in/api/v1
Auth: JWT in localStorage + SameSite=Lax cookie for SSR middleware
State: Zustand (auth, cart count, address, coupon, notif, search, wallet, wishlist)
Server state: TanStack Query (staleTime 5min default, cart/wallet always fresh)
Real-time: Socket.IO (order tracking, notifications)
Payments: Razorpay
Maps: Google Maps
```

### Single-Vendor Assumptions Found

| # | File / Location | Assumption | Severity |
|---|---|---|---|
| 1 | `src/types/product.types.ts` | No `shopId`, `shopProductId`, `shopPrice`, `shopStock` fields | HIGH |
| 2 | `src/types/cart.types.ts` | `CartItem` has no `storeId`, `shopProductId` — flat single-shop bag | HIGH |
| 3 | `src/types/order.types.ts` | No `shopId`, `storeName` — no sub-order concept | HIGH |
| 4 | `src/types/banner.types.ts` | No `shopId` — all banners assumed global | MEDIUM |
| 5 | `src/services/products.service.ts` | All endpoints lack `shopId` / `storeId` param | HIGH |
| 6 | `src/services/cart.service.ts` | `POST /cart/items` body: `{ productId, quantity }` — no `shopProductId` | HIGH |
| 7 | `src/services/orders.service.ts` | `POST /orders` payload lacks `shopId` | HIGH |
| 8 | `src/lib/constants.ts` | `FREE_DELIVERY_THRESHOLD=299` (backend=499), `DEFAULT_DELIVERY_FEE=29` (backend=25) | HIGH |
| 9 | `src/lib/queryKeys.ts` | All keys shopless: `['products', params]`, `['cart']`, `['categories']` | HIGH |
| 10 | `src/store/cart.store.ts` | Only holds `count` — no `storeId` affinity | MEDIUM |
| 11 | All UI components | No "Sold by X", no store selector, no shop profile anywhere | MEDIUM |
| 12 | `src/providers/*.tsx` | No StoreContext or allocation provider | HIGH |
| 13 | `src/app/(shop)/page.tsx` | Home fetches banners/categories/products globally, no store scope | HIGH |
| 14 | `src/components/product/ProductDeliveryPanel.tsx` | Validates pincode globally, not per-store | MEDIUM |
| 15 | `src/lib/shopfront/shopfront-content.ts` | Static theme/copy not driven by dashboard store config | LOW |

---

## Architecture Overview

### 1. Canonical Store Context (Phase 1)

One Zustand store — `useStoreContext` — is the single source of truth for which store the customer is shopping from.

```typescript
// src/store/store.context.ts

interface StoreContextState {
  // Location
  selectedPincode: string | null;
  selectedAddressId: string | null;
  lat: number | null;
  lng: number | null;

  // Allocated store (resolved from backend)
  allocatedStoreId: string | null;
  allocatedStoreName: string | null;
  allocatedStoreSlug: string | null;
  storeLogo: string | null;
  storeStatus: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED' | null;

  // Serviceability
  serviceable: boolean;
  availabilityReason: string | null;
  deliveryEta: number | null;          // minutes
  deliveryDistance: number | null;     // km
  minimumOrder: number | null;         // ₹

  // Resolution metadata
  lastResolvedAt: number | null;       // unix ms
  isResolving: boolean;
  resolutionError: string | null;

  // Actions
  resolveStore: (pincode: string, lat?: number, lng?: number) => Promise<void>;
  resolveFromAddress: (addressId: string) => Promise<void>;
  clearStore: () => void;
  setStoreFromAllocation: (allocation: StoreAllocation) => void;
}
```

**Persistence strategy** (Zustand persist, key `bakaloo-store-v1`):
- Persist: `selectedPincode`, `selectedAddressId`, `allocatedStoreId`, `allocatedStoreName`, `allocatedStoreSlug`, `storeStatus`, `serviceable`, `deliveryEta`, `lastResolvedAt`
- Do NOT persist: `lat`, `lng`, `isResolving`, `resolutionError`, `storeLogo`
- Version: 1 — migrate/clear on version bump
- Clear on: user logout, user change (compare userId at login vs. persisted userId)

**Resolution flow:**
```
Anonymous visitor
  → Show location prompt (LocationModal)
  → User enters pincode OR grants GPS
  → Call GET /stores/serviceable?pincode={p} OR ?lat={lat}&lng={lng}
  → If serviceable: save storeId + pincode, fetch store-scoped data
  → If unserviceable: show UnserviceableState, allow browsing with null storeId
  → On login: call GET /addresses, if default address has pincode, re-resolve
  → If new allocation differs from current: invalidate all store-dependent queries
```

### 2. Query Key Factory (Phase 2)

```typescript
// src/lib/queryKeys.ts — FULL REPLACEMENT

export const keys = {
  // Auth / user (not store-scoped)
  user: () => ['user'] as const,
  userStats: () => ['user', 'stats'] as const,

  // Store resolution
  serviceability: (pincode: string) => ['serviceability', pincode] as const,
  store: (storeId: string) => ['store', storeId] as const,
  stores: (pincode: string) => ['stores', pincode] as const,

  // Store-scoped catalog
  categories: (storeId: string) => ['categories', storeId] as const,
  category: (storeId: string, categoryId: string) => ['category', storeId, categoryId] as const,
  categoryProducts: (storeId: string, categoryId: string, page: number) =>
    ['categoryProducts', storeId, categoryId, page] as const,

  banners: (storeId: string) => ['banners', storeId] as const,

  // Products — all must include storeId
  products: (storeId: string, filters: Record<string, unknown>) =>
    ['products', storeId, filters] as const,
  featuredProducts: (storeId: string) => ['products', storeId, 'featured'] as const,
  dealsProducts: (storeId: string) => ['products', storeId, 'deals'] as const,
  newArrivals: (storeId: string) => ['products', storeId, 'new-arrivals'] as const,
  product: (storeId: string, slug: string) => ['product', storeId, slug] as const,
  productOptions: (storeId: string, familyId: string) =>
    ['product-options', storeId, familyId] as const,
  relatedProducts: (storeId: string, productId: string) =>
    ['product-related', storeId, productId] as const,
  search: (storeId: string, query: string, page: number) =>
    ['search', storeId, query, page] as const,

  // Cart — user + store scoped
  cart: (userId: string, storeId: string) => ['cart', userId, storeId] as const,

  // Fees / delivery
  fees: (storeId: string, addressId: string) => ['fees', storeId, addressId] as const,
  deliverySlots: (storeId: string, date: string) =>
    ['delivery-slots', storeId, date] as const,

  // Orders — user scoped (order belongs to a store but query is per user)
  orders: (filters: Record<string, unknown>) => ['orders', filters] as const,
  activeOrders: () => ['orders', 'active'] as const,
  order: (orderId: string) => ['order', orderId] as const,

  // User data (not store-scoped)
  addresses: () => ['addresses'] as const,
  wallet: () => ['wallet'] as const,
  walletTransactions: (filters: Record<string, unknown>) =>
    ['wallet-transactions', filters] as const,
  coupons: (storeId: string) => ['coupons', storeId] as const,
  notifications: (filters: Record<string, unknown>) => ['notifications', filters] as const,
  wishlist: () => ['wishlist'] as const,
  reviews: (productId: string, page: number) => ['reviews', productId, page] as const,
  reviewEligibility: (productId: string, userId: string) =>
    ['review-eligibility', productId, userId] as const,
  myReviews: () => ['my-reviews'] as const,
  loyalty: () => ['loyalty'] as const,
  referral: () => ['referral'] as const,
} as const;
```

### 3. Updated Type System (Phase 1)

#### Store types (new)
```typescript
// src/types/store.types.ts (NEW)

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
  description: string | null;
  address: string | null;
  phone: string | null;
  minimum_order: number;
  delivery_eta: number;            // minutes
  delivery_distance: number;       // km
  free_delivery_threshold: number;
  delivery_fee: number;
  platform_fee: number;
  handling_fee: number;
  rating: number | null;
  total_orders: number;
}

export interface ServiceabilityResult {
  serviceable: boolean;
  reason: string | null;
  stores: Store[];                 // May be multiple
  pincode: string;
}

export interface StoreAllocation {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeStatus: Store['status'];
  serviceable: boolean;
  deliveryEta: number;
  deliveryDistance: number;
  minimumOrder: number;
}
```

#### Updated Product type
```typescript
// src/types/product.types.ts — ADD these fields

export interface Product {
  // ... existing fields ...
  // NEW multi-vendor fields (optional for backward compat during migration)
  shop_id?: string;
  shop_product_id?: string;      // shopProductId — the junction table PK
  shop_name?: string;
  shop_price?: number | null;    // store-specific sale price
  shop_stock?: number | null;    // store-specific stock
  shop_is_active?: boolean;
}

// New type for shop-scoped product (from /shop-products endpoint)
export interface ShopProduct extends Product {
  shop_id: string;
  shop_product_id: string;
  shop_name: string;
  shop_price: number | null;
  shop_stock: number;
  shop_is_active: boolean;
}
```

#### Updated CartItem type
```typescript
// src/types/cart.types.ts

export interface CartItem {
  // Existing fields
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  unit: string;
  image: string | null;
  slug: string;
  subtotal: number;
  inStock: boolean;
  stockQuantity: number;

  // NEW multi-vendor fields
  shopProductId: string;         // Required — junction table ID
  storeId: string;               // Which store this item belongs to
  storeName: string;             // For display and validation
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  count: number;
  storeId: string | null;        // NEW — cart's owning store
  storeName: string | null;      // NEW
}
```

#### Updated Order type
```typescript
// src/types/order.types.ts

export interface Order {
  // ... existing fields ...
  shop_id: string;               // NEW
  shop_name: string;             // NEW
  store_slug?: string;           // NEW
}
```

---

## Phase-by-Phase Design

### Phase 1 — Canonical Store Context

**New files:**
- `src/store/store.context.ts` — Zustand store (see shape above)
- `src/types/store.types.ts` — Store, ServiceabilityResult, StoreAllocation types
- `src/hooks/useStoreContext.ts` — convenience hook, re-exports store selectors

**Modified files:**
- `src/providers/Providers.tsx` — add StoreProvider initialization logic
- `src/store/cart.store.ts` — add `storeId: string | null`, `storeName: string | null`, `setStore(id, name)`, `clearStore()`

**Backend endpoints required:**
```
GET  /stores/serviceable?pincode={p}          → ServiceabilityResult
GET  /stores/serviceable?lat={lat}&lng={lng}   → ServiceabilityResult
GET  /stores/:id                               → Store
GET  /stores (admin) — not needed for customer web
```

**Resolution algorithm:**
```typescript
async function resolveStore(pincode: string) {
  set({ isResolving: true, resolutionError: null });
  try {
    const result = await storesService.getServiceability({ pincode });
    if (result.serviceable && result.stores.length > 0) {
      const store = result.stores[0]; // Primary allocation
      set({
        serviceable: true,
        allocatedStoreId: store.id,
        allocatedStoreName: store.name,
        allocatedStoreSlug: store.slug,
        storeStatus: store.status,
        deliveryEta: store.delivery_eta,
        deliveryDistance: store.delivery_distance,
        minimumOrder: store.minimum_order,
        selectedPincode: pincode,
        lastResolvedAt: Date.now(),
      });
      // Invalidate all store-dependent query families
      queryClient.invalidateQueries({ queryKey: ['categories', store.id] });
      queryClient.invalidateQueries({ queryKey: ['banners', store.id] });
      queryClient.invalidateQueries({ queryKey: ['products', store.id] });
    } else {
      set({ serviceable: false, availabilityReason: result.reason });
    }
  } catch (e) {
    set({ resolutionError: 'Failed to check serviceability' });
  } finally {
    set({ isResolving: false });
  }
}
```

---

### Phase 2 — Query Keys and Server-State Isolation

**Modified files:**
- `src/lib/queryKeys.ts` — full replacement with factory (see above)
- `src/lib/constants.ts` — remove QUERY_KEYS and STALE_TIMES (consolidate to queryKeys.ts)
- All hooks/pages that build query keys manually — update to use factory

**Rules enforced:**
- No query that returns store-specific data may use a key without `storeId`
- When `storeId` is null (unserviceable/location not set), queries return empty/null — do not fire
- `enabled: !!storeId` on all store-dependent queries

---

### Phase 3 — Location, Serviceability and Store Selection UX

**New components:**
- `src/components/store/LocationModal.tsx` — full-screen modal: pincode input + GPS button + saved addresses (if logged in) + unserviceable state
- `src/components/store/StoreCard.tsx` — shows store name, logo, ETA, distance, min order (if multiple stores returned)
- `src/components/store/StoreStatusBanner.tsx` — shows "Store closed — browsing only" banner when `storeStatus !== 'OPEN'`
- `src/components/store/StoreSwitchConfirmDialog.tsx` — shown when user switches location and has cart items

**Modified components:**
- `src/components/layout/Header.tsx` — replace static "Set delivery address" with dynamic `LocationPicker` showing current pincode + store name, clicking opens `LocationModal`
- `src/app/(shop)/layout.tsx` — wrap with `StoreStatusBanner` if applicable

**Location modal state machine:**
```
idle → pincode-input | gps-requesting
gps-requesting → resolving | gps-denied
pincode-input → resolving
resolving → serviceable | unserviceable | error
serviceable → (modal closes, store context updated)
unserviceable → (stays open, shows reason, allows retry or manual pincode)
```

---

### Phase 4 — Multi-Vendor Home Experience

**Modified files:**
- `src/app/(shop)/page.tsx` — use `allocatedStoreId` from StoreContext for all queries
- `src/services/banners.service.ts` — `GET /stores/:storeId/banners`
- `src/services/categories.service.ts` — `GET /stores/:storeId/categories` (new) OR `GET /categories?storeId=`
- `src/services/products.service.ts` — add `storeId` param to all product endpoints
- `src/components/home/HomeHeroMosaic.tsx` — pass `storeId` to banner query
- `src/components/home/HomeCategoryGrid.tsx` — pass `storeId` to categories query
- All home section components — pass `storeId` through

**Guard:** If `!allocatedStoreId` → show `LocationRequired` empty state, not a blank page.

---

### Phase 5 — Shop-Scoped Categories, Search and Filtering

**Modified files:**
- `src/app/(shop)/categories/page.tsx` — `GET /stores/:storeId/categories`
- `src/app/(shop)/categories/[id]/page.tsx` — `GET /shop-products?storeId=&categoryId=`
- `src/app/(shop)/search/page.tsx` — `GET /shop-products/search?storeId=&q=`
- `src/app/(shop)/products/page.tsx` — `GET /shop-products?storeId=`
- `src/components/product/FilterBar.tsx` — add food type, availability, discount filters

**Backend endpoints:**
```
GET /shop-products?storeId=&categoryId=&page=&limit=&sort=&inStock=&foodType=
GET /shop-products/search?storeId=&q=&page=&limit=
GET /stores/:storeId/categories
```

---

### Phase 6 — Product Detail and Product Family Options

**Modified files:**
- `src/app/(shop)/products/[slug]/page.tsx` — fetch `ShopProduct` with `storeId`
- `src/components/product/ProductInfo.tsx` — show `shopPrice` if available, else `price`; show "Sold by {storeName}"
- `src/components/product/ProductDeliveryPanel.tsx` — show store-specific ETA from StoreContext; call `GET /stores/:storeId/serviceable?pincode=` for per-store check
- Add `src/components/product/ProductFamilyOptions.tsx` — option picker for products with `family_id`

**Backend endpoints:**
```
GET /shop-products/:shopProductId          → ShopProduct detail
GET /products/family/:familyId?storeId=   → ShopProduct[] (all options in family for this store)
```

**Product family option picker:**
```typescript
// Shows: 250g | 500g ✓ | 1kg
// Each option has own shopProductId, shopPrice, shopStock
// Selecting option updates: gallery, price, stock, add-to-cart target
// Resets quantity to 1 when switching options
```

---

### Phase 7 — Multi-Vendor Cart Invariants

**Core rule:** `cart.storeId` must equal every `cartItem.storeId`. If not, cross-store add triggers confirmation.

**Modified files:**
- `src/types/cart.types.ts` — add `storeId`, `storeName`, `shopProductId` to `CartItem` and `Cart`
- `src/store/cart.store.ts` — add `storeId`, `storeName`; update `setCount`, add `setStore`, `clearStore`
- `src/services/cart.service.ts` — `POST /cart/items` body becomes `{ shopProductId, quantity }`; `PUT /cart/items/:shopProductId`
- `src/hooks/useCart.ts` — `addItem` checks `cartStore.storeId` vs. item's `storeId`; if different, open `CartStoreSwitchDialog`
- `src/components/cart/CartItem.tsx` — show "Sold by {storeName}" on each item

**Cross-store add flow:**
```
User taps Add on product from Store B, cart has items from Store A
→ CartStoreSwitchDialog: "Your cart has items from {Store A}. Switch to {Store B}? Cart will be cleared."
→ User confirms → DELETE /cart → add new item → update cartStore.storeId
→ User cancels → nothing changes
```

**Cart restoration after login:**
```
Login completes → GET /cart → if cart.storeId !== allocatedStoreId
  → If cart is non-empty and from a different store: show confirmation
  → Else: accept backend cart, update cartStore.storeId
```

---

### Phase 8 — Fees, Delivery Time and Schedule

**Remove hardcoded constants:** Delete `FREE_DELIVERY_THRESHOLD`, `DEFAULT_DELIVERY_FEE`, `PLATFORM_FEE` from `src/lib/constants.ts`.

**New service:**
```typescript
// src/services/fees.service.ts
GET /stores/:storeId/fees?addressId=   → FeeSummary
GET /stores/:storeId/delivery-slots?date=  → DeliverySlot[]
```

**FeeSummary type:**
```typescript
interface FeeSummary {
  subtotal: number;
  item_discount: number;
  coupon_discount: number;
  delivery_fee: number;
  handling_fee: number;
  platform_fee: number;
  small_cart_fee: number;
  total_savings: number;
  payable_total: number;
  free_delivery_threshold: number;
  free_delivery_remaining: number;
  distance_km: number;
  eta_minutes: number;
}
```

**Modified files:**
- `src/components/cart/CartSummary.tsx` — fetch `FeeSummary` from backend, not calculate locally
- `src/components/cart/FreeDeliveryBar.tsx` — use `feeSummary.free_delivery_remaining`
- `src/components/checkout/PriceBreakdown.tsx` — render from `FeeSummary`
- `src/app/(shop)/checkout/page.tsx` — add delivery slot step if `storeId` supports scheduling

---

### Phase 9 — Authentication and User Session

**Audit findings — issues to fix:**
1. Tokens in `localStorage` accessible to XSS — document risk, wrap in try/catch, keep SameSite cookie as primary for SSR
2. Add `userId` snapshot to persisted `bakaloo-store-v1` — on login, compare userId and clear store context if changed
3. `AuthProvider` already hydrates user on mount — ensure it also calls `resolveFromAddress(defaultAddressId)` when user loads with a default address

**Modified files:**
- `src/providers/AuthProvider.tsx` — after `GET /users/me` success: if user has addresses, call `storeContext.resolveFromAddress(defaultAddressId)`
- `src/store/auth.store.ts` — add `persistedUserId` to detect cross-user contamination
- `src/lib/api.ts` — no changes (already correct with refresh queue)

---

### Phase 10 — Coupons, Wallet and Payments

**Modified files:**
- `src/services/coupons.service.ts` — `GET /coupons/available?storeId=`; `POST /coupons/validate` body add `storeId`
- `src/components/cart/AvailableCouponsSheet.tsx` — pass `storeId` to coupon query
- `src/lib/queryKeys.ts` — `coupons: (storeId) => ['coupons', storeId]`
- `src/services/payments.service.ts` — no change (payment verification is order-level)
- `src/components/checkout/RazorpayButton.tsx` — no change (secret stays backend-only)

---

### Phase 11 — Orders and Real-Time Tracking

**Modified files:**
- `src/services/orders.service.ts` — `POST /orders` add `storeId` to `PlaceOrderPayload`
- `src/types/order.types.ts` — add `shop_id`, `shop_name`
- `src/components/order/OrderCard.tsx` — show "From {storeName}"
- `src/components/order/OrderDetailPage` — show store attribution in header
- `src/lib/socket.ts` — already correct; no changes needed

**Socket.IO — no structural changes needed.** Existing `order:track/{orderId}` events are sufficient. Backend already knows which store the order belongs to.

---

### Phase 12 — Dashboard-Driven Store Content

**Key insight:** Dashboard already controls banners, categories, featured products, store status, delivery fees, service areas. The website simply needs to request the correct store-scoped endpoints and stop caching them indefinitely.

**Cache invalidation strategy:**
- `staleTime` for banners: 5min (was 30min — reduce for faster dashboard updates)
- `staleTime` for categories: 5min (was 30min)
- `staleTime` for store status: 1min
- On `store:config:update` Socket.IO event (if backend emits): invalidate store, banners, categories

---

### Phase 13 — Responsive Customer Experience

No major architecture changes. Verify:
- `LocationModal` works on mobile (full-screen sheet on small viewports)
- `StoreSwitchConfirmDialog` is touch-friendly (min 44px targets)
- `ProductFamilyOptions` renders as scrollable chip row on mobile
- BottomNav still correct
- Header location picker doesn't overflow on small screens

---

### Phase 14 — SEO

**Modified files:**
- `src/app/(shop)/products/[slug]/page.tsx` — metadata should include `storeName` in description when available
- `src/app/sitemap.ts` — include store-scoped product URLs if applicable
- Product structured data: use actual `shopPrice` not `price` for `offers.price`

---

### Phase 15 — Error / Loading / Offline States

**New shared states to add:**
```
LocationRequired         → No location set yet; prompt to set
Unserviceable            → Pincode not served by any store
StoreClosed              → Store exists but status !== OPEN
StoreNotFound            → storeId from persist no longer valid
ProductUnavailable       → shopProductId not available in this store
CrossStoreCartConflict   → shown before switching stores
NetworkUnavailable       → offline banner
```

---

### Phase 16 — Performance

- `enabled: !!allocatedStoreId` prevents firing product queries before location is set
- `suspense: false` — use status/isLoading pattern, not Suspense boundaries (already the pattern)
- Home page: limit initial product count to 8 per section
- `ProductFamilyOptions`: load lazily (only when product has `family_id`)
- Remove `staleTime: 30min` for banners/categories — reduce to 5min for dashboard responsiveness

---

### Phase 17 — Security

Verified:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — public key only ✅
- No backend secret in any frontend file ✅
- Auth token in localStorage (documented risk; acceptable for current architecture) ✅
- No cross-user leak risk in Zustand persist if `userId` guard is added ✅
- Store context persist must be cleared on user change ✅

---

### Phase 18 — Testing

New test files needed:
- `src/store/__tests__/store.context.test.ts` — StoreContext resolution, persistence, clear on user change
- `src/hooks/__tests__/useCart.test.ts` — cross-store add confirmation flow
- `src/services/__tests__/products.service.test.ts` — storeId param is sent
- `src/components/__tests__/CartStoreSwitchDialog.test.tsx`
- `src/components/__tests__/LocationModal.test.tsx`

---

### Phase 19 — QA Matrix

**Test journeys:**
1. Anonymous → set pincode → store allocated → home loads store-scoped products
2. Search within allocated store — no cross-store results
3. Product detail shows correct shopPrice, storeName
4. Product family options — selecting 500g vs 1kg loads correct shopProductId
5. Add item → cart has storeId
6. Add item from different store → CartStoreSwitchDialog shown
7. Checkout sends storeId, fees come from backend
8. Razorpay success → order created → order has storeName
9. Login with existing cart — reconcile correctly
10. Logout → store context cleared → new user gets fresh state

---

## Files to Change — Complete List

### New Files
```
src/types/store.types.ts
src/store/store.context.ts
src/hooks/useStoreContext.ts
src/hooks/useServiceability.ts
src/services/stores.service.ts
src/services/fees.service.ts
src/components/store/LocationModal.tsx
src/components/store/StoreCard.tsx
src/components/store/StoreStatusBanner.tsx
src/components/store/StoreSwitchConfirmDialog.tsx
src/components/store/CartStoreSwitchDialog.tsx
src/components/product/ProductFamilyOptions.tsx
```

### Modified Files (key changes)
```
src/types/product.types.ts         — add shopId, shopProductId, shopPrice, shopStock, shopName
src/types/cart.types.ts            — add storeId, storeName, shopProductId to CartItem and Cart
src/types/order.types.ts           — add shop_id, shop_name
src/lib/queryKeys.ts               — full replacement with factory including storeId
src/lib/constants.ts               — remove QUERY_KEYS, STALE_TIMES, FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_FEE
src/store/cart.store.ts            — add storeId, storeName, setStore, clearStore
src/services/products.service.ts   — add storeId to all calls, use /shop-products where needed
src/services/cart.service.ts       — use shopProductId in POST/PUT/DELETE
src/services/orders.service.ts     — add storeId to PlaceOrderPayload
src/services/categories.service.ts — add storeId to GET /categories
src/services/banners.service.ts    — add storeId to GET /banners
src/services/coupons.service.ts    — add storeId to GET /coupons/available
src/hooks/useCart.ts               — add cross-store conflict detection
src/providers/AuthProvider.tsx     — resolve store from default address on login
src/providers/Providers.tsx        — add StoreContext initialization
src/components/layout/Header.tsx   — add LocationPicker replacing static address button
src/components/product/ProductInfo.tsx  — show shopPrice, storeName
src/components/product/ProductDeliveryPanel.tsx  — per-store ETA from StoreContext
src/components/cart/CartItem.tsx   — show "Sold by {storeName}"
src/components/cart/CartSummary.tsx — use FeeSummary from backend
src/components/cart/FreeDeliveryBar.tsx — use backend free delivery threshold
src/components/checkout/PriceBreakdown.tsx — render from FeeSummary
src/app/(shop)/page.tsx            — use storeId in all queries
src/app/(shop)/categories/page.tsx — use storeId
src/app/(shop)/categories/[id]/page.tsx — use storeId, /shop-products endpoint
src/app/(shop)/products/page.tsx   — use storeId, /shop-products endpoint
src/app/(shop)/products/[slug]/page.tsx — use storeId, show shopPrice
src/app/(shop)/search/page.tsx     — use storeId
src/app/(shop)/cart/page.tsx       — add CartStoreSwitchDialog
src/app/(shop)/checkout/page.tsx   — add storeId to order payload, use FeeSummary
```

### Files NOT to Touch
```
src/lib/api.ts                     — correct, do not modify
src/lib/socket.ts                  — correct, do not modify
src/middleware.ts                  — correct, do not modify
src/providers/QueryProvider.tsx    — correct, do not modify
src/lib/utils.ts                   — correct, do not modify
src/lib/validations.ts             — correct, do not modify
src/lib/razorpay.ts                — correct, do not modify
src/components/ui/*                — shadcn/radix primitives, do not touch
src/store/auth.store.ts            — minor addition only (userId guard), careful change
src/types/user.types.ts            — no change needed
src/types/address.types.ts         — no change needed
src/types/payment.types.ts         — no change needed
All test files (until Phase 18)    — do not touch during feature phases
```

---

## Backend Contract Gaps

Before Phase 1, the following backend endpoints must be confirmed or added:

| Endpoint | Status | Notes |
|---|---|---|
| `GET /stores/serviceable?pincode=` | Verify exists | Backend has shops table with service areas |
| `GET /stores/:id` | Verify exists | Public store info |
| `GET /stores/:id/categories` | Verify exists | OR categories have shop_id filter |
| `GET /stores/:id/banners` | Verify exists | OR banners have shop_id filter |
| `GET /shop-products?storeId=&...` | Verify exists | Backend has shop_products table |
| `GET /shop-products/:shopProductId` | Verify exists | |
| `GET /products/family/:familyId?storeId=` | Verify / add | Flutter uses this |
| `GET /stores/:id/fees?addressId=` | Verify exists | Backend calculates delivery fee |
| `GET /stores/:id/delivery-slots?date=` | Verify exists | If scheduled delivery supported |
| `GET /coupons/available?storeId=` | Add storeId param | Currently global |

---

## Migration Risk Matrix

| Risk | Impact | Mitigation |
|---|---|---|
| Backend `/shop-products` endpoint doesn't match assumed shape | HIGH | Run Phase 0 API audit against live backend before coding Phase 4+ |
| Persisted cart with old `cartItem` shape (no `shopProductId`) after deploy | HIGH | Add migration in `cart.store.ts` persist config v2 |
| Query key changes invalidate all existing caches on deploy | MEDIUM | Acceptable — users see brief loading states |
| Cross-user StoreContext contamination if userId guard not added | HIGH | Add userId to `bakaloo-store-v1` persist in Phase 1 |
| Fee constants change causes cart/checkout price mismatch | HIGH | Remove frontend fee constants in Phase 8, use backend only |
| Product `slug` collisions across stores (same product name, different shopProductId) | MEDIUM | URL stays `/products/[slug]` but fetch is `/shop-products?slug=&storeId=` |
| Socket.IO `order:status` events don't include `storeId` | LOW | Not needed — order detail fetched by orderId which is unique |
| Razorpay flow broken if `storeId` is added incorrectly to order payload | HIGH | Verify backend accepts optional `storeId` in order payload before Phase 10 |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Store Resolution State Consistency

*For any* pincode or coordinate input, after `Store_Context.resolveStore` completes successfully with a serviceable result, the state must satisfy: `serviceable === true`, `allocatedStoreId === stores[0].id`, `allocatedStoreName === stores[0].name`, `deliveryEta === stores[0].delivery_eta`, and `isResolving === false`.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Unserviceable State Consistency

*For any* pincode or coordinate for which the backend returns `serviceable: false`, after `Store_Context.resolveStore` completes, the state must satisfy: `serviceable === false`, `allocatedStoreId === null`, `availabilityReason` is the reason string from the response, and `isResolving === false`.

**Validates: Requirements 1.4**

---

### Property 3: Resolution Error State Consistency

*For any* serviceability API call that throws a network or server error, after the call settles, `Store_Context` must satisfy: `resolutionError` is a non-empty string and `isResolving === false`.

**Validates: Requirements 1.6**

---

### Property 4: Store Context Persistence Invariant

*For any* resolved store context state, the persisted value in localStorage under key `bakaloo-store-v1` must contain exactly the fields `selectedPincode`, `selectedAddressId`, `allocatedStoreId`, `allocatedStoreName`, `allocatedStoreSlug`, `storeStatus`, `serviceable`, `deliveryEta`, and `lastResolvedAt`, and must NOT contain `lat`, `lng`, `isResolving`, or `resolutionError`.

**Validates: Requirements 1.7, 1.8**

---

### Property 5: Cross-User Store Context Contamination Prevention

*For any* two distinct user IDs (A and B), if `bakaloo-store-v1` was persisted during a session for user A and then user B logs in, the Store_Context must be fully reset to its initial null state before user B's session begins.

**Validates: Requirements 1.9, 17.2**

---

### Property 6: Store Switch Query Invalidation

*For any* two distinct store IDs (A and B), when `Store_Context` transitions its allocated store from A to B, all TanStack Query entries whose cache key contains store ID A must be marked stale or removed from the cache.

**Validates: Requirements 1.11**

---

### Property 7: Query Key Factory Always Includes StoreId for Store-Scoped Data

*For any* string value of `storeId`, the following key constructors in the Query_Key_Factory must produce arrays that contain `storeId` as an element: `categories`, `category`, `categoryProducts`, `banners`, `products`, `featuredProducts`, `dealsProducts`, `newArrivals`, `product`, `productOptions`, `relatedProducts`, `search`, `cart`, `fees`, `deliverySlots`, and `coupons`.

**Validates: Requirements 2.1**

---

### Property 8: Query Key Factory Never Includes StoreId for User-Scoped Data

*For any* string value of `storeId`, the following key constructors must produce arrays that do NOT contain `storeId` as an element: `user`, `userStats`, `addresses`, `wallet`, `walletTransactions`, `notifications`, `wishlist`, `reviews`, `reviewEligibility`, `myReviews`, `loyalty`, and `referral`.

**Validates: Requirements 2.2, 10.4**

---

### Property 9: Store Status Banner Invariant

*For any* value of `storeStatus` that is not `'OPEN'` (i.e., `'CLOSED'` or `'TEMPORARILY_CLOSED'`), the `StoreStatusBanner` component must be rendered on all shop layout pages.

**Validates: Requirements 3.9, 15.3**

---

### Property 10: Home Page Catalog API Calls Include StoreId

*For any* non-null `allocatedStoreId`, all API calls made by the Home page for banners, categories, featured products, deals, and new arrivals must include that `storeId` in their request URL or query parameters.

**Validates: Requirements 4.1, 4.2, 4.3**

---

### Property 11: Home Page Initial Section Count Limit

*For any* allocated store, each product section on the Home page must initially render at most 8 product items, regardless of how many products the backend returns.

**Validates: Requirements 4.7**

---

### Property 12: Shop Products API Calls Include StoreId and CategoryId

*For any* combination of `storeId` and `categoryId`, the API call made by the Category detail page must include both `storeId` and `categoryId` as query parameters in the `GET /shop-products` request.

**Validates: Requirements 5.2**

---

### Property 13: Search API Calls Include StoreId and Query

*For any* combination of `storeId` and search `query`, the API call made by the Search page must include both `storeId` and `query` as parameters in the `GET /shop-products/search` request.

**Validates: Requirements 5.3**

---

### Property 14: Product Detail Uses Correct Price (shopPrice Priority)

*For any* product where `shop_price` is non-null, the price displayed in the Product detail page and the `offers.price` field in the JSON-LD structured data must equal `shop_price`. *For any* product where `shop_price` is null, both must equal the base `price`.

**Validates: Requirements 6.2, 6.3, 6.10, 14.1, 14.2**

---

### Property 15: Product Detail Displays Store Attribution

*For any* `ShopProduct` with a non-null `shop_name`, the rendered Product detail page must contain the string "Sold by {shop_name}".

**Validates: Requirements 6.4**

---

### Property 16: Product Family Option Selection Updates All Dependent State

*For any* product family with two or more variants, selecting variant V must result in: displayed price equals V's `shop_price` (or base price), stock display equals V's `shop_stock`, add-to-cart target equals V's `shopProductId`, and the quantity selector value equals 1.

**Validates: Requirements 6.7, 6.8**

---

### Property 17: Zero-Stock Product Disables Add-To-Cart

*For any* product or product family variant where `shop_stock === 0`, the add-to-cart button must be in a disabled state.

**Validates: Requirements 6.9**

---

### Property 18: CartItem Invariant — Every Item Carries shopProductId and storeId

*For any* Cart state (after any sequence of add/remove/update operations), every `CartItem` in `cart.items` must have non-null, non-empty `shopProductId` and `storeId` fields.

**Validates: Requirements 7.2, 7.7**

---

### Property 19: Cart StoreId Set on First Item Addition

*For any* empty cart, adding a product from store S must result in `cart.storeId === S` and `cart.storeName` equal to the product's store name.

**Validates: Requirements 7.3**

---

### Property 20: Cross-Store Add Triggers Confirmation Dialog

*For any* cart with `cart.storeId === A` (where `cart.items` is non-empty), attempting to add a product from store B (where B ≠ A) must cause the `CartStoreSwitchDialog` to be shown before any cart mutation occurs.

**Validates: Requirements 7.4**

---

### Property 21: Store Switch Confirmation Clears Old Cart and Adopts New Store

*For any* cart state with items from store A, after a customer confirms the store switch to store B, the cart must satisfy: `cart.storeId === B`, `cart.items` contains only items from store B, and the previous items from store A are absent.

**Validates: Requirements 7.5**

---

### Property 22: Store Switch Cancellation Preserves Cart

*For any* cart state, cancelling the `CartStoreSwitchDialog` must result in the cart state being identical to its state before the dialog was opened (storeId, items, and count all unchanged).

**Validates: Requirements 7.6**

---

### Property 23: Cart Item Renders Store Attribution

*For any* `CartItem` with a non-null `storeName`, the rendered cart item component must contain the string "Sold by {storeName}".

**Validates: Requirements 7.8**

---

### Property 24: Fee Display Matches Backend FeeSummary Exactly

*For any* `FeeSummary` response from the backend, the values displayed in the cart summary, the free delivery progress bar, and the checkout price breakdown must each exactly equal the corresponding field in the `FeeSummary` object (no rounding, calculation, or substitution from local constants).

**Validates: Requirements 8.1, 8.3, 8.4, 8.5**

---

### Property 25: Logout Clears Store Context and Cart

*For any* authenticated session with a non-empty Store_Context and Cart, after the logout action completes, `Store_Context.allocatedStoreId` must be `null`, `cart.storeId` must be `null`, and `cart.items` must be empty.

**Validates: Requirements 9.3, 17.3, 17.4**

---

### Property 26: Token Refresh Queues Concurrent Requests

*For any* set of N concurrent API requests that arrive while a token refresh is in progress, all N requests must complete successfully (with the refreshed token) after the refresh resolves, rather than any of them being rejected with an authentication error prematurely.

**Validates: Requirements 9.6**

---

### Property 27: Coupon Validation Payload Includes StoreId

*For any* coupon validation request, the request body sent to `POST /coupons/validate` must include a `storeId` field with a non-null, non-empty value matching `allocatedStoreId`.

**Validates: Requirements 10.2**

---

### Property 28: Order Placement Payload Includes StoreId and ShopProductId for Every Item

*For any* checkout submission, the payload sent to `POST /orders` must include: a top-level `storeId` field equal to `cart.storeId`, and every item in the order items array must include a `shopProductId` field with a non-null value.

**Validates: Requirements 11.1, 11.2**

---

### Property 29: Order Card and Detail Render Store Attribution

*For any* `Order` object with a non-null `shop_name`, the rendered Order card must contain the string "From {shop_name}" and the Order detail page header must display the store name.

**Validates: Requirements 11.4, 11.5**

---

### Property 30: Routes Render Without Errors When StoreId is Null

*For any* of the 19 application routes, rendering the route with `allocatedStoreId === null` must not throw a JavaScript error; the route must render a defined UI state (LocationRequired, empty state, or non-store-scoped content as appropriate).

**Validates: Requirements 19.2**

---

### Property 31: Product Page Metadata Includes Store Name

*For any* product page rendered with a non-null `allocatedStoreName`, the generated page metadata description must contain `allocatedStoreName` as a substring.

**Validates: Requirements 14.3**
