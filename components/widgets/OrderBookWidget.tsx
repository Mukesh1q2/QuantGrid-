'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

/**
 * Order Book Widget
 * 
 * Real-time bid/ask visualization for energy markets.
 * Shows depth on both sides with visual bar representation.
 */

interface OrderBookEntry {
    price: number
    quantity: number
    total: number
}

interface OrderBookWidgetProps {
    market?: string
    className?: string
}

function generateOrderBookData(centerPrice: number): { bids: OrderBookEntry[], asks: OrderBookEntry[] } {
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []

    let bidTotal = 0
    let askTotal = 0

    for (let i = 0; i < 10; i++) {
        const bidQty = Math.floor(100 + Math.random() * 500)
        const askQty = Math.floor(100 + Math.random() * 500)
        bidTotal += bidQty
        askTotal += askQty

        bids.push({
            price: centerPrice - (i + 1) * 3 + Math.random(),
            quantity: bidQty,
            total: bidTotal
        })

        asks.unshift({
            price: centerPrice + (i + 1) * 3 + Math.random(),
            quantity: askQty,
            total: askTotal
        })
    }

    return { bids, asks }
}

export function OrderBookWidget({ market = 'DAM', className = '' }: OrderBookWidgetProps) {
    const [centerPrice] = useState(4532.50)
    const [data, setData] = useState(generateOrderBookData(centerPrice))

    useEffect(() => {
        const interval = setInterval(() => {
            setData(generateOrderBookData(centerPrice + (Math.random() - 0.5) * 20))
        }, 2000)
        return () => clearInterval(interval)
    }, [centerPrice])

    const maxTotal = Math.max(
        data.bids[data.bids.length - 1]?.total || 0,
        data.asks[0]?.total || 0
    )

    return (
        <div className={clsx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col', className)}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Order Book</h3>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{market}</span>
            </div>

            <div className="flex-1 overflow-hidden">
                {/* Headers */}
                <div className="grid grid-cols-3 px-4 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <span>Price</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Total</span>
                </div>

                {/* Asks */}
                <div className="overflow-y-auto" style={{ maxHeight: '40%' }}>
                    {data.asks.map((ask, i) => (
                        <div key={`ask-${i}`} className="relative grid grid-cols-3 px-4 py-0.5 text-xs">
                            <div
                                className="absolute right-0 top-0 bottom-0 bg-red-100/50 dark:bg-red-900/20"
                                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                            />
                            <span className="relative text-red-600 dark:text-red-400">{ask.price.toFixed(2)}</span>
                            <span className="relative text-right text-gray-600 dark:text-gray-300">{ask.quantity}</span>
                            <span className="relative text-right text-gray-400">{ask.total}</span>
                        </div>
                    ))}
                </div>

                {/* Spread */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Spread</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{centerPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {((data.asks[data.asks.length - 1]?.price || 0) - (data.bids[0]?.price || 0)).toFixed(2)}
                    </span>
                </div>

                {/* Bids */}
                <div className="overflow-y-auto" style={{ maxHeight: '40%' }}>
                    {data.bids.map((bid, i) => (
                        <div key={`bid-${i}`} className="relative grid grid-cols-3 px-4 py-0.5 text-xs">
                            <div
                                className="absolute right-0 top-0 bottom-0 bg-green-100/50 dark:bg-green-900/20"
                                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                            />
                            <span className="relative text-green-600 dark:text-green-400">{bid.price.toFixed(2)}</span>
                            <span className="relative text-right text-gray-600 dark:text-gray-300">{bid.quantity}</span>
                            <span className="relative text-right text-gray-400">{bid.total}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default OrderBookWidget
