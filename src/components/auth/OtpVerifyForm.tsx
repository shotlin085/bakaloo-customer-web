'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface OtpVerifyFormProps {
    phone: string
    onVerify: (otp: string) => Promise<void>
    onResend: () => Promise<void>
    isVerifying: boolean
}

export function OtpVerifyForm({ phone, onVerify, onResend, isVerifying }: OtpVerifyFormProps) {
    const [otp, setOtp] = useState('')
    const [timer, setTimer] = useState(60)

    useEffect(() => {
        if (timer <= 0) return
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
        return () => clearInterval(interval)
    }, [timer])

    useEffect(() => {
        if (otp.length !== 6) return
        void onVerify(otp)
    }, [otp, onVerify])

    const handleResend = async () => {
        await onResend()
        setTimer(60)
        setOtp('')
    }

    return (
        <div className="space-y-4">
            <p className="text-center text-sm text-gray-500">
                Enter the 6-digit OTP sent to <span className="font-semibold text-gray-900">{phone}</span>
            </p>

            <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="· · · · · ·"
                className="w-full rounded-xl border border-gray-200 px-4 py-4 text-center text-2xl font-bold tracking-[12px] focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
            />

            {isVerifying && (
                <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                </div>
            )}

            <div className="text-center">
                {timer > 0 ? (
                    <p className="text-sm text-gray-400">Resend OTP in {timer}s</p>
                ) : (
                    <button onClick={() => void handleResend()} className="text-sm font-semibold text-green-600 hover:underline" type="button">
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    )
}
