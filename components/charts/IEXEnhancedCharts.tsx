'use client'

import React, { useState, useMemo } from 'react'
import {
    ComposedChart,
    Bar,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
    ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
    ChartBarIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    SunIcon,
    BoltIcon
} from '@heroicons/react/24/outline'

// Color palettes for different markets
const DAM_COLORS = {
    clearedVolume: '#10B981',      // Green
    unclearedBuy: '#3B82F6',       // Blue  
    unclearedSell: '#F59E0B',      // Amber
    mcp: '#EF4444',                // Red line
    avgPrice: '#8B5CF6',           // Purple reference
    grid: '#E5E7EB'
}

const RTM_COLORS = {
    purchaseVolume: '#06B6D4',     // Cyan
    sellVolume: '#F97316',         // Orange
    mcv: '#8B5CF6',                // Purple
    mcp: '#1F2937',                // Dark
    damPrice: '#10B981',           // Green reference
    grid: '#E5E7EB'
}

const SO_COLORS = {
    upRegulation: '#22C55E',       // Green
    downRegulation: '#EF4444',     // Red
    frequency: '#3B82F6',          // Blue line
    grid: '#E5E7EB'
}

export type TimeInterval = '15min' | '30min' | '45min' | '1hr'

export interface DAMDataPoint {
    timeBlock: number
    timestamp: string
    clearedVolume: number        // MW
    unclearedBuyVolume: number   // MW
    unclearedSellVolume: number  // MW
    mcp: number                  // Rs/KWh
    area?: string                // Optional area/region
}

export interface RTMDataPoint {
    timeBlock: number
    timestamp: string
    purchaseVolume: number       // MW
    sellVolume: number           // MW
    mcv: number                  // MW
    mcp: number                  // Rs/KWh
    damPrice?: number            // Reference DAM price
}

export interface SODataPoint {
    timeBlock: number
    timestamp: string
    upRegulation: number         // MW
    downRegulation: number       // MW
    frequency: number            // Hz (49.5 - 50.5)
    acp?: number                 // Ancillary Clearing Price
}

interface DAMChartEnhancedProps {
    data: DAMDataPoint[]
    title?: string
    className?: string
    showExport?: boolean
}

interface RTMChartEnhancedProps {
    data: RTMDataPoint[]
    title?: string
    className?: string
    showExport?: boolean
}

interface SOChartEnhancedProps {
    data: SODataPoint[]
    title?: string
    className?: string
    showExport?: boolean
}

