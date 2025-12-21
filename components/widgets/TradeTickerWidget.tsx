'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

/**
 * Trade Ticker Widget
 * 
 * Real-time feed of executed trades across markets.
 * Shows price, quantity, and direction with visual highlighting.
 */

interface Trade {
    id: string
    time: string
    price: number
    quantity: number
    type: 'buy' | 'sell'
    market: string
}

interface TradeTickerWidgetProps {
    markets?: string[]
    maxTrades?: number
    className?: string
}

function generateTrade(markets: string[]): Trade {
    const market = markets[Math.floor(Math.random() * markets.length)]
    const basePrice = market === 'DAM' ? 4532 : market === 'RTM' ? 4789 : 4345

    return {
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        price: basePrice + (Math.random() - 0.5) * 100,
        quantity: Math.floor(50 + Math.random() * 450),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        market
    }
}

export function TradeTickerWidget({
    markets = ['DAM', 'RTM', 'TAM'],
    maxTrades = 15,
    className = ''
}: TradeTickerWidgetProps) {
    const [trades, setTrades] = useState<Trade[]>([])
    const [isPaused, setIsPaused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Generate initial trades
    useEffect(() => {
        const initialTrades = Array.from({ length: 10 }, () => generateTrade(markets))
        setTrades(initialTrades)
    }, [markets])

    // Add new trades periodically
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setTrades(prev => {
                const newTrade = generateTrade(markets)
                return [newTrade, ...prev.slice(0, maxTrades - 1)]
            })
        }, 1500 + Math.random() * 1000)

        return () => clearInterval(interval)
    }, [isPaused, markets, maxTrades])

    return (
        <div
            className={clsx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col', className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Trade Ticker</h3>
                <div className="flex items-center space-x-1">
                    <span className={clsx(
                        'w-2 h-2 rounded-full',
                        isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
                    )} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isPaused ? 'Paused' : 'Live'}
                    </span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto"
            >
                {/* Headers */}
                <div className="grid grid-cols-5 gap-2 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <span>Time</span>
                    <span>Market</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Type</span>
                </div>

                <AnimatePresence initial={false}>
                    {trades.map((trade, index) => (
                        <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, x: -20, backgroundColor: trade.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
                            animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className={clsx(
                                'grid grid-cols-5 gap-2 px-4 py-1.5 text-xs border-b border-gray-50 dark:border-gray-700/50',
                                index === 0 && 'font-medium'
                            )}
                        >
                            <span className="text-gray-500 dark:text-gray-400 font-mono">
                                {trade.time}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                                {trade.market}
                            </span>
                            <span className={clsx(
                                'text-right font-medium',
                                trade.type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                                ₹{trade.price.toFixed(2)}
                            </span>
                            <span className="text-right text-gray-600 dark:text-gray-300">
                                {trade.quantity}
                            </span>
                            <span className="text-right">
                                <span className={clsx(
                                    'inline-flex items-center',
                                    trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {trade.type === 'buy' ? (
                                        <ArrowUpIcon className="h-3 w-3" />
                                    ) : (
                                        <ArrowDownIcon className="h-3 w-3" />
                                    )}
                                </span>
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                        {trades.length} trades
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        Vol: {trades.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()} MWh
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TradeTickerWidget
