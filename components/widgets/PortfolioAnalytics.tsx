'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * Portfolio Performance Analytics Widget
 * 
 * Premium widget showing comprehensive portfolio performance metrics including:
 * - P&L tracking (daily/weekly/monthly/yearly)
 * - Asset allocation with drill-down
 * - Risk metrics (VaR, Sharpe, Sortino ratios)
 * - Benchmark comparison
 */

interface PortfolioData {
    totalValue: number
    pnl: number
    pnlPercent: number
    dailyChange: number
    dailyChangePercent: number
    allocation: Array<{
        name: string
        value: number
        percent: number
        color: string
        change: number
    }>
    metrics: {
        var95: number
        sharpeRatio: number
        sortinoRatio: number
        maxDrawdown: number
        volatility: number
    }
    performance: Array<{
        period: string
        value: number
        benchmark: number
    }>
}

interface PortfolioAnalyticsProps {
    className?: string
    compact?: boolean
}

// Generate realistic mock portfolio data
function generatePortfolioData(): PortfolioData {
    const baseValue = 5000000 // ₹50 Lakhs
    const dailyChange = baseValue * (Math.random() * 0.04 - 0.02) // -2% to +2%
    const monthlyPnl = baseValue * (Math.random() * 0.15 - 0.05) // -5% to +10%

    return {
        totalValue: baseValue + monthlyPnl,
        pnl: monthlyPnl,
        pnlPercent: (monthlyPnl / baseValue) * 100,
        dailyChange,
        dailyChangePercent: (dailyChange / baseValue) * 100,
        allocation: [
            { name: 'Solar Assets', value: baseValue * 0.35, percent: 35, color: '#fbbf24', change: 2.4 },
            { name: 'Wind Assets', value: baseValue * 0.28, percent: 28, color: '#60a5fa', change: -1.2 },
            { name: 'Trading Positions', value: baseValue * 0.22, percent: 22, color: '#34d399', change: 5.8 },
            { name: 'Reserves', value: baseValue * 0.10, percent: 10, color: '#a78bfa', change: 0.1 },
            { name: 'Other', value: baseValue * 0.05, percent: 5, color: '#f472b6', change: -0.3 }
        ],
        metrics: {
            var95: baseValue * 0.032, // 3.2% VaR
            sharpeRatio: 1.45 + Math.random() * 0.5,
            sortinoRatio: 1.82 + Math.random() * 0.4,
            maxDrawdown: -8.5 + Math.random() * 3,
            volatility: 12.5 + Math.random() * 5
        },
        performance: [
            { period: '1D', value: 0.8, benchmark: 0.5 },
            { period: '1W', value: 2.4, benchmark: 1.8 },
            { period: '1M', value: 5.2, benchmark: 3.9 },
            { period: '3M', value: 12.8, benchmark: 9.2 },
            { period: '6M', value: 18.4, benchmark: 14.1 },
            { period: '1Y', value: 28.6, benchmark: 22.3 }
        ]
    }
}

export function PortfolioAnalytics({ className, compact = false }: PortfolioAnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('1M')
    const [data] = useState<PortfolioData>(generatePortfolioData)

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`
        }
        return `₹${value.toLocaleString('en-IN')}`
    }

    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : ''
        return `${sign}${value.toFixed(2)}%`
    }

    const selectedPerformance = data.performance.find(p => p.period === selectedPeriod)

    return (
        <div className={clsx('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Portfolio Performance
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Updated now</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Main Value Display */}
            <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Portfolio Value
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(data.totalValue)}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className={clsx(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold',
                            data.pnl >= 0
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                            {data.pnl >= 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                            {formatPercent(data.pnlPercent)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(Math.abs(data.pnl))} {data.pnl >= 0 ? 'gain' : 'loss'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Performance Period Selector */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-1">
                    {data.performance.map((period) => (
                        <button
                            key={period.period}
                            onClick={() => setSelectedPeriod(period.period)}
                            className={clsx(
                                'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                                selectedPeriod === period.period
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            )}
                        >
                            {period.period}
                        </button>
                    ))}
                </div>
                {selectedPerformance && (
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Portfolio</span>
                                <span className={clsx(
                                    'ml-2 text-sm font-semibold',
                                    selectedPerformance.value >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {formatPercent(selectedPerformance.value)}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Benchmark</span>
                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {formatPercent(selectedPerformance.benchmark)}
                                </span>
                            </div>
                        </div>
                        <div className={clsx(
                            'text-xs font-medium',
                            selectedPerformance.value > selectedPerformance.benchmark ? 'text-green-600' : 'text-red-600'
                        )}>
                            {selectedPerformance.value > selectedPerformance.benchmark ? 'Outperforming' : 'Underperforming'}
                            {' '}by {Math.abs(selectedPerformance.value - selectedPerformance.benchmark).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>

            {/* Asset Allocation */}
            {!compact && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                        Asset Allocation
                    </h4>
                    {/* Allocation Bar */}
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        {data.allocation.map((asset, i) => (
                            <motion.div
                                key={asset.name}
                                initial={{ width: 0 }}
                                animate={{ width: `${asset.percent}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                style={{ backgroundColor: asset.color }}
                                className="h-full first:rounded-l-full last:rounded-r-full"
                                title={`${asset.name}: ${asset.percent}%`}
                            />
                        ))}
                    </div>
                    {/* Asset List */}
                    <div className="mt-3 space-y-1.5">
                        {data.allocation.map((asset) => (
                            <div key={asset.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                    <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: asset.color }} />
                                    <span className="text-gray-700 dark:text-gray-300">{asset.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-500 dark:text-gray-400">{asset.percent}%</span>
                                    <span className={clsx(
                                        'font-medium',
                                        asset.change >= 0 ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {formatPercent(asset.change)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Metrics */}
            <div className="px-4 py-3">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Risk Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">VaR (95%)</span>
                            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                            {formatCurrency(data.metrics.var95)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Sharpe Ratio</span>
                            <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                        </div>
                        <p className={clsx(
                            'text-sm font-semibold mt-0.5',
                            data.metrics.sharpeRatio >= 1.5 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                        )}>
                            {data.metrics.sharpeRatio.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Max Drawdown</span>
                        <p className="text-sm font-semibold text-red-600 mt-0.5">
                            {data.metrics.maxDrawdown.toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Volatility</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                            {data.metrics.volatility.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PortfolioAnalytics
