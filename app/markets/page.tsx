'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    BoltIcon,
    GlobeAltIcon,
    FunnelIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'

/**
 * Markets Page
 * 
 * Live market overview with orderbook, price tickers, and market depth visualization.
 */

interface OrderBookEntry {
    price: number
    quantity: number
    total: number
    percentage: number
}

interface MarketTicker {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    volume: number
    lastUpdate: Date
}

interface Trade {
    id: string
    time: string
    type: 'buy' | 'sell'
    price: number
    quantity: number
    market: string
}

// Generate mock orderbook
function generateOrderBook(centerPrice: number): { bids: OrderBookEntry[], asks: OrderBookEntry[] } {
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []

    let bidTotal = 0
    let askTotal = 0

    for (let i = 0; i < 15; i++) {
        const bidQty = Math.floor(200 + Math.random() * 800)
        const askQty = Math.floor(200 + Math.random() * 800)
        bidTotal += bidQty
        askTotal += askQty

        bids.push({
            price: centerPrice - (i + 1) * 5 + Math.random() * 2,
            quantity: bidQty,
            total: bidTotal,
            percentage: 0
        })

        asks.push({
            price: centerPrice + (i + 1) * 5 + Math.random() * 2,
            quantity: askQty,
            total: askTotal,
            percentage: 0
        })
    }

    // Calculate percentages
    const maxTotal = Math.max(bidTotal, askTotal)
    bids.forEach(b => b.percentage = (b.total / maxTotal) * 100)
    asks.forEach(a => a.percentage = (a.total / maxTotal) * 100)

    return { bids, asks: asks.reverse() }
}

// Generate mock market data
function generateMarketTickers(): MarketTicker[] {
    return [
        { symbol: 'DAM', name: 'Day Ahead Market', price: 4532.50, change: 45.20, changePercent: 1.01, high: 4680, low: 4420, volume: 125000, lastUpdate: new Date() },
        { symbol: 'RTM', name: 'Real Time Market', price: 4789.00, change: -23.50, changePercent: -0.49, high: 4850, low: 4720, volume: 82000, lastUpdate: new Date() },
        { symbol: 'TAM', name: 'Term Ahead Market', price: 4345.75, change: 12.80, changePercent: 0.30, high: 4400, low: 4300, volume: 56000, lastUpdate: new Date() },
        { symbol: 'GDAM', name: 'Green Day Ahead', price: 4120.00, change: -8.50, changePercent: -0.21, high: 4180, low: 4080, volume: 32000, lastUpdate: new Date() },
        { symbol: 'HPDAM', name: 'High Price DAM', price: 5230.25, change: 78.40, changePercent: 1.52, high: 5280, low: 5150, volume: 21000, lastUpdate: new Date() },
        { symbol: 'REC', name: 'Renewable Certificates', price: 1850.00, change: 25.00, changePercent: 1.37, high: 1880, low: 1820, volume: 15000, lastUpdate: new Date() },
    ]
}

// Generate mock trades
function generateRecentTrades(): Trade[] {
    const markets = ['DAM', 'RTM', 'TAM']
    return Array.from({ length: 20 }, (_, i) => ({
        id: `trade-${i}`,
        time: new Date(Date.now() - i * 30000).toLocaleTimeString(),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: 4400 + Math.random() * 400,
        quantity: Math.floor(50 + Math.random() * 500),
        market: markets[Math.floor(Math.random() * markets.length)]
    }))
}

