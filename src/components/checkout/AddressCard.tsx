import { Briefcase, CheckCircle2, Home, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/address.types'

interface AddressCardProps {
    address: Address
    selected: boolean
    onSelect: () => void
}

export function AddressCard({ address, selected, onSelect }: AddressCardProps) {
    const LabelIcon = getAddressIcon(address.label)

    return (
        <button
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'group flex w-full items-start gap-4 rounded-[24px] border-2 p-5 text-left transition-all duration-200',
                selected
                    ? 'border-green-600 bg-green-50/70 shadow-[0_14px_28px_rgba(22,163,74,0.12)]'
                    : 'border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
            )}
            type="button"
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-200">
                <LabelIcon className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {address.label && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                            {address.label}
                        </span>
                    )}
                    {selected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                            Selected
                        </span>
                    )}
                </div>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">
                    {address.address_line1}
                    {address.address_line2 ? `, ${address.address_line2}` : ''}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    {address.city}, {address.state} - {address.pincode}
                </p>
            </div>

            <div className="hidden shrink-0 self-center text-xs font-medium text-slate-400 sm:block">
                {selected ? 'Selected' : 'Tap to select'}
            </div>
        </button>
    )
}

function getAddressIcon(label?: string) {
    const normalized = (label ?? '').toLowerCase()

    if (normalized === 'home') return Home
    if (normalized === 'work') return Briefcase
    return MapPin
}