// Utility: Format time block
const formatTimeBlock = (block: number, interval: TimeInterval): string => {
    const minutesPerBlock = { '15min': 15, '30min': 30, '45min': 45, '1hr': 60 }
    const totalMinutes = block * minutesPerBlock[interval]
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Utility: Aggregate data
const aggregateData = <T extends { timeBlock: number }>(
    data: T[],
    interval: TimeInterval,
    aggregator: (group: T[]) => T
): T[] => {
    if (interval === '15min' || !data.length) return data
    const blocksPerInterval = { '30min': 2, '45min': 3, '1hr': 4 }
    const groupSize = blocksPerInterval[interval]
    const aggregated: T[] = []

    for (let i = 0; i < data.length; i += groupSize) {
        const group = data.slice(i, i + groupSize)
        if (group.length === 0) continue
        aggregated.push(aggregator(group))
    }
    return aggregated
}

// ============ DAM Chart Enhanced ============
export function DAMChartEnhanced({
    data,
    title = 'Day-Ahead Market (DAM)',
    className,
    showExport = true
}: DAMChartEnhancedProps) {
    const [interval, setInterval] = useState<TimeInterval>('15min')

    const chartData = useMemo(() => {
        return aggregateData(data, interval, (group) => ({
            timeBlock: Math.floor(group[0].timeBlock / (interval === '30min' ? 2 : interval === '45min' ? 3 : 4)),
            timestamp: group[0].timestamp,
            clearedVolume: group.reduce((s, p) => s + p.clearedVolume, 0) / group.length,
            unclearedBuyVolume: group.reduce((s, p) => s + p.unclearedBuyVolume, 0) / group.length,
            unclearedSellVolume: group.reduce((s, p) => s + p.unclearedSellVolume, 0) / group.length,
            mcp: group.reduce((s, p) => s + p.mcp, 0) / group.length
        }))
    }, [data, interval])

    const avgMcp = useMemo(() => {
        if (!chartData.length) return 0
        return chartData.reduce((s, d) => s + d.mcp, 0) / chartData.length
    }, [chartData])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <SunIcon className="h-5 w-5 text-amber-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                        <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                            DAM
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <select
                            value={interval}
                            onChange={(e) => setInterval(e.target.value as TimeInterval)}
                            className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                        >
                            <option value="15min">15-Min</option>
                            <option value="30min">30-Min</option>
                            <option value="45min">45-Min</option>
                            <option value="1hr">1-Hour</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DAM_COLORS.grid} vertical={false} />
                        <XAxis
                            dataKey="timeBlock"
                            tickFormatter={(v) => formatTimeBlock(v, interval)}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            yAxisId="volume"
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Volume (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                        />
                        <YAxis
                            yAxisId="price"
                            orientation="right"
                            tick={{ fontSize: 10 }}
                            label={{ value: 'MCP (₹/KWh)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload) return null
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-sm">
                                        <p className="font-bold mb-2">{formatTimeBlock(label, interval)}</p>
                                        {payload.map((p: any, i) => (
                                            <p key={i} style={{ color: p.color }}>
                                                {p.name}: {p.dataKey === 'mcp' ? `₹${p.value.toFixed(2)}` : `${p.value.toFixed(0)} MW`}
                                            </p>
                                        ))}
                                    </div>
                                )
                            }}
                        />
                        <Bar yAxisId="volume" dataKey="clearedVolume" name="Cleared Volume" fill={DAM_COLORS.clearedVolume} stackId="a" />
                        <Bar yAxisId="volume" dataKey="unclearedBuyVolume" name="Uncleared Buy" fill={DAM_COLORS.unclearedBuy} stackId="a" />
                        <Bar yAxisId="volume" dataKey="unclearedSellVolume" name="Uncleared Sell" fill={DAM_COLORS.unclearedSell} stackId="b" />
                        <Line yAxisId="price" type="monotone" dataKey="mcp" name="MCP" stroke={DAM_COLORS.mcp} strokeWidth={2} dot={false} />
                        <ReferenceLine yAxisId="price" y={avgMcp} stroke={DAM_COLORS.avgPrice} strokeDasharray="5 5" label={{ value: `Avg: ₹${avgMcp.toFixed(2)}`, fill: DAM_COLORS.avgPrice, fontSize: 10 }} />
                        <Legend verticalAlign="bottom" height={30} />
                        <Brush dataKey="timeBlock" height={25} stroke="#8884d8" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

// ============ RTM Chart Enhanced ============
export function RTMChartEnhanced({
    data,
    title = 'Real-Time Market (RTM)',
    className,
    showExport = true
}: RTMChartEnhancedProps) {
    const [interval, setInterval] = useState<TimeInterval>('15min')

    const chartData = useMemo(() => {
        return aggregateData(data, interval, (group) => ({
            timeBlock: Math.floor(group[0].timeBlock / (interval === '30min' ? 2 : interval === '45min' ? 3 : 4)),
            timestamp: group[0].timestamp,
            purchaseVolume: group.reduce((s, p) => s + p.purchaseVolume, 0) / group.length,
            sellVolume: group.reduce((s, p) => s + p.sellVolume, 0) / group.length,
            mcv: group.reduce((s, p) => s + p.mcv, 0) / group.length,
            mcp: group.reduce((s, p) => s + p.mcp, 0) / group.length,
            damPrice: group[0].damPrice
        }))
    }, [data, interval])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BoltIcon className="h-5 w-5 text-cyan-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                        <span className="px-2 py-0.5 text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                            RTM
                        </span>
                    </div>
                    <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value as TimeInterval)}
                        className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                    >
                        <option value="15min">15-Min</option>
                        <option value="30min">30-Min</option>
                        <option value="45min">45-Min</option>
                        <option value="1hr">1-Hour</option>
                    </select>
                </div>
            </div>

            <div className="p-4">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={RTM_COLORS.grid} vertical={false} />
                        <XAxis dataKey="timeBlock" tickFormatter={(v) => formatTimeBlock(v, interval)} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="volume" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area yAxisId="volume" type="monotone" dataKey="purchaseVolume" name="Purchase Vol" fill={RTM_COLORS.purchaseVolume} fillOpacity={0.6} stroke={RTM_COLORS.purchaseVolume} />
                        <Area yAxisId="volume" type="monotone" dataKey="sellVolume" name="Sell Vol" fill={RTM_COLORS.sellVolume} fillOpacity={0.6} stroke={RTM_COLORS.sellVolume} />
                        <Line yAxisId="volume" type="monotone" dataKey="mcv" name="MCV" stroke={RTM_COLORS.mcv} strokeWidth={2} dot={false} />
                        <Line yAxisId="price" type="monotone" dataKey="mcp" name="MCP" stroke={RTM_COLORS.mcp} strokeWidth={2} dot={false} />
                        {chartData[0]?.damPrice && (
                            <Line yAxisId="price" type="monotone" dataKey="damPrice" name="DAM Price" stroke={RTM_COLORS.damPrice} strokeDasharray="5 5" strokeWidth={1} dot={false} />
                        )}
                        <Legend verticalAlign="bottom" height={30} />
                        <Brush dataKey="timeBlock" height={25} stroke="#06B6D4" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

