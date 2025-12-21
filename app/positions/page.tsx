'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ChartBarSquareIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    XMarkIcon,
    FunnelIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, ComposedChart, Bar } from 'recharts'
import toast from 'react-hot-toast'
import { useIEXSync } from '@/hooks/useIEXSync'

/**
 * Positions Page
 * 
 * Comprehensive view of all open trading positions with P&L tracking.
 */

interface Position {
    id: string
    market: string
    type: 'long' | 'short'
    quantity: number
    entryPrice: number
    currentPrice: number
    pnl: number
    pnlPercent: number
    margin: number
    leverage: number
    openTime: Date
    stopLoss?: number
    takeProfit?: number
    status: 'active' | 'warning' | 'critical'
}

const mockPositions: Position[] = [
    { id: 'P001', market: 'DAM', type: 'long', quantity: 500, entryPrice: 4480, currentPrice: 4532, pnl: 26000, pnlPercent: 1.16, margin: 224000, leverage: 10, openTime: new Date(Date.now() - 3600000 * 5), stopLoss: 4400, takeProfit: 4600, status: 'active' },
    { id: 'P002', market: 'RTM', type: 'short', quantity: 300, entryPrice: 4820, currentPrice: 4789, pnl: 9300, pnlPercent: 0.64, margin: 144600, leverage: 10, openTime: new Date(Date.now() - 3600000 * 3), status: 'active' },
    { id: 'P003', market: 'TAM', type: 'long', quantity: 200, entryPrice: 4380, currentPrice: 4345, pnl: -7000, pnlPercent: -0.80, margin: 87600, leverage: 10, openTime: new Date(Date.now() - 3600000 * 8), stopLoss: 4300, status: 'warning' },
    { id: 'P004', market: 'GDAM', type: 'long', quantity: 150, entryPrice: 4050, currentPrice: 4120, pnl: 10500, pnlPercent: 1.73, margin: 60750, leverage: 10, openTime: new Date(Date.now() - 3600000 * 12), takeProfit: 4200, status: 'active' },
    { id: 'P005', market: 'DAM', type: 'short', quantity: 400, entryPrice: 4600, currentPrice: 4650, pnl: -20000, pnlPercent: -1.09, margin: 184000, leverage: 10, openTime: new Date(Date.now() - 3600000 * 2), stopLoss: 4700, status: 'critical' },
    { id: 'P006', market: 'RTM', type: 'long', quantity: 250, entryPrice: 4700, currentPrice: 4789, pnl: 22250, pnlPercent: 1.89, margin: 117500, leverage: 10, openTime: new Date(Date.now() - 3600000 * 6), status: 'active' },
]

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>(mockPositions)
    const [filter, setFilter] = useState<'all' | 'long' | 'short'>('all')
    const [isUpdating, setIsUpdating] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)

    // Consistent number formatter to avoid hydration mismatch
    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-US').format(Math.round(num))
    }

    // Generate chart data for selected position
    const generateChartData = (position: Position) => {
        const data = []
        let price = position.entryPrice - 50 + Math.random() * 20
        for (let i = 0; i < 48; i++) {
            const change = (Math.random() - 0.48) * 25
            price = Math.max(position.entryPrice - 100, Math.min(position.entryPrice + 150, price + change))
            const volume = Math.floor(200 + Math.random() * 800)
            data.push({
                time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
                price: Math.round(price * 100) / 100,
                volume,
                high: price + Math.random() * 15,
                low: price - Math.random() * 15
            })
        }
        // End near current price
        data[data.length - 1].price = position.currentPrice
        return data
    }

    const handleMarketClick = (position: Position) => {
        setSelectedPosition(position)
        toast(`Loading ${position.market} chart...`, { icon: '📈' })
    }

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setIsUpdating(true)
            setPositions(prev => prev.map(pos => {
                const priceChange = (Math.random() - 0.5) * 20
                const newPrice = pos.currentPrice + priceChange
                const newPnl = (newPrice - pos.entryPrice) * pos.quantity * (pos.type === 'long' ? 1 : -1)
                const newPnlPercent = ((newPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.type === 'long' ? 1 : -1)

                let status: Position['status'] = 'active'
                if (newPnlPercent < -1.5) status = 'critical'
                else if (newPnlPercent < -0.5) status = 'warning'

                return { ...pos, currentPrice: newPrice, pnl: newPnl, pnlPercent: newPnlPercent, status }
            }))
            setTimeout(() => setIsUpdating(false), 200)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const filteredPositions = positions.filter(p => filter === 'all' || p.type === filter)

    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
    const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0)
    const totalValue = positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0)
    const longCount = positions.filter(p => p.type === 'long').length
    const shortCount = positions.filter(p => p.type === 'short').length

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className="transition-all duration-200"
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                    <ChartBarSquareIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Open Positions
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Monitor and manage your active trades
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={clsx(
                                    'flex items-center px-3 py-1 rounded-full text-sm',
                                    isUpdating
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                )}>
                                    <span className={clsx('w-2 h-2 rounded-full mr-2', isUpdating ? 'bg-green-500 animate-ping' : 'bg-gray-400')} />
                                    {isUpdating ? 'Updating...' : 'Live'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total P&L</span>
                            <div className={clsx(
                                'mt-1 text-2xl font-bold flex items-center',
                                totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {totalPnl >= 0 ? <ArrowTrendingUpIcon className="h-6 w-6 mr-1" /> : <ArrowTrendingDownIcon className="h-6 w-6 mr-1" />}
                                {totalPnl >= 0 ? '+' : ''}₹{formatNumber(totalPnl)}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</span>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{(totalValue / 100000).toFixed(2)}L
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Margin</span>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{(totalMargin / 100000).toFixed(2)}L
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Long Positions</span>
                            <div className="mt-1 text-2xl font-bold text-green-600">{longCount}</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Short Positions</span>
                            <div className="mt-1 text-2xl font-bold text-red-600">{shortCount}</div>
                        </motion.div>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        {(['all', 'long', 'short'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    'px-4 py-2 text-sm rounded-lg capitalize transition-colors',
                                    filter === f
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Positions Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="py-3 px-4 text-left">ID</th>
                                        <th className="py-3 px-4 text-left">Market</th>
                                        <th className="py-3 px-4 text-left">Type</th>
                                        <th className="py-3 px-4 text-right">Quantity</th>
                                        <th className="py-3 px-4 text-right">Entry</th>
                                        <th className="py-3 px-4 text-right">Current</th>
                                        <th className="py-3 px-4 text-right">P&L</th>
                                        <th className="py-3 px-4 text-right">Margin</th>
                                        <th className="py-3 px-4 text-left">Opened</th>
                                        <th className="py-3 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredPositions.map((pos, index) => (
                                        <motion.tr
                                            key={pos.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={clsx(
                                                'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                                                pos.status === 'critical' && 'bg-red-50/50 dark:bg-red-900/10',
                                                pos.status === 'warning' && 'bg-yellow-50/50 dark:bg-yellow-900/10'
                                            )}
                                        >
                                            <td className="py-3 px-4 font-mono text-sm text-gray-600 dark:text-gray-300">{pos.id}</td>
                                            <td
                                                className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                                onClick={() => handleMarketClick(pos)}
                                            >
                                                <span className="flex items-center">
                                                    <ChartBarIcon className="h-4 w-4 mr-1" />
                                                    {pos.market}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={clsx(
                                                    'px-2 py-0.5 rounded text-xs font-medium',
                                                    pos.type === 'long'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                )}>
                                                    {pos.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{pos.quantity}</td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-300">₹{pos.entryPrice.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">₹{pos.currentPrice.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={clsx(
                                                    'font-medium',
                                                    pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toLocaleString()}
                                                    <span className="text-xs ml-1">({pos.pnlPercent.toFixed(2)}%)</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">₹{pos.margin.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                {pos.openTime.toLocaleTimeString()}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Risk Warning */}
                    {positions.some(p => p.status === 'critical') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                        >
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                            <div>
                                <h4 className="font-medium text-red-800 dark:text-red-200">Risk Alert</h4>
                                <p className="text-sm text-red-600 dark:text-red-300">
                                    Some positions are approaching stop-loss levels. Consider reviewing your risk exposure.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </main>

                <AIInsightsBar />
            </div>

            {/* Chart Modal */}
            {selectedPosition && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedPosition.market} Price Chart
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Position {selectedPosition.id} • {selectedPosition.type.toUpperCase()} • {selectedPosition.quantity} MWh
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPosition(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Chart Area */}
                        <div className="p-5">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={generateChartData(selectedPosition)}>
                                        <defs>
                                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={selectedPosition.pnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={selectedPosition.pnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            domain={['dataMin - 30', 'dataMax + 30']}
                                            tickFormatter={(v) => `₹${v}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(value: number, name: string) => {
                                                if (name === 'price') return [`₹${value.toFixed(2)}`, 'Price']
                                                if (name === 'volume') return [value, 'Volume']
                                                return [value, name]
                                            }}
                                        />
                                        <ReferenceLine
                                            y={selectedPosition.entryPrice}
                                            stroke="#3b82f6"
                                            strokeDasharray="5 5"
                                            label={{ value: `Entry ₹${selectedPosition.entryPrice}`, fill: '#3b82f6', fontSize: 11 }}
                                        />
                                        {selectedPosition.stopLoss && (
                                            <ReferenceLine
                                                y={selectedPosition.stopLoss}
                                                stroke="#ef4444"
                                                strokeDasharray="5 5"
                                                label={{ value: `SL ₹${selectedPosition.stopLoss}`, fill: '#ef4444', fontSize: 11 }}
                                            />
                                        )}
                                        {selectedPosition.takeProfit && (
                                            <ReferenceLine
                                                y={selectedPosition.takeProfit}
                                                stroke="#10b981"
                                                strokeDasharray="5 5"
                                                label={{ value: `TP ₹${selectedPosition.takeProfit}`, fill: '#10b981', fontSize: 11 }}
                                            />
                                        )}
                                        <Bar dataKey="volume" fill="#6b7280" opacity={0.2} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke={selectedPosition.pnl >= 0 ? '#10b981' : '#ef4444'}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#priceGradient)"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Position Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Entry Price</span>
                                    <p className="font-semibold text-gray-900 dark:text-white">₹{selectedPosition.entryPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Current Price</span>
                                    <p className="font-semibold text-gray-900 dark:text-white">₹{selectedPosition.currentPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Unrealized P&L</span>
                                    <p className={clsx('font-semibold', selectedPosition.pnl >= 0 ? 'text-green-600' : 'text-red-600')}>
                                        {selectedPosition.pnl >= 0 ? '+' : ''}₹{selectedPosition.pnl.toLocaleString()} ({selectedPosition.pnlPercent.toFixed(2)}%)
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Margin Used</span>
                                    <p className="font-semibold text-gray-900 dark:text-white">₹{selectedPosition.margin.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-5">
                                <button
                                    onClick={() => {
                                        toast.success(`Stop-Loss updated for ${selectedPosition.market}`)
                                    }}
                                    className="px-4 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg font-medium"
                                >
                                    Modify Stop-Loss
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success(`Position ${selectedPosition.id} closed`)
                                        setPositions(prev => prev.filter(p => p.id !== selectedPosition.id))
                                        setSelectedPosition(null)
                                    }}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                                >
                                    Close Position
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
