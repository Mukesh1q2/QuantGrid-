'use client'

import { useConnectionStatus, ConnectionStatus } from '@/lib/realtime/RealtimeService'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SignalIcon,
    SignalSlashIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

interface ConnectionIndicatorProps {
    showDetails?: boolean
    compact?: boolean
}

export function ConnectionIndicator({ showDetails = true, compact = false }: ConnectionIndicatorProps) {
    const { status, latency, lastUpdate } = useConnectionStatus()

    const statusConfig: Record<ConnectionStatus, {
        color: string
        bgColor: string
        text: string
        icon: typeof SignalIcon
        pulse: boolean
    }> = {
        connected: {
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            text: 'Live',
            icon: SignalIcon,
            pulse: true
        },
        connecting: {
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'Connecting...',
            icon: ArrowPathIcon,
            pulse: false
        },
        disconnected: {
            color: 'text-gray-500 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            text: 'Offline',
            icon: SignalSlashIcon,
            pulse: false
        },
        error: {
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            text: 'Error',
            icon: ExclamationTriangleIcon,
            pulse: false
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    const formatLastUpdate = () => {
        if (!lastUpdate) return 'Never'
        const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
        if (seconds < 5) return 'just now'
        if (seconds < 60) return `${seconds}s ago`
        return `${Math.floor(seconds / 60)}m ago`
    }

    if (compact) {
        return (
            <div className={clsx(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                config.bgColor,
                config.color
            )}>
                <span className={clsx(
                    'w-2 h-2 rounded-full',
                    status === 'connected' ? 'bg-green-500' :
                        status === 'connecting' ? 'bg-yellow-500' :
                            status === 'error' ? 'bg-red-500' : 'bg-gray-400',
                    config.pulse && 'animate-pulse'
                )} />
                <span>{config.text}</span>
            </div>
        )
    }

    return (
        <motion.div
            className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg',
                config.bgColor
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Status Icon */}
            <div className="relative">
                <Icon className={clsx('h-5 w-5', config.color, status === 'connecting' && 'animate-spin')} />
                {config.pulse && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                )}
            </div>

            {/* Status Text */}
            <div className="flex items-center gap-2">
                <span className={clsx('font-medium text-sm', config.color)}>
                    {config.text}
                </span>

                {showDetails && status === 'connected' && (
                    <>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ⚡ {latency}ms
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ↻ {formatLastUpdate()}
                        </span>
                    </>
                )}
            </div>
        </motion.div>
    )
}

// Compact version for widget headers
export function WidgetConnectionBadge() {
    const { status } = useConnectionStatus()

    return (
        <span className={clsx(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
            status === 'connected'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : status === 'connecting'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        )}>
            <span className={clsx(
                'w-1.5 h-1.5 rounded-full',
                status === 'connected' ? 'bg-green-500 animate-pulse' :
                    status === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'
            )} />
            {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
        </span>
    )
}

// Toast notification for connection changes
export function useConnectionToast() {
    const { status } = useConnectionStatus()
    // Could integrate with a toast library like react-hot-toast
    // For now, just returns status for manual handling
    return { status }
}
