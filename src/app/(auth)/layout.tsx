import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex bg-[var(--shop-page-gradient)]">
            {/* Left — Branding panel (hidden on mobile) */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-[480px] shop-hero-surface">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
                <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-8 w-40 h-40 bg-white/5 rounded-full" />

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Bakaloo</span>
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-extrabold leading-tight">
                            Fresh groceries,<br />
                            delivered in<br />
                            <span className="text-white/80">minutes.</span>
                        </h2>
                        <p className="text-white/70 text-lg max-w-xs leading-relaxed">
                            Order from 1000+ products. Delivered fresh to your doorstep.
                        </p>
                        <div className="flex gap-6 text-sm text-white/60">
                            <div>
                                <p className="text-2xl font-bold text-white">1000+</p>
                                <p>Products</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div>
                                <p className="text-2xl font-bold text-white">30 min</p>
                                <p>Delivery</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div>
                                <p className="text-2xl font-bold text-white">₹0</p>
                                <p>Above ₹299</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} Bakaloo. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right — Auth form */}
            <div className="flex flex-1 items-center justify-center bg-transparent p-6">
                <div className="w-full max-w-[420px]">
                    {/* Mobile-only brand header */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">Bakaloo</span>
                        </Link>
                        <p className="text-sm text-gray-500 mt-2">Fresh groceries, delivered fast</p>
                    </div>

                    {/* Auth card */}
                    <div className="rounded-[28px] border border-[color:var(--shop-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,239,0.98)_100%)] p-8 shadow-[var(--shop-shadow-soft)]">
                        {children}
                    </div>

                    <p className="mt-6 text-center text-xs text-[color:var(--shop-ink-muted)]">
                        By continuing, you agree to our{' '}
                        <span className="cursor-pointer text-[color:var(--shop-ink)] hover:underline">Terms of Service</span>{' '}
                        and{' '}
                        <span className="cursor-pointer text-[color:var(--shop-ink)] hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
