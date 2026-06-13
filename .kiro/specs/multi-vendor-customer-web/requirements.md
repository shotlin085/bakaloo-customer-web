# Requirements Document

## Introduction

This document captures the functional requirements for converting the Bakaloo customer web application (Next.js 14) from a single-vendor model to full multi-vendor grocery commerce. The backend, dashboard, and Flutter app already support multi-vendor. This feature ensures the customer web correctly consumes the existing multi-vendor backend contracts, scoping all catalog, cart, checkout, and order data to the store allocated to the customer's delivery location.

All 19 existing routes continue to function. A single-store deployment remains a valid special case.

---

## Glossary

- **Store_Context**: The Zustand store (`useStoreContext`) that holds the canonical state of which store serves the current customer — including `allocatedStoreId`, serviceability, ETA, and resolution status.
- **StoreId**: The unique identifier of the allocated store, resolved by the backend from the customer's delivery location.
- **ShopProductId**: The primary key of the `shop_products` junction table — the per-store variant of a product.
- **ServiceabilityResult**: The backend response from `GET /stores/serviceable` indicating whether a pincode or coordinate is served, and which stores serve it.
- **FeeSummary**: The backend-computed fee breakdown returned by `GET /stores/:storeId/fees?addressId=`, containing delivery, platform, handling, and small-cart fees.
- **Query_Key_Factory**: The typed factory in `src/lib/queryKeys.ts` that constructs TanStack Query cache keys.
- **LocationModal**: The full-screen modal component through which a customer sets or changes their delivery location.
- **CartStoreSwitchDialog**: The confirmation dialog shown when a customer attempts to add a product from a different store than the one currently in their cart.
- **StoreStatusBanner**: The banner shown when the allocated store is not open (`CLOSED` or `TEMPORARILY_CLOSED`).
- **ProductFamilyOptions**: The option picker (e.g., weight/size selector) for products that belong to a product family with multiple variants.
- **Allocated_Store**: The store assigned by the backend to serve the customer's selected delivery location.
- **Anonymous_User**: A customer who has not authenticated with the application.
- **Cart**: The shopping bag scoped to exactly one store, containing `CartItem` entries each carrying `shopProductId` and `storeId`.
- **AuthProvider**: The React provider that hydrates the authenticated user on mount.
- **BottomNav**: The mobile navigation bar.

---

## Requirements

### Requirement 1: Canonical Store Context

**User Story:** As a customer, I want the application to remember which store serves my delivery location, so that all browsing, search, and cart activity is automatically scoped to that store.

#### Acceptance Criteria

1. THE Store_Context SHALL maintain a single source of truth containing `allocatedStoreId`, `allocatedStoreName`, `allocatedStoreSlug`, `storeStatus`, `serviceable`, `deliveryEta`, `deliveryDistance`, `minimumOrder`, `selectedPincode`, and `lastResolvedAt`.
2. WHEN a customer provides a pincode or GPS coordinates, THE Store_Context SHALL call `GET /stores/serviceable` with those parameters and update its state from the `ServiceabilityResult` response.
3. WHEN the backend returns a serviceable result with at least one store, THE Store_Context SHALL set `serviceable: true` and populate all allocated store fields from the first store in the result.
4. WHEN the backend returns an unserviceable result, THE Store_Context SHALL set `serviceable: false` and store the `reason` in `availabilityReason`.
5. WHEN store resolution is in progress, THE Store_Context SHALL set `isResolving: true` and clear `resolutionError`.
6. IF the serviceability API call fails, THEN THE Store_Context SHALL set `resolutionError` to a non-empty error string and set `isResolving: false`.
7. THE Store_Context SHALL persist `selectedPincode`, `selectedAddressId`, `allocatedStoreId`, `allocatedStoreName`, `allocatedStoreSlug`, `storeStatus`, `serviceable`, `deliveryEta`, and `lastResolvedAt` to localStorage under the key `bakaloo-store-v1`.
8. THE Store_Context SHALL NOT persist `lat`, `lng`, `isResolving`, or `resolutionError`.
9. WHEN a customer logs in and the resolved `userId` differs from the `persistedUserId` stored in `bakaloo-store-v1`, THE Store_Context SHALL clear all store context state.
10. WHEN a customer logs out, THE Store_Context SHALL call its `clearStore` action, resetting all allocated store fields to `null`.
11. WHEN a new store is allocated that differs from the previously allocated store, THE Store_Context SHALL invalidate all TanStack Query families keyed by the previous `storeId`.
12. THE Store_Context SHALL expose a `resolveFromAddress(addressId: string)` action that calls `GET /stores/serviceable` using the coordinates or pincode of the given address.

