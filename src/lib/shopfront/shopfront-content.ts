export type CategoryIconKey =
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'snacks'
  | 'baby'
  | 'care'
  | 'pantry'

export interface ShopfrontCategoryPreference {
  label: string
  keywords: string[]
  icon: CategoryIconKey
}

export interface ShopfrontFooterGroup {
  title: string
  links: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export interface ShopfrontSocialLink {
  label: string
  href: string
}

export interface ShopfrontAppDownload {
  label: string
  href: string
  caption: string
}

export const SHOPFRONT_VALUE_BAR = {
  message: 'FREE delivery & 40% discount for your next 3 orders. Place your 1st order today.',
  locale: 'INR • English',
  helpLabel: 'Help Center',
  helpHref: '/profile',
}

export const SHOPFRONT_HEADER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Pages', href: '/categories' },
  { label: 'Shop', href: '/products' },
  { label: 'Vendor', href: '/profile' },
  { label: 'Blog', href: '/search?q=organic' },
  { label: 'Contact', href: '/profile' },
]

export const SHOPFRONT_HEADER_HOTLINE = {
  label: 'Weekly Discount!',
  phoneLabel: 'Hotline Number',
  phone: '+91 98765 43210',
}

export const SHOPFRONT_CATEGORY_PREFERENCES: ShopfrontCategoryPreference[] = [
  { label: 'Vegetables', keywords: ['vegetable', 'veggie', 'greens'], icon: 'vegetables' },
  { label: 'Fruits', keywords: ['fruit', 'fruits'], icon: 'fruits' },
  { label: 'Dairy', keywords: ['dairy', 'milk', 'egg', 'eggs'], icon: 'dairy' },
  { label: 'Snacks', keywords: ['snack', 'chips', 'biscuits'], icon: 'snacks' },
  { label: 'Baby Food', keywords: ['baby', 'kids', 'infant'], icon: 'baby' },
  { label: 'Personal Care', keywords: ['care', 'beauty', 'personal', 'hygiene'], icon: 'care' },
]

export const SHOPFRONT_CAMPAIGN_COPY = {
  heroEyebrow: 'Premium grocery commerce',
  heroFallbackTitle: 'Taste the Bakaloo difference.',
  heroFallbackSubtitle: 'Curated essentials, premium produce, and everyday delivery with cleaner UX.',
  heroCtaLabel: 'Shop Now',
  promoPrimaryLabel: 'Shop Collection',
  promoSecondaryLabel: 'Explore Deal',
  stripLabel: 'Browse Campaign',
}

export const SHOPFRONT_PROMISE_BANNER = {
  eyebrow: 'Our quality promise',
  title: 'Uncompromising quality, handled with care.',
  subtitle:
    "If it doesn't feel fresh, it doesn't belong in your basket. Bakaloo curates produce, pantry, and family essentials with stricter standards from source to doorstep.",
  ctaLabel: 'Learn More About Quality',
  ctaHref: '/categories',
  points: ['Certified sourcing', 'Freshness-backed deliveries', 'Clear pricing with no surprises'],
}

export const SHOPFRONT_NEWSLETTER = {
  eyebrow: 'Stay in the loop',
  title: 'Recipes, premium offers, and seasonal grocery edits.',
  subtitle: 'Newsletter delivery is being prepared. The signup experience will go live in a later release.',
  placeholder: 'Enter your email address',
  ctaLabel: 'Join the Waitlist',
  statusLabel: 'Launching Soon',
}

export const SHOPFRONT_FOOTER_GROUPS: ShopfrontFooterGroup[] = [
  {
    title: 'About Us',
    links: [
      { label: 'Our Story', href: '/' },
      { label: 'New Arrivals', href: '/products' },
      { label: 'Organic Picks', href: '/search?q=organic' },
      { label: 'Accessibility', href: '/profile' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact Support', href: '/profile' },
      { label: 'Shipping Information', href: '/orders' },
      { label: 'Return & Refund Policy', href: '/orders' },
      { label: 'Payment Methods', href: '/checkout' },
    ],
  },
  {
    title: 'Shop by Category',
    links: [
      { label: 'Organic Produce', href: '/search?q=organic' },
      { label: 'Baby Care', href: '/search?q=baby' },
      { label: 'Gourmet Goods', href: '/search?q=gourmet' },
      { label: 'Bulk Orders', href: '/categories' },
    ],
  },
  {
    title: 'Support & Legal',
    links: [
      { label: 'FAQs', href: '/profile' },
      { label: 'Privacy Policy', href: '/profile' },
      { label: 'Terms of Service', href: '/profile' },
      { label: 'Cookie Policy', href: '/profile' },
    ],
  },
  {
    title: 'Get the App',
    links: [
      { label: 'Download on the App Store', href: '#', external: true },
      { label: 'Get it on Google Play', href: '#', external: true },
    ],
  },
]

export const SHOPFRONT_FOOTER_CONTACT = {
  brand: 'Bakaloo',
  tagline: 'Premium grocery commerce for households that care about quality, speed, and trust.',
  address: 'Kolkata, India',
  phone: '+91 98765 43210',
  email: 'support@bakaloo.com',
}

export const SHOPFRONT_PAYMENT_BADGES = [
  'Visa',
  'Mastercard',
  'UPI',
  'Google Pay',
  'Apple Pay',
  'Razorpay',
]

export const SHOPFRONT_TRUST_BADGES = [
  'Verified Secure',
  'Freshness Guaranteed',
  'Top-rated support',
]

export const SHOPFRONT_SOCIAL_LINKS: ShopfrontSocialLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/bakaloo' },
  { label: 'Facebook', href: 'https://facebook.com/bakaloo' },
  { label: 'Twitter', href: 'https://twitter.com/bakaloo' },
  { label: 'YouTube', href: 'https://youtube.com/@bakaloo' },
]

export const SHOPFRONT_APP_DOWNLOADS: ShopfrontAppDownload[] = [
  {
    label: 'App Store',
    caption: 'Download on the',
    href: '#',
  },
  {
    label: 'Google Play',
    caption: 'Get it on',
    href: '#',
  },
]
