# Implementation Plan: Multi-Vendor Customer Web

## Overview

Convert the Bakaloo customer web (Next.js 14 / TypeScript / TanStack Query / Zustand) from single-vendor to multi-vendor. Every phase builds on the previous: types first, then the canonical store context, then query key isolation, then UI layer by layer, then cart invariants, fees, auth, orders, and finally polish (responsive, SEO, error states, performance, security, tests, QA).

The design document is the authoritative contract. These tasks reference specific requirements and the exact files to create or modify as listed in the design's "Files to Change" section.

---

## Tasks

- [x] 1. Type System Foundation
  - [x] 1.1 Create `src/types/store.types.ts` with `Store`, `ServiceabilityResult`, and `StoreAllocation` interfaces
    - Define `Store` with all fields: `id`, `name`, `slug`, `logo_url`, `status` union, `minimum_order`, `delivery_eta`, `delivery_distance`, `free_delivery_threshold`, `delivery_fee`, `platform_fee`, `handling_fee`, `rating`, `total_orders`
    - Define `ServiceabilityResult` with `serviceable`, `reason`, `stores: Store[]`, `pincode`
    - Define `StoreAllocation` as a flat projection of store fields used by the context
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Extend `src/types/product.types.ts` with multi-vendor fields
    - Add optional fields to `Product`: `shop_id`, `shop_product_id`, `shop_name`, `shop_price`, `shop_stock`, `shop_is_active`
    - Add new `ShopProduct` interface extending `Product` with all shop fields required (non-optional)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.3 Extend `src/types/cart.types.ts` with store invariant fields
    - Add `shopProductId: string`, `storeId: string`, `storeName: string` to `CartItem`
    - Add `storeId: string | null`, `storeName: string | null` to `Cart`
    - _Requirements: 7.1, 7.2_

  - [x] 1.4 Extend `src/types/order.types.ts` with store attribution fields
    - Add `shop_id: string`, `shop_name: string`, `store_slug?: string` to `Order`
    - _Requirements: 11.3_

  - [ ]* 1.5 Write unit tests for updated type shapes
    - Verify `CartItem` satisfies store invariant: every item carries `shopProductId` and `storeId`
    - Verify `ShopProduct` extends `Product` without losing any base fields
    - _Requirements: 18.1_

- [ ] 2. Query Key Factory
  - [x] 2.1 Replace `src/lib/queryKeys.ts` with the full store-scoped factory
    - Implement all key constructors exactly as specified in the design Phase 2 section
    - Include `storeId` as required parameter in: `categories`, `category`, `categoryProducts`, `banners`, `products`, `featuredProducts`, `dealsProducts`, `newArrivals`, `product`, `productOptions`, `relatedProducts`, `search`, `cart`, `fees`, `deliverySlots`, `coupons`
    - Keep user-scoped keys without `storeId`: `user`, `userStats`, `addresses`, `wallet`, `walletTransactions`, `notifications`, `wishlist`, `reviews`, `reviewEligibility`, `myReviews`, `loyalty`, `referral`
    - Export as `export const keys = { ... } as const`
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 2.2 Remove legacy exports from `src/lib/constants.ts`
    - Delete `QUERY_KEYS` export entirely
    - Delete `STALE_TIMES` export entirely
    - Delete `FREE_DELIVERY_THRESHOLD`, `DEFAULT_DELIVERY_FEE`, `PLATFORM_FEE` constants
    - Find all import sites with grep and update them to use `keys` from `queryKeys.ts` before deleting
    - _Requirements: 2.5, 8.6_

