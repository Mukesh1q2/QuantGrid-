'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    DocumentArrowDownIcon,
    TableCellsIcon,
    CubeTransparentIcon,
    PresentationChartLineIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
    useAnalytics,
    usePortfolioMetrics,
    PortfolioMetrics,
    PnLAttribution,
    VolumeBreakdown,
    CorrelationData,
    PerformancePoint
} from '@/lib/analytics/AnalyticsService'

// ========================
// Portfolio Performance Widget
// ========================
export function PortfolioPerformanceWidget() {
    const { metrics, refresh, isLoading } = usePortfolioMetrics()

    useEffect(() => {
        refresh()
    }, [refresh])

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
        return `₹${value.toLocaleString()}`
    }

    if (isLoading || !metrics) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <PresentationChartLineIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Portfolio Performance</span>
                </div>
                <button onClick={() => refresh()} className="text-xs text-blue-600 hover:text-blue-700">Refresh</button>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <span className="text-xs text-blue-600 dark:text-blue-400">Total Value</span>
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(metrics.totalValue)}</div>
                </div>
                <div className={clsx(
                    'p-3 rounded-lg',
                    metrics.todayPnL >= 0
                        ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                        : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
                )}>
                    <span className={clsx('text-xs', metrics.todayPnL >= 0 ? 'text-green-600' : 'text-red-600')}>Today's P&L</span>
                    <div className={clsx('text-xl font-bold flex items-center gap-1', metrics.todayPnL >= 0 ? 'text-green-700' : 'text-red-700')}>
                        {metrics.todayPnL >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />}
                        {formatCurrency(Math.abs(metrics.todayPnL))}
                    </div>
                </div>
            </div>

            {/* Key Ratios */}
            <div className="flex-1 grid grid-cols-3 gap-2">
                {[
                    { label: 'Sharpe', value: metrics.sharpeRatio.toFixed(2), color: 'text-purple-600' },
                    { label: 'Sortino', value: metrics.sortinoRatio.toFixed(2), color: 'text-indigo-600' },
                    { label: 'Win Rate', value: `${metrics.winRate}%`, color: 'text-green-600' },
                    { label: 'Max DD', value: `${metrics.maxDrawdown}%`, color: 'text-red-600' },
                    { label: 'Profit Factor', value: metrics.profitFactor.toFixed(2), color: 'text-blue-600' },
                    { label: 'Trades', value: metrics.totalTrades.toLocaleString(), color: 'text-gray-600' }
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={clsx('text-lg font-bold', stat.color)}>{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ========================
// P&L Attribution Widget
// ========================
export function PnLAttributionWidget() {
    const { attribution, loadAttribution } = useAnalytics()

    useEffect(() => {
        loadAttribution()
    }, [loadAttribution])

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
        if (trend === 'down') return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
        return <span className="text-gray-400">—</span>
    }

    const formatValue = (value: number) => {
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
        return `₹${value.toLocaleString()}`
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <ChartBarIcon className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white">P&L Attribution</span>
            </div>

            {/* Attribution Bars */}
            <div className="flex-1 space-y-3 overflow-y-auto">
                {attribution.map((item, idx) => (
                    <motion.div
                        key={item.factor}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.factor}</span>
                                {getTrendIcon(item.trend)}
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatValue(item.contribution)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            />
                        </div>
                        <span className="text-xs text-gray-500">{item.percentage}% of total</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ========================
// Correlation Matrix Widget
// ========================
export function CorrelationMatrixWidget() {
    const { correlations, loadCorrelations } = useAnalytics()

    useEffect(() => {
        loadCorrelations()
    }, [loadCorrelations])

    const getCorrelationColor = (corr: number) => {
        if (corr > 0.7) return 'bg-green-500 text-white'
        if (corr > 0.4) return 'bg-green-300 text-green-900'
        if (corr > 0.1) return 'bg-yellow-200 text-yellow-900'
        if (corr > -0.1) return 'bg-gray-200 text-gray-700'
        if (corr > -0.4) return 'bg-red-200 text-red-900'
        return 'bg-red-500 text-white'
    }

    // Build matrix from correlation pairs
    const assets = ['DAM-N', 'DAM-S', 'DAM-W', 'DAM-E', 'RTM-N', 'RTM-S']
    const matrix: Record<string, Record<string, number>> = {}

    assets.forEach(a1 => {
        matrix[a1] = {}
        assets.forEach(a2 => {
            if (a1 === a2) {
                matrix[a1][a2] = 1.0
            } else {
                const corr = correlations.find(c =>
                    (c.asset1 === a1 && c.asset2 === a2) || (c.asset1 === a2 && c.asset2 === a1)
                )
                matrix[a1][a2] = corr?.correlation ?? 0
            }
        })
    })

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <CubeTransparentIcon className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Correlation Matrix</span>
            </div>

            {/* Matrix */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="p-1"></th>
                            {assets.map(a => (
                                <th key={a} className="p-1 text-center font-medium text-gray-600 dark:text-gray-400">
                                    {a.split('-')[1]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(a1 => (
                            <tr key={a1}>
                                <td className="p-1 font-medium text-gray-600 dark:text-gray-400">{a1}</td>
                                {assets.map(a2 => (
                                    <td key={a2} className="p-0.5">
                                        <div className={clsx(
                                            'w-8 h-8 flex items-center justify-center rounded text-xs font-medium',
                                            getCorrelationColor(matrix[a1][a2])
                                        )}>
                                            {matrix[a1][a2].toFixed(1)}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                <span className="text-gray-500">Low</span>
                <div className="flex gap-0.5">
                    <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                    <div className="w-4 h-3 bg-yellow-200 rounded-sm"></div>
                    <div className="w-4 h-3 bg-green-300 rounded-sm"></div>
                    <div className="w-4 h-3 bg-green-500 rounded-sm"></div>
                </div>
                <span className="text-gray-500">High</span>
            </div>
        </div>
    )
}

// ========================
// Volume Breakdown Widget
// ========================
export function VolumeBreakdownWidget() {
    const { volumeBreakdown, loadVolumeBreakdown } = useAnalytics()

    useEffect(() => {
        loadVolumeBreakdown()
    }, [loadVolumeBreakdown])

    const formatVolume = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`
        if (value >= 100000) return `${(value / 100000).toFixed(1)} L`
        return value.toLocaleString()
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <TableCellsIcon className="h-5 w-5 text-teal-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Volume Breakdown</span>
            </div>

            {/* Volume Cards */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {volumeBreakdown.map((item, idx) => (
                    <motion.div
                        key={item.market}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.market}</span>
                            <span className={clsx(
                                'text-xs font-medium flex items-center gap-0.5',
                                item.trend >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {item.trend >= 0 ? '+' : ''}{item.trend}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatVolume(item.volume)}</span>
                                <span className="text-xs text-gray-500">MWh</span>
                            </div>
                            <span className="text-xs text-gray-500">₹{item.avgPrice}/kWh</span>
                        </div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ========================
// Report Generator Widget
// ========================
export function ReportGeneratorWidget() {
    const { generateReport, exportData } = useAnalytics()
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedReport, setGeneratedReport] = useState<any>(null)

    const handleGenerate = async (format: 'pdf' | 'excel' | 'csv') => {
        setIsGenerating(true)
        try {
            const report = await generateReport({
                name: `Trading Report - ${new Date().toLocaleDateString()}`,
                format,
                sections: ['summary', 'pnl', 'trades', 'metrics']
            })
            setGeneratedReport(report)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <DocumentArrowDownIcon className="h-5 w-5 text-indigo-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Report Generator</span>
            </div>

            {/* Format Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                    { format: 'pdf' as const, label: 'PDF', color: 'bg-red-500 hover:bg-red-600' },
                    { format: 'excel' as const, label: 'Excel', color: 'bg-green-500 hover:bg-green-600' },
                    { format: 'csv' as const, label: 'CSV', color: 'bg-blue-500 hover:bg-blue-600' }
                ].map((opt) => (
                    <button
                        key={opt.format}
                        onClick={() => handleGenerate(opt.format)}
                        disabled={isGenerating}
                        className={clsx(
                            'py-2 px-3 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50',
                            opt.color
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Status */}
            {isGenerating && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Generating report...</span>
                </div>
            )}

            {generatedReport && !isGenerating && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Report Ready</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                        {generatedReport.name} • {generatedReport.size}
                    </p>
                    <button className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Download {generatedReport.format.toUpperCase()}
                    </button>
                </motion.div>
            )}

            {/* Quick Exports */}
            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 mb-2 block">Quick Export</span>
                <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Trades
                    </button>
                    <button className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        P&L
                    </button>
                    <button className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Metrics
                    </button>
                </div>
            </div>
        </div>
    )
}
