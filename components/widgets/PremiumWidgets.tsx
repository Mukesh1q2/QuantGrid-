'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChartBarIcon,
    ExclamationTriangleIcon,
    NewspaperIcon,
    CalendarIcon,
    ClockIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useMarketDataQuery } from '@/hooks/useMarketDataQuery'

// ========================
// ORDER BOOK WIDGET
// ========================
interface OrderBookEntry {
    price: number
    quantity: number
    total: number
    percentage: number
}

export function OrderBookWidget() {
    const [bids, setBids] = useState<OrderBookEntry[]>([])
    const [asks, setAsks] = useState<OrderBookEntry[]>([])
    const [spread, setSpread] = useState({ value: 0, percentage: 0 })

    // Use real IEX market data for base price
    const { data: marketData } = useMarketDataQuery('DAM')
    const basePrice = marketData?.price || 5.42
    const [lastPrice, setLastPrice] = useState(5.42)

    useEffect(() => {
        if (marketData?.price) {
            setLastPrice(marketData.price)
        }
    }, [marketData])

    useEffect(() => {
        const generateOrderBook = () => {
            const newBids: OrderBookEntry[] = []
            const newAsks: OrderBookEntry[] = []

            // Generate bids (buy orders - below current price)
            let bidTotal = 0
            for (let i = 0; i < 10; i++) {
                const price = basePrice - (i + 1) * 0.02 + (Math.random() * 0.01 - 0.005)
                const quantity = Math.floor(500 + Math.random() * 2000)
                bidTotal += quantity
                newBids.push({
                    price: parseFloat(price.toFixed(2)),
                    quantity,
                    total: bidTotal,
                    percentage: 0
                })
            }

            // Generate asks (sell orders - above current price)
            let askTotal = 0
            for (let i = 0; i < 10; i++) {
                const price = basePrice + (i + 1) * 0.02 + (Math.random() * 0.01 - 0.005)
                const quantity = Math.floor(500 + Math.random() * 2000)
                askTotal += quantity
                newAsks.push({
                    price: parseFloat(price.toFixed(2)),
                    quantity,
                    total: askTotal,
                    percentage: 0
                })
            }

            // Calculate percentages
            const maxTotal = Math.max(bidTotal, askTotal)
            newBids.forEach(b => b.percentage = (b.total / maxTotal) * 100)
            newAsks.forEach(a => a.percentage = (a.total / maxTotal) * 100)

            setBids(newBids)
            setAsks(newAsks)

            // Calculate spread
            const bestBid = newBids[0]?.price || 0
            const bestAsk = newAsks[0]?.price || 0
            setSpread({
                value: parseFloat((bestAsk - bestBid).toFixed(3)),
                percentage: parseFloat((((bestAsk - bestBid) / bestBid) * 100).toFixed(2))
            })
        }

        generateOrderBook()
        const interval = setInterval(generateOrderBook, 2000)
        return () => clearInterval(interval)
    }, [basePrice])

    return (
        <div className="h-full flex flex-col p-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Last Price</span>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">₹{lastPrice}</div>
                </div>
                <div className="text-center flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Spread</span>
                    <div className="text-lg font-bold text-yellow-600">₹{spread.value} ({spread.percentage}%)</div>
                </div>
            </div>

            {/* Order Book Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
                {/* Bids (Buy) */}
                <div className="flex flex-col">
                    <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                        <span>Price</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5">
                        {bids.map((bid, i) => (
                            <div key={i} className="relative">
                                <div
                                    className="absolute inset-0 bg-green-500/20"
                                    style={{ width: `${bid.percentage}%` }}
                                />
                                <div className="relative grid grid-cols-3 text-xs px-1 py-0.5">
                                    <span className="font-medium text-green-600 dark:text-green-400">₹{bid.price}</span>
                                    <span className="text-right text-gray-700 dark:text-gray-300">{bid.quantity.toLocaleString()}</span>
                                    <span className="text-right text-gray-500 dark:text-gray-400">{bid.total.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Asks (Sell) */}
                <div className="flex flex-col">
                    <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                        <span>Price</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Total</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0.5">
                        {asks.map((ask, i) => (
                            <div key={i} className="relative">
                                <div
                                    className="absolute inset-0 right-0 bg-red-500/20"
                                    style={{ width: `${ask.percentage}%`, marginLeft: 'auto' }}
                                />
                                <div className="relative grid grid-cols-3 text-xs px-1 py-0.5">
                                    <span className="font-medium text-red-600 dark:text-red-400">₹{ask.price}</span>
                                    <span className="text-right text-gray-700 dark:text-gray-300">{ask.quantity.toLocaleString()}</span>
                                    <span className="text-right text-gray-500 dark:text-gray-400">{ask.total.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================
// DEPTH CHART WIDGET
// ========================
export function DepthChartWidget() {
    const [data, setData] = useState<{ bids: number[][]; asks: number[][] }>({ bids: [], asks: [] })

    // Use real IEX market data
    const { data: marketData } = useMarketDataQuery()
    const basePrice = marketData?.mcp || 5.42 // Use real MCP or fallback

    useEffect(() => {
        const generateDepthData = () => {
            const bids: number[][] = []
            const asks: number[][] = []

            let bidCumulative = 0
            let askCumulative = 0

            for (let i = 20; i >= 1; i--) {
                const price = basePrice - i * 0.02
                bidCumulative += Math.floor(500 + Math.random() * 1500)
                bids.push([price, bidCumulative])
            }

            for (let i = 1; i <= 20; i++) {
                const price = basePrice + i * 0.02
                askCumulative += Math.floor(500 + Math.random() * 1500)
                asks.push([price, askCumulative])
            }

            setData({ bids, asks })
        }

        generateDepthData()
        const interval = setInterval(generateDepthData, 3000)
        return () => clearInterval(interval)
    }, [basePrice])

    const maxVolume = useMemo(() => {
        const maxBid = data.bids[0]?.[1] || 0
        const maxAsk = data.asks[data.asks.length - 1]?.[1] || 0
        return Math.max(maxBid, maxAsk)
    }, [data])

    const minPrice = (basePrice - 0.4).toFixed(2)
    const maxPrice = (basePrice + 0.4).toFixed(2)

    return (
        <div className="h-full flex flex-col p-3">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-green-600 font-medium">● Bids (Buy)</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹{basePrice.toFixed(2)}</span>
                <span className="text-xs text-red-600 font-medium">● Asks (Sell)</span>
            </div>

            {/* Visual Depth Chart */}
            <div className="flex-1 relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {/* Bids Area */}
                    <path
                        d={`M 0 200 ${data.bids.map((b, i) =>
                            `L ${(i / data.bids.length) * 200} ${200 - (b[1] / maxVolume) * 180}`
                        ).join(' ')} L 200 200 Z`}
                        fill="rgba(34, 197, 94, 0.3)"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="2"
                    />

                    {/* Asks Area */}
                    <path
                        d={`M 200 200 ${data.asks.map((a, i) =>
                            `L ${200 + (i / data.asks.length) * 200} ${200 - (a[1] / maxVolume) * 180}`
                        ).join(' ')} L 400 200 Z`}
                        fill="rgba(239, 68, 68, 0.3)"
                        stroke="rgb(239, 68, 68)"
                        strokeWidth="2"
                    />

                    {/* Center Line */}
                    <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeDasharray="4" opacity="0.3" />
                </svg>

                {/* Price Labels */}
                <div className="absolute bottom-1 left-2 text-xs text-green-600">₹{minPrice}</div>
                <div className="absolute bottom-1 right-2 text-xs text-red-600">₹{maxPrice}</div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mt-3 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <div className="text-xs text-green-600">Total Bid Volume</div>
                    <div className="text-sm font-bold text-green-700 dark:text-green-400">
                        {(data.bids[0]?.[1] || 0).toLocaleString()} MWh
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <div className="text-xs text-red-600">Total Ask Volume</div>
                    <div className="text-sm font-bold text-red-700 dark:text-red-400">
                        {(data.asks[data.asks.length - 1]?.[1] || 0).toLocaleString()} MWh
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================
// TRADE TICKER WIDGET
// ========================
interface Trade {
    id: string
    time: string
    price: number
    quantity: number
    side: 'buy' | 'sell'
    market: string
}

export function TradeTickerWidget() {
    const [trades, setTrades] = useState<Trade[]>([])

    // Use real IEX market data for price reference
    const { data: marketData } = useMarketDataQuery()
    const basePrice = marketData?.mcp || 5.2

    useEffect(() => {
        const markets = ['DAM', 'RTM', 'TAM']

        const addTrade = () => {
            const newTrade: Trade = {
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                price: parseFloat((basePrice + (Math.random() - 0.5) * 0.5).toFixed(2)),
                quantity: Math.floor(100 + Math.random() * 900),
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                market: markets[Math.floor(Math.random() * markets.length)]
            }

            setTrades(prev => [newTrade, ...prev.slice(0, 19)])
        }

        // Initial trades
        for (let i = 0; i < 10; i++) addTrade()

        const interval = setInterval(addTrade, 1500)
        return () => clearInterval(interval)
    }, [basePrice])

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-5 text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span>Time</span>
                <span>Market</span>
                <span className="text-right">Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Side</span>
            </div>

            {/* Trades List */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence initial={false}>
                    {trades.map((trade) => (
                        <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, x: -20, backgroundColor: trade.side === 'buy' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
                            animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-5 text-xs px-3 py-1.5 border-b border-gray-100 dark:border-gray-800"
                        >
                            <span className="text-gray-500 dark:text-gray-400">{trade.time}</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{trade.market}</span>
                            <span className={clsx(
                                'text-right font-medium',
                                trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                            )}>
                                ₹{trade.price}
                            </span>
                            <span className="text-right text-gray-700 dark:text-gray-300">{trade.quantity}</span>
                            <span className={clsx(
                                'text-right font-medium uppercase text-xs',
                                trade.side === 'buy' ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trade.side}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ========================
// POSITION MONITOR WIDGET
// ========================
interface Position {
    id: string
    asset: string
    market: string
    side: 'long' | 'short'
    entryPrice: number
    currentPrice: number
    quantity: number
    pnl: number
    pnlPercent: number
}

export function PositionMonitorWidget() {
    const [positions, setPositions] = useState<Position[]>([])
    const [totals, setTotals] = useState({ pnl: 0, exposure: 0 })

    useEffect(() => {
        const generatePositions = () => {
            const newPositions: Position[] = [
                {
                    id: '1',
                    asset: 'Northern Grid',
                    market: 'DAM',
                    side: 'long',
                    entryPrice: 5.20,
                    currentPrice: 5.42,
                    quantity: 500,
                    pnl: 110,
                    pnlPercent: 4.23
                },
                {
                    id: '2',
                    asset: 'Southern Grid',
                    market: 'RTM',
                    side: 'long',
                    entryPrice: 4.85,
                    currentPrice: 4.92,
                    quantity: 800,
                    pnl: 56,
                    pnlPercent: 1.44
                },
                {
                    id: '3',
                    asset: 'Western Grid',
                    market: 'DAM',
                    side: 'short',
                    entryPrice: 5.60,
                    currentPrice: 5.52,
                    quantity: 300,
                    pnl: 24,
                    pnlPercent: 1.43
                },
                {
                    id: '4',
                    asset: 'Eastern Grid',
                    market: 'TAM',
                    side: 'long',
                    entryPrice: 4.70,
                    currentPrice: 4.55,
                    quantity: 400,
                    pnl: -60,
                    pnlPercent: -3.19
                }
            ]

            // Add some randomness to prices
            newPositions.forEach(p => {
                const change = (Math.random() - 0.5) * 0.1
                p.currentPrice = parseFloat((p.currentPrice + change).toFixed(2))
                p.pnl = parseFloat(((p.currentPrice - p.entryPrice) * p.quantity * (p.side === 'short' ? -1 : 1)).toFixed(2))
                p.pnlPercent = parseFloat(((p.pnl / (p.entryPrice * p.quantity)) * 100).toFixed(2))
            })

            setPositions(newPositions)

            const totalPnl = newPositions.reduce((sum, p) => sum + p.pnl, 0)
            const totalExposure = newPositions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
            setTotals({ pnl: totalPnl, exposure: totalExposure })
        }

        generatePositions()
        const interval = setInterval(generatePositions, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-full flex flex-col">
            {/* Summary Bar */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total P&L</div>
                    <div className={clsx(
                        'text-lg font-bold',
                        totals.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {totals.pnl >= 0 ? '+' : ''}₹{totals.pnl.toFixed(2)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Exposure</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{totals.exposure.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Positions Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-xs">
                    <thead className="text-gray-500 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-900">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-2">Asset</th>
                            <th className="text-center">Side</th>
                            <th className="text-right">Entry</th>
                            <th className="text-right">Current</th>
                            <th className="text-right px-2">P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((pos) => (
                            <tr key={pos.id} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2 px-2">
                                    <div className="font-medium text-gray-900 dark:text-white">{pos.asset}</div>
                                    <div className="text-gray-500">{pos.market} • {pos.quantity} MWh</div>
                                </td>
                                <td className="text-center">
                                    <span className={clsx(
                                        'px-1.5 py-0.5 rounded text-xs font-medium',
                                        pos.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    )}>
                                        {pos.side.toUpperCase()}
                                    </span>
                                </td>
                                <td className="text-right text-gray-600 dark:text-gray-400">₹{pos.entryPrice}</td>
                                <td className="text-right font-medium text-gray-900 dark:text-white">₹{pos.currentPrice}</td>
                                <td className={clsx(
                                    'text-right px-2 font-medium',
                                    pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    <div>{pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(0)}</div>
                                    <div className="text-xs opacity-75">{pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent}%</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ========================
// RISK DASHBOARD WIDGET
// ========================
export function RiskDashboardWidget() {
    const [metrics, setMetrics] = useState({
        var95: 12500,
        var99: 18750,
        maxDrawdown: -4.2,
        sharpeRatio: 1.85,
        sortino: 2.12,
        beta: 0.92,
        exposure: {
            long: 65,
            short: 35
        },
        concentration: [
            { region: 'Northern', percent: 35 },
            { region: 'Southern', percent: 28 },
            { region: 'Western', percent: 22 },
            { region: 'Eastern', percent: 15 }
        ]
    })

    return (
        <div className="h-full p-3 overflow-y-auto">
            {/* VaR Section */}
            <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Value at Risk</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                        <div className="text-xs text-orange-600">VaR (95%)</div>
                        <div className="text-lg font-bold text-orange-700 dark:text-orange-400">₹{metrics.var95.toLocaleString()}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                        <div className="text-xs text-red-600">VaR (99%)</div>
                        <div className="text-lg font-bold text-red-700 dark:text-red-400">₹{metrics.var99.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Performance</h4>
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-500">Sharpe</div>
                        <div className="text-sm font-bold text-green-600">{metrics.sharpeRatio}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-500">Sortino</div>
                        <div className="text-sm font-bold text-green-600">{metrics.sortino}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-500">Beta</div>
                        <div className="text-sm font-bold text-blue-600">{metrics.beta}</div>
                    </div>
                </div>
            </div>

            {/* Exposure Bar */}
            <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Exposure</h4>
                <div className="h-4 flex rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${metrics.exposure.long}%` }}
                    >
                        {metrics.exposure.long}% Long
                    </div>
                    <div
                        className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${metrics.exposure.short}%` }}
                    >
                        {metrics.exposure.short}% Short
                    </div>
                </div>
            </div>

            {/* Concentration */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Concentration</h4>
                <div className="space-y-1">
                    {metrics.concentration.map((item, i) => (
                        <div key={i} className="flex items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-20">{item.region}</span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${item.percent}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{item.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ========================
// NEWS FEED WIDGET
// ========================
interface NewsItem {
    id: string
    title: string
    source: string
    time: string
    sentiment: 'positive' | 'negative' | 'neutral'
    category: string
}

export function NewsFeedWidget() {
    const [news] = useState<NewsItem[]>([
        {
            id: '1',
            title: 'IEX India records highest trading volume in December',
            source: 'Economic Times',
            time: '10 min ago',
            sentiment: 'positive',
            category: 'Market'
        },
        {
            id: '2',
            title: 'Grid frequency drops to 49.85 Hz during peak hours',
            source: 'Power Grid Corp',
            time: '25 min ago',
            sentiment: 'negative',
            category: 'Grid'
        },
        {
            id: '3',
            title: 'Solar generation exceeds 50 GW for first time',
            source: 'MNRE',
            time: '1 hour ago',
            sentiment: 'positive',
            category: 'Renewable'
        },
        {
            id: '4',
            title: 'CERC proposes new tariff regulations for FY26',
            source: 'CERC',
            time: '2 hours ago',
            sentiment: 'neutral',
            category: 'Regulatory'
        },
        {
            id: '5',
            title: 'Coal shortage expected to ease by next week',
            source: 'Coal India',
            time: '3 hours ago',
            sentiment: 'positive',
            category: 'Supply'
        }
    ])

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
            case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800'
        }
    }

    return (
        <div className="h-full overflow-y-auto">
            {news.map((item) => (
                <div
                    key={item.id}
                    className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                    <div className="flex items-start justify-between mb-1">
                        <span className={clsx(
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            getSentimentColor(item.sentiment)
                        )}>
                            {item.category}
                        </span>
                        <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {item.title}
                    </h4>
                    <span className="text-xs text-gray-500">{item.source}</span>
                </div>
            ))}
        </div>
    )
}

// ========================
// ECONOMIC CALENDAR WIDGET
// ========================
interface CalendarEvent {
    id: string
    title: string
    date: string
    time: string
    type: 'auction' | 'maintenance' | 'regulatory' | 'market'
    impact: 'high' | 'medium' | 'low'
}

export function EconomicCalendarWidget() {
    const [events] = useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'DAM Auction Session',
            date: 'Today',
            time: '10:00 AM',
            type: 'auction',
            impact: 'high'
        },
        {
            id: '2',
            title: 'Northern Grid Maintenance',
            date: 'Today',
            time: '2:00 PM',
            type: 'maintenance',
            impact: 'medium'
        },
        {
            id: '3',
            title: 'RTM Session Opens',
            date: 'Tomorrow',
            time: '6:00 AM',
            type: 'market',
            impact: 'high'
        },
        {
            id: '4',
            title: 'CERC Quarterly Review',
            date: 'Dec 25',
            time: '11:00 AM',
            type: 'regulatory',
            impact: 'high'
        },
        {
            id: '5',
            title: 'Western Grid Upgrade',
            date: 'Dec 28',
            time: 'All Day',
            type: 'maintenance',
            impact: 'low'
        }
    ])

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'auction': return 'bg-blue-500'
            case 'maintenance': return 'bg-yellow-500'
            case 'regulatory': return 'bg-purple-500'
            case 'market': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getImpactBadge = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    return (
        <div className="h-full overflow-y-auto">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="flex items-start p-3 border-b border-gray-100 dark:border-gray-800"
                >
                    <div className={clsx('w-1 h-full min-h-[40px] rounded-full mr-3', getTypeColor(event.type))} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{event.date} • {event.time}</span>
                            <span className={clsx(
                                'text-xs px-1.5 py-0.5 rounded font-medium uppercase',
                                getImpactBadge(event.impact)
                            )}>
                                {event.impact}
                            </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ========================
// SESSION STATS WIDGET
// ========================
export function SessionStatsWidget() {
    const [stats] = useState({
        today: {
            trades: 1247,
            volume: 45620,
            avgPrice: 5.38,
            high: 5.72,
            low: 5.12,
            vwap: 5.41
        },
        comparison: {
            trades: 12.5,
            volume: 8.2,
            avgPrice: -2.1
        }
    })

    return (
        <div className="h-full p-3 overflow-y-auto">
            {/* Main Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Trades</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.today.trades.toLocaleString()}</div>
                    <div className={clsx(
                        'text-xs',
                        stats.comparison.trades >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {stats.comparison.trades >= 0 ? '↑' : '↓'}{Math.abs(stats.comparison.trades)}%
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{(stats.today.volume / 1000).toFixed(1)}k</div>
                    <div className={clsx(
                        'text-xs',
                        stats.comparison.volume >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {stats.comparison.volume >= 0 ? '↑' : '↓'}{Math.abs(stats.comparison.volume)}%
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Avg Price</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">₹{stats.today.avgPrice}</div>
                    <div className={clsx(
                        'text-xs',
                        stats.comparison.avgPrice >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                        {stats.comparison.avgPrice >= 0 ? '↑' : '↓'}{Math.abs(stats.comparison.avgPrice)}%
                    </div>
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Today's Range</h4>
                <div className="relative h-6 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
                    <div
                        className="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${((stats.today.avgPrice - stats.today.low) / (stats.today.high - stats.today.low)) * 100}%` }}
                        title={`Current: ₹${stats.today.avgPrice}`}
                    />
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-600">Low: ₹{stats.today.low}</span>
                    <span className="text-gray-500">VWAP: ₹{stats.today.vwap}</span>
                    <span className="text-red-600">High: ₹{stats.today.high}</span>
                </div>
            </div>

            {/* Market Sessions */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Market Sessions</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">DAM</span>
                        <span className="text-xs text-green-600">Active • 10:00-14:00</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RTM</span>
                        <span className="text-xs text-gray-500">Next: 14:30</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TAM</span>
                        <span className="text-xs text-gray-500">Closed</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================
// HEAT MAP WIDGET
// ========================
export function HeatMapWidget() {
    const [data] = useState([
        { region: 'Northern', dam: 5.42, rtm: 5.38, tam: 5.45 },
        { region: 'Southern', dam: 4.95, rtm: 4.88, tam: 5.02 },
        { region: 'Western', dam: 5.28, rtm: 5.32, tam: 5.25 },
        { region: 'Eastern', dam: 4.72, rtm: 4.68, tam: 4.80 },
        { region: 'NE', dam: 4.55, rtm: 4.52, tam: 4.58 }
    ])

    const getHeatColor = (value: number) => {
        const min = 4.5, max = 5.5
        const normalized = (value - min) / (max - min)
        if (normalized < 0.33) return 'bg-green-500'
        if (normalized < 0.66) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="h-full p-3">
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-gray-500 dark:text-gray-400">
                        <th className="text-left py-2">Region</th>
                        <th className="text-center">DAM</th>
                        <th className="text-center">RTM</th>
                        <th className="text-center">TAM</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="py-2 font-medium text-gray-900 dark:text-white">{row.region}</td>
                            <td className="text-center">
                                <span className={clsx(
                                    'inline-block px-2 py-1 rounded text-white font-medium',
                                    getHeatColor(row.dam)
                                )}>
                                    ₹{row.dam}
                                </span>
                            </td>
                            <td className="text-center">
                                <span className={clsx(
                                    'inline-block px-2 py-1 rounded text-white font-medium',
                                    getHeatColor(row.rtm)
                                )}>
                                    ₹{row.rtm}
                                </span>
                            </td>
                            <td className="text-center">
                                <span className={clsx(
                                    'inline-block px-2 py-1 rounded text-white font-medium',
                                    getHeatColor(row.tam)
                                )}>
                                    ₹{row.tam}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-gray-500">Low (&lt;₹4.80)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-gray-500">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-gray-500">High (&gt;₹5.20)</span>
                </div>
            </div>
        </div>
    )
}
