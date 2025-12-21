'use client'

import React, { useMemo } from 'react'
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import clsx from 'clsx'

interface SODataPoint {
    timestamp: string
    price: number
    upRegulation?: number
    downRegulation?: number
    frequency?: number
    reserves?: number
}

interface SOChartProps {
    data: SODataPoint[]
    title?: string
    showRegulation?: boolean
    showFrequency?: boolean
    height?: number
    className?: string
}

export default function SOChart({
    data,
    title = 'System Operator (SO) Ancillary Services',
    showRegulation = true,
    showFrequency = false,
    height = 350,
    className
}: SOChartProps) {
    const stats = useMemo(() => {
        if (!data.length) return null
        const prices = data.map(d => d.price)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
        const max = Math.max(...prices)
        const min = Math.min(...prices)

        const upReg = data.filter(d => d.upRegulation).map(d => d.upRegulation as number)
        const downReg = data.filter(d => d.downRegulation).map(d => d.downRegulation as number)
        const avgUpReg = upReg.length ? upReg.reduce((a, b) => a + b, 0) / upReg.length : 0
        const avgDownReg = downReg.length ? downReg.reduce((a, b) => a + b, 0) / downReg.length : 0

        return { avg, max, min, avgUpReg, avgDownReg }
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
                            {entry.name.includes('Regulation') ? `${entry.value} MW` : formatPrice(entry.value)}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ancillary services and frequency regulation</p>
                </div>

                {stats && (
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">SO Price</p>
                            <p className="font-semibold text-purple-600 dark:text-purple-400">{formatPrice(stats.avg)}</p>
                        </div>
                        {showRegulation && (
                            <>
                                <div className="text-center">
                                    <p className="text-gray-500 dark:text-gray-400">Up Reg</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">{stats.avgUpReg.toFixed(0)} MW</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500 dark:text-gray-400">Down Reg</p>
                                    <p className="font-semibold text-red-600 dark:text-red-400">{stats.avgDownReg.toFixed(0)} MW</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />

                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTime}
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                    />

                    <YAxis
                        yAxisId="price"
                        tickFormatter={(v) => `₹${v}`}
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    {showRegulation && (
                        <YAxis
                            yAxisId="regulation"
                            orientation="right"
                            tickFormatter={(v) => `${v}MW`}
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                    )}

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                    />

                    {stats && (
                        <ReferenceLine
                            yAxisId="price"
                            y={stats.avg}
                            stroke="#A855F7"
                            strokeDasharray="5 5"
                        />
                    )}

                    {showRegulation && (
                        <>
                            <Bar
                                yAxisId="regulation"
                                dataKey="upRegulation"
                                name="Up Regulation"
                                fill="#10B981"
                                opacity={0.6}
                                barSize={8}
                            />
                            <Bar
                                yAxisId="regulation"
                                dataKey="downRegulation"
                                name="Down Regulation"
                                fill="#EF4444"
                                opacity={0.6}
                                barSize={8}
                            />
                        </>
                    )}

                    <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="price"
                        name="SO Price"
                        stroke="#A855F7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: '#A855F7' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Service Types */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-3 text-xs">
                    {[
                        { label: 'SRAS-Up', desc: 'Secondary Reserve (Up)', color: 'bg-green-500' },
                        { label: 'SRAS-Down', desc: 'Secondary Reserve (Down)', color: 'bg-red-500' },
                        { label: 'TRAS', desc: 'Tertiary Reserve', color: 'bg-purple-500' },
                    ].map(service => (
                        <div key={service.label} className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
                            <span className={clsx('w-2 h-2 rounded-full', service.color)}></span>
                            <span>{service.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
