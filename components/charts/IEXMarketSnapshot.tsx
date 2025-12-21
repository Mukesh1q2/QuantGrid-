'use client'

import React, { useState, useMemo } from 'react'
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
    ChartBarIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'

// IEX-style color palette
const COLORS = {
    purchaseBid: '#3B82F6',      // Blue
    sellBid: '#FCD34D',          // Yellow
    mcv: '#A78BFA',              // Purple
    scheduledVolume: '#34D399',  // Green
    mcp: '#1F2937',              // Dark line for MCP
    grid: '#E5E7EB'
}

export interface IEXDataPoint {
    timeBlock: number           // 0-95 for 15-min, 0-47 for 30-min, etc.
    timestamp: string
    purchaseBid: number         // MW
    sellBid: number             // MW
    mcv: number                 // Market Clearing Volume (MW)
    scheduledVolume: number     // MW
    mcp: number                 // Market Clearing Price (Rs/KWh)
}

interface IEXMarketSnapshotProps {
    data: IEXDataPoint[]
    title?: string
    marketType?: 'DAM' | 'RTM' | 'SO' | 'DMO'
    showExport?: boolean
    onExport?: () => void
    className?: string
}

type TimeInterval = '15min' | '30min' | '45min' | '1hr'
type DeliveryPeriod = 'today' | 'yesterday' | 'last7days' | 'custom'

// Aggregate data based on interval
const aggregateData = (data: IEXDataPoint[], interval: TimeInterval): IEXDataPoint[] => {
    if (interval === '15min' || !data.length) return data

    const blocksPerInterval = {
        '30min': 2,
        '45min': 3,
        '1hr': 4
    }

    const groupSize = blocksPerInterval[interval] || 1
    const aggregated: IEXDataPoint[] = []

    for (let i = 0; i < data.length; i += groupSize) {
        const group = data.slice(i, i + groupSize)
        if (group.length === 0) continue

        const avgPoint: IEXDataPoint = {
            timeBlock: Math.floor(i / groupSize),
            timestamp: group[0].timestamp,
            purchaseBid: group.reduce((sum, p) => sum + p.purchaseBid, 0) / group.length,
            sellBid: group.reduce((sum, p) => sum + p.sellBid, 0) / group.length,
            mcv: group.reduce((sum, p) => sum + p.mcv, 0) / group.length,
            scheduledVolume: group.reduce((sum, p) => sum + p.scheduledVolume, 0) / group.length,
            mcp: group.reduce((sum, p) => sum + p.mcp, 0) / group.length
        }
        aggregated.push(avgPoint)
    }

    return aggregated
}