---

### Requirement 2: Query Key Isolation

**User Story:** As a developer, I want every store-dependent TanStack Query to include `storeId` in its cache key, so that data from different stores is never mixed in the query cache.

#### Acceptance Criteria

1. THE Query_Key_Factory SHALL include `storeId` as a required parameter in the following key constructors: `categories`, `category`, `categoryProducts`, `banners`, `products`, `featuredProducts`, `dealsProducts`, `newArrivals`, `product`, `productOptions`, `relatedProducts`, `search`, `cart`, `fees`, `deliverySlots`, and `coupons`.
2. THE Query_Key_Factory SHALL use user-scoped keys without `storeId` for: `user`, `userStats`, `addresses`, `wallet`, `walletTransactions`, `notifications`, `wishlist`, `reviews`, `reviewEligibility`, `myReviews`, `loyalty`, and `referral`.
3. WHEN `allocatedStoreId` is `null`, THE System SHALL set `enabled: false` on all queries whose key factory requires a `storeId` parameter.
4. THE Query_Key_Factory SHALL be the single canonical source for all TanStack Query keys; no component or hook SHALL construct store-dependent query keys manually.
5. THE System SHALL remove the legacy `QUERY_KEYS` and `STALE_TIMES` exports from `src/lib/constants.ts` and replace all references with the Query_Key_Factory.

---

### Requirement 3: Location and Serviceability UX

**User Story:** As a customer, I want a clear flow to set my delivery location, so that the app can tell me whether delivery is available and which store will serve me.

#### Acceptance Criteria

1. WHEN a customer has not set a delivery location, THE LocationModal SHALL be displayed before any store-scoped content is shown.
2. THE LocationModal SHALL support pincode text input and a GPS-based location button.
3. WHEN a customer grants GPS permission, THE LocationModal SHALL call the serviceability API with the resolved coordinates.
4. IF a customer denies GPS permission, THEN THE LocationModal SHALL remain open and display the pincode input for manual entry.
5. WHEN an authenticated customer opens the LocationModal, THE LocationModal SHALL display the customer's saved addresses as selectable options.
6. WHEN a customer selects a saved address, THE Store_Context SHALL resolve the store using that address's coordinates or pincode.
7. WHEN resolution succeeds and a store is allocated, THE LocationModal SHALL close and THE System SHALL load store-scoped catalog data.
8. WHEN resolution returns an unserviceable result, THE LocationModal SHALL remain open, display the `availabilityReason`, and allow the customer to enter a different pincode.
9. WHEN the allocated store has `storeStatus !== 'OPEN'`, THE StoreStatusBanner SHALL be displayed on all shop pages with a message indicating the store is closed and the customer is browsing only.
10. WHEN a customer has an active cart and changes their delivery location to a different store, THE System SHALL display a confirmation dialog before completing the location change, warning that the cart will be cleared.
11. THE Header location picker SHALL display the current `selectedPincode` and `allocatedStoreName` when a store is allocated.
12. WHEN the Header location picker is clicked, THE LocationModal SHALL open.
13. THE BottomNav on mobile SHALL include the location picker entry point consistent with the Header.

---

### Requirement 4: Store-Scoped Home Experience

**User Story:** As a customer, I want the home page to show banners, categories, and products from my allocated store, so that I only see items I can actually buy and have delivered.

#### Acceptance Criteria

