'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    BoltIcon,
    AdjustmentsHorizontalIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import { useIEXSync } from '@/hooks/useIEXSync'

/**
 * Trading Page
 * 
 * Comprehensive trading interface for IEX India energy markets
 */

interface Order {
    id: string
    type: 'buy' | 'sell'
    market: string
    quantity: number
    price: number
    status: 'pending' | 'filled' | 'cancelled' | 'partial'
    filledQuantity: number
    timestamp: string
}

interface MarketData {
    symbol: string
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    volume: number
    bid: number
    ask: number
}

// Mock data generators
function generatePriceHistory() {
    const data = []
    let price = 4500 + Math.random() * 500
    for (let i = 24; i >= 0; i--) {
        price = price + (Math.random() - 0.5) * 100
        data.push({
            time: `${i}h ago`,
            price: Math.round(price),
            volume: Math.round(1000 + Math.random() * 2000)
        })
    }
    return data.reverse()
}

function generateMarketData(): MarketData[] {
    return [
        { symbol: 'DAM', price: 4532.50, change: 45.20, changePercent: 1.01, high: 4680, low: 4420, volume: 12500, bid: 4530, ask: 4535 },
        { symbol: 'RTM', price: 4789.00, change: -23.50, changePercent: -0.49, high: 4850, low: 4720, volume: 8200, bid: 4787, ask: 4791 },
        { symbol: 'TAM', price: 4345.75, change: 12.80, changePercent: 0.30, high: 4400, low: 4300, volume: 5600, bid: 4344, ask: 4347 },
        { symbol: 'GDAM', price: 4120.00, change: -8.50, changePercent: -0.21, high: 4180, low: 4080, volume: 3200, bid: 4118, ask: 4122 },
        { symbol: 'HPDAM', price: 5230.25, change: 78.40, changePercent: 1.52, high: 5280, low: 5150, volume: 2100, bid: 5228, ask: 5232 }
    ]
}

function generateOrders(): Order[] {
    return [
        { id: 'ORD-001', type: 'buy', market: 'DAM', quantity: 500, price: 4520, status: 'filled', filledQuantity: 500, timestamp: '2 min ago' },
        { id: 'ORD-002', type: 'sell', market: 'RTM', quantity: 300, price: 4800, status: 'pending', filledQuantity: 0, timestamp: '5 min ago' },
        { id: 'ORD-003', type: 'buy', market: 'TAM', quantity: 200, price: 4340, status: 'partial', filledQuantity: 150, timestamp: '12 min ago' },
        { id: 'ORD-004', type: 'sell', market: 'DAM', quantity: 450, price: 4550, status: 'filled', filledQuantity: 450, timestamp: '25 min ago' },
        { id: 'ORD-005', type: 'buy', market: 'GDAM', quantity: 100, price: 4100, status: 'cancelled', filledQuantity: 0, timestamp: '1 hr ago' }
    ]
}