- [ ] 3. Canonical Store Context
  - [x] 3.1 Create `src/store/store.context.ts` — Zustand store with full `StoreContextState` shape
    - Implement all state fields from the design: location, allocated store, serviceability, resolution metadata
    - Implement `resolveStore(pincode, lat?, lng?)` async action calling `GET /stores/serviceable`
    - Implement `resolveFromAddress(addressId)` async action
    - Implement `setStoreFromAllocation(allocation)` synchronous action
    - Implement `clearStore()` resetting all allocated store fields to `null`
    - Wire `queryClient.invalidateQueries` on store change (import queryClient from `src/lib/queryClient.ts`)
    - Configure Zustand `persist` with key `bakaloo-store-v1`, version 1; persist only the fields listed in the design; add `persistedUserId` field
    - _Requirements: 1.1–1.12, 17.2, 17.3_

  - [x] 3.2 Create `src/services/stores.service.ts`
    - `getServiceability({ pincode? lat? lng? }): Promise<ServiceabilityResult>` → `GET /stores/serviceable`
    - `getStore(storeId: string): Promise<Store>` → `GET /stores/:id`
    - Use the existing `api` client from `src/lib/api.ts`
    - _Requirements: 1.2, 15.4_

  - [x] 3.3 Create `src/hooks/useStoreContext.ts` — convenience hook re-exporting selectors
    - Export: `useAllocatedStoreId`, `useAllocatedStoreName`, `useStoreStatus`, `useServiceable`, `useIsResolving`, `useResolveStore`, `useResolveFromAddress`, `useClearStore`, `useDeliveryEta`, `useMinimumOrder`
    - All selectors use shallow equality to avoid unnecessary re-renders
    - _Requirements: 1.1_

  - [ ] 3.4 Create `src/hooks/useServiceability.ts` — TanStack Query wrapper for serviceability API
    - `useServiceabilityQuery(pincode: string)` with key `keys.serviceability(pincode)`, `enabled: !!pincode`, `staleTime: 60_000`
    - _Requirements: 1.2, 16.1_

  - [x] 3.5 Update `src/store/cart.store.ts` — add store affinity fields
    - Add `storeId: string | null`, `storeName: string | null` to state
    - Add `setStore(id: string, name: string)` action
    - Add `clearStore()` action that resets `storeId`, `storeName` to `null` (do not remove existing `count` logic)
    - Include `storeId` and `storeName` in the `persist` config so they survive page reload
    - _Requirements: 7.1, 7.11, 17.4_

  - [x] 3.6 Update `src/providers/Providers.tsx` — add StoreContext initialization
    - Import and mount `StoreContextInitializer` logic: on mount, if `bakaloo-store-v1` has a persisted `allocatedStoreId`, validate it (or leave it as-is; the 404 path is handled in Phase 15)
    - Ensure `StoreStatusBanner` can be rendered from the shop layout (just export the provider)
    - _Requirements: 1.7, 19.2_

- [ ] 4. Location and Serviceability UX
  - [x] 4.1 Create `src/components/store/LocationModal.tsx`
    - Full-screen modal (uses `src/components/ui/dialog.tsx`) on desktop, bottom sheet (`src/components/ui/sheet.tsx`) on mobile (width < 768px)
    - State machine: `idle → pincode-input | gps-requesting → resolving → serviceable | unserviceable | error`
    - Pincode text input with validation (6-digit Indian pincode)
    - GPS button: calls `navigator.geolocation.getCurrentPosition`; on denial shows pincode input
    - If user is authenticated, fetch and display saved addresses (query `keys.addresses()`) as selectable chips
    - On serviceable result: calls `storeContext.resolveStore(pincode)` or `resolveFromAddress(addressId)`, then closes modal
    - On unserviceable result: stays open, shows `availabilityReason`, shows retry button
    - Touch targets ≥ 44×44px on all interactive elements
    - _Requirements: 3.1–3.8, 3.12, 13.1, 13.2_

  - [x] 4.2 Create `src/components/store/StoreCard.tsx` (LocationModal handles multi-store inline)
    - Displays: store name, logo, ETA, distance, minimum order
    - Used inside `LocationModal` when multiple stores are returned to let user pick
    - _Requirements: 3.7_

  - [x] 4.3 Create `src/components/store/StoreStatusBanner.tsx`
    - Renders a sticky banner when `storeStatus === 'CLOSED' || 'TEMPORARILY_CLOSED'`
    - Message: "Store closed — browsing only. Orders are not being accepted."
    - Dismissible (per-session, not persisted)
    - _Requirements: 3.9, 15.3_

  - [ ] 4.4 Create `src/components/store/StoreSwitchConfirmDialog.tsx`
    - Shown when user changes location and `cart.storeId` is non-null
    - Props: `currentStoreName`, `newStoreName`, `onConfirm`, `onCancel`
    - Confirm: clears cart, completes location change; Cancel: aborts
    - _Requirements: 3.10_

  - [ ] 4.5 Update `src/components/layout/Header.tsx` — add `LocationPicker`
    - Replace static "Set delivery address" text/button with a `LocationPicker` component inline
    - `LocationPicker` shows: pin icon + `selectedPincode` (or "Set location") + `allocatedStoreName` (truncated to 18ch on < 375px viewports)
    - Clicking `LocationPicker` opens `LocationModal`
    - _Requirements: 3.11, 3.12, 13.5, 13.6_

  - [ ] 4.6 Update `src/components/layout/BottomNav.tsx` — add location entry point
    - Add a location pin icon/button accessible from the bottom nav on mobile
    - Clicking it opens `LocationModal`
    - _Requirements: 3.13, 13.4_

  - [ ] 4.7 Update `src/app/(shop)/layout.tsx` — mount `StoreStatusBanner`
    - Render `<StoreStatusBanner />` between the header and the page content slot
    - `StoreStatusBanner` self-hides when `storeStatus === 'OPEN'`
    - _Requirements: 3.9_