1. WHEN `allocatedStoreId` is set, THE Home page SHALL fetch banners from `GET /stores/:storeId/banners`.
2. WHEN `allocatedStoreId` is set, THE Home page SHALL fetch categories from `GET /stores/:storeId/categories`.
3. WHEN `allocatedStoreId` is set, THE Home page SHALL fetch featured products, deals, and new arrivals from `GET /shop-products?storeId=:storeId&...`.
4. WHEN `allocatedStoreId` is `null`, THE Home page SHALL display a `LocationRequired` empty state prompting the customer to set a delivery location, instead of rendering blank sections.
5. THE Home page SHALL pass `allocatedStoreId` as a prop or via context hook to every child section component that renders store-scoped data.
6. WHEN `allocatedStoreId` changes, THE Home page SHALL re-fetch all store-scoped sections with the new `storeId`.
7. THE Home page SHALL limit each product section to a maximum of 8 items on initial load to meet performance requirements.
8. THE Home page SHALL lazy-load below-the-fold product sections; only above-the-fold content is loaded on initial render.

---

### Requirement 5: Store-Scoped Categories, Search and Filtering

**User Story:** As a customer, I want to browse categories and search for products within my allocated store, so that every result I see is available from the store serving my location.

#### Acceptance Criteria

1. THE Categories page SHALL fetch categories from `GET /stores/:storeId/categories` and SHALL include `storeId` in its TanStack Query key.
2. THE Category detail page SHALL fetch products from `GET /shop-products?storeId=:storeId&categoryId=:categoryId&...`.
3. THE Search page SHALL fetch results from `GET /shop-products/search?storeId=:storeId&q=:query&...`.
4. THE Products listing page SHALL fetch products from `GET /shop-products?storeId=:storeId&...`.
5. THE Search and listing endpoints SHALL support the following filter parameters: `categoryId`, `page`, `limit`, `sort`, `inStock`, and `foodType`.
6. WHEN `allocatedStoreId` is `null`, ALL category, search, and listing queries SHALL be disabled (`enabled: false`) and the pages SHALL display a `LocationRequired` state.
7. WHEN a search query returns no results, THE Search page SHALL display an appropriate empty state.

---

### Requirement 6: Product Detail with Store-Scoped Pricing and Stock

**User Story:** As a customer, I want to see the price, stock availability, and selling store for a product as it exists in my allocated store, so that I know exactly what I'm buying and from whom.

#### Acceptance Criteria

1. THE Product detail page SHALL fetch the product via `GET /shop-products/:shopProductId?storeId=:storeId`, scoped to the allocated store.
2. WHEN a product has a `shop_price` value, THE Product detail page SHALL display `shop_price` as the active price.
3. WHEN a product does not have a `shop_price`, THE Product detail page SHALL display the base `price`.
4. THE Product detail page SHALL display the selling store name as "Sold by {storeName}".
5. THE Product detail page SHALL display the delivery ETA from `Store_Context.deliveryEta`.
6. WHEN a product has a `family_id`, THE ProductFamilyOptions component SHALL fetch all variant options from `GET /products/family/:familyId?storeId=:storeId`.
7. WHEN a customer selects a product family variant, THE Product detail page SHALL update the displayed price, stock, image gallery, and add-to-cart target to reflect the selected variant's `shopProductId`.
8. WHEN a customer selects a product family variant, THE Product detail page SHALL reset the quantity selector to 1.
9. WHEN `shop_stock` is 0 for the selected variant, THE Product detail page SHALL disable the add-to-cart button and display a `ProductUnavailable` state.
10. THE Product detail page structured data (`JSON-LD`) SHALL use `shopPrice` as `offers.price` when available.
11. WHEN `allocatedStoreId` is `null`, THE Product detail page SHALL display a `LocationRequired` state instead of product data.

---

### Requirement 7: Cart Store Invariant

**User Story:** As a customer, I want my cart to always belong to exactly one store, so that I never accidentally mix items from different stores in a single order.

#### Acceptance Criteria

