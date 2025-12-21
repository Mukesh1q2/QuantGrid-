'use client'

import React, { useState, useMemo } from 'react'
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Scatter,
    ReferenceLine, Brush
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChartBarIcon,
    TableCellsIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyRupeeIcon,
    BoltIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    CalendarIcon,
    SparklesIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import IEXMarketSnapshot, { IEXDataPoint } from '@/components/charts/IEXMarketSnapshot'

interface DataPoint {
    timestamp: string
    dam_price?: number
    rtm_price?: number
    so_price?: number
    mcp?: number
    volume?: number
    cost?: number
    revenue?: number
    [key: string]: any
}

interface EvaluationResultsProps {
    data: DataPoint[]
    mappings: { sourceColumn: string; targetField: string }[]
    metrics?: {
        totalRevenue?: number
        totalCost?: number
        profit?: number
        profitMargin?: number
        avgPrice?: number
        maxPrice?: number
        minPrice?: number
        volatility?: number
        confidenceLevel?: number
    }
    aiAnalysis?: string
    recommendations?: {
        type: string
        priority: 'high' | 'medium' | 'low'
        title: string
        description: string
        expectedImpact: string
    }[]
}

type ChartView = 'overview' | 'price' | 'volume' | 'comparison' | 'iex' | 'table'
type TimeRange = 'all' | '24h' | '7d' | '30d'

