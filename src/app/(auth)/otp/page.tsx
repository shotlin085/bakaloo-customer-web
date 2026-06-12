'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { OTP_RESEND_SECONDS } from '@/lib/constants'
import { formatPhone } from '@/lib/utils'
import { toast } from 'sonner'

export default function OtpPage() {
    return (
        <Suspense fallback={<OtpPageSkeleton />}>
            <OtpContent />
        </Suspense>
    )
}

function OtpContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get('phone') ?? ''
    const redirect = searchParams.get('redirect') ?? '/'

    const { setUser } = useAuthStore()
    const [otp, setOtp] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState('')
    const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS)
    const [canResend, setCanResend] = useState(false)

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true)
            return
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown])

    // Auto-submit when 6 digits entered — pass value directly to avoid stale closure
    useEffect(() => {
        if (otp.length === 6) {
            // Small delay to ensure state is fully committed
            const timer = setTimeout(() => verifyOtp(otp), 100)
            return () => clearTimeout(timer)
        }
        return undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp])

    const verifyOtp = async (otpValue?: string) => {
        const code = otpValue ?? otp
        if (code.length !== 6 || isVerifying) return
        setIsVerifying(true)
        setError('')
        try {
            const result = await authService.verifyOtp(phone, code)
            localStorage.setItem('accessToken', result.accessToken)
            localStorage.setItem('refreshToken', result.refreshToken)
            document.cookie = `accessToken=${result.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
            setUser(result.user)

            if (result.isNewUser) {
                router.push('/profile/edit?new=true')
            } else {
                router.push(redirect)
            }
        } catch {
            setError('Incorrect OTP. Please try again.')
            setOtp('')
        } finally {
            setIsVerifying(false)
        }
    }

    const resendOtp = async () => {
        if (!canResend) return
        try {
            await authService.sendOtp(phone)
            setCountdown(OTP_RESEND_SECONDS)
            setCanResend(false)
            setError('')
            toast.success('New OTP sent!')
        } catch {
            toast.error('Could not resend OTP')
        }
    }

    if (!phone) {
        router.push('/login')
        return null
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/login?redirect=${encodeURIComponent(redirect)}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Change number
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
                <p className="text-sm text-gray-500 mt-1.5">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-gray-900">{formatPhone(phone)}</span>
                </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center py-2">
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifying}
                >
                    <InputOTPGroup className="gap-2.5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <InputOTPSlot
                                key={i}
                                index={i}
                                className="h-14 w-12 rounded-xl border-2 border-[color:var(--shop-border)] bg-gray-50 text-lg font-bold transition-all data-[active=true]:border-[color:var(--shop-primary)] data-[active=true]:bg-white data-[active=true]:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
                            />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {/* Verifying state */}
            {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-[color:var(--shop-primary)]" />
                    Verifying...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-center">
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg py-2.5 px-4 inline-block">
                        {error}
                    </p>
                </div>
            )}

            {/* Resend */}
            <div className="text-center text-sm">
                {canResend ? (
                    <button
                        onClick={resendOtp}
                        className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--shop-primary)] transition-colors hover:text-[color:var(--shop-primary-hover)]"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend OTP
                    </button>
                ) : (
                    <span className="text-gray-400">
                        Resend code in{' '}
                        <span className="text-gray-600 font-semibold tabular-nums">
                            0:{String(countdown).padStart(2, '0')}
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

function OtpPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="h-5 w-28 rounded bg-gray-100" />
                <div className="h-8 w-40 rounded bg-gray-100" />
                <div className="h-4 w-64 rounded bg-gray-100" />
            </div>
            <div className="flex justify-center gap-2.5">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-14 w-12 rounded-xl bg-gray-100" />
                ))}
            </div>
            <div className="mx-auto h-4 w-40 rounded bg-gray-100" />
        </div>
    )
}
