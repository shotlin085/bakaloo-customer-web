'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="flex flex-col items-center justify-center px-6 py-20">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <AlertTriangle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="mb-1 text-lg font-bold text-gray-900">Something went wrong</h2>
                    <p className="mb-6 max-w-xs text-center text-sm text-gray-500">
                        An unexpected error occurred. Please try again.
                    </p>
                    <button
                        type="button"
                        onClick={this.handleRetry}
                        className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-500"
                    >
                        <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                        Try Again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
