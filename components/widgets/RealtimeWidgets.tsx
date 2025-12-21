'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowUpIcon,
    ArrowDownIcon,
    BoltIcon
} from '@heroicons/react/24/outline'
import {
    useRealtime,
    usePriceStream,
    useTradeStream,
    useAlerts,
    useConnectionStatus,
    PriceData,
    TradeData,
    AlertData
} from '@/lib/realtime/RealtimeService'
import { WidgetConnectionBadge } from '@/components/realtime/ConnectionIndicator'
import { clsx } from 'clsx'

// ========================
// IEX Live Prices - Real-time Version
// ========================
interface LivePriceCardProps {
    market: string
    region: string
    price: number
    change: number
    changePercent: number
    volume: number
    lastUpdate: Date
}

function LivePriceCard({ market, region, price, change, changePercent, volume, lastUpdate }: LivePriceCardProps) {
    const isPositive = change >= 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'p-3 rounded-lg border transition-all',
                isPositive
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{market}</span>
                    <span className="text-xs text-gray-400 mx-1">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{region}</span>
                </div>
                <span className="text-xs text-gray-400">
                    {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>

            <div className="flex items-baseline justify-between">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{price.toFixed(2)}
                    <span className="text-xs text-gray-500 ml-1">/kWh</span>
                </div>

                <div className={clsx(
                    'flex items-center text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                    {isPositive ? (
                        <ArrowUpIcon className="h-4 w-4 mr-0.5" />
                    ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-0.5" />
                    )}
                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Volume: {volume.toLocaleString()} MWh
            </div>
        </motion.div>
    )
}

export function IEXLivePricesRealtime() {
    const { priceData, status } = useRealtime()
    const { latency } = useConnectionStatus()

    // Convert Map to array for rendering
    const prices = useMemo(() => {
        return Array.from(priceData.values())
            .filter(p => p.market === 'DAM' || p.market === 'RTM')
            .slice(0, 6) // Show top 6 prices
    }, [priceData])

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header with connection status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BoltIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        IEX India Live Prices
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">⚡ {latency}ms</span>
                    <WidgetConnectionBadge />
                </div>
            </div>

            {/* Price Grid */}
            <div className="flex-1 overflow-y-auto">
                {status === 'connecting' ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <span className="text-sm text-gray-500">Connecting to market data...</span>
                        </div>
                    </div>
                ) : prices.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-gray-500">Waiting for price data...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <AnimatePresence mode="popLayout">
                            {prices.map((price, idx) => (
                                <LivePriceCard
                                    key={`${price.market}-${price.region}`}
                                    market={price.market}
                                    region={price.region}
                                    price={price.price}
                                    change={price.change}
                                    changePercent={price.changePercent}
                                    volume={price.volume}
                                    lastUpdate={price.timestamp}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

// ========================
// Live Trades Stream Widget
// ========================
export function LiveTradesRealtime() {
    const { trades, status } = useTradeStream()

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Live Trades
                </span>
                <WidgetConnectionBadge />
            </div>

            {/* Trades List */}
            <div className="flex-1 overflow-y-auto">
                {trades.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-gray-500">Waiting for trades...</span>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        <AnimatePresence initial={false}>
                            {trades.slice(0, 15).map((trade) => (
                                <motion.div
                                    key={trade.id}
                                    initial={{ opacity: 0, x: -20, backgroundColor: trade.side === 'buy' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
                                    animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-4 text-xs p-2"
                                >
                                    <span className="text-gray-500">
                                        {trade.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{trade.market}</span>
                                    <span className={clsx(
                                        'text-right font-medium',
                                        trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        ₹{trade.price}
                                    </span>
                                    <span className="text-right text-gray-500">{trade.quantity}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

// ========================
// Live Alerts Stream Widget
// ========================
export function LiveAlertsRealtime() {
    const { alerts, status } = useAlerts()

    const getSeverityStyles = (severity: AlertData['severity']) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 border-red-500 dark:bg-red-900/30'
            case 'high':
                return 'bg-orange-100 border-orange-500 dark:bg-orange-900/30'
            case 'medium':
                return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30'
            default:
                return 'bg-blue-100 border-blue-500 dark:bg-blue-900/30'
        }
    }

    const getSeverityTextColor = (severity: AlertData['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-700 dark:text-red-400'
            case 'high': return 'text-orange-700 dark:text-orange-400'
            case 'medium': return 'text-yellow-700 dark:text-yellow-400'
            default: return 'text-blue-700 dark:text-blue-400'
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    🔔 Live Alerts
                </span>
                <WidgetConnectionBadge />
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <span className="text-2xl mb-2">✓</span>
                            <p className="text-sm text-gray-500">No active alerts</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        <AnimatePresence initial={false}>
                            {alerts.slice(0, 10).map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={clsx(
                                        'p-2 rounded-lg border-l-4',
                                        getSeverityStyles(alert.severity)
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <span className={clsx(
                                            'text-xs font-semibold uppercase',
                                            getSeverityTextColor(alert.severity)
                                        )}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {alert.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                        {alert.message}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
