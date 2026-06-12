'use client'

import type { MouseEvent } from 'react'
import { Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
    title: string
    text: string
    url: string
    className?: string
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
    const handleShare = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        const fullUrl =
            typeof window !== 'undefined' ? new URL(url, window.location.origin).toString() : url

        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, text, url: fullUrl })
                return
            } catch {
                // Share cancelled/failed, fallback to clipboard.
            }
        }

        try {
            await navigator.clipboard.writeText(fullUrl)
            toast.success('Link copied!')
        } catch {
            toast.info(`Share this link: ${fullUrl}`)
        }
    }

    return (
        <motion.button
            type="button"
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm backdrop-blur transition-all hover:bg-blue-50 hover:text-blue-500',
                className,
            )}
            aria-label="Share this product"
        >
            <Share2 className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
    )
}