- [x] 5. Store-Scoped Home Experience
  - [x] 5.1 Update `src/services/banners.service.ts` — scope to store
    - Change `getBanners()` to `getBanners(storeId: string)` calling `GET /stores/:storeId/banners`
    - _Requirements: 4.1_

  - [x] 5.2 Update `src/services/categories.service.ts` — scope to store
    - Add `getStoreCategories(storeId: string)` calling `GET /stores/:storeId/categories`
    - Keep the old `getCategories()` if still referenced by non-store pages, but mark as deprecated
    - _Requirements: 4.2, 5.1_

  - [x] 5.3 Update `src/services/products.service.ts` — add `storeId` to all calls
    - Add `storeId` param to: `getFeaturedProducts`, `getDealsProducts`, `getNewArrivals`, `getProducts`, `getProduct`
    - New function: `getShopProducts(storeId, params)` → `GET /shop-products?storeId=...`
    - New function: `getShopProduct(shopProductId, storeId)` → `GET /shop-products/:shopProductId?storeId=`
    - New function: `searchShopProducts(storeId, query, page)` → `GET /shop-products/search?storeId=...`
    - New function: `getProductFamily(familyId, storeId)` → `GET /products/family/:familyId?storeId=`
    - _Requirements: 4.3, 5.2, 5.3, 5.4, 6.1, 6.6_

  - [x] 5.4 Update `src/app/(shop)/page.tsx` — wire all sections to `allocatedStoreId`
    - Read `allocatedStoreId` from `useStoreContext`
    - If `!allocatedStoreId`: render `<LocationRequired />` empty state instead of all sections
    - Pass `storeId` to: `BannerCarousel`, `HomeCategoryGrid`, `HomeHeroMosaic`, `DealsSection`, `BestSellersShowcase`, `HomeTrendingGrid`, `ProductSectionRow`
    - Use `keys.banners(storeId)`, `keys.categories(storeId)`, `keys.featuredProducts(storeId)` etc. for all queries
    - Set `enabled: !!allocatedStoreId` on all store-scoped queries
    - Limit each product section to `limit: 8` on initial fetch
    - Lazy-load below-the-fold sections with `dynamic(() => import(...), { ssr: false })` or Intersection Observer
    - _Requirements: 4.1–4.8, 15.1, 16.1, 16.2_

  - [x] 5.5 Update home section components to accept and use `storeId` prop
    - `src/components/home/HomeHeroMosaic.tsx`: accept `storeId`, pass to banner query
    - `src/components/home/HomeCategoryGrid.tsx`: accept `storeId`, pass to categories query
    - `src/components/home/DealsSection.tsx`: accept `storeId`, pass to deals query
    - `src/components/home/BestSellersShowcase.tsx`: accept `storeId`, pass to products query
    - `src/components/home/HomeTrendingGrid.tsx`: accept `storeId`, pass to products query
    - `src/components/home/ProductSectionRow.tsx`: accept `storeId`, pass to products query
    - All `useQuery` calls inside these components must use `keys.*` from the factory, not manual string arrays
    - _Requirements: 4.5, 4.6, 2.4_

