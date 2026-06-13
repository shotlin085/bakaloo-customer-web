'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, MapPin, Menu, RotateCcw, Store, UserRound, X } from 'lucide-react'
import { HeaderCartButton } from './HeaderCartButton'
import { HeaderWishlistButton } from './HeaderWishlistButton'
import { SearchBar } from './SearchBar'
import { LocationModal } from '@/components/store/LocationModal'
import { SHOPFRONT_HEADER_LINKS, SHOPFRONT_VALUE_BAR } from '@/lib/shopfront/shopfront-content'
import { useAuthStore } from '@/store/auth.store'
import { useAddressStore } from '@/store/address.store'
import { useStoreContext } from '@/store/store.context'
import { keys, STALE } from '@/lib/queryKeys'
import { addressesService } from '@/services/addresses.service'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/address.types'

export function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const activeAddressId = useAddressStore((state) => state.activeAddressId)
  const activeAddress = useAddressStore((state) => state.activeAddress)
  const setActiveAddress = useAddressStore((state) => state.setActiveAddress)
  const clearAddress = useAddressStore((state) => state.clearAddress)

  // Store context — show allocated store name + ETA in the location pill
  const allocatedStoreName = useStoreContext((s) => s.allocatedStoreName)
  const deliveryEta = useStoreContext((s) => s.deliveryEta)
  const selectedPincode = useStoreContext((s) => s.selectedPincode)
  const isResolving = useStoreContext((s) => s.isResolving)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: keys.addresses(),
    queryFn: () => addressesService.getAll(),
    staleTime: STALE.addresses,
    enabled: isLoggedIn,
  })

  // Derive header location display:
  // Priority: allocated store > active address > prompt
  const hasStore = Boolean(allocatedStoreName)
  const addressTitle = hasStore
    ? allocatedStoreName!
    : activeAddress
      ? `${activeAddress.city}, ${activeAddress.state}`
      : 'Set delivery location'
  const addressLine = hasStore
    ? selectedPincode
      ? `${selectedPincode}${deliveryEta ? ` · ${deliveryEta} min` : ''}`
      : deliveryEta
        ? `Delivery in ${deliveryEta} min`
        : 'Tap to change location'
    : activeAddress
      ? activeAddress.address_line1
      : 'Choose your delivery area'

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
    if (activeAddress?.id !== preferred.id) setActiveAddress(preferred)
  }, [activeAddress?.id, activeAddressId, addresses, clearAddress, isLoggedIn, setActiveAddress])

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (moreOpen && moreMenuRef.current && !moreMenuRef.current.contains(target)) setMoreOpen(false)
      if (mobileOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [mobileOpen, moreOpen])

  return (
    <>
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

          {/* Location + Store pill — opens LocationModal on click */}
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="hidden min-w-[248px] items-center gap-3 rounded-[18px] border border-[rgba(17,24,39,0.10)] bg-white px-4 py-3 text-left transition-colors hover:border-[rgba(17,24,39,0.16)] lg:flex"
            aria-label="Change delivery location"
          >
            <span className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              hasStore
                ? 'bg-[rgba(34,197,94,0.10)] text-green-600'
                : 'bg-[rgba(54,150,110,0.08)] text-[color:var(--shop-success)]'
            )}>
              {hasStore
                ? <Store className="h-[18px] w-[18px]" strokeWidth={1.9} />
                : <MapPin className="h-[18px] w-[18px]" strokeWidth={1.9} />
              }
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 truncate">
                <span className="block truncate text-[15px] font-semibold leading-tight text-[color:var(--shop-ink)]">
                  {isResolving ? 'Checking location…' : addressTitle}
                </span>
                {hasStore && deliveryEta && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                    <Clock className="h-3 w-3" />
                    {deliveryEta}m
                  </span>
                )}
              </span>
              <span className="mt-1 block truncate text-[13px] leading-tight text-[color:var(--shop-ink-muted)]">
                {addressLine}
              </span>
            </span>
          </button>

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
                onClick={() => { setMobileOpen(false); setMoreOpen((v) => !v) }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-ink)] transition-colors hover:bg-[rgba(17,24,39,0.04)]"
                aria-label={moreOpen ? 'Close menu' : 'Open menu'}
              >
                {moreOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full z-[240] mt-3 w-[248px] rounded-[16px] border border-[rgba(17,24,39,0.08)] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.10)]">
                  <div className="grid gap-1">
                    {['Browse categories:/categories','Orders:/orders','Profile:/profile','Wallet:/wallet'].map((item) => {
                      const [label, href = '/'] = item.split(':')
                      return (
                        <Link key={href} href={href} onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB] hover:text-[color:var(--shop-primary)]">
                          {label}
                        </Link>
                      )
                    })}
                    {!isLoggedIn && (
                      <Link href="/login" onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB]">Login</Link>
                    )}
                    <Link href={SHOPFRONT_VALUE_BAR.helpHref} onClick={() => setMoreOpen(false)} className="rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB]">
                      {SHOPFRONT_VALUE_BAR.helpLabel}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setMoreOpen(false); setMobileOpen((v) => !v) }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--shop-ink)] transition-colors hover:bg-[rgba(17,24,39,0.04)] lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
          </div>
        </div>

        <div className="border-t border-[rgba(17,24,39,0.05)] px-4 py-3 lg:hidden">
          {/* Mobile location pill */}
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="mb-3 flex w-full items-center gap-2 rounded-xl border border-[rgba(17,24,39,0.08)] bg-gray-50/80 px-3 py-2 text-left"
          >
            {hasStore
              ? <Store className="h-4 w-4 shrink-0 text-green-600" strokeWidth={1.8} />
              : <MapPin className="h-4 w-4 shrink-0 text-[color:var(--shop-success)]" strokeWidth={1.8} />
            }
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[color:var(--shop-ink)]">
                {isResolving ? 'Checking…' : addressTitle}
              </span>
              {hasStore && deliveryEta && (
                <span className="block text-[11px] text-green-600">{deliveryEta} min delivery</span>
              )}
            </span>
            {hasStore && (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Live</span>
            )}
          </button>

          <SearchBar />

          {mobileOpen && (
            <div ref={mobileMenuRef} className="mt-3 rounded-[16px] border border-[rgba(17,24,39,0.08)] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <div className="grid gap-1">
                {SHOPFRONT_HEADER_LINKS.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB]">
                    {item.label}
                  </Link>
                ))}
                {['Browse categories:/categories','Wishlist:/wishlist','Orders:/orders','Wallet:/wallet'].map((item) => {
                  const [label, href = '/'] = item.split(':')
                  return (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB]">
                      {label}
                    </Link>
                  )
                })}
                {!isLoggedIn && (
                  <Link href="/new-user-setup" onClick={() => setMobileOpen(false)} className="rounded-[12px] px-3 py-3 text-[15px] font-medium text-[color:var(--shop-ink)] hover:bg-[#F7F5FB]">
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Location picker modal — opened from both desktop + mobile pills */}
      <LocationModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </>
  )
}
