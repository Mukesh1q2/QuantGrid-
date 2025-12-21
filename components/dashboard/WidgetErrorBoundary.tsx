'use client'

import React, { Component, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
    children: ReactNode
    widgetName?: string
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export class WidgetErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[WidgetError] ${this.props.widgetName || 'Widget'}:`, error, errorInfo)

        this.setState({ errorInfo })

        // Call optional error handler
        this.props.onError?.(error, errorInfo)
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="h-full flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mb-3" />

                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                        Widget Error
                    </h3>

                    <p className="text-xs text-red-600 dark:text-red-500 text-center mb-3 max-w-[200px]">
                        {this.props.widgetName || 'This widget'} encountered an error
                    </p>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mb-3 w-full">
                            <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
                                Show details
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300 overflow-x-auto max-h-24 overflow-y-auto">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}

                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        <ArrowPathIcon className="h-3.5 w-3.5" />
                        Retry
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

// HOC for wrapping functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    widgetName?: string
) {
    return function WithErrorBoundary(props: P) {
        return (
            <WidgetErrorBoundary widgetName={widgetName}>
                <WrappedComponent {...props} />
            </WidgetErrorBoundary>
        )
    }
}