- [x] 6. Store-Scoped Categories, Search and Filtering
  - [x] 6.1 Update `src/app/(shop)/categories/page.tsx`
    - Read `allocatedStoreId` from context; set `enabled: !!allocatedStoreId`
    - Use `keys.categories(storeId)`, fetch from `GET /stores/:storeId/categories`
    - Show `<LocationRequired />` when `!allocatedStoreId`
    - _Requirements: 5.1, 5.6_

  - [x] 6.2 Update `src/app/(shop)/categories/[id]/page.tsx`
    - Use `keys.categoryProducts(storeId, categoryId, page)`, fetch from `GET /shop-products?storeId=&categoryId=`
    - Pass `storeId` to query; `enabled: !!allocatedStoreId`
    - _Requirements: 5.2, 5.5_

  - [x] 6.3 Update `src/app/(shop)/search/page.tsx` and `src/hooks/useSearch.ts`
    - Add `storeId` param; use `keys.search(storeId, query, page)`
    - Fetch from `GET /shop-products/search?storeId=&q=`
    - `enabled: !!allocatedStoreId && !!query`
    - Show `<LocationRequired />` when no store, `<SearchEmpty />` when no results
    - _Requirements: 5.3, 5.6, 5.7_

  - [x] 6.4 Update `src/app/(shop)/products/page.tsx`
    - Use `keys.products(storeId, filters)`, fetch from `GET /shop-products?storeId=`
    - `enabled: !!allocatedStoreId`
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 6.5 Update `src/components/product/FilterBar.tsx` — add food type and availability filters
    - Add `inStock: boolean` toggle chip
    - Add `foodType: 'VEG' | 'NON_VEG' | 'ALL'` chip group
    - Add `sort` select: `price_asc`, `price_desc`, `newest`, `popular`
    - Pass filter state up to parent page via callback prop
    - _Requirements: 5.5_

- [x] 7. Product Detail with Family Options
  - [x] 7.1 Update `src/app/(shop)/products/[slug]/page.tsx` — fetch shop-scoped product
    - Fetch via `getShopProduct(shopProductId, storeId)` or `getShopProducts({ storeId, slug })` to resolve `shopProductId` from slug
    - Use `keys.product(storeId, slug)`; `enabled: !!allocatedStoreId`
    - Show `<LocationRequired />` when `!allocatedStoreId`
    - Pass `shopProduct` (with `shopProductId`, `shopPrice`, `storeName`) to child components
    - Update `metadata` export to include store name in description and `shopPrice` in JSON-LD `offers.price`
    - _Requirements: 6.1, 6.5, 6.10, 6.11, 14.1–14.3_

  - [x] 7.2 Update `src/components/product/ProductInfo.tsx` — show store-scoped price and attribution
    - Display `shopPrice` if non-null, else fall back to base `price`
    - Add "Sold by {storeName}" line below the product name using `shop_name`
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 7.3 Update `src/components/product/ProductDeliveryPanel.tsx` — per-store ETA
    - Replace the global pincode validation call with `deliveryEta` from `useStoreContext`
    - Show: "Delivery in {deliveryEta} min · from {allocatedStoreName}"
    - _Requirements: 6.5_

  - [x] 7.4 Create `src/components/product/ProductFamilyOptions.tsx` — variant picker
    - Only render when `product.family_id` is non-null (lazy render)
    - Fetch family options via `keys.productOptions(storeId, familyId)`, `GET /products/family/:familyId?storeId=`
    - Render as a horizontal scrollable chip row; each chip shows variant label (e.g. "250g"), price, and stock status
    - On chip select: update `selectedVariant` state → notify parent to switch `shopProductId`, `shopPrice`, `shopStock`, gallery
    - On chip select: reset quantity to 1
    - If `shopStock === 0` for the selected variant: disable the chip with "Out of stock" label
    - _Requirements: 6.6–6.9, 13.3, 16.3_

  - [x] 7.5 Update `src/components/product/AddToCartSection.tsx` — use `shopProductId`
    - Accept `shopProductId` as a required prop (falls back to `productId` only during transition)
    - Pass `shopProductId` to `useCart` add-item call
    - Disable and show `ProductUnavailable` state when `shopStock === 0`
    - _Requirements: 6.9, 7.2_

