'use client'

import { createContext, useContext, useMemo } from 'react'
import { resolveActiveTheme, themeToCssVars } from '@/lib/theme/theme.utils'
import type { ShopThemeConfig } from '@/lib/theme/theme.types'

const ShopThemeContext = createContext<ShopThemeConfig | null>(null)

export function ShopThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () => resolveActiveTheme(process.env.NEXT_PUBLIC_SHOP_THEME),
    [],
  )

  return (
    <ShopThemeContext.Provider value={theme}>
      <div
        data-shop-theme={theme.key}
        className="shop-theme-root min-h-screen text-[color:var(--shop-ink)]"
        style={themeToCssVars(theme)}
      >
        {children}
      </div>
    </ShopThemeContext.Provider>
  )
}

export function useShopTheme() {
  const value = useContext(ShopThemeContext)
  if (!value) {
    throw new Error('useShopTheme must be used within ShopThemeProvider')
  }
  return value
}