1. THE Cart SHALL maintain a `storeId` and `storeName` field identifying which store owns the cart.
2. EVERY `CartItem` in the Cart SHALL carry `shopProductId` and `storeId` fields.
3. WHEN a customer adds a product to the cart and the cart is empty, THE Cart SHALL set `cart.storeId` to the product's `storeId`.
4. WHEN a customer adds a product whose `storeId` differs from `cart.storeId`, THE CartStoreSwitchDialog SHALL be shown, informing the customer that adding the item will clear the current cart.
5. WHEN a customer confirms the store switch in THE CartStoreSwitchDialog, THE System SHALL call `DELETE /cart` to clear the existing cart and then add the new item from the new store, updating `cart.storeId`.
6. WHEN a customer cancels the store switch in THE CartStoreSwitchDialog, THE Cart SHALL remain unchanged.
7. THE cart service SHALL use `shopProductId` in the request body for `POST /cart/items` and as the path parameter for `PUT /cart/items/:shopProductId` and `DELETE /cart/items/:shopProductId`.
8. EACH `CartItem` displayed in the cart view SHALL show "Sold by {storeName}".
9. WHEN a customer logs in and the fetched cart has a `storeId` that differs from `allocatedStoreId`, AND the cart is non-empty, THE System SHALL prompt the customer to choose whether to keep the existing cart or replace it with the current store's cart.
10. WHEN the cart is restored after login and the fetched cart's `storeId` matches `allocatedStoreId`, THE System SHALL merge the cart silently without prompting.
11. THE cart Zustand store SHALL persist `storeId` and `storeName` across page reloads as part of its state.

---

### Requirement 8: Dynamic Backend-Computed Fees

**User Story:** As a customer, I want the delivery, platform, handling, and small-cart fees shown in my cart and at checkout to come from the backend, so that fees are always accurate for my store and delivery address.

#### Acceptance Criteria

1. THE System SHALL fetch the fee breakdown from `GET /stores/:storeId/fees?addressId=:addressId` and SHALL NOT calculate any fee values client-side.
2. THE fees query SHALL be keyed as `['fees', storeId, addressId]` and SHALL only be enabled when both `storeId` and `addressId` are non-null.
3. THE Cart summary SHALL render `delivery_fee`, `handling_fee`, `platform_fee`, `small_cart_fee`, `total_savings`, and `payable_total` from the `FeeSummary` response.
4. THE Free delivery progress bar SHALL use `feeSummary.free_delivery_remaining` and `feeSummary.free_delivery_threshold` from the backend.
5. THE Checkout price breakdown SHALL render all line items from the `FeeSummary` response.
6. THE System SHALL remove the constants `FREE_DELIVERY_THRESHOLD`, `DEFAULT_DELIVERY_FEE`, and `PLATFORM_FEE` from `src/lib/constants.ts` and all references to them.
7. WHEN `storeId` or `addressId` is `null`, THE Cart summary and Checkout breakdown SHALL display a loading state rather than calculated values.

---

### Requirement 9: Authentication and Session Management

**User Story:** As a customer, I want my store context and cart to be correctly initialized when I log in or log out, so that I never see another user's store data or cart contents.

#### Acceptance Criteria

1. WHEN a customer successfully authenticates, THE AuthProvider SHALL call `GET /users/me` to hydrate the current user.
2. WHEN user hydration completes and the user has a default delivery address, THE AuthProvider SHALL call `Store_Context.resolveFromAddress(defaultAddressId)` to resolve the store for the default address.
3. WHEN a customer logs out, THE System SHALL clear the Store_Context, clear the cart Zustand store, and remove the user token.
4. WHEN the application initializes and `bakaloo-store-v1` persisted state contains a `persistedUserId` that differs from the currently logged-in user's ID, THE Store_Context SHALL reset to its initial state.
5. THE System SHALL use the `SameSite=Lax` cookie as the primary auth token for SSR middleware; the `localStorage` token is used for client-side API calls.
6. WHEN the access token is expired and a refresh is in progress, THE System SHALL queue all concurrent API requests and retry them after the refresh completes, rather than failing them immediately.
7. IF a token refresh call fails, THEN THE System SHALL clear authentication state and redirect the customer to the login page.

---

### Requirement 10: Store-Scoped Coupons, Wallet, and Payments

**User Story:** As a customer, I want available coupons to be relevant to my allocated store and my wallet payment to be correctly applied at checkout, so that I can take advantage of store-specific offers.

#### Acceptance Criteria

1. THE coupons service SHALL call `GET /coupons/available?storeId=:storeId` and the query SHALL be keyed as `['coupons', storeId]`.
2. THE coupon validation call (`POST /coupons/validate`) SHALL include `storeId` in its request body.
3. WHEN `allocatedStoreId` is `null`, the coupons query SHALL be disabled and the coupons sheet SHALL display a `LocationRequired` state.
4. THE wallet balance and transaction queries SHALL remain user-scoped and SHALL NOT include `storeId` in their keys.
5. THE Razorpay payment flow SHALL use only `NEXT_PUBLIC_RAZORPAY_KEY_ID` (the public key) on the client; the Razorpay secret SHALL remain server-side only.
6. WHEN a Razorpay payment completes, THE System SHALL send the payment verification to the backend; THE client SHALL NOT verify the Razorpay signature locally.

