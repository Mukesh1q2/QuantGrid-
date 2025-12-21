'use client'

import React, { Component, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    componentName?: string
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary component for graceful error handling in React
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo })

        // Log to console
        console.error('ErrorBoundary caught an error:', error)
        console.error('Error info:', errorInfo)

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                {this.props.componentName
                                    ? `Error in ${this.props.componentName}`
                                    : 'Something went wrong'}
                            </h3>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                                <details className="mt-3">
                                    <summary className="text-xs text-red-500 cursor-pointer hover:underline">
                                        Show error details
                                    </summary>
                                    <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto max-h-32">
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                            <button
                                onClick={this.handleRetry}
                                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                <span>Try Again</span>
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Loading Skeleton component for content placeholders
 */
interface SkeletonProps {
    className?: string
    variant?: 'text' | 'rectangular' | 'circular' | 'chart'
    width?: string | number
    height?: string | number
    count?: number
}

export function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
    count = 1
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded'

    const variantClasses = {
        text: 'h-4 rounded',
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        chart: 'rounded-xl'
    }

    const items = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                width: width || (variant === 'text' ? '100%' : undefined),
                height: height || (variant === 'text' ? 16 : undefined)
            }}
        />
    ))

    return count > 1 ? <div className="space-y-2">{items}</div> : items[0]
}

/**
 * Chart Loading Skeleton
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="text" width={150} height={24} />
                <div className="flex space-x-2">
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                </div>
            </div>

            {/* Chart area skeleton */}
            <div
                className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                style={{ height }}
            >
                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
                    <Skeleton variant="text" width={30} height={12} />
                    <Skeleton variant="text" width={30} height={12} />
                    <Skeleton variant="text" width={30} height={12} />
                    <Skeleton variant="text" width={30} height={12} />
                </div>

                {/* Bars/lines placeholder */}
                <div className="absolute inset-0 flex items-end justify-around px-12 pb-8">
                    {[0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.85, 0.45, 0.65, 0.75, 0.55, 0.8].map((h, i) => (
                        <div
                            key={i}
                            className="w-6 bg-gray-300 dark:bg-gray-600 rounded-t animate-pulse"
                            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-2 left-12 right-4 flex justify-between">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} variant="text" width={30} height={12} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Data Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="text" width={120} height={16} />
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="text" width={100} height={16} />
                </div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }, (_, i) => (
                <div
                    key={i}
                    className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                    <div className="flex space-x-4">
                        <Skeleton variant="text" width={100} height={14} />
                        <Skeleton variant="text" width={80} height={14} />
                        <Skeleton variant="text" width={120} height={14} />
                        <Skeleton variant="text" width={80} height={14} />
                        <Skeleton variant="text" width={100} height={14} />
                    </div>
                </div>
            ))}
        </div>
    )
}

/**
 * Metrics Cards Loading Skeleton
 */
export function MetricsCardsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center space-x-2 mb-3">
                        <Skeleton variant="circular" width={20} height={20} />
                        <Skeleton variant="text" width={60} height={12} />
                    </div>
                    <Skeleton variant="text" width={80} height={28} />
                </div>
            ))}
        </div>
    )
}

/**
 * Evaluation Page Full Skeleton
 */
export function EvaluationPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="text" width={300} height={16} className="mt-2" />
                </div>
                <Skeleton variant="rectangular" width={120} height={40} />
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center">
                        <Skeleton variant="circular" width={40} height={40} />
                        {i < 4 && <Skeleton variant="rectangular" width={60} height={2} className="mx-2" />}
                    </div>
                ))}
            </div>

            {/* Main content */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <Skeleton variant="text" width={150} height={24} className="mb-4" />
                <Skeleton variant="rectangular" width="100%" height={200} />
            </div>
        </div>
    )
}

export default ErrorBoundary