- [x] 8. Cart Store Invariant
  - [x] 8.1 Update `src/services/cart.service.ts` — use `shopProductId`
    - `POST /cart/items` body: `{ shopProductId, quantity }` (replace `productId`)
    - `PUT /cart/items/:shopProductId` path param: `shopProductId`
    - `DELETE /cart/items/:shopProductId` path param: `shopProductId`
    - _Requirements: 7.7_

  - [x] 8.2 Create `src/components/store/CartStoreSwitchDialog.tsx`
    - Props: `open`, `currentStoreName`, `newStoreName`, `onConfirm`, `onCancel`
    - Uses `src/components/ui/dialog.tsx`
    - Confirm button: calls `DELETE /cart` then adds new item; Cancel: no-op
    - Min 44×44px touch targets on both buttons
    - _Requirements: 7.4, 7.5, 7.6, 13.2_

  - [x] 8.3 Update `src/hooks/useCart.ts` — cross-store conflict detection
    - Before `addItem(product)`: check `cartStore.storeId` vs `product.storeId`
    - If stores differ and cart is non-empty: open `CartStoreSwitchDialog`
    - If cart is empty: set `cartStore.setStore(product.storeId, product.storeName)` and add normally
    - After confirmed switch: call `DELETE /cart`, then add, then `cartStore.setStore(newStoreId, newStoreName)`
    - On login: fetch `GET /cart`; if `cart.storeId !== allocatedStoreId` and cart non-empty: show confirmation (Requirement 7.9)
    - On login: if `cart.storeId === allocatedStoreId`: merge silently (Requirement 7.10)
    - _Requirements: 7.3–7.6, 7.9, 7.10_

  - [x] 8.4 Update `src/components/cart/CartItem.tsx` and `CartItemMobile.tsx` — show store attribution
    - Add "Sold by {storeName}" line below product name, using `item.storeName`
    - _Requirements: 7.8_

  - [x] 8.5 Update `src/app/(shop)/cart/page.tsx` — mount `CartStoreSwitchDialog`
    - Import and render `CartStoreSwitchDialog`; its open state controlled by `useCart` hook
    - _Requirements: 7.4_

  - [ ]* 8.6 Write unit tests for `useCart` cross-store logic
    - Test: adding first item sets `cart.storeId`
    - Test: adding item from different store triggers `CartStoreSwitchDialog`
    - Test: confirming switch clears old cart and sets new `storeId`
    - _Requirements: 18.2_

- [x] 9. Dynamic Backend-Computed Fees
  - [x] 9.1 Create `src/services/fees.service.ts`
    - `getFees(storeId, addressId): Promise<FeeSummary>` → `GET /stores/:storeId/fees?addressId=`
    - Define `FeeSummary` interface inline (or export from `src/types/cart.types.ts`)
    - `getDeliverySlots(storeId, date): Promise<DeliverySlot[]>` → `GET /stores/:storeId/delivery-slots?date=`
    - _Requirements: 8.1_

  - [x] 9.2 Update `src/components/cart/CartSummary.tsx` — render from `FeeSummary`
    - Add `useQuery(keys.fees(storeId, addressId), ...)` with `enabled: !!storeId && !!addressId`
    - Render: `delivery_fee`, `handling_fee`, `platform_fee`, `small_cart_fee`, `item_discount`, `total_savings`, `payable_total` from response
    - Show skeleton/loading state when `storeId` or `addressId` is null
    - _Requirements: 8.2, 8.3, 8.7_

  - [x] 9.3 Update `src/components/cart/FreeDeliveryBar.tsx` — use backend threshold
    - Replace `FREE_DELIVERY_THRESHOLD` constant with `feeSummary.free_delivery_threshold`
    - Use `feeSummary.free_delivery_remaining` for the progress bar fill
    - Show loading state when `FeeSummary` is pending
    - _Requirements: 8.4_

  - [x] 9.4 Update `src/components/checkout/PriceBreakdown.tsx` — render all `FeeSummary` line items
    - Accept `FeeSummary` as a prop (passed down from checkout page)
    - Render every field including `small_cart_fee`, `coupon_discount`, `distance_km`, `eta_minutes`
    - _Requirements: 8.5_

  - [x] 9.5 Update `src/app/(shop)/checkout/page.tsx` — fetch `FeeSummary`, pass to components
    - Read `storeId` from `useStoreContext`, `addressId` from checkout form state
    - Query `keys.fees(storeId, addressId)`, pass `feeSummary` to `PriceBreakdown` and `CartSummary`
    - Optionally: if store supports `deliverySlots`, render slot picker step
    - _Requirements: 8.1, 8.2_

- [x] 10. Authentication and Session Management
  - [x] 10.1 Update `src/providers/AuthProvider.tsx` — resolve store on login
    - After `GET /users/me` success: if user has a default address, call `storeContext.resolveFromAddress(defaultAddressId)`
    - After logout: call `storeContext.clearStore()`, then `cartStore.clearStore()`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.2 Update `src/store/auth.store.ts` — add `persistedUserId` guard
    - Add `persistedUserId: string | null` to persisted state
    - On login, compare `persistedUserId` with the incoming `userId`; if they differ, call `storeContext.clearStore()` and update `persistedUserId`
    - This is the only change to `auth.store.ts`; do not alter existing token/refresh logic
    - _Requirements: 9.4, 17.2_