export default function MarketsPage() {
    const [selectedMarket, setSelectedMarket] = useState('DAM')
    const [tickers, setTickers] = useState<MarketTicker[]>(generateMarketTickers())
    const [orderBook, setOrderBook] = useState(generateOrderBook(4532.50))
    const [recentTrades, setRecentTrades] = useState<Trade[]>(generateRecentTrades())
    const [isUpdating, setIsUpdating] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setIsUpdating(true)

            // Update tickers
            setTickers(prev => prev.map(t => ({
                ...t,
                price: t.price + (Math.random() - 0.5) * 10,
                change: t.change + (Math.random() - 0.5) * 2,
                volume: t.volume + Math.floor(Math.random() * 100),
                lastUpdate: new Date()
            })))

            // Update orderbook
            const currentTicker = tickers.find(t => t.symbol === selectedMarket)
            if (currentTicker) {
                setOrderBook(generateOrderBook(currentTicker.price))
            }

            // Add new trade
            setRecentTrades(prev => [{
                id: `trade-${Date.now()}`,
                time: new Date().toLocaleTimeString(),
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                price: (currentTicker?.price || 4500) + (Math.random() - 0.5) * 50,
                quantity: Math.floor(50 + Math.random() * 500),
                market: selectedMarket
            }, ...prev.slice(0, 19)])

            setTimeout(() => setIsUpdating(false), 200)
        }, 3000)

        return () => clearInterval(interval)
    }, [selectedMarket, tickers])

    const selectedTicker = tickers.find(t => t.symbol === selectedMarket)

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
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                    <GlobeAltIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Live Markets
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        IEX India Energy Exchange
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                    <span className={clsx(
                                        'w-2 h-2 bg-green-500 rounded-full mr-2',
                                        isUpdating && 'animate-ping'
                                    )} />
                                    Markets Open
                                </span>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    <ArrowPathIcon className={clsx('h-5 w-5', isUpdating && 'animate-spin')} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20 space-y-6">
                    {/* Market Tickers Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {tickers.map(ticker => (
                            <button
                                key={ticker.symbol}
                                onClick={() => setSelectedMarket(ticker.symbol)}
                                className={clsx(
                                    'p-4 rounded-xl border-2 transition-all text-left',
                                    selectedMarket === ticker.symbol
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-900 dark:text-white">{ticker.symbol}</span>
                                    {ticker.change >= 0 ? (
                                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{ticker.price.toFixed(2)}
                                </div>
                                <div className={clsx(
                                    'text-sm',
                                    ticker.change >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {ticker.change >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Order Book */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Order Book - {selectedMarket}
                                    </h2>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {/* Headers */}
                                    <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        <span>Price (₹)</span>
                                        <span className="text-right">Quantity</span>
                                        <span className="text-right">Total</span>
                                    </div>

                                    {/* Asks (Sell orders) */}
                                    <div className="max-h-48 overflow-y-auto">
                                        {orderBook.asks.map((ask, i) => (
                                            <div key={`ask-${i}`} className="relative grid grid-cols-3 px-4 py-1.5 text-sm">
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 bg-red-100 dark:bg-red-900/20"
                                                    style={{ width: `${ask.percentage}%` }}
                                                />
                                                <span className="relative text-red-600 dark:text-red-400 font-medium">
                                                    {ask.price.toFixed(2)}
                                                </span>
                                                <span className="relative text-right text-gray-600 dark:text-gray-300">
                                                    {ask.quantity}
                                                </span>
                                                <span className="relative text-right text-gray-500 dark:text-gray-400">
                                                    {ask.total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Spread */}
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Spread</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                ₹{((orderBook.asks[orderBook.asks.length - 1]?.price || 0) - (orderBook.bids[0]?.price || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bids (Buy orders) */}
                                    <div className="max-h-48 overflow-y-auto">
                                        {orderBook.bids.map((bid, i) => (
                                            <div key={`bid-${i}`} className="relative grid grid-cols-3 px-4 py-1.5 text-sm">
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 bg-green-100 dark:bg-green-900/20"
                                                    style={{ width: `${bid.percentage}%` }}
                                                />
                                                <span className="relative text-green-600 dark:text-green-400 font-medium">
                                                    {bid.price.toFixed(2)}
                                                </span>
                                                <span className="relative text-right text-gray-600 dark:text-gray-300">
                                                    {bid.quantity}
                                                </span>
                                                <span className="relative text-right text-gray-500 dark:text-gray-400">
                                                    {bid.total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Details & Recent Trades */}
                        <div className="col-span-12 lg:col-span-7 space-y-6">
                            {/* Market Summary */}
                            {selectedTicker && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedTicker.name}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400">{selectedTicker.symbol}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                ₹{selectedTicker.price.toFixed(2)}
                                            </div>
                                            <div className={clsx(
                                                'flex items-center justify-end text-lg',
                                                selectedTicker.change >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {selectedTicker.change >= 0 ? (
                                                    <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                                                ) : (
                                                    <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                                                )}
                                                {selectedTicker.change >= 0 ? '+' : ''}{selectedTicker.change.toFixed(2)} ({selectedTicker.changePercent.toFixed(2)}%)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">High</span>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{selectedTicker.high.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Low</span>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{selectedTicker.low.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Volume</span>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{(selectedTicker.volume / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Last Update</span>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {selectedTicker.lastUpdate.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Trades */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Recent Trades
                                    </h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Last 20 trades
                                    </span>
                                </div>

                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                            <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                <th className="py-2 px-4 text-left">Time</th>
                                                <th className="py-2 px-4 text-left">Type</th>
                                                <th className="py-2 px-4 text-right">Price</th>
                                                <th className="py-2 px-4 text-right">Quantity</th>
                                                <th className="py-2 px-4 text-right">Market</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            <AnimatePresence>
                                                {recentTrades.map((trade, index) => (
                                                    <motion.tr
                                                        key={trade.id}
                                                        initial={index === 0 ? { opacity: 0, backgroundColor: trade.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' } : false}
                                                        animate={{ opacity: 1, backgroundColor: 'transparent' }}
                                                        className="text-sm"
                                                    >
                                                        <td className="py-2 px-4 text-gray-600 dark:text-gray-300">{trade.time}</td>
                                                        <td className="py-2 px-4">
                                                            <span className={clsx(
                                                                'px-2 py-0.5 rounded text-xs font-medium',
                                                                trade.type === 'buy'
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            )}>
                                                                {trade.type.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 text-right font-medium text-gray-900 dark:text-white">
                                                            ₹{trade.price.toFixed(2)}
                                                        </td>
                                                        <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">
                                                            {trade.quantity} MWh
                                                        </td>
                                                        <td className="py-2 px-4 text-right text-gray-500 dark:text-gray-400">
                                                            {trade.market}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <AIInsightsBar />
            </div>
        </div>
    )
}
