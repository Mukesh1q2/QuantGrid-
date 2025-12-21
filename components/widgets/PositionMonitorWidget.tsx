'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * Position Monitor Widget
 * 
 * Real-time tracking of open trading positions with P&L calculations.
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
    openTime: string
}

interface PositionMonitorWidgetProps {
    className?: string
}

function generatePositions(): Position[] {
    return [
        { id: '1', market: 'DAM', type: 'long', quantity: 500, entryPrice: 4480, currentPrice: 4532, pnl: 26000, pnlPercent: 1.16, openTime: '09:30' },
        { id: '2', market: 'RTM', type: 'short', quantity: 300, entryPrice: 4820, currentPrice: 4789, pnl: 9300, pnlPercent: 0.64, openTime: '10:15' },
        { id: '3', market: 'TAM', type: 'long', quantity: 200, entryPrice: 4380, currentPrice: 4345, pnl: -7000, pnlPercent: -0.80, openTime: '11:00' },
        { id: '4', market: 'GDAM', type: 'long', quantity: 150, entryPrice: 4050, currentPrice: 4120, pnl: 10500, pnlPercent: 1.73, openTime: '08:45' },
    ]
}

export function PositionMonitorWidget({ className = '' }: PositionMonitorWidgetProps) {
    const [positions, setPositions] = useState<Position[]>(generatePositions())

    // Simulate price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPositions(prev => prev.map(pos => {
                const priceChange = (Math.random() - 0.5) * 20
                const newPrice = pos.currentPrice + priceChange
                const newPnl = (newPrice - pos.entryPrice) * pos.quantity * (pos.type === 'long' ? 1 : -1)
                const newPnlPercent = ((newPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.type === 'long' ? 1 : -1)

                return {
                    ...pos,
                    currentPrice: newPrice,
                    pnl: newPnl,
                    pnlPercent: newPnlPercent
                }
            }))
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
    const totalValue = positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0)

    return (
        <div className={clsx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col', className)}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Position Monitor</h3>
                <span className={clsx(
                    'text-sm font-medium',
                    totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                    {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {positions.map((position, index) => (
                    <motion.div
                        key={position.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">{position.market}</span>
                                <span className={clsx(
                                    'px-1.5 py-0.5 text-xs rounded',
                                    position.type === 'long'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                )}>
                                    {position.type.toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {position.openTime}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Qty</span>
                                <p className="font-medium text-gray-900 dark:text-white">{position.quantity}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Entry / Current</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {position.entryPrice.toFixed(0)} / {position.currentPrice.toFixed(0)}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400">P&L</span>
                                <p className={clsx(
                                    'font-medium flex items-center justify-end',
                                    position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {position.pnl >= 0 ? (
                                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                                    )}
                                    {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()}
                                    <span className="text-xs ml-1">({position.pnlPercent.toFixed(2)}%)</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{positions.length} positions</span>
                    <span className="text-gray-600 dark:text-gray-300">
                        Total: ₹{(totalValue / 100000).toFixed(2)}L
                    </span>
                </div>
            </div>
        </div>
    )
}

export default PositionMonitorWidget
