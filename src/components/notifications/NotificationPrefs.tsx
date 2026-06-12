'use client'

import { useState } from 'react'
import { CreditCard, Megaphone, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import type { LucideIcon } from 'lucide-react'

interface PrefItem {
    key: string
    label: string
    icon: LucideIcon
    locked?: boolean
}

const PREFS: PrefItem[] = [
    { key: 'ORDER_STATUS', label: 'Order Updates', icon: Package },
    { key: 'PAYMENT', label: 'Payment Alerts', icon: CreditCard, locked: true },
    { key: 'PROMOTION', label: 'Promotions & Offers', icon: Megaphone },
    { key: 'DELIVERY', label: 'Delivery Updates', icon: Truck },
]

interface NotificationPrefsProps {
    preferences: Record<string, boolean>
    onToggle: (key: string, value: boolean) => Promise<void>
}

export function NotificationPrefs({ preferences, onToggle }: NotificationPrefsProps) {
    const [local, setLocal] = useState(preferences)

    const handleToggle = async (key: string, value: boolean) => {
        setLocal((prev) => ({ ...prev, [key]: value }))
        try {
            await onToggle(key, value)
        } catch {
            setLocal((prev) => ({ ...prev, [key]: !value }))
            toast.error('Failed to update')
        }
    }

    return (
        <div className="space-y-1">
            {PREFS.map((pref) => (
                <div key={pref.key} className="flex items-center justify-between rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                        <pref.icon className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-700">{pref.label}</span>
                    </div>
                    <Switch
                        checked={local[pref.key] ?? true}
                        onCheckedChange={(value) => void handleToggle(pref.key, value)}
                        disabled={pref.locked}
                    />
                </div>
            ))}
        </div>
    )
}
