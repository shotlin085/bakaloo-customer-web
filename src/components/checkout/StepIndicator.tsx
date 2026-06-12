import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
    steps: string[]
    currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 sm:gap-4">
                {steps.map((label, index) => {
                    const isComplete = index < currentStep
                    const isCurrent = index === currentStep
                    const isUpcoming = index > currentStep

                    return (
                        <div
                            key={label}
                            className={cn(
                                'flex min-w-0 flex-1 items-center',
                                index === steps.length - 1 && 'flex-none',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200',
                                        isComplete &&
                                            'border-green-600 bg-green-600 text-white shadow-[0_8px_18px_rgba(22,163,74,0.22)]',
                                        isCurrent &&
                                            'border-slate-950 bg-slate-950 text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)]',
                                        isUpcoming && 'border-slate-200 bg-white text-slate-400',
                                    )}
                                >
                                    {isComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
                                </div>

                                <div className="hidden sm:block">
                                    <p
                                        className={cn(
                                            'text-sm font-semibold transition-colors',
                                            isCurrent && 'text-slate-950',
                                            isComplete && 'text-green-700',
                                            isUpcoming && 'text-slate-400',
                                        )}
                                    >
                                        {label}
                                    </p>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="mx-3 flex-1 sm:mx-4">
                                    <div className="h-px rounded-full bg-slate-200">
                                        <div
                                            className={cn(
                                                'h-px rounded-full bg-green-600 transition-all duration-300',
                                                index < currentStep ? 'w-full' : 'w-0',
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:hidden">
                {steps.map((label, index) => (
                    <p
                        key={label}
                        className={cn(
                            'text-[11px] font-medium',
                            index === currentStep && 'text-slate-950',
                            index < currentStep && 'text-green-700',
                            index > currentStep && 'text-slate-400',
                        )}
                    >
                        {label}
                    </p>
                ))}
            </div>
        </div>
    )
}