- [x] 11. Store-Scoped Coupons, Wallet, Payments
  - [x] 11.1 Update `src/services/coupons.service.ts` — add `storeId`
    - `getAvailableCoupons(storeId)` → `GET /coupons/available?storeId=:storeId`
    - `validateCoupon(code, storeId, ...)` → `POST /coupons/validate` body includes `storeId`
    - _Requirements: 10.1, 10.2_

  - [x] 11.2 Update `src/components/cart/AvailableCouponsSheet.tsx` — pass `storeId`
    - Read `allocatedStoreId` from `useStoreContext`
    - Pass to `getAvailableCoupons`; use `keys.coupons(storeId)`
    - Show `<LocationRequired />` when `!allocatedStoreId`
    - _Requirements: 10.1, 10.3_

- [x] 12. Orders with Store Attribution
  - [x] 12.1 Update `src/services/orders.service.ts` — add `storeId` to placement payload
    - Add `storeId: string` to `PlaceOrderPayload` type
    - Add `shopProductId: string` to each order item in the payload
    - `POST /orders` body now includes `storeId` at the top level and `shopProductId` per item
    - _Requirements: 11.1, 11.2_

  - [x] 12.2 Update `src/components/order/OrderCard.tsx` — show store attribution
    - Display "From {shop_name}" below order date/status using `order.shop_name`
    - _Requirements: 11.4_

  - [x] 12.3 Update order detail page — show store in header
    - Locate the order detail page under `src/app/(shop)/orders/[id]/`
    - Add store attribution ("From {shop_name}") in the page header area
    - _Requirements: 11.5_

  - [x] 12.4 Update `src/app/(shop)/checkout/page.tsx` — include `storeId` in place-order call
    - Read `allocatedStoreId` from `useStoreContext`
    - Pass `storeId` to `placeOrder(payload)` call
    - _Requirements: 11.1_

- [x] 13. Dashboard Content Freshness + Socket Invalidation
  - [x] 13.1 Update stale times across all store-scoped queries
    - Banners query: `staleTime: 5 * 60 * 1000` (5 min)
    - Categories query: `staleTime: 5 * 60 * 1000` (5 min)
    - Store status / store detail query: `staleTime: 60 * 1000` (1 min)
    - Apply these to the relevant `useQuery` calls in home section components, categories page, and store context refresh
    - _Requirements: 12.1, 12.2, 12.3, 16.5_

  - [x] 13.2 Update `src/providers/SocketProvider.tsx` — handle `store:config:update` event
    - Listen for `store:config:update` Socket.IO event
    - On receipt: `queryClient.invalidateQueries({ queryKey: ['store', storeId] })`, `['banners', storeId]`, `['categories', storeId]`
    - Also handle Socket.IO order status update: `queryClient.invalidateQueries({ queryKey: ['order', orderId] })`
    - _Requirements: 12.4, 11.7_

- [ ] 14. Checkpoint — Core Integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: home page loads store-scoped data, cart enforces `storeId`, fees come from backend, orders include `storeId`

- [ ] 15. Responsive UX Polish
  - [ ] 15.1 Verify and fix `LocationModal` mobile rendering
    - Confirm `<Sheet>` (bottom sheet) is used on `width < 768px` and `<Dialog>` on desktop
    - Test pincode input is visible above the keyboard on iOS/Android viewport
    - _Requirements: 13.1_

  - [ ] 15.2 Verify `ProductFamilyOptions` scrollable chip row on mobile
    - Wrap chip row in `overflow-x-auto` with `scrollbar-hide`; chips use `flex-shrink-0`
    - _Requirements: 13.3_

  - [ ] 15.3 Verify Header `LocationPicker` does not overflow at 375px
    - Apply `max-w-[18ch]` truncation with `text-ellipsis` on store name span
    - Test at 320px, 375px, 768px, 1280px breakpoints in DevTools
    - _Requirements: 13.5, 13.6_

