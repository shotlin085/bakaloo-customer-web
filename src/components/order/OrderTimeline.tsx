import { Check } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types/order.types'

interface TimelineEvent {
    status: OrderStatus
    timestamp?: string | null
}

interface OrderTimelineProps {
    currentStatus: OrderStatus
    events: TimelineEvent[]
}

const ALL_STEPS: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'PACKED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
]

const STEP_LABELS: Record<string, string> = {
    PENDING: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    PACKED: 'Packed',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
}

export function OrderTimeline({ currentStatus, events }: OrderTimelineProps) {
    const currentIdx = ALL_STEPS.indexOf(currentStatus)

    if (currentStatus === 'CANCELLED') {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
            </div>
        )
    }

    return (
        <div className="space-y-0">
            {ALL_STEPS.map((step, i) => {
                const isComplete = i <= currentIdx
                const isCurrent = i === currentIdx
                const event = events.find((entry) => entry.status === step)
                const isLast = i === ALL_STEPS.length - 1

                return (
                    <div key={step} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-full',
                                    isComplete && 'bg-green-500 text-white',
                                    isCurrent && 'ring-4 ring-green-100',
                                    !isComplete && 'border-2 border-gray-200 bg-white',
                                )}
                            >
                                {isComplete && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        'min-h-[24px] w-0.5 flex-1',
                                        isComplete ? 'bg-green-500' : 'bg-gray-200',
                                    )}
                                />
                            )}
                        </div>

                        <div className="pb-4">
                            <p
                                className={cn(
                                    'text-sm font-medium',
                                    isComplete ? 'text-gray-900' : 'text-gray-400',
                                )}
                            >
                                {STEP_LABELS[step] || step}
                            </p>
                            {event?.timestamp && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                    {formatDateTime(event.timestamp)}
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
