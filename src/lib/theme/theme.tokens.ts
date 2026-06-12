import type { ShopThemeConfig } from './theme.types'

export const DEFAULT_PREMIUM_THEME: ShopThemeConfig = {
  key: 'default-premium',
  label: 'Default Premium',
  mode: 'light',
  colors: {
    canvas: '#F0ECE8',
    surface: 'rgba(255, 252, 250, 0.90)',
    surfaceElevated: '#FFFFFF',
    ink: '#1A232B',
    inkMuted: '#56606B',
    border: '#DEDDE6',
    primary: '#6E49D8',
    primaryHover: '#5C39C5',
    accent: '#E3B93C',
    success: '#16945E',
    warning: '#D9911D',
    danger: '#DC2626',
  },
  gradients: {
    pageBackground:
      'radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 30%), linear-gradient(180deg, rgba(247,242,238,0.96) 0%, rgba(239,233,230,0.94) 46%, rgba(233,228,236,0.96) 100%)',
    heroSurface: 'linear-gradient(135deg, rgba(95,63,191,0.96) 0%, rgba(133,93,224,0.92) 54%, rgba(51,142,105,0.88) 100%)',
    promoSurface: 'linear-gradient(135deg, rgba(249,240,255,0.94) 0%, rgba(238,233,252,0.92) 58%, rgba(244,242,232,0.90) 100%)',
    footerSurface: 'linear-gradient(135deg, rgba(58,35,120,0.98) 0%, rgba(74,47,142,0.98) 54%, rgba(35,34,64,0.99) 100%)',
  },
  chrome: {
    headerSurface: 'rgba(255,255,255,0.80)',
    sidebarSurface: 'linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(247,243,255,0.84) 100%)',
    cardRadius: '30px',
    shadowSoft: '0 16px 34px rgba(42, 28, 92, 0.10)',
    shadowStrong: '0 24px 60px rgba(42, 28, 92, 0.16)',
  },
  seasonal: {
    badgeText: 'Curated premium',
    heroSparkles: false,
    promoRibbon: false,
    accentWash: 'rgba(110, 73, 216, 0.08)',
  },
  commerce: {
    discount: '#C2410C',
    deal: '#D9911D',
    freeDelivery: '#16945E',
    trust: '#6E49D8',
  },
  imagery: {
    heroOverlayOpacity: '0.24',
    fallbackTint: '#F4EEF9',
    promoBannerTreatment: 'soft',
  },
}

export const WINTER_THEME: ShopThemeConfig = {
  ...DEFAULT_PREMIUM_THEME,
  key: 'winter',
  label: 'Winter',
  colors: {
    ...DEFAULT_PREMIUM_THEME.colors,
    canvas: '#E7EDF3',
    surface: 'rgba(252, 254, 255, 0.90)',
    ink: '#15202B',
    inkMuted: '#5E6C79',
    primary: '#0F766E',
    primaryHover: '#115E59',
    accent: '#2563EB',
  },
  gradients: {
    pageBackground:
      'radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 30%), linear-gradient(180deg, rgba(240,245,250,0.96) 0%, rgba(228,236,244,0.94) 100%)',
    heroSurface: 'linear-gradient(135deg, rgba(20,83,105,0.94) 0%, rgba(15,118,110,0.88) 100%)',
    promoSurface: 'linear-gradient(135deg, rgba(240,249,255,0.96) 0%, rgba(224,242,254,0.92) 100%)',
    footerSurface: 'linear-gradient(135deg, rgba(16,37,49,0.99) 0%, rgba(11,27,38,0.99) 100%)',
  },
  seasonal: {
    badgeText: 'Winter edit',
    heroSparkles: true,
    promoRibbon: true,
    accentWash: 'rgba(14, 116, 144, 0.06)',
  },
  commerce: {
    ...DEFAULT_PREMIUM_THEME.commerce,
    trust: '#0F766E',
  },
  imagery: {
    heroOverlayOpacity: '0.26',
    fallbackTint: '#E4EEF6',
    promoBannerTreatment: 'crisp',
  },
}

export const FESTIVAL_THEME: ShopThemeConfig = {
  ...DEFAULT_PREMIUM_THEME,
  key: 'festival',
  label: 'Festival',
  colors: {
    ...DEFAULT_PREMIUM_THEME.colors,
    canvas: '#F2E7DC',
    surface: 'rgba(255, 249, 243, 0.92)',
    ink: '#1F1B18',
    inkMuted: '#6B625C',
    primary: '#9A3412',
    primaryHover: '#7C2D12',
    accent: '#B45309',
  },
  gradients: {
    pageBackground:
      'radial-gradient(circle at top left, rgba(255,247,239,0.92), transparent 28%), linear-gradient(180deg, rgba(249,241,232,0.98) 0%, rgba(239,226,212,0.94) 100%)',
    heroSurface: 'linear-gradient(135deg, rgba(154,52,18,0.92) 0%, rgba(180,83,9,0.88) 100%)',
    promoSurface: 'linear-gradient(135deg, rgba(255,251,235,0.98) 0%, rgba(254,243,199,0.92) 100%)',
    footerSurface: 'linear-gradient(135deg, rgba(54,23,14,0.98) 0%, rgba(29,17,12,0.99) 100%)',
  },
  seasonal: {
    badgeText: 'Festival picks',
    heroSparkles: true,
    promoRibbon: true,
    accentWash: 'rgba(180, 83, 9, 0.08)',
  },
  commerce: {
    ...DEFAULT_PREMIUM_THEME.commerce,
    discount: '#C2410C',
    deal: '#EA580C',
    freeDelivery: '#15803D',
    trust: '#9A3412',
  },
  imagery: {
    heroOverlayOpacity: '0.18',
    fallbackTint: '#F5E4D1',
    promoBannerTreatment: 'warm',
  },
}