---

### Requirement 11: Orders with Store Attribution

**User Story:** As a customer, I want my orders to show which store they came from, so that I can easily identify and track orders from specific vendors.

#### Acceptance Criteria

1. THE order placement payload sent to `POST /orders` SHALL include `storeId` as a required field.
2. EVERY item in the order placement payload SHALL include `shopProductId`.
3. THE `Order` type SHALL include `shop_id` and `shop_name` fields.
4. THE Order card in the orders list SHALL display "From {storeName}" for each order.
5. THE Order detail page SHALL display store attribution in the page header.
6. THE real-time order tracking via Socket.IO SHALL use the existing `order:track/{orderId}` event structure without modification.
7. WHEN an order status update event is received via Socket.IO, THE System SHALL update the relevant order query cache entry for that `orderId`.

---

### Requirement 12: Dashboard-Driven Store Content Freshness

**User Story:** As a store operator, I want changes I make in the dashboard (banners, categories, store status, fees) to be reflected on the customer web promptly, so that customers always see accurate information.

#### Acceptance Criteria

1. THE TanStack Query `staleTime` for banners SHALL be set to 5 minutes or less.
2. THE TanStack Query `staleTime` for categories SHALL be set to 5 minutes or less.
3. THE TanStack Query `staleTime` for store status SHALL be set to 1 minute or less.
4. WHEN the Socket.IO client receives a `store:config:update` event, THE System SHALL invalidate the query families for the affected store's banners, categories, and store detail.

---

### Requirement 13: Responsive Layout for Location and Store Picker

**User Story:** As a customer using a mobile device, I want the location picker and store information to be accessible through the bottom navigation bar as well as the header, so that I can change my delivery location without navigating away.

#### Acceptance Criteria

1. THE LocationModal SHALL render as a full-screen bottom sheet on mobile viewports (width < 768px).
2. THE CartStoreSwitchDialog interactive targets SHALL have a minimum touch target size of 44×44 pixels.
3. THE ProductFamilyOptions component SHALL render as a horizontally scrollable chip row on mobile viewports.
4. THE BottomNav SHALL include an accessible entry point to the location picker.
5. THE Header location picker SHALL not overflow or truncate in a way that hides the store name on viewports narrower than 375px.
6. THE Header location picker SHALL display on desktop viewports alongside the existing navigation elements without layout regression.

---

### Requirement 14: SEO and Structured Data

**User Story:** As a product owner, I want product pages to use accurate store-scoped pricing in their structured data and metadata, so that search engines show the correct price for the specific store.

#### Acceptance Criteria

1. WHEN a product page is rendered with a `shopPrice`, THE JSON-LD structured data `offers.price` field SHALL use `shopPrice`.
2. WHEN a product page is rendered without a `shopPrice`, THE JSON-LD structured data `offers.price` field SHALL use the base `price`.
3. WHEN a product page has an `allocatedStoreName`, THE page metadata description SHALL include the store name.

---

### Requirement 15: Error and Empty States

**User Story:** As a customer, I want clear, actionable error screens for all store-related failure modes, so that I understand what went wrong and know what to do next.

#### Acceptance Criteria

1. WHEN `allocatedStoreId` is `null` and the customer attempts to view catalog content, THE System SHALL render a `LocationRequired` state with a call-to-action to set a delivery location.
2. WHEN the serviceability API returns `serviceable: false`, THE System SHALL render an `Unserviceable` state displaying the `availabilityReason` and a prompt to try a different pincode.
3. WHEN `storeStatus` is `'CLOSED'` or `'TEMPORARILY_CLOSED'`, THE System SHALL render a `StoreClosed` state indicating the store is not currently accepting orders; browsing SHALL still be permitted.
4. WHEN a persisted `storeId` is no longer valid (backend returns 404 for `GET /stores/:id`), THE System SHALL clear the persisted store context and render a `StoreNotFound` state with a prompt to re-select a location.
5. WHEN a `shopProductId` is not available in the allocated store, THE Product detail page SHALL render a `ProductUnavailable` state.
6. WHEN the network is unavailable, THE System SHALL display a `NetworkUnavailable` banner on all pages.

