import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface WalletCardProps {
    balance: number
}

export function WalletCard({ balance }: WalletCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10">
                <div className="mb-1 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-white/80" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-white/80">Bakaloo Wallet</span>
                </div>

                <p className="mt-2 text-3xl font-extrabold">{formatINR(balance)}</p>
                <p className="mt-0.5 text-xs text-white/60">Available Balance</p>

                <Link
                    href="/wallet/add-money"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                    <Plus className="h-4 w-4" />
                    Add Money
                </Link>
            </div>
        </div>
    )
}
