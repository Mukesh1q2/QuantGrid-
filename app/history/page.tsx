'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ClockIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import toast from 'react-hot-toast'

/**
 * History Page
 * 
 * Complete trade history with filtering, search, and export capabilities.
 */

interface Trade {
    id: string
    timestamp: Date
    market: string
    type: 'buy' | 'sell'
    quantity: number
    price: number
    total: number
    fee: number
    status: 'completed' | 'cancelled' | 'partial'
    orderId: string
    pnl?: number
}

// Generate mock history
function generateHistory(): Trade[] {
    const markets = ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM']
    const trades: Trade[] = []

    for (let i = 0; i < 100; i++) {
        const market = markets[Math.floor(Math.random() * markets.length)]
        const type = Math.random() > 0.5 ? 'buy' : 'sell'
        const quantity = Math.floor(50 + Math.random() * 500)
        const price = 4000 + Math.random() * 1000
        const total = quantity * price
        const fee = total * 0.001
        const status = Math.random() > 0.9 ? 'cancelled' : Math.random() > 0.85 ? 'partial' : 'completed'
        const pnl = status === 'completed' ? (Math.random() - 0.4) * 20000 : undefined

        trades.push({
            id: `TRD-${String(100 - i).padStart(5, '0')}`,
            timestamp: new Date(Date.now() - i * 3600000 * Math.random() * 24),
            market,
            type,
            quantity,
            price,
            total,
            fee,
            status,
            orderId: `ORD-${String(100 - i).padStart(5, '0')}`,
            pnl
        })
    }

    return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export default function HistoryPage() {
    const [history] = useState<Trade[]>(generateHistory())
    const [searchQuery, setSearchQuery] = useState('')
    const [marketFilter, setMarketFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const itemsPerPage = 15

    const filteredHistory = history.filter(trade => {
        const matchesSearch = trade.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trade.orderId.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesMarket = marketFilter === 'all' || trade.market === marketFilter
        const matchesType = typeFilter === 'all' || trade.type === typeFilter
        return matchesSearch && matchesMarket && matchesType
    })

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const totalVolume = filteredHistory.reduce((sum, t) => sum + t.total, 0)
    const totalFees = filteredHistory.reduce((sum, t) => sum + t.fee, 0)
    const totalPnl = filteredHistory.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const completedCount = filteredHistory.filter(t => t.status === 'completed').length

    const handleExportCSV = () => {
        const headers = ['Trade ID', 'Timestamp', 'Market', 'Type', 'Quantity (MWh)', 'Price (₹/MWh)', 'Total (₹)', 'Fee (₹)', 'P&L (₹)', 'Status', 'Order ID']
        const rows = filteredHistory.map(trade => [
            trade.id,
            trade.timestamp.toISOString(),
            trade.market,
            trade.type.toUpperCase(),
            trade.quantity.toString(),
            trade.price.toFixed(2),
            trade.total.toFixed(2),
            trade.fee.toFixed(2),
            trade.pnl !== undefined ? trade.pnl.toFixed(2) : '-',
            trade.status,
            trade.orderId
        ])

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(`Exported ${filteredHistory.length} trades to CSV`)
    }

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
                                <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg">
                                    <ClockIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Trade History
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Complete record of all your trades
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Volume</span>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{(totalVolume / 10000000).toFixed(2)}Cr
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Fees</span>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{totalFees.toLocaleString()}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Realized P&L</span>
                            <div className={clsx(
                                'mt-1 text-2xl font-bold flex items-center',
                                totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-400">Completed Trades</span>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                {completedCount} / {filteredHistory.length}
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Trade ID or Order ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="h-5 w-5 text-gray-400" />
                            <select
                                value={marketFilter}
                                onChange={e => setMarketFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Markets</option>
                                <option value="DAM">DAM</option>
                                <option value="RTM">RTM</option>
                                <option value="TAM">TAM</option>
                                <option value="GDAM">GDAM</option>
                                <option value="HPDAM">HPDAM</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Types</option>
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="py-3 px-4 text-left">Trade ID</th>
                                        <th className="py-3 px-4 text-left">Date/Time</th>
                                        <th className="py-3 px-4 text-left">Market</th>
                                        <th className="py-3 px-4 text-left">Type</th>
                                        <th className="py-3 px-4 text-right">Quantity</th>
                                        <th className="py-3 px-4 text-right">Price</th>
                                        <th className="py-3 px-4 text-right">Total</th>
                                        <th className="py-3 px-4 text-right">P&L</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {paginatedHistory.map((trade, index) => (
                                        <motion.tr
                                            key={trade.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="py-3 px-4 font-mono text-sm text-blue-600 dark:text-blue-400">{trade.id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                                                {trade.timestamp.toLocaleDateString()} {trade.timestamp.toLocaleTimeString()}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{trade.market}</td>
                                            <td className="py-3 px-4">
                                                <span className={clsx(
                                                    'flex items-center text-sm',
                                                    trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {trade.type === 'buy' ? (
                                                        <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                                    ) : (
                                                        <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                                    )}
                                                    {trade.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{trade.quantity}</td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-300">₹{trade.price.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">₹{trade.total.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                {trade.pnl !== undefined ? (
                                                    <span className={clsx('font-medium', trade.pnl >= 0 ? 'text-green-600' : 'text-red-600')}>
                                                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={clsx(
                                                    'px-2 py-0.5 rounded text-xs font-medium',
                                                    trade.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        trade.status === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                )}>
                                                    {trade.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </button>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <ChevronRightIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <AIInsightsBar />
            </div>
        </div>
    )
}
