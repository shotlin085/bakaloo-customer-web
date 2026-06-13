'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keys } from '@/lib/queryKeys'
import { notificationsService } from '@/services/notifications.service'
import { timeAgo, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { EmptyStateCard, PageHeader, PageShell } from '@/components/shared'
import { Bell, CheckCheck, Package, CreditCard, Tag, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { Notification, NotificationType } from '@/types/notification.types'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const ICON_MAP: Record<NotificationType, typeof Package> = {
    ORDER_STATUS: Package,
    PAYMENT: CreditCard,
    PROMOTION: Tag,
    DELIVERY: Package,
    ADMIN_BROADCAST: Info,
    SYSTEM: Info,
}

export default function NotificationsPage() {
    const qc = useQueryClient()
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        document.title = 'Notifications — Bakaloo'
    }, [])

    const { data, isLoading } = useQuery({
        queryKey: keys.notifications(),
        queryFn: () => notificationsService.getAll(),
    })

    const markAllRead = useMutation({
        mutationFn: notificationsService.markAllRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: keys.notifications() })
            toast.success('All marked as read')
        },
    })

    const notifications = Array.isArray(data?.notifications) ? data.notifications : []
    const filteredNotifications =
        filter === 'unread'
            ? notifications.filter((notification) => !notification.is_read)
            : notifications
    const unreadCount = Number(data?.unreadCount ?? notifications.filter((n) => !n.is_read).length)

    const handleNotificationClick = async (notif: Notification) => {
        try {
            if (!notif.is_read) {
                await notificationsService.markAsRead(notif.id)
                qc.invalidateQueries({ queryKey: keys.notifications() })
            }
        } catch {
            toast.error('Could not open notification')
            return
        }

        const payload = (notif.data ?? {}) as Record<string, unknown>
        const orderId = String(payload.orderId ?? payload.order_id ?? '')

        switch (notif.type) {
            case 'ORDER_STATUS':
            case 'DELIVERY':
                if (orderId) router.push(`/orders/${orderId}`)
                break
            case 'PAYMENT':
                router.push('/wallet')
                break
            case 'PROMOTION':
                router.push('/products?sort=popular')
                break
            default:
                break
        }
    }

    if (isLoading) {
        return (
            <div className="px-6 py-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        )
    }

    return (
        <PageShell spacing="relaxed">
            <PageHeader
                eyebrow="Inbox"
                title="Notifications"
                subtitle="Track operational updates, delivery signals, payments, and promotions in one feed."
                actions={unreadCount > 0 ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllRead.mutate()}
                        className="text-brand-500 border-brand-200"
                    >
                        <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
                    </Button>
                ) : null}
            />

            <div className="shop-surface-soft flex gap-1 rounded-[22px] p-1.5">
                {(['all', 'unread'] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={cn(
                            'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                            filter === f ? 'bg-white text-[color:var(--shop-ink)] shadow-sm' : 'text-[color:var(--shop-ink-muted)] hover:text-[color:var(--shop-ink)]',
                        )}
                    >
                        {f === 'all' ? 'All' : 'Unread'}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <EmptyStateCard
                    icon={Bell}
                    title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    subtitle={filter === 'unread' ? 'You are all caught up.' : "You're all caught up."}
                />
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notif) => {
                        const Icon = ICON_MAP[notif.type] ?? Info
                        return (
                            <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleNotificationClick(notif)}
                                className={cn(
                                    'flex w-full items-start gap-3 rounded-[22px] border p-4 text-left transition-colors',
                                    notif.is_read
                                        ? 'bg-white/92 border-[color:var(--shop-border)] hover:bg-gray-50'
                                        : 'bg-[var(--shop-seasonal-accent-wash)] border-[color:var(--shop-border)] hover:bg-[#eef8f0]',
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-sm', notif.is_read ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                                </div>
                                {!notif.is_read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[color:var(--shop-primary)]" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </PageShell>
    )
}