// Format time block for X-axis
const formatTimeBlock = (block: number, interval: TimeInterval): string => {
    const minutesPerBlock = {
        '15min': 15,
        '30min': 30,
        '45min': 45,
        '1hr': 60
    }

    const totalMinutes = block * minutesPerBlock[interval]
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Custom tooltip for IEX-style display
const CustomTooltip = ({ active, payload, label, interval }: any) => {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white mb-2">
                Time Block: {formatTimeBlock(label, interval)}
            </p>
            <div className="space-y-1 text-sm">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 dark:text-gray-300">
                                {entry.name}:
                            </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {entry.dataKey === 'mcp'
                                ? `₹${entry.value.toFixed(2)}/KWh`
                                : `${entry.value.toFixed(0)} MW`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function IEXMarketSnapshot({
    data,
    title = 'Market Snapshot',
    marketType = 'DAM',
    showExport = true,
    onExport,
    className
}: IEXMarketSnapshotProps) {
    const [interval, setInterval] = useState<TimeInterval>('15min')
    const [deliveryPeriod, setDeliveryPeriod] = useState<DeliveryPeriod>('today')
    const [viewGraph, setViewGraph] = useState(true)

    // Aggregate data based on selected interval
    const chartData = useMemo(() => {
        return aggregateData(data, interval)
    }, [data, interval])

    // Calculate Y-axis domains
    const volumeDomain = useMemo(() => {
        if (!chartData.length) return [0, 40000]
        const maxVolume = Math.max(
            ...chartData.map(d => Math.max(d.purchaseBid, d.sellBid, d.mcv, d.scheduledVolume))
        )
        return [0, Math.ceil(maxVolume / 8000) * 8000]
    }, [chartData])

    const mcpDomain = useMemo(() => {
        if (!chartData.length) return [0, 12]
        const maxMcp = Math.max(...chartData.map(d => d.mcp))
        const minMcp = Math.min(...chartData.map(d => d.mcp))
        return [Math.floor(minMcp * 0.8), Math.ceil(maxMcp * 1.2)]
    }, [chartData])

    const intervalOptions: { value: TimeInterval; label: string }[] = [
        { value: '15min', label: '15-Min-Block' },
        { value: '30min', label: '30-Min-Block' },
        { value: '45min', label: '45-Min-Block' },
        { value: '1hr', label: '1-Hour-Block' }
    ]

    const periodOptions: { value: DeliveryPeriod; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'custom', label: 'Custom' }
    ]

    const handleExport = () => {
        if (onExport) {
            onExport()
        } else {
            // Default export as CSV
            const csvContent = [
                'TimeBlock,Timestamp,PurchaseBid(MW),SellBid(MW),MCV(MW),ScheduledVolume(MW),MCP(Rs/KWh)',
                ...chartData.map(d =>
                    `${d.timeBlock},${d.timestamp},${d.purchaseBid},${d.sellBid},${d.mcv},${d.scheduledVolume},${d.mcp}`
                )
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${marketType}_market_snapshot_${Date.now()}.csv`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                            <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                            <span>{title}</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                {marketType}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                            Data in {interval === '15min' ? '15-minute' : interval === '30min' ? '30-minute' : interval === '45min' ? '45-minute' : '1-hour'} time block format
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Interval Selector - Compact on mobile */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <ClockIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value as TimeInterval)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                            >
                                {intervalOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Delivery Period Selector - Compact on mobile */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
                            <select
                                value={deliveryPeriod}
                                onChange={(e) => setDeliveryPeriod(e.target.value as DeliveryPeriod)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                            >
                                {periodOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Export Button */}
                        {showExport && (
                            <button
                                onClick={handleExport}
                                className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        )}

                        {/* View Graph Toggle */}
                        <label className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={viewGraph}
                                onChange={(e) => setViewGraph(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Graph</span>
                        </label>
                    </div>
                </div>

                {/* Tooltip hint - hidden on mobile */}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right hidden sm:block">
                    Move cursor on the MCP line to view the time-block wise data
                </p>
            </div>

            {/* Chart - Responsive height */}
            {viewGraph && (
                <div className="p-2 sm:p-4">
                    <ResponsiveContainer width="100%" height={typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 400}>
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={COLORS.grid}
                                vertical={false}
                            />

                            {/* X-Axis - Time Period */}
                            <XAxis
                                dataKey="timeBlock"
                                tickFormatter={(value) => formatTimeBlock(value, interval)}
                                axisLine={{ stroke: COLORS.grid }}
                                tickLine={{ stroke: COLORS.grid }}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                label={{
                                    value: 'Time Period',
                                    position: 'insideBottom',
                                    offset: -10,
                                    style: { fontSize: 12, fill: '#6B7280' }
                                }}
                            />

                            {/* Left Y-Axis - Market Volume (MW) */}
                            <YAxis
                                yAxisId="volume"
                                domain={volumeDomain}
                                tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                                axisLine={{ stroke: COLORS.grid }}
                                tickLine={{ stroke: COLORS.grid }}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                label={{
                                    value: 'Market Volume (MW)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fontSize: 12, fill: '#6B7280', textAnchor: 'middle' }
                                }}
                            />

                            {/* Right Y-Axis - MCP (Rs/KWh) */}
                            <YAxis
                                yAxisId="mcp"
                                orientation="right"
                                domain={mcpDomain}
                                axisLine={{ stroke: COLORS.grid }}
                                tickLine={{ stroke: COLORS.grid }}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                label={{
                                    value: 'MCP (Rs/KWh)',
                                    angle: 90,
                                    position: 'insideRight',
                                    style: { fontSize: 12, fill: '#6B7280', textAnchor: 'middle' }
                                }}
                            />

                            <Tooltip content={<CustomTooltip interval={interval} />} />

                            {/* Stacked Areas - matching IEX order */}
                            <Area
                                yAxisId="volume"
                                type="monotone"
                                dataKey="scheduledVolume"
                                name="Scheduled Volume(MW)"
                                stackId="1"
                                fill={COLORS.scheduledVolume}
                                stroke={COLORS.scheduledVolume}
                                fillOpacity={0.8}
                            />
                            <Area
                                yAxisId="volume"
                                type="monotone"
                                dataKey="mcv"
                                name="MCV (MW)"
                                stackId="1"
                                fill={COLORS.mcv}
                                stroke={COLORS.mcv}
                                fillOpacity={0.8}
                            />
                            <Area
                                yAxisId="volume"
                                type="monotone"
                                dataKey="sellBid"
                                name="Sell Bid (MW)"
                                stackId="1"
                                fill={COLORS.sellBid}
                                stroke={COLORS.sellBid}
                                fillOpacity={0.8}
                            />
                            <Area
                                yAxisId="volume"
                                type="monotone"
                                dataKey="purchaseBid"
                                name="Purchase Bid (MW)"
                                stackId="1"
                                fill={COLORS.purchaseBid}
                                stroke={COLORS.purchaseBid}
                                fillOpacity={0.6}
                            />

                            {/* MCP Line */}
                            <Line
                                yAxisId="mcp"
                                type="monotone"
                                dataKey="mcp"
                                name="MCP (Rs/KWh)"
                                stroke={COLORS.mcp}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: COLORS.mcp }}
                            />

                            {/* Legend */}
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={10}
                                formatter={(value) => (
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                                )}
                            />

                            {/* Brush for zooming */}
                            <Brush
                                dataKey="timeBlock"
                                height={30}
                                stroke="#8884d8"
                                tickFormatter={(value) => formatTimeBlock(value, interval)}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Data Table (optional, shown when graph is hidden) */}
            {!viewGraph && (
                <div className="p-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Time Block</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">Purchase Bid (MW)</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">Sell Bid (MW)</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">MCV (MW)</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">Scheduled Vol (MW)</th>
                                <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">MCP (Rs/KWh)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.slice(0, 24).map((row, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                        {formatTimeBlock(row.timeBlock, interval)}
                                    </td>
                                    <td className="px-4 py-2 text-right text-blue-600">{row.purchaseBid.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right text-yellow-600">{row.sellBid.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right text-purple-600">{row.mcv.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right text-green-600">{row.scheduledVolume.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">₹{row.mcp.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    )
}