// ============ SO Chart Enhanced ============
export function SOChartEnhanced({
    data,
    title = 'System Operations (SO)',
    className,
    showExport = true
}: SOChartEnhancedProps) {
    const [interval, setInterval] = useState<TimeInterval>('15min')

    const chartData = useMemo(() => {
        return aggregateData(data, interval, (group) => ({
            timeBlock: Math.floor(group[0].timeBlock / (interval === '30min' ? 2 : interval === '45min' ? 3 : 4)),
            timestamp: group[0].timestamp,
            upRegulation: group.reduce((s, p) => s + p.upRegulation, 0) / group.length,
            downRegulation: group.reduce((s, p) => s + p.downRegulation, 0) / group.length,
            frequency: group.reduce((s, p) => s + p.frequency, 0) / group.length,
            acp: group[0].acp
        }))
    }, [data, interval])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ChartBarIcon className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                        <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                            SO
                        </span>
                    </div>
                    <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value as TimeInterval)}
                        className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                    >
                        <option value="15min">15-Min</option>
                        <option value="30min">30-Min</option>
                        <option value="45min">45-Min</option>
                        <option value="1hr">1-Hour</option>
                    </select>
                </div>
            </div>

            <div className="p-4">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={SO_COLORS.grid} vertical={false} />
                        <XAxis dataKey="timeBlock" tickFormatter={(v) => formatTimeBlock(v, interval)} tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="regulation" tick={{ fontSize: 10 }} label={{ value: 'Regulation (MW)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                        <YAxis yAxisId="frequency" orientation="right" domain={[49.5, 50.5]} tick={{ fontSize: 10 }} label={{ value: 'Frequency (Hz)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                        <Tooltip />
                        <Bar yAxisId="regulation" dataKey="upRegulation" name="Up Regulation" fill={SO_COLORS.upRegulation} />
                        <Bar yAxisId="regulation" dataKey="downRegulation" name="Down Regulation" fill={SO_COLORS.downRegulation} />
                        <Line yAxisId="frequency" type="monotone" dataKey="frequency" name="Grid Frequency" stroke={SO_COLORS.frequency} strokeWidth={2} dot={false} />
                        <ReferenceLine yAxisId="frequency" y={50} stroke="#6B7280" strokeDasharray="3 3" label={{ value: '50 Hz', fontSize: 10 }} />
                        <Legend verticalAlign="bottom" height={30} />
                        <Brush dataKey="timeBlock" height={25} stroke="#22C55E" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}
