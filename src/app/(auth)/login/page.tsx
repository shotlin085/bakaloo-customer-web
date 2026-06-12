'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Phone, ArrowRight, Shield, Truck, Clock, Sparkles } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { phoneSchema } from '@/lib/validations'

const schema = z.object({ phone: phoneSchema })
type FormData = z.infer<typeof schema>

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = async ({ phone }: FormData) => {
        try {
            const fullPhone = `+91${phone}`
            await authService.sendOtp(fullPhone)
            const redirect = searchParams.get('redirect') ?? '/'
            router.push(
                `/otp?phone=${encodeURIComponent(fullPhone)}&redirect=${encodeURIComponent(redirect)}`,
            )
        } catch {
            toast.error('Could not send OTP. Please try again.')
        }
    }

    return (
        <div className="space-y-8">
            {/* Logo + Title */}
            <div>
                <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--shop-primary)]">
                        <span className="text-white font-extrabold text-lg">G</span>
                    </div>
                    <span className="text-xl font-extrabold text-gray-900 tracking-tight">BAKALOO</span>
                </div>
                <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight">
                    Fresh groceries,<br />delivered to your door
                </h1>
                <p className="text-sm text-gray-500 mt-2">
                    Enter your mobile number to get started
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Mobile Number
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-2xl border-2 border-[color:var(--shop-border)] transition-all focus-within:border-[color:var(--shop-primary)] focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.08)]">
                        <span className="flex select-none items-center gap-2 border-r border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            +91
                        </span>
                        <input
                            {...register('phone')}
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Enter 10-digit number"
                            autoFocus
                            autoComplete="tel"
                            className="flex-1 px-4 py-4 text-[15px] font-medium outline-none bg-white placeholder:text-gray-300 placeholder:font-normal tracking-widest"
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 animate-[shake_0.3s_ease-in-out]">
                            <span className="w-1 h-1 bg-red-500 rounded-full" />
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--shop-primary)] text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-all hover:bg-[color:var(--shop-primary-hover)] hover:shadow-[0_6px_24px_rgba(34,197,94,0.4)] active:scale-[0.98] disabled:opacity-60"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Send OTP
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Trust signals */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5 text-[color:var(--shop-primary)]" />
                    <span>Your number is safe and secure with us</span>
                </div>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
                    {[
                        { icon: Truck, label: '30 min delivery' },
                        { icon: Clock, label: 'Open 24/7' },
                        { icon: Sparkles, label: 'Fresh quality' },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Icon className="h-3.5 w-3.5 text-[color:var(--shop-primary)]" />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function LoginPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="h-10 w-32 rounded-xl bg-gray-100" />
                <div className="h-7 w-64 rounded bg-gray-100" />
                <div className="h-4 w-48 rounded bg-gray-100" />
            </div>
            <div className="space-y-5">
                <div className="h-[54px] w-full rounded-2xl bg-gray-100" />
                <div className="h-[54px] w-full rounded-xl bg-gray-100" />
            </div>
        </div>
    )
}