export default function TradingPage() {
    const [selectedMarket, setSelectedMarket] = useState('DAM')
    const [priceHistory, setPriceHistory] = useState(generatePriceHistory())
    const [markets, setMarkets] = useState(generateMarketData())
    const [orders, setOrders] = useState(generateOrders())
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
    const [orderQuantity, setOrderQuantity] = useState('')
    const [orderPrice, setOrderPrice] = useState('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [selectedTimeframe, setSelectedTimeframe] = useState('1H')

    // IEX India data sync with 5-minute interval
    const { markets: iexMarkets, isConnected, lastSyncTime, forceSync } = useIEXSync({
        syncIntervalMs: 5 * 60 * 1000,
        autoConnect: true
    })

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMarkets(prev => prev.map(m => ({
                ...m,
                price: m.price + (Math.random() - 0.5) * 10,
                change: m.change + (Math.random() - 0.5) * 2,
                volume: m.volume + Math.floor(Math.random() * 50)
            })))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const selectedMarketData = markets.find(m => m.symbol === selectedMarket)

    const handlePlaceOrder = () => {
        if (!orderQuantity || !orderPrice) return

        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            type: orderType,
            market: selectedMarket,
            quantity: parseFloat(orderQuantity),
            price: parseFloat(orderPrice),
            status: 'pending',
            filledQuantity: 0,
            timestamp: 'Just now'
        }

        setOrders(prev => [newOrder, ...prev])
        setOrderQuantity('')
        setOrderPrice('')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className="transition-all duration-200"
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Energy Trading
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        IEX India Markets
                                    </p>
                                </div>
                            </div>
                            <span className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                Markets Open
                            </span>
                        </div>
                    </div>
                </header>

                <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Market Selector */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                    Markets
                                </h2>
                                <div className="space-y-2">
                                    {markets.map(market => (
                                        <button
                                            key={market.symbol}
                                            onClick={() => setSelectedMarket(market.symbol)}
                                            className={clsx(
                                                'w-full flex items-center justify-between p-3 rounded-lg transition-all',
                                                selectedMarket === market.symbol
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                                                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                                            )}
                                        >
                                            <div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {market.symbol}
                                                </span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Vol: {market.volume.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    ₹{market.price.toFixed(2)}
                                                </span>
                                                <p className={clsx(
                                                    'text-xs flex items-center justify-end',
                                                    market.change >= 0 ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {market.change >= 0 ? (
                                                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                                                    )}
                                                    {market.changePercent.toFixed(2)}%
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedMarket} Price Chart
                                        </h2>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            ₹{selectedMarketData?.price.toFixed(2)}
                                            <span className={clsx(
                                                'text-sm ml-2',
                                                (selectedMarketData?.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {(selectedMarketData?.change || 0) >= 0 ? '+' : ''}
                                                {selectedMarketData?.changePercent.toFixed(2)}%
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {['15m', '30m', '1H', '4H', '1D', '1W'].map(period => (
                                            <button
                                                key={period}
                                                onClick={() => setSelectedTimeframe(period)}
                                                className={clsx(
                                                    'px-3 py-1 text-sm rounded-lg transition-colors',
                                                    selectedTimeframe === period
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                )}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                                            <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    borderColor: '#374151',
                                                    borderRadius: '8px'
                                                }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">High</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ₹{selectedMarketData?.high.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Low</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ₹{selectedMarketData?.low.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Bid</span>
                                        <p className="font-semibold text-green-600">
                                            ₹{selectedMarketData?.bid.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Ask</span>
                                        <p className="font-semibold text-red-600">
                                            ₹{selectedMarketData?.ask.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                    Place Order
                                </h2>

                                {/* Buy/Sell Toggle */}
                                <div className="flex rounded-lg overflow-hidden mb-4">
                                    <button
                                        onClick={() => setOrderType('buy')}
                                        className={clsx(
                                            'flex-1 py-2 font-semibold transition-colors',
                                            orderType === 'buy'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        )}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => setOrderType('sell')}
                                        className={clsx(
                                            'flex-1 py-2 font-semibold transition-colors',
                                            orderType === 'sell'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        )}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Quantity (MWh)
                                        </label>
                                        <input
                                            type="number"
                                            value={orderQuantity}
                                            onChange={(e) => setOrderQuantity(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Price (₹/MWh)
                                        </label>
                                        <input
                                            type="number"
                                            value={orderPrice}
                                            onChange={(e) => setOrderPrice(e.target.value)}
                                            placeholder={selectedMarketData?.price.toFixed(2)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Total Value</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                ₹{((parseFloat(orderQuantity) || 0) * (parseFloat(orderPrice) || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={!orderQuantity || !orderPrice}
                                        className={clsx(
                                            'w-full py-3 rounded-lg font-semibold transition-all',
                                            orderType === 'buy'
                                                ? 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-300'
                                                : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
                                        )}
                                    >
                                        {orderType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="col-span-12">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                                    Recent Orders
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                <th className="pb-3 font-medium">Order ID</th>
                                                <th className="pb-3 font-medium">Type</th>
                                                <th className="pb-3 font-medium">Market</th>
                                                <th className="pb-3 font-medium">Quantity</th>
                                                <th className="pb-3 font-medium">Price</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {orders.map(order => (
                                                <tr key={order.id} className="text-sm">
                                                    <td className="py-3 font-mono text-gray-600 dark:text-gray-300">
                                                        {order.id}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={clsx(
                                                            'px-2 py-1 rounded text-xs font-medium',
                                                            order.type === 'buy'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        )}>
                                                            {order.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                        {order.market}
                                                    </td>
                                                    <td className="py-3 text-gray-600 dark:text-gray-300">
                                                        {order.filledQuantity}/{order.quantity} MWh
                                                    </td>
                                                    <td className="py-3 text-gray-900 dark:text-white">
                                                        ₹{order.price.toFixed(2)}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={clsx(
                                                            'flex items-center text-xs',
                                                            order.status === 'filled' && 'text-green-600',
                                                            order.status === 'pending' && 'text-yellow-600',
                                                            order.status === 'partial' && 'text-blue-600',
                                                            order.status === 'cancelled' && 'text-gray-500'
                                                        )}>
                                                            {order.status === 'filled' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                                                            {order.status === 'pending' && <ClockIcon className="h-4 w-4 mr-1" />}
                                                            {order.status === 'partial' && <ExclamationTriangleIcon className="h-4 w-4 mr-1" />}
                                                            {order.status === 'cancelled' && <XCircleIcon className="h-4 w-4 mr-1" />}
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500 dark:text-gray-400">
                                                        {order.timestamp}
                                                    </td>
                                                </tr>
                                            ))}
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
