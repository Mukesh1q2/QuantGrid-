'use client'

import React, { useMemo } from 'react'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import clsx from 'clsx'

interface RTMDataPoint {
    timestamp: string
    price: number
    damPrice?: number
    volume?: number
    volatility?: number
}

interface RTMChartProps {
    data: RTMDataPoint[]
    title?: string
    showDAMComparison?: boolean
    showVolatility?: boolean
    resolution?: '5min' | '15min' | 'hourly'
    height?: number
    className?: string
}

export default function RTMChart({
    data,
    title = 'Real-Time Market (RTM) Prices',
    showDAMComparison = true,
    showVolatility = false,
    resolution = '5min',
    height = 350,
    className
}: RTMChartProps) {
    const stats = useMemo(() => {
        if (!data.length) return null
        const prices = data.map(d => d.price)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
        const max = Math.max(...prices)
        const min = Math.min(...prices)

        // Calculate volatility
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length
        const stdDev = Math.sqrt(variance)
        const volatilityPct = (stdDev / avg) * 100

        // Calculate spread vs DAM
        let avgSpread = 0
        if (data.some(d => d.damPrice)) {
            const spreads = data.filter(d => d.damPrice).map(d => d.price - (d.damPrice || 0))
            avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length
        }

        return { avg, max, min, volatilityPct, avgSpread }
    }, [data])

    const formatTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                ...(resolution === '5min' && { second: '2-digit' })
            })
        } catch {
            return timestamp
        }
    }

    const formatPrice = (value: number) => `₹${value.toFixed(2)}`

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null

        const rtmPrice = payload.find((p: any) => p.dataKey === 'price')?.value
        const damPrice = payload.find((p: any) => p.dataKey === 'damPrice')?.value
        const spread = rtmPrice && damPrice ? rtmPrice - damPrice : 0

        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formatTime(label)}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between space-x-4 text-sm">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formatPrice(entry.value)}
                        </span>
                    </div>
                ))}
                {spread !== 0 && (
                    <div className={clsx(
                        'mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-sm',
                        spread > 0 ? 'text-red-600' : 'text-green-600'
                    )}>
                        RTM Spread: {spread > 0 ? '+' : ''}{formatPrice(spread)}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={clsx('bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {resolution === '5min' ? '5-minute' : resolution === '15min' ? '15-minute' : 'Hourly'} resolution
                    </p>
                </div>

                {stats && (
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Avg</p>
                            <p className="font-semibold text-orange-600 dark:text-orange-400">{formatPrice(stats.avg)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Volatility</p>
                            <p className={clsx(
                                'font-semibold',
                                stats.volatilityPct > 10 ? 'text-red-600' : stats.volatilityPct > 5 ? 'text-yellow-600' : 'text-green-600'
                            )}>
                                {stats.volatilityPct.toFixed(1)}%
                            </p>
                        </div>
                        {showDAMComparison && stats.avgSpread !== 0 && (
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">vs DAM</p>
                                <p className={clsx(
                                    'font-semibold',
                                    stats.avgSpread > 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                    {stats.avgSpread > 0 ? '+' : ''}{formatPrice(stats.avgSpread)}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="rtmGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTime}
                        stroke="#6B7280"
                        fontSize={11}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        tickFormatter={(v) => `₹${v}`}
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />

                    {stats && (
                        <ReferenceLine
                            y={stats.avg}
                            stroke="#F59E0B"
                            strokeDasharray="5 5"
                        />
                    )}

                    {showDAMComparison && data.some(d => d.damPrice) && (
                        <Line
                            type="stepAfter"
                            dataKey="damPrice"
                            name="DAM Reference"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    )}

                    <Line
                        type="monotone"
                        dataKey="price"
                        name="RTM Price"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: '#F97316' }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Status Indicators */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <span className="w-3 h-0.5 bg-orange-500 mr-1.5"></span>
                        RTM Real-Time Price
                    </span>
                    {showDAMComparison && (
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <span className="w-3 h-0.5 bg-blue-500 mr-1.5" style={{ borderBottom: '1px dashed' }}></span>
                            DAM Reference Price
                        </span>
                    )}
                    <div className="ml-auto flex items-center space-x-2">
                        <span className={clsx(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            resolution === '5min' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        )}>
                            {resolution === '5min' ? '5min blocks' : resolution === '15min' ? '15min blocks' : 'Hourly'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