export default function EvaluationResults({
    data,
    mappings,
    metrics = {},
    aiAnalysis,
    recommendations = []
}: EvaluationResultsProps) {
    const [activeView, setActiveView] = useState<ChartView>('overview')
    const [timeRange, setTimeRange] = useState<TimeRange>('all')
    const [showBrush, setShowBrush] = useState(true)

    // Define metrics type
    interface CalculatedMetrics {
        totalRecords: number
        avgPrice: string | number
        maxPrice: string | number
        minPrice: string | number
        totalCost: number
        totalRevenue: number
        profit: number
        [key: string]: any
    }

    // Calculate derived metrics
    const calculatedMetrics = useMemo((): CalculatedMetrics => {
        const emptyMetrics: CalculatedMetrics = {
            totalRecords: 0,
            avgPrice: '0',
            maxPrice: '0',
            minPrice: '0',
            totalCost: 0,
            totalRevenue: 0,
            profit: 0
        }

        if (!data.length) return emptyMetrics

        const prices = data
            .map(d => d.dam_price || d.mcp || d.cost || 0)
            .filter(p => p > 0)

        const costs = data.map(d => d.cost || 0).reduce((a, b) => a + b, 0)
        const revenues = data.map(d => d.revenue || (d.dam_price || 0) * (d.volume || 1)).reduce((a, b) => a + b, 0)

        return {
            totalRecords: data.length,
            avgPrice: prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : '0',
            maxPrice: prices.length ? Math.max(...prices).toFixed(2) : '0',
            minPrice: prices.length ? Math.min(...prices).toFixed(2) : '0',
            totalCost: costs,
            totalRevenue: revenues,
            profit: revenues - costs,
            ...metrics
        }
    }, [data, metrics])

    // Filter data by time range
    const filteredData = useMemo(() => {
        if (timeRange === 'all') return data
        const now = new Date()
        const ranges: Record<TimeRange, number> = {
            'all': Infinity,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        }
        const cutoff = now.getTime() - ranges[timeRange]
        return data.filter(d => new Date(d.timestamp).getTime() > cutoff)
    }, [data, timeRange])

    // Format numbers for display
    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
        return `₹${value.toFixed(2)}`
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(label).toLocaleString('en-IN')}
                </p>
                {payload.map((entry: any, i: number) => (
                    <p key={i} className="text-sm" style={{ color: entry.color }}>
                        <span className="font-medium">{entry.name}:</span>{' '}
                        {entry.name.includes('Price') || entry.name.includes('MCP')
                            ? `₹${entry.value?.toFixed(2)}/kWh`
                            : entry.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Records', value: calculatedMetrics.totalRecords?.toLocaleString(), icon: TableCellsIcon, color: 'blue' },
                    { label: 'Avg Price', value: `₹${calculatedMetrics.avgPrice}`, icon: CurrencyRupeeIcon, color: 'green' },
                    { label: 'Max Price', value: `₹${calculatedMetrics.maxPrice}`, icon: ArrowTrendingUpIcon, color: 'red' },
                    { label: 'Min Price', value: `₹${calculatedMetrics.minPrice}`, icon: ArrowTrendingDownIcon, color: 'purple' },
                    { label: 'Total Cost', value: formatCurrency(calculatedMetrics.totalCost || 0), icon: BoltIcon, color: 'orange' },
                    { label: 'Profit', value: formatCurrency(calculatedMetrics.profit || 0), icon: ArrowTrendingUpIcon, color: calculatedMetrics.profit && calculatedMetrics.profit > 0 ? 'green' : 'red' },
                ].map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center space-x-2 mb-2">
                            <metric.icon className={`h-4 w-4 text-${metric.color}-500`} />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                        </div>
                        <p className={`text-xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                            {metric.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Chart Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="flex space-x-2 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                        { id: 'price', label: 'Prices', icon: CurrencyRupeeIcon },
                        { id: 'volume', label: 'Volume', icon: BoltIcon },
                        { id: 'comparison', label: 'Compare', icon: ArrowTrendingUpIcon },
                        { id: 'iex', label: 'IEX Market', icon: GlobeAltIcon },
                        { id: 'table', label: 'Data Table', icon: TableCellsIcon },
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as ChartView)}
                            className={clsx(
                                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all',
                                activeView === view.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            )}
                        >
                            <view.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{view.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {(['all', '24h', '7d', '30d'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={clsx(
                                'px-2 py-1 text-xs rounded',
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            )}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    {/* Overview Chart */}
                    {activeView === 'overview' && (
                        <div className="h-96">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Market Overview
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={filteredData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={formatTime}
                                        stroke="#9CA3AF"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        yAxisId="price"
                                        stroke="#9CA3AF"
                                        fontSize={12}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <YAxis
                                        yAxisId="volume"
                                        orientation="right"
                                        stroke="#9CA3AF"
                                        fontSize={12}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />

                                    <Area
                                        yAxisId="volume"
                                        type="monotone"
                                        dataKey="volume"
                                        fill="rgba(59, 130, 246, 0.2)"
                                        stroke="rgba(59, 130, 246, 0.5)"
                                        name="Volume"
                                    />
                                    <Line
                                        yAxisId="price"
                                        type="monotone"
                                        dataKey="dam_price"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={false}
                                        name="DAM Price"
                                    />
                                    <Line
                                        yAxisId="price"
                                        type="monotone"
                                        dataKey="mcp"
                                        stroke="#F59E0B"
                                        strokeWidth={2}
                                        dot={false}
                                        name="MCP"
                                    />
                                    {showBrush && (
                                        <Brush
                                            dataKey="timestamp"
                                            height={30}
                                            stroke="#6366F1"
                                            tickFormatter={formatTime}
                                        />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Price Chart */}
                    {activeView === 'price' && (
                        <div className="h-96">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Price Analysis
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredData}>
                                    <defs>
                                        <linearGradient id="colorDAM" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRTM" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <ReferenceLine
                                        y={Number(calculatedMetrics.avgPrice)}
                                        stroke="#6366F1"
                                        strokeDasharray="5 5"
                                        label={{ value: 'Avg', position: 'right', fill: '#6366F1' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="dam_price"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorDAM)"
                                        name="DAM Price"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rtm_price"
                                        stroke="#F59E0B"
                                        fillOpacity={1}
                                        fill="url(#colorRTM)"
                                        name="RTM Price"
                                    />
                                    {showBrush && <Brush dataKey="timestamp" height={30} stroke="#6366F1" />}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Volume Chart */}
                    {activeView === 'volume' && (
                        <div className="h-96">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Volume Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="volume"
                                        fill="#3B82F6"
                                        name="Volume (MWh)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="cost"
                                        fill="#F59E0B"
                                        name="Cost"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    {showBrush && <Brush dataKey="timestamp" height={30} stroke="#6366F1" />}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Comparison Chart */}
                    {activeView === 'comparison' && (
                        <div className="h-96">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                DAM vs RTM Comparison
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={filteredData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="dam_price" stroke="#10B981" strokeWidth={2} name="DAM" dot={false} />
                                    <Line type="monotone" dataKey="rtm_price" stroke="#F59E0B" strokeWidth={2} name="RTM" dot={false} />
                                    <Scatter dataKey="mcp" fill="#8B5CF6" name="MCP" />
                                    {showBrush && <Brush dataKey="timestamp" height={30} stroke="#6366F1" />}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* IEX Market Snapshot */}
                    {activeView === 'iex' && (
                        <div>
                            <IEXMarketSnapshot
                                data={filteredData.map((d, i) => {
                                    // Use actual data values with consistent patterns (no random)
                                    const baseVolume = d.volume || 1000
                                    const basePrice = d.dam_price || d.mcp || 5
                                    const hour = i % 24

                                    // Peak hour multipliers (morning 8-10, evening 18-21)
                                    const peakMultiplier = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21) ? 1.4 : 1.0

                                    return {
                                        timeBlock: i,
                                        timestamp: d.timestamp,
                                        purchaseBid: baseVolume * 0.7 * peakMultiplier,
                                        sellBid: baseVolume * 0.55 * peakMultiplier,
                                        mcv: baseVolume * 0.45 * peakMultiplier,
                                        scheduledVolume: baseVolume * 0.35 * peakMultiplier,
                                        mcp: Number(basePrice) * peakMultiplier
                                    }
                                }) as IEXDataPoint[]}
                                title="Market Snapshot"
                                marketType="DAM"
                                showExport={true}
                            />
                        </div>
                    )}

                    {/* Data Table */}
                    {activeView === 'table' && (
                        <div className="max-h-96 overflow-auto">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Data Table
                            </h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Timestamp</th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">DAM Price</th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">RTM Price</th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">MCP</th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Volume</th>
                                        <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice(0, 100).map((row, i) => (
                                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                                {new Date(row.timestamp).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-2 text-right text-green-600">{row.dam_price?.toFixed(2) || '-'}</td>
                                            <td className="px-4 py-2 text-right text-orange-600">{row.rtm_price?.toFixed(2) || '-'}</td>
                                            <td className="px-4 py-2 text-right text-purple-600">{row.mcp?.toFixed(2) || '-'}</td>
                                            <td className="px-4 py-2 text-right text-blue-600">{row.volume?.toLocaleString() || '-'}</td>
                                            <td className="px-4 py-2 text-right text-gray-600">{row.cost?.toLocaleString() || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length > 100 && (
                                <p className="text-center text-sm text-gray-500 py-2">
                                    Showing first 100 of {filteredData.length} records
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* AI Analysis */}
            {aiAnalysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
                >
                    <div className="flex items-start space-x-4">
                        <SparklesIcon className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Gemini AI Analysis
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={clsx(
                                'p-4 rounded-xl border-l-4',
                                rec.priority === 'high'
                                    ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
                                    : rec.priority === 'medium'
                                        ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            )}
                        >
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                {rec.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {rec.description}
                            </p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                Expected: {rec.expectedImpact}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Export Button */}
            <div className="flex justify-center">
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify({ data: filteredData, metrics: calculatedMetrics }, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `evaluation_results_${Date.now()}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Export Results</span>
                </button>
            </div>
        </div>
    )
}
