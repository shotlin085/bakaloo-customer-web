import type { CSSProperties } from 'react'
import { DEFAULT_THEME_KEY, getShopTheme } from './theme.registry'
import type { ShopThemeConfig, ThemeKey } from './theme.types'

export function resolveThemeKey(themeKey?: string | null): ThemeKey {
  return getShopTheme(themeKey).key
}

export function resolveActiveTheme(themeKey?: string | null): ShopThemeConfig {
  return getShopTheme(themeKey ?? process.env.NEXT_PUBLIC_SHOP_THEME ?? DEFAULT_THEME_KEY)
}

export function themeToCssVars(theme: ShopThemeConfig): CSSProperties {
  return {
    ['--shop-theme-key' as string]: theme.key,
    ['--shop-canvas' as string]: theme.colors.canvas,
    ['--shop-surface' as string]: theme.colors.surface,
    ['--shop-surface-elevated' as string]: theme.colors.surfaceElevated,
    ['--shop-ink' as string]: theme.colors.ink,
    ['--shop-ink-muted' as string]: theme.colors.inkMuted,
    ['--shop-border' as string]: theme.colors.border,
    ['--shop-primary' as string]: theme.colors.primary,
    ['--shop-primary-hover' as string]: theme.colors.primaryHover,
    ['--shop-accent' as string]: theme.colors.accent,
    ['--shop-success' as string]: theme.colors.success,
    ['--shop-warning' as string]: theme.colors.warning,
    ['--shop-danger' as string]: theme.colors.danger,
    ['--shop-page-gradient' as string]: theme.gradients.pageBackground,
    ['--shop-hero-surface' as string]: theme.gradients.heroSurface,
    ['--shop-promo-surface' as string]: theme.gradients.promoSurface,
    ['--shop-footer-surface' as string]: theme.gradients.footerSurface,
    ['--shop-header-surface' as string]: theme.chrome.headerSurface,
    ['--shop-sidebar-surface' as string]: theme.chrome.sidebarSurface,
    ['--shop-card-radius' as string]: theme.chrome.cardRadius,
    ['--shop-shadow-soft' as string]: theme.chrome.shadowSoft,
    ['--shop-shadow-strong' as string]: theme.chrome.shadowStrong,
    ['--shop-discount' as string]: theme.commerce.discount,
    ['--shop-deal' as string]: theme.commerce.deal,
    ['--shop-free-delivery' as string]: theme.commerce.freeDelivery,
    ['--shop-trust' as string]: theme.commerce.trust,
    ['--shop-hero-overlay-opacity' as string]: theme.imagery.heroOverlayOpacity,
    ['--shop-fallback-tint' as string]: theme.imagery.fallbackTint,
    ['--shop-promo-treatment' as string]: theme.imagery.promoBannerTreatment,
    ['--shop-seasonal-badge' as string]: `"${theme.seasonal.badgeText}"`,
    ['--shop-seasonal-accent-wash' as string]: theme.seasonal.accentWash ?? 'rgba(0,0,0,0.04)',
  }
}
