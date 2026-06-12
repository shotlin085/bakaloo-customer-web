import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Download,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Twitter,
  Youtube,
} from 'lucide-react'
import { FooterNewsletter } from './FooterNewsletter'
import {
  SHOPFRONT_APP_DOWNLOADS,
  SHOPFRONT_FOOTER_CONTACT,
  SHOPFRONT_FOOTER_GROUPS,
  SHOPFRONT_PAYMENT_BADGES,
  SHOPFRONT_SOCIAL_LINKS,
  SHOPFRONT_TRUST_BADGES,
} from '@/lib/shopfront/shopfront-content'

const SOCIAL_ICONS = {
  Instagram,
  Facebook,
  Twitter,
  YouTube: Youtube,
} as const

export function ShopFooter() {
  return (
    <footer className="footer-layered-surface mt-auto overflow-hidden px-4 py-0 text-white sm:px-5 lg:px-6">
      <FooterNewsletter />

      <div className="grid gap-10 pb-10 lg:grid-cols-[1.08fr_2.45fr]">
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/72">
              Premium grocery commerce
            </p>
            <h2 className="mt-2 bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(216,253,231,0.92)_62%,rgba(110,231,183,0.82)_100%)] bg-clip-text text-[32px] font-bold tracking-tight text-transparent">
              {SHOPFRONT_FOOTER_CONTACT.brand}
            </h2>
            <p className="mt-3 max-w-[360px] text-sm leading-6 text-white/80">
              {SHOPFRONT_FOOTER_CONTACT.tagline}
            </p>
          </div>

          <div className="space-y-2.5 text-sm text-white/80">
            <p className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {SHOPFRONT_FOOTER_CONTACT.email}
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {SHOPFRONT_FOOTER_CONTACT.phone}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {SHOPFRONT_FOOTER_CONTACT.address}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {SHOPFRONT_SOCIAL_LINKS.map((item) => {
              const Icon = SOCIAL_ICONS[item.label as keyof typeof SOCIAL_ICONS]

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/6 text-white/85 transition-all hover:-translate-y-0.5 hover:border-emerald-300/40 hover:bg-emerald-400/12 hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </a>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SHOPFRONT_TRUST_BADGES.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-200" strokeWidth={1.8} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
          {SHOPFRONT_FOOTER_GROUPS.filter((group) => group.title !== 'Get the App').map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/78">
                {group.title}
              </h3>
              <div className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <FooterLink
                    key={`${group.title}-${link.label}`}
                    link={link}
                    className="group flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-emerald-300 transition-all group-hover:w-3" />
                    <span className="underline-offset-4 group-hover:underline">{link.label}</span>
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/78">
              Get the App
            </h3>
            <div className="mt-4 space-y-3">
              {SHOPFRONT_APP_DOWNLOADS.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/7 px-4 py-3 transition-all hover:border-emerald-300/30 hover:bg-white/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
                    {index === 0 ? (
                      <Smartphone className="h-5 w-5" strokeWidth={1.8} />
                    ) : (
                      <Download className="h-5 w-5" strokeWidth={1.8} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.16em] text-white/48">
                      {item.caption}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-white/88">{item.label}</span>
                  </span>
                </a>
              ))}

              <div className="rounded-2xl border border-emerald-300/14 bg-emerald-400/8 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-100">
                    <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Early access coming</p>
                    <p className="mt-1 text-xs leading-5 text-white/62">
                      Mobile ordering, reorders, and live basket updates are in progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.14)_20%,rgba(110,231,183,0.34)_50%,rgba(255,255,255,0.14)_80%,rgba(255,255,255,0)_100%)]" />

      <div className="flex flex-col gap-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-white/62">© {new Date().getFullYear()} Bakaloo. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-2">
          {SHOPFRONT_PAYMENT_BADGES.map((item) => (
            <span
              key={item}
              className="inline-flex h-8 items-center rounded-md border border-white/12 bg-white/7 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/76"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="inline-flex items-center gap-1.5 text-white/50">
          Made with <Heart className="h-3.5 w-3.5 fill-current text-rose-300" /> in Kolkata, India
        </p>
      </div>
    </footer>
  )
}

function FooterLink({
  link,
  className,
  children,
}: {
  link: {
    label: string
    href: string
    external?: boolean
  }
  className: string
  children: ReactNode
}) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  )
}
