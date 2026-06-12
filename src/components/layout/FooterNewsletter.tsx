'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { SHOPFRONT_NEWSLETTER } from '@/lib/shopfront/shopfront-content'

export function FooterNewsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('Enter your email to join the waitlist.')
      return
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    if (!isValidEmail) {
      toast.error('Enter a valid email address.')
      return
    }

    toast.info('Newsletter signup is launching soon. We will open this shortly.')
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.04)_45%,rgba(36,197,94,0.07)_100%)] p-6 shadow-[0_22px_48px_rgba(10,16,35,0.24)] backdrop-blur-xl sm:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(74,222,128,0.75)_0%,rgba(167,243,208,0.4)_38%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute left-0 top-0 h-full w-20 bg-[radial-gradient(circle_at_left,rgba(74,222,128,0.18),transparent_72%)]" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[540px]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              {SHOPFRONT_NEWSLETTER.eyebrow}
            </p>
            <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/90">
              {SHOPFRONT_NEWSLETTER.statusLabel}
            </span>
          </div>
          <h3 className="mt-3 bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(216,253,231,0.94)_65%,rgba(134,239,172,0.86)_100%)] bg-clip-text text-[28px] font-bold tracking-tight text-transparent sm:text-[32px]">
            {SHOPFRONT_NEWSLETTER.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/72">
            {SHOPFRONT_NEWSLETTER.subtitle}
          </p>
        </div>

        <form
          className="flex w-full max-w-[460px] flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="shop-newsletter-email">
            Email address
          </label>
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <input
              id="shop-newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={SHOPFRONT_NEWSLETTER.placeholder}
              className="h-12 w-full rounded-xl border border-white/14 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition-colors focus:border-emerald-300/40 focus:bg-white/12"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#16A34A_0%,#22C55E_48%,#34D399_100%)] px-7 text-sm font-bold text-white shadow-[0_18px_30px_rgba(34,197,94,0.22)] transition-all hover:brightness-110 hover:shadow-[0_22px_34px_rgba(34,197,94,0.28)]"
          >
            {SHOPFRONT_NEWSLETTER.ctaLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
