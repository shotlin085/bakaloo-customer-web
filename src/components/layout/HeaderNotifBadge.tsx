'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifStore } from '@/store/notif.store'

export function HeaderNotifBadge() {
    const unreadCount = useNotifStore((s) => s.unreadCount)

    return (
        <Link
            href="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-colors hover:border-[rgba(104,72,198,0.18)] active:scale-95"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <Bell className="h-[20px] w-[20px] text-[color:var(--shop-primary)]" strokeWidth={1.6} />
            <AnimatePresence>
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    )
}
