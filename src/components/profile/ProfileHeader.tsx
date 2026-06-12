'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
    name?: string | null
    phone?: string | null
    avatarUrl?: string | null
    onAvatarUpload?: (file: File) => Promise<void>
}

export function ProfileHeader({ name, phone, avatarUrl, onAvatarUpload }: ProfileHeaderProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const initial = name?.[0]?.toUpperCase() ?? '?'

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !onAvatarUpload) return

        setIsUploading(true)
        try {
            await onAvatarUpload(file)
        } finally {
            setIsUploading(false)
            event.target.value = ''
        }
    }

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => fileRef.current?.click()}
                className="relative h-16 w-16 shrink-0 disabled:cursor-not-allowed"
                disabled={!onAvatarUpload || isUploading}
                type="button"
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={name ?? 'Avatar'}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                        {initial}
                    </div>
                )}

                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100',
                        isUploading && 'opacity-100',
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                        <Camera className="h-5 w-5 text-white" strokeWidth={1.5} />
                    )}
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </button>

            <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900">{name ?? 'User'}</h2>
                {phone && <p className="text-sm text-gray-500">{phone}</p>}
            </div>

            <Link
                href="/profile/edit"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
                Edit
            </Link>
        </div>
    )
}