- [ ] 16. Error and Empty States
  - [ ] 16.1 Create error/empty state components in `src/components/shared/`
    - `LocationRequired.tsx`: prompt card with "Set your delivery location" CTA that opens `LocationModal`
    - `Unserviceable.tsx`: shows `availabilityReason`, "Try a different pincode" button
    - `StoreClosed.tsx`: browsing-permitted banner with store re-open time if available
    - `StoreNotFound.tsx`: persisted store ID no longer valid; "Re-select location" CTA; on mount, clears store context
    - `ProductUnavailable.tsx`: product not in store; "Browse similar products" CTA
    - _Requirements: 15.1–15.5_

  - [ ] 16.2 Wire `StoreNotFound` recovery — handle 404 from `GET /stores/:id`
    - In `src/store/store.context.ts` `resolveStore` / `resolveFromAddress`: catch 404 errors from `getStore`
    - On 404: call `clearStore()`, set `resolutionError: 'store-not-found'`
    - Pages detect `resolutionError === 'store-not-found'` and render `<StoreNotFound />`
    - _Requirements: 15.4_

  - [ ] 16.3 Add `NetworkUnavailable` banner to shop layout
    - In `src/app/(shop)/layout.tsx`, add an `online` event listener (`window.addEventListener('offline', ...)`)
    - Render a sticky top banner when offline; dismiss when back online
    - _Requirements: 15.6_

- [ ] 17. Performance Optimizations
  - [ ] 17.1 Audit all store-scoped `useQuery` calls — enforce `enabled: !!allocatedStoreId`
    - Search for every `useQuery` that uses a key from the factory requiring `storeId`
    - Add `enabled: !!storeId` where missing
    - _Requirements: 16.1_

  - [ ] 17.2 Lazy-load below-the-fold home sections
    - Use `next/dynamic` with `loading` skeleton for: `DealsSection`, `BestSellersShowcase`, `HomeTrendingGrid`, `PromoOffersSection`
    - Keep `HomeHeroMosaic` and `HomeCategoryGrid` as SSR / eager
    - _Requirements: 16.2, 4.8_

  - [ ] 17.3 Lazy-render `ProductFamilyOptions`
    - In product detail page: only render `<ProductFamilyOptions />` when `product.family_id != null`
    - Use `dynamic(() => import('./ProductFamilyOptions'))` for code-split
    - _Requirements: 16.3_

- [ ] 18. Security Hardening
  - [ ] 18.1 Audit Razorpay key exposure
    - `grep -r "RAZORPAY_SECRET\|rzp_secret" src/` — confirm zero hits
    - Verify only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is referenced in client code
    - If any secret is found, move it to a server action or API route immediately
    - _Requirements: 17.1, 10.5, 10.6_

  - [ ] 18.2 Add `userId` guard to `bakaloo-store-v1` persist (confirm Phase 3.1 + 10.2 are complete)
    - Verify the `persistedUserId` field is written on login and checked on mount
    - Write an integration smoke test: simulate userId change → assert `clearStore` is called
    - _Requirements: 17.2, 9.4_

- [ ] 19. SEO Updates
  - [ ] 19.1 Update `src/app/(shop)/products/[slug]/page.tsx` — metadata and JSON-LD
    - In `generateMetadata()`: include `allocatedStoreName` in `description` if available
    - In JSON-LD `offers`: use `shopPrice ?? price` for `offers.price`
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 19.2 Update `src/app/sitemap.ts` — consider store-scoped URLs
    - If multiple stores serve different pincodes, include store-slug variants
    - At minimum, ensure existing product URLs remain in sitemap
    - _Requirements: 19.1_

- [ ] 20. Checkpoint — Full Feature Validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: all 19 routes render without errors when `allocatedStoreId` is null (shows `LocationRequired`), all routes work correctly when a store is allocated

