'use client'

import { Gift, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralCardProps {
    referralCode: string
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
    const referralUrl = `https://bakaloo.com/r/${referralCode}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode)
            toast.success('Referral code copied! 📋')
        } catch {
            toast.error('Could not copy code')
        }
    }

    const handleShare = async () => {
        const message = `Join Bakaloo! Use my code ${referralCode} for ₹50 off. ${referralUrl}`
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: 'Refer & Earn on Bakaloo',
                    text: message,
                    url: referralUrl,
                })
                return
            } catch {
                // Fallback to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(message)
            toast.success('Referral link copied')
        } catch {
            toast.error('Could not share referral code')
        }
    }

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10" />

            <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                    <Gift className="h-5 w-5" strokeWidth={1.5} />
                    <h3 className="text-base font-bold">Refer &amp; Earn</h3>
                </div>
                <p className="mb-4 text-sm text-white/90">
                    Share your code and get ₹50 off when they order.
                </p>

                <div className="mb-3 rounded-xl border border-dashed border-white/40 bg-white/15 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-white/80">Your referral code</p>
                    <p className="font-mono text-lg font-bold tracking-[0.15em]">{referralCode}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                    >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Copy Code
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/40 bg-white/15 px-3 text-xs font-bold text-white transition-colors hover:bg-white/25"
                    >
                        <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Share
                    </button>
                </div>
            </div>
        </section>
    )
}
