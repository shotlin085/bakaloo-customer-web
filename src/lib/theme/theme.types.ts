export type ThemeKey = 'default-premium' | 'winter' | 'festival'

export interface ThemeColorTokens {
  canvas: string
  surface: string
  surfaceElevated: string
  ink: string
  inkMuted: string
  border: string
  primary: string
  primaryHover: string
  accent: string
  success: string
  warning: string
  danger: string
}

export interface ThemeGradientTokens {
  pageBackground: string
  heroSurface: string
  promoSurface: string
  footerSurface: string
}

export interface ThemeChromeTokens {
  headerSurface: string
  sidebarSurface: string
  cardRadius: string
  shadowSoft: string
  shadowStrong: string
}

export interface ThemeSeasonalTokens {
  badgeText: string
  heroSparkles: boolean
  promoRibbon: boolean
  accentWash?: string
}

export interface ThemeCommerceTokens {
  discount: string
  deal: string
  freeDelivery: string
  trust: string
}

export interface ThemeImageryTokens {
  heroOverlayOpacity: string
  fallbackTint: string
  promoBannerTreatment: string
}

export interface ShopThemeConfig {
  key: ThemeKey
  label: string
  mode: 'light'
  colors: ThemeColorTokens
  gradients: ThemeGradientTokens
  chrome: ThemeChromeTokens
  seasonal: ThemeSeasonalTokens
  commerce: ThemeCommerceTokens
  imagery: ThemeImageryTokens
}
