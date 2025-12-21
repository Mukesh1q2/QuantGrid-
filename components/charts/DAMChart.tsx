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
    ReferenceLine,
    Brush
} from 'recharts'
import clsx from 'clsx'

interface MarketDataPoint {
    timestamp: string
    price: number
    volume?: number
    optimizedPrice?: number
    actualPrice?: number
}

interface DAMChartProps {
    data: MarketDataPoint[]
    title?: string
    showOptimization?: boolean
    showVolume?: boolean
    height?: number
    className?: string
}

export default function DAMChart({
    data,
    title = 'Day-Ahead Market (DAM) Prices',
    showOptimization = true,
    showVolume = false,
    height = 350,
    className
}: DAMChartProps) {
    const stats = useMemo(() => {
        if (!data.length) return null
        const prices = data.map(d => d.price)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
        const max = Math.max(...prices)
        const min = Math.min(...prices)
        return { avg, max, min }
    }, [data])

    const formatTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        } catch {
            return timestamp
        }
    }

    const formatPrice = (value: number) => `₹${value.toFixed(2)}`

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null

        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formatTime(label)}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between space-x-4 text-sm">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {entry.name.includes('Volume') ? `${entry.value} MW` : formatPrice(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={clsx('bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hourly clearing prices</p>
                </div>

                {stats && (
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Avg</p>
                            <p className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(stats.avg)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Max</p>
                            <p className="font-semibold text-red-600 dark:text-red-400">{formatPrice(stats.max)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Min</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">{formatPrice(stats.min)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="damPriceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTime}
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
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
                            label={{ value: 'Avg', position: 'right', fill: '#F59E0B', fontSize: 12 }}
                        />
                    )}

                    <Area
                        type="monotone"
                        dataKey="price"
                        name="DAM Price"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#damPriceGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                    />

                    {showOptimization && data.some(d => d.optimizedPrice) && (
                        <Area
                            type="monotone"
                            dataKey="optimizedPrice"
                            name="Optimized Bid"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#optimizedGradient)"
                            dot={false}
                            activeDot={{ r: 6, fill: '#10B981' }}
                        />
                    )}

                    <Brush
                        dataKey="timestamp"
                        height={30}
                        stroke="#3B82F6"
                        tickFormatter={formatTime}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend Info */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
                        DAM Market Clearing Price
                    </span>
                    {showOptimization && (
                        <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>
                            Optimized Bid Strategy
                        </span>
                    )}
                    <span className="flex items-center">
                        <span className="w-3 h-0.5 bg-yellow-500 mr-1.5"></span>
                        Average Price
                    </span>
                </div>
            </div>
        </div>
    )
}
