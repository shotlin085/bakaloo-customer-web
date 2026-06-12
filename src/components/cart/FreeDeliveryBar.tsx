'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Sparkles, Truck } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface FreeDeliveryBarProps {
    subtotal: number
    threshold: number
}

export function FreeDeliveryBar({ subtotal, threshold }: FreeDeliveryBarProps) {
    const reduceMotion = useReducedMotion()
    const remaining = Math.max(0, threshold - subtotal)
    const progress = Math.min(100, Math.round((subtotal / threshold) * 100))
    const prevSubtotal = useRef(subtotal)
    const [celebrating, setCelebrating] = useState(false)

    useEffect(() => {
        if (prevSubtotal.current < threshold && subtotal >= threshold) {
            setCelebrating(true)
        }
        prevSubtotal.current = subtotal
    }, [subtotal, threshold])

    useEffect(() => {
        if (!celebrating) return
        const timeout = window.setTimeout(() => setCelebrating(false), 2200)
        return () => window.clearTimeout(timeout)
    }, [celebrating])

    if (remaining <= 0) {
        return (
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[20px] border border-[rgba(22,101,52,0.14)] bg-[linear-gradient(135deg,#F8FFF9_0%,#F0FAF4_100%)] px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(134,239,172,0.28),transparent_42%)]" />
                <div className="relative flex items-center gap-3">
                    <motion.div
                        animate={
                            reduceMotion
                                ? undefined
                                : celebrating
                                    ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }
                                    : { scale: 1 }
                        }
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#166534] shadow-[0_10px_20px_rgba(22,101,52,0.12)]"
                    >
                        <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B8A75]">
                            Delivery unlocked
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#166534]">Free delivery unlocked!</p>
                            <motion.span
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : celebrating
                                            ? { scale: [1, 1.08, 1] }
                                            : { scale: 1 }
                                }
                                transition={{ duration: 0.8, repeat: celebrating ? 2 : 0 }}
                                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#166534]"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Basket perk active
                            </motion.span>
                        </div>
                        <p className="mt-2 text-xs font-medium text-[#4D7C5A]">
                            You crossed the {formatINR(threshold)} threshold. Delivery fee is now free.
                        </p>
                    </div>
                </div>

                <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-white/85">
                    <motion.div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#15803D_0%,#22C55E_45%,#86EFAC_100%)] shadow-[0_0_18px_rgba(34,197,94,0.25)]"
                        initial={reduceMotion ? false : { width: '82%' }}
                        animate={reduceMotion ? undefined : { width: '100%' }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[20px] border border-[rgba(232,183,78,0.18)] bg-[linear-gradient(180deg,#FFF9EF_0%,#F8F0E0_100%)] px-4 py-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
        >
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#B45309] shadow-[0_8px_18px_rgba(180,131,26,0.10)]">
                    <Truck className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A0711C]">
                        Free delivery progress
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#7C4A0B]">
                            Add {formatINR(remaining)} more for free delivery
                        </p>
                        <span className="text-xs font-semibold text-[#A0711C]">{progress}%</span>
                    </div>
                </div>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/85">
                <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#16A34A_0%,#22C55E_45%,#86EFAC_100%)] bg-[length:200%_100%]"
                    style={{ width: `${progress}%` }}
                    animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%'] }}
                    transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        </motion.div>
    )
}
