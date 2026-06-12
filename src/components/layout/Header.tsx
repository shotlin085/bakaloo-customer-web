'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Menu, RotateCcw, UserRound, X } from 'lucide-react'
import { HeaderCartButton } from './HeaderCartButton'
import { HeaderWishlistButton } from './HeaderWishlistButton'
import { SearchBar } from './SearchBar'
import { SHOPFRONT_HEADER_LINKS, SHOPFRONT_VALUE_BAR } from '@/lib/shopfront/shopfront-content'
import { useAuthStore } from '@/store/auth.store'
import { useAddressStore } from '@/store/address.store'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { addressesService } from '@/services/addresses.service'
import { cn } from '@/lib/utils'

export function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const activeAddressId = useAddressStore((state) => state.activeAddressId)
  const activeAddress = useAddressStore((state) => state.activeAddress)
  const setActiveAddress = useAddressStore((state) => state.setActiveAddress)
  const clearAddress = useAddressStore((state) => state.clearAddress)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const { data: addresses = [] } = useQuery({
    queryKey: QUERY_KEYS.addresses,
    queryFn: () => addressesService.getAll(),
    staleTime: STALE_TIMES.addresses,
    enabled: isLoggedIn,
  })

  const addressTitle = activeAddress
    ? `${activeAddress.city}, ${activeAddress.state}`
    : 'Set delivery address'
  const addressLine = activeAddress
    ? activeAddress.address_line1
    : 'Choose your default location'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 42)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      clearAddress()
      return
    }

    if (addresses.length === 0) return

    const preferred =
      addresses.find((address) => address.id === activeAddressId) ??
      addresses.find((address) => address.is_default) ??
      addresses[0]

    if (!preferred) return

    if (activeAddress?.id !== preferred.id) {
      setActiveAddress(preferred)
    }
  }, [activeAddress?.id, activeAddressId, addresses, clearAddress, isLoggedIn, setActiveAddress])

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (moreOpen && moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setMoreOpen(false)
      }
      if (mobileOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [mobileOpen, moreOpen])

  return (
    <header
      className={cn(
        'border-b border-[rgba(17,24,39,0.06)] bg-white transition-all duration-200',
        scrolled && 'shadow-[0_10px_24px_rgba(15,23,42,0.05)]',
      )}
    >
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:gap-5 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-[32px] font-extrabold leading-none tracking-[-0.05em] text-[color:var(--shop-primary)] lg:text-[38px]"
          aria-label="Go to homepage"
        >
          Bakaloo
        </Link>

        <Link
          href="/profile/addresses"
          className="hidden min-w-[248px] items-center gap-3 rounded-[18px] border border-[rgba(17,24,39,0.10)] bg-white px-4 py-3 text-left transition-colors hover:border-[rgba(17,24,39,0.16)] lg:flex"
          aria-label="Manage delivery address"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(54,150,110,0.08)] text-[color:var(--shop-success)]">
            <MapPin className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-tight text-[color:var(--shop-ink)]">
              {addressTitle}
            </span>
            <span className="mt-1 block truncate text-[13px] leading-tight text-[color:var(--shop-ink-muted)]">
              {addressLine}
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">
            <Link
              href={isLoggedIn ? '/profile' : '/login'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-success)] transition-colors hover:bg-[rgba(54,150,110,0.08)]"
              aria-label={isLoggedIn ? 'Profile' : 'Login'}
            >
              <UserRound className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </Link>
          </div>

          <div className="hidden lg:block">
            <Link
              href="/orders"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-ink)] transition-colors hover:bg-[rgba(17,24,39,0.04)] hover:text-[color:var(--shop-primary)]"
              aria-label="Orders and activity"
            >
              <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.9} />
              <span className="absolute left-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--shop-accent)] px-1 text-[10px] font-bold leading-none text-[#241D05]">
                0
              </span>
            </Link>
          </div>

          <div className="lg:hidden">
            <HeaderWishlistButton />
          </div>
          <div className="hidden lg:block">
            <HeaderWishlistButton />
          </div>
          <HeaderCartButton />

          <div className="relative hidden lg:block" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                setMoreOpen((value) => !value)
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-ink)] transition-colors hover:bg-[rgba(17,24,39,0.04)] hover:text-[color:var(--shop-primary)]"
              aria-label={moreOpen ? 'Close menu' : 'Open menu'}
            >
              {moreOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full z-[240] mt-3 w-[248px] rounded-[16px] border border-[rgba(17,24,39,0.08)] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.10)]">
                <div className="grid gap-1">
                  <Link href="/categories" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                    Browse categories
                  </Link>
                  <Link href="/orders" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                    Orders
                  </Link>
                  <Link href="/profile" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                    Profile
                  </Link>
                  <Link href="/wallet" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                    Wallet
                  </Link>
                  {!isLoggedIn && (
                    <>
                      <Link href="/login" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                        Login
                      </Link>
                      <Link href="/new-user-setup" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                        Sign Up
                      </Link>
                    </>
                  )}
                  <Link href={SHOPFRONT_VALUE_BAR.helpHref} onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                    {SHOPFRONT_VALUE_BAR.helpLabel}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false)
              setMobileOpen((value) => !value)
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-ink)] transition-colors hover:bg-[rgba(17,24,39,0.04)] lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div className="border-t border-[rgba(17,24,39,0.05)] px-4 py-3 lg:hidden">
        <SearchBar />

        {mobileOpen && (
          <div ref={mobileMenuRef} className="mt-3 rounded-[16px] border border-[rgba(17,24,39,0.08)] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="grid gap-1">
              {SHOPFRONT_HEADER_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/categories"
                onClick={() => setMobileOpen(false)}
                className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
              >
                Browse categories
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
              >
                Wishlist
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
              >
                Orders
              </Link>
              <Link
                href="/wallet"
                onClick={() => setMobileOpen(false)}
                className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
              >
                Wallet
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/new-user-setup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] transition-colors hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
