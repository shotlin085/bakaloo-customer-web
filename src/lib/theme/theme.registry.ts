import type { ShopThemeConfig, ThemeKey } from './theme.types'
import { DEFAULT_PREMIUM_THEME, FESTIVAL_THEME, WINTER_THEME } from './theme.tokens'

export const SHOP_THEMES: Record<ThemeKey, ShopThemeConfig> = {
  'default-premium': DEFAULT_PREMIUM_THEME,
  winter: WINTER_THEME,
  festival: FESTIVAL_THEME,
}

export const DEFAULT_THEME_KEY: ThemeKey = 'default-premium'

export function isThemeKey(value: string | undefined | null): value is ThemeKey {
  return Boolean(value && value in SHOP_THEMES)
}

export function getShopTheme(themeKey?: string | null): ShopThemeConfig {
  if (isThemeKey(themeKey)) {
    return SHOP_THEMES[themeKey]
  }
  return SHOP_THEMES[DEFAULT_THEME_KEY]
}