- [ ] 21. Automated Tests
  - [ ] 21.1 Write unit tests for `src/store/store.context.ts`
    - Test: successful store resolution from pincode sets all allocated store fields
    - Test: unserviceable result sets `serviceable: false` and `availabilityReason`
    - Test: `clearStore` resets all allocated fields to `null`
    - Test: cross-user contamination — mismatched `persistedUserId` triggers `clearStore`
    - _Requirements: 18.1_

  - [ ]* 21.2 Write unit tests for `src/hooks/useCart.ts`
    - Test: adding first item sets `cart.storeId` on cartStore
    - Test: adding item from different store triggers `CartStoreSwitchDialog`
    - Test: confirming switch clears old cart and sets new `storeId`
    - _Requirements: 18.2_

  - [ ]* 21.3 Write unit tests for `src/services/products.service.ts`
    - Test: `getShopProducts` sends `storeId` as a query param
    - Test: `getShopProduct` sends `storeId` as a query param
    - Test: `searchShopProducts` sends `storeId` as a query param
    - _Requirements: 18.3_

  - [ ]* 21.4 Write render tests for `src/components/store/CartStoreSwitchDialog.tsx`
    - Test: renders `currentStoreName` and `newStoreName` in dialog body
    - Test: Confirm button triggers `onConfirm` callback
    - Test: Cancel button triggers `onCancel` callback
    - _Requirements: 18.4_

  - [ ]* 21.5 Write render and interaction tests for `src/components/store/LocationModal.tsx`
    - Test: renders pincode input on initial open
    - Test: submitting a pincode calls `resolveStore` with the pincode value
    - Test: GPS grant calls `resolveStore` with coordinates
    - Test: GPS denial leaves modal open and shows pincode input
    - Test: unserviceable result keeps modal open and shows `availabilityReason`
    - _Requirements: 18.5_

- [ ] 22. QA — Backward Compatibility Check
  - [ ] 22.1 Verify all 19 routes render without errors when `allocatedStoreId` is null
    - Walk each route: `/`, `/categories`, `/categories/[id]`, `/products`, `/products/[slug]`, `/search`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/profile`, `/profile/addresses`, `/profile/wallet`, `/profile/wishlist`, `/profile/reviews`, `/notifications`, `/auth/login`, `/auth/otp`
    - Each must show `LocationRequired` or a graceful empty state — no thrown errors, no blank white pages
    - _Requirements: 19.2_

  - [ ] 22.2 Write Playwright smoke tests for the 10 critical journeys (if Playwright is set up)
    - Journey 1: Anonymous → set pincode → store allocated → home shows store-scoped products
    - Journey 2: Search within allocated store — results contain only store products
    - Journey 3: Product detail shows `shopPrice` and "Sold by {storeName}"
    - Journey 4: Product family options — selecting variant updates price and `shopProductId`
    - Journey 5: Add item → cart has correct `storeId`
    - Journey 6: Add item from different store → `CartStoreSwitchDialog` shown
    - Journey 7: Checkout sends `storeId`; fees rendered from backend
    - Journey 8: Razorpay success → order created with `storeName`
    - Journey 9: Login with existing cart — reconcile flow shown when stores differ
    - Journey 10: Logout → store context cleared → new session starts fresh
    - _Requirements: 19.1–19.5_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but are strongly recommended before production
- Tasks in each phase build sequentially on the previous phase; do not skip ahead
- Phases 1–3 (Tasks 1–3) are the foundation — no later phase works without them
- Phase 8 (Task 8) is the most risk-prone change; test the cross-store add flow manually before merging
- `src/lib/api.ts`, `src/lib/socket.ts`, `src/middleware.ts`, `src/providers/QueryProvider.tsx`, all `src/components/ui/*` files are **not to be modified**
- The `src/store/auth.store.ts` change in Task 10.2 is the only modification to that file; do not alter token/refresh logic
- All `useQuery` calls must go through the `keys.*` factory — no manual string arrays
- Hardcoded fee constants (`FREE_DELIVERY_THRESHOLD`, `DEFAULT_DELIVERY_FEE`, `PLATFORM_FEE`) must be removed in Task 2.2 before Phase 9 work begins

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.5", "3.6"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 6, "tasks": ["5.4", "5.5", "6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 8, "tasks": ["8.1", "8.2", "9.1"] },
    { "id": 9, "tasks": ["8.3", "8.4", "8.5", "9.2", "9.3", "9.4", "9.5"] },
    { "id": 10, "tasks": ["8.6", "10.1", "10.2", "11.1"] },
    { "id": 11, "tasks": ["11.2", "12.1", "12.2", "12.3", "12.4", "13.1"] },
    { "id": 12, "tasks": ["13.2", "15.1", "15.2", "15.3"] },
    { "id": 13, "tasks": ["16.1", "16.2", "16.3"] },
    { "id": 14, "tasks": ["17.1", "17.2", "17.3", "18.1", "18.2"] },
    { "id": 15, "tasks": ["19.1", "19.2"] },
    { "id": 16, "tasks": ["21.1", "21.2", "21.3", "21.4", "21.5"] },
    { "id": 17, "tasks": ["22.1", "22.2"] }
  ]
}
```
