'use client'

import { Banknote, CheckCircle2, CreditCard, ShieldCheck, Wallet } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { PaymentMethodCard } from './PaymentMethodCard'
import { TrustBadge } from './TrustBadge'
import type { PaymentMethod } from '@/types/order.types'

interface PaymentStepProps {
    selected: PaymentMethod
    onSelect: (method: PaymentMethod) => void
    total: number
    walletBalance: number
    deliveryNotes: string
    onDeliveryNotesChange: (value: string) => void
    walletBalanceLoading?: boolean
}

export function PaymentStep({
    selected,
    onSelect,
    total,
    walletBalance,
    deliveryNotes,
    onDeliveryNotesChange,
    walletBalanceLoading = false,
}: PaymentStepProps) {
    const walletInsufficient = walletBalance < total
    const walletSubtext = walletBalanceLoading
        ? 'Checking wallet balance...'
        : walletInsufficient
            ? `Insufficient balance - Add ${formatINR(total - walletBalance)} more`
            : `Balance: ${formatINR(walletBalance)}`

    return (
        <div className="space-y-5">
            <div>
                <p className="text-sm font-semibold text-slate-950">Select payment method</p>
                <p className="mt-1 text-sm text-slate-500">
                    Pick the option that feels safest and fastest for you.
                </p>
            </div>

            <div className="space-y-3">
                <PaymentMethodCard
                    icon={CreditCard}
                    label="Pay Online"
                    subtext="UPI, Cards, Net Banking"
                    badge="Recommended"
                    selected={selected === 'ONLINE'}
                    onSelect={() => onSelect('ONLINE')}
                />

                <PaymentMethodCard
                    icon={Banknote}
                    label="Cash on Delivery"
                    subtext={
                        total > 2000
                            ? 'Cash on delivery is available up to ₹2,000 only'
                            : 'Pay in cash when your order arrives'
                    }
                    selected={selected === 'COD'}
                    onSelect={() => onSelect('COD')}
                    disabled={total > 2000}
                />

                <PaymentMethodCard
                    icon={Wallet}
                    label="Wallet"
                    subtext={walletSubtext}
                    selected={selected === 'WALLET'}
                    onSelect={() => onSelect('WALLET')}
                    disabled={walletBalanceLoading || walletInsufficient}
                />
            </div>

            <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3">
                <TrustBadge
                    icon={ShieldCheck}
                    label="100% Secure Payment"
                    subtext="Protected from start to finish"
                />
                <TrustBadge
                    icon={CheckCircle2}
                    label="PCI DSS Compliant"
                    subtext="Trusted payment infrastructure"
                />
                <TrustBadge
                    icon={CreditCard}
                    label="256-bit SSL Encryption"
                    subtext="Encrypted checkout session"
                />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Delivery Notes <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                    value={deliveryNotes}
                    onChange={(event) => onDeliveryNotesChange(event.target.value)}
                    maxLength={200}
                    placeholder="Leave at the door, ring the bell..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    rows={2}
                />
                <p className="mt-2 text-right text-[10px] text-slate-400">{deliveryNotes.length}/200</p>
            </div>
        </div>
    )
}
