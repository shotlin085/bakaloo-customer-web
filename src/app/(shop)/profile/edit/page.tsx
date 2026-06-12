'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, Camera } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { profileSchema } from '@/lib/validations'
import { formatPhone } from '@/lib/utils'

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const updateUser = useAuthStore((s) => s.updateUser)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url ?? null)

    const initialValues = useMemo<ProfileFormValues>(
        () => ({
            name: user?.name ?? '',
            email: user?.email ?? '',
            birthday: user?.birthday ?? undefined,
        }),
        [user?.birthday, user?.email, user?.name],
    )

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialValues,
    })

    useEffect(() => {
        reset(initialValues)
        setAvatarPreview(user?.avatar_url ?? null)
    }, [initialValues, reset, user?.avatar_url])

    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploadingAvatar(true)

        try {
            const result = await authService.uploadAvatar(file)
            updateUser({ avatar_url: result.avatar_url })
            setAvatarPreview(result.avatar_url)
            toast.success('Profile photo updated')
        } catch {
            toast.error('Could not upload photo')
        } finally {
            setIsUploadingAvatar(false)
            event.target.value = ''
        }
    }

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            const updated = await authService.updateProfile({
                name: values.name,
                email: values.email || undefined,
                birthday: values.birthday || undefined,
            })

            updateUser(updated)
            toast.success('Profile updated successfully')
            router.back()
        } catch {
            toast.error('Could not update profile')
        }
    }

    const initials = user?.name?.charAt(0)?.toUpperCase() || 'U'

    return (
        <div className="page-enter mx-auto max-w-lg px-6 py-6">
            <div className="mb-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>

            <div className="mb-6 flex flex-col items-center">
                <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                        <AvatarImage src={avatarPreview ?? undefined} alt={user?.name ?? 'User'} />
                        <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <label
                        className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-700"
                        aria-label="Change profile picture"
                    >
                        {isUploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <Camera className="h-4 w-4" strokeWidth={1.5} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={isUploadingAvatar}
                        />
                    </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">Change Photo</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                        {...register('name')}
                        className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        placeholder="Enter your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                        value={user?.phone ? formatPhone(user.phone) : ''}
                        readOnly
                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500 outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email (optional)</label>
                    <input
                        {...register('email')}
                        className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-green-500 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}
