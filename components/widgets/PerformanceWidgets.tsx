'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CpuChipIcon,
    ChartBarIcon,
    ClockIcon,
    CubeIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BoltIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
    usePerformance,
    getRenderMetrics,
    useFPS,
    useMemoryUsage,
    WidgetSkeleton
} from '@/lib/performance/PerformanceUtils'

// ========================
// Performance Monitor Widget
// ========================
export const PerformanceMonitorWidget = memo(function PerformanceMonitorWidget() {
    const fps = useFPS()
    const memory = useMemoryUsage()
    const [componentCount, setComponentCount] = useState(0)

    useEffect(() => {
        const updateCount = () => {
            const widgets = document.querySelectorAll('[data-widget-id]')
            setComponentCount(widgets.length)
        }
        updateCount()
        const interval = setInterval(updateCount, 2000)
        return () => clearInterval(interval)
    }, [])

    const getFPSColor = (fps: number) => {
        if (fps >= 55) return 'text-green-500'
        if (fps >= 30) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getMemoryPercentage = () => {
        if (!memory) return 0
        return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    }

    const formatBytes = (bytes: number) => {
        if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
        if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
        return `${(bytes / 1024).toFixed(1)} KB`
    }

    return (
        <div className="h-full flex flex-col p-3" data-widget="performance-monitor">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <CpuChipIcon className="h-5 w-5 text-cyan-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Performance</span>
                <span className="ml-auto text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">Live</span>
            </div>

            {/* FPS Gauge */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Frame Rate</span>
                    <span className={clsx('text-2xl font-bold', getFPSColor(fps))}>
                        {fps} <span className="text-sm font-normal">FPS</span>
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className={clsx(
                            'h-full rounded-full transition-colors',
                            fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        animate={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>0</span>
                    <span>30</span>
                    <span>60</span>
                </div>
            </div>

            {/* Memory Usage */}
            {memory && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory</span>
                        <span className="text-lg font-bold text-purple-600">
                            {formatBytes(memory.usedJSHeapSize)}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={clsx(
                                'h-full rounded-full',
                                getMemoryPercentage() < 50 ? 'bg-purple-500' :
                                    getMemoryPercentage() < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${getMemoryPercentage()}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>Used: {formatBytes(memory.usedJSHeapSize)}</span>
                        <span>Limit: {formatBytes(memory.jsHeapSizeLimit)}</span>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <CubeIcon className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{componentCount}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Widgets</div>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <BoltIcon className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                        {fps >= 55 ? 'Optimal' : fps >= 30 ? 'Fair' : 'Slow'}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">Status</div>
                </div>
            </div>
        </div>
    )
})

// ========================
// Render Profiler Widget
// ========================
export const RenderProfilerWidget = memo(function RenderProfilerWidget() {
    const [metrics, setMetrics] = useState<any[]>([])
    const [isProfiling, setIsProfiling] = useState(false)

    const handleProfile = () => {
        if (isProfiling) {
            setMetrics(getRenderMetrics())
            setIsProfiling(false)
        } else {
            setIsProfiling(true)
            setMetrics([])
        }
    }

    useEffect(() => {
        if (isProfiling) {
            const interval = setInterval(() => {
                setMetrics(getRenderMetrics())
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [isProfiling])

    return (
        <div className="h-full flex flex-col p-3" data-widget="render-profiler">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Render Profiler</span>
                </div>
                <button
                    onClick={handleProfile}
                    className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                        isProfiling
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400'
                    )}
                >
                    {isProfiling ? '⏹ Stop' : '▶ Start'}
                </button>
            </div>

            {/* Metrics List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                <AnimatePresence>
                    {metrics.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{isProfiling ? 'Profiling...' : 'Click Start to profile renders'}</p>
                        </div>
                    ) : (
                        metrics.map((metric, idx) => (
                            <motion.div
                                key={metric.component}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {metric.component}
                                    </span>
                                    <span className={clsx(
                                        'text-xs font-medium',
                                        metric.avgRenderTime < 5 ? 'text-green-600' :
                                            metric.avgRenderTime < 15 ? 'text-yellow-600' : 'text-red-600'
                                    )}>
                                        {metric.avgRenderTime.toFixed(1)}ms
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                    <span>{metric.renders} renders</span>
                                    <span>Last: {metric.lastRenderTime.toFixed(1)}ms</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
})

// ========================
// Bundle Size Widget
// ========================
export const BundleSizeWidget = memo(function BundleSizeWidget() {
    const [bundles, setBundles] = useState([
        { name: 'Main Bundle', size: 245, loaded: true },
        { name: 'Widget Library', size: 156, loaded: true },
        { name: 'AI Services', size: 89, loaded: true },
        { name: 'Collaboration', size: 67, loaded: true },
        { name: 'Analytics', size: 78, loaded: true },
        { name: 'Real-time', size: 45, loaded: true }
    ])

    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0)

    return (
        <div className="h-full flex flex-col p-3" data-widget="bundle-size">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CubeIcon className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Bundle Size</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{totalSize} KB</span>
            </div>

            {/* Bundle List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {bundles.map((bundle, idx) => (
                    <div key={bundle.name} className="flex items-center gap-2">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{bundle.name}</span>
                                <span className="text-xs text-gray-500">{bundle.size} KB</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(bundle.size / totalSize) * 100}%` }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                />
                            </div>
                        </div>
                        {bundle.loaded && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Gzipped estimate</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">~{Math.round(totalSize * 0.3)} KB</span>
                </div>
            </div>
        </div>
    )
})

// ========================
// Loading States Demo Widget
// ========================
export const LoadingStatesWidget = memo(function LoadingStatesWidget() {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="h-full flex flex-col p-3" data-widget="loading-states">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-rose-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Loading States</span>
                </div>
                <button
                    onClick={() => setIsLoading(!isLoading)}
                    className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
                >
                    Toggle Demo
                </button>
            </div>

            {/* Demo Content */}
            <div className="flex-1 overflow-y-auto space-y-3">
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Skeleton Loader</div>
                {isLoading ? (
                    <WidgetSkeleton className="h-24" />
                ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">Content loaded successfully</p>
                        <div className="mt-2 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-600">Ready</span>
                        </div>
                    </div>
                )}

                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Spinner Variants</div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="animate-pulse rounded-full h-6 w-6 bg-purple-500"></div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="flex space-x-1">
                            <div className="animate-bounce w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '0ms' }}></div>
                            <div className="animate-bounce w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '150ms' }}></div>
                            <div className="animate-bounce w-2 h-2 bg-green-500 rounded-full" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