---

### Requirement 16: Performance and Query Efficiency

**User Story:** As a developer, I want store-dependent queries to be disabled when no store is allocated and heavy content to load lazily, so that the application uses minimal resources on low-end devices and slow connections.

#### Acceptance Criteria

1. ALL TanStack Query hooks whose key factory requires `storeId` SHALL set `enabled: !!allocatedStoreId`.
2. THE Home page SHALL lazy-load all product sections that appear below the initial viewport.
3. THE ProductFamilyOptions component SHALL only be rendered when the product has a non-null `family_id`.
4. THE System SHALL use status/isLoading patterns for loading states; React Suspense boundaries SHALL NOT be used for data-fetching in store-scoped queries.
5. THE `staleTime` for banners and categories SHALL NOT exceed 5 minutes, ensuring dashboard updates are reflected promptly.

---

### Requirement 17: Security Invariants

**User Story:** As a security-conscious developer, I want the application to prevent client-side secrets exposure, cross-user data leakage, and unauthorized store access, so that customer data and payment flows are safe.

#### Acceptance Criteria

1. THE client bundle SHALL NOT contain the Razorpay secret key; only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is permitted.
2. THE System SHALL add a `persistedUserId` to the `bakaloo-store-v1` persisted state and SHALL clear all store context when the authenticated user's ID does not match `persistedUserId`.
3. WHEN a customer logs out, THE Store_Context SHALL call `clearStore`, ensuring the next visitor does not inherit the previous customer's store allocation.
4. THE cart Zustand store SHALL clear `storeId` and all items on logout.
5. ALL API calls that access user-specific data (cart, orders, wallet, addresses) SHALL include the authenticated JWT; unauthenticated requests SHALL be rejected by the client before reaching the API.

---

### Requirement 18: Test Coverage for Multi-Vendor Logic

**User Story:** As a developer, I want automated tests covering the key multi-vendor behaviors, so that regressions are caught before they reach production.

#### Acceptance Criteria

1. THE Store_Context SHALL have unit tests covering: successful store resolution from pincode, unserviceable result handling, `clearStore` on logout, and cross-user contamination detection.
2. THE `useCart` hook SHALL have unit tests covering: adding the first item sets `cart.storeId`, adding an item from a different store triggers `CartStoreSwitchDialog`, confirming store switch clears the old cart and sets the new `storeId`.
3. THE products service SHALL have unit tests verifying that `storeId` is included as a parameter in all product API calls.
4. THE `CartStoreSwitchDialog` component SHALL have render tests verifying it displays the current store name and the new store name.
5. THE `LocationModal` component SHALL have render and interaction tests covering: pincode submission, GPS permission grant, GPS permission denial, and unserviceable state display.

---

### Requirement 19: Backward Compatibility and Route Preservation

**User Story:** As a product owner, I want all 19 existing customer web routes to continue functioning after the multi-vendor migration, so that customers with bookmarks and existing sessions are not broken.

#### Acceptance Criteria

1. THE System SHALL preserve the URL structure for all 19 existing routes: `/`, `/categories`, `/categories/[id]`, `/products`, `/products/[slug]`, `/search`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/profile`, `/profile/addresses`, `/profile/wallet`, `/profile/wishlist`, `/profile/reviews`, `/notifications`, `/auth/login`, `/auth/otp`, and any additional existing routes.
2. WHEN `allocatedStoreId` is `null`, ALL existing routes SHALL render without throwing errors; they SHALL show the `LocationRequired` or appropriate empty state where catalog data would appear.
3. THE single-store deployment case SHALL remain valid: when the backend always returns the same store for all pincodes, the customer web SHALL function correctly without any additional configuration.
4. WHEN a customer navigates to a product URL (`/products/[slug]`) that was bookmarked before the multi-vendor migration, THE System SHALL attempt to resolve the product within the currently allocated store using the slug.
5. THE existing Socket.IO order tracking flow SHALL continue to function without modification to `src/lib/socket.ts`.
