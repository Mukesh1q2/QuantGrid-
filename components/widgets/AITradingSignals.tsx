'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowUpIcon,
    ArrowDownIcon,
    MinusIcon,
    LightBulbIcon,
    BeakerIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * AI Trading Signals Widget
 * 
 * Premium widget displaying ML-based trading recommendations:
 * - Buy/Sell/Hold signals with confidence scores
 * - Historical accuracy tracking
 * - Explainable AI insights
 * - Real-time signal notifications
 */

interface TradingSignal {
    id: string
    timestamp: Date
    asset: string
    action: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    targetPrice: number
    currentPrice: number
    potentialGain: number
    reason: string
    aiExplanation: string
    timeHorizon: string
    riskLevel: 'low' | 'medium' | 'high'
}

interface AITradingSignalsProps {
    className?: string
    compact?: boolean
}

// Generate realistic trading signals
function generateSignals(): TradingSignal[] {
    const assets = [
        { name: 'Solar Farm Alpha', current: 4.25 },
        { name: 'Wind Park Beta', current: 3.85 },
        { name: 'Hydro Station Gamma', current: 4.10 },
        { name: 'Grid Position N1', current: 4.45 },
        { name: 'DAM Trade Slot 14', current: 4.62 }
    ]

    const reasons = [
        'Strong demand forecast for next 48 hours',
        'Favorable weather conditions predicted',
        'Historical price patterns indicate uptrend',
        'Supply shortage expected in region',
        'Market volatility creating opportunity',
        'Regulatory changes favor renewable pricing',
        'Grid congestion likely to increase prices'
    ]

    const explanations = [
        'Our LSTM model detected a high-probability price movement based on 847 similar historical patterns with 78% accuracy.',
        'Random Forest ensemble analyzed 23 features including weather, demand, and grid data to identify this opportunity.',
        'Transformer model cross-referenced news sentiment with price data showing 0.82 correlation coefficient.',
        'XGBoost regression predicts price movement with 95% confidence interval of ±₹0.15.',
        'Neural network attention mechanism identified key market drivers aligning for positive momentum.'
    ]

    return assets.map((asset, i) => {
        const actions: Array<'BUY' | 'SELL' | 'HOLD'> = ['BUY', 'SELL', 'HOLD']
        const action = actions[Math.floor(Math.random() * actions.length)]
        const targetMultiplier = action === 'BUY' ? 1.05 + Math.random() * 0.1 : action === 'SELL' ? 0.92 + Math.random() * 0.05 : 1
        const targetPrice = asset.current * targetMultiplier

        return {
            id: `signal-${i}`,
            timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
            asset: asset.name,
            action,
            confidence: 65 + Math.random() * 30,
            targetPrice,
            currentPrice: asset.current,
            potentialGain: ((targetPrice - asset.current) / asset.current) * 100,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            aiExplanation: explanations[Math.floor(Math.random() * explanations.length)],
            timeHorizon: ['1-2 hours', '4-6 hours', '12-24 hours', '2-3 days'][Math.floor(Math.random() * 4)],
            riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        }
    })
}

export function AITradingSignals({ className, compact = false }: AITradingSignalsProps) {
    const [signals, setSignals] = useState<TradingSignal[]>([])
    const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null)
    const [filter, setFilter] = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all')

    useEffect(() => {
        setSignals(generateSignals())
    }, [])

    const filteredSignals = useMemo(() => {
        if (filter === 'all') return signals
        return signals.filter(s => s.action === filter)
    }, [signals, filter])

    // Model accuracy stats
    const accuracy = {
        overall: 82.4,
        buy: 85.2,
        sell: 78.9,
        signalsToday: signals.length,
        successfulPredictions: Math.floor(signals.length * 0.82)
    }

    const getActionIcon = (action: TradingSignal['action']) => {
        switch (action) {
            case 'BUY': return <ArrowUpIcon className="w-4 h-4" />
            case 'SELL': return <ArrowDownIcon className="w-4 h-4" />
            case 'HOLD': return <MinusIcon className="w-4 h-4" />
        }
    }

    const getActionColor = (action: TradingSignal['action']) => {
        switch (action) {
            case 'BUY': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
            case 'SELL': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
            case 'HOLD': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
        }
    }

    const getRiskColor = (risk: TradingSignal['riskLevel']) => {
        switch (risk) {
            case 'low': return 'bg-green-500'
            case 'medium': return 'bg-yellow-500'
            case 'high': return 'bg-red-500'
        }
    }

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes}m ago`
        return `${Math.floor(minutes / 60)}h ago`
    }

    return (
        <div className={clsx('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                            <BeakerIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                AI Trading Signals
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ML-powered recommendations
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Model Accuracy</p>
                            <p className="text-sm font-bold text-green-600">{accuracy.overall}%</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-1">
                {(['all', 'BUY', 'SELL', 'HOLD'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                            filter === f
                                ? f === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                    : f === 'SELL' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                        : f === 'HOLD' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                    >
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            {/* Signals List */}
            <div className={clsx('divide-y divide-gray-100 dark:divide-gray-700', compact ? 'max-h-48' : 'max-h-72', 'overflow-y-auto')}>
                <AnimatePresence>
                    {filteredSignals.map((signal, index) => (
                        <motion.div
                            key={signal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedSignal(selectedSignal?.id === signal.id ? null : signal)}
                            className={clsx(
                                'px-4 py-3 cursor-pointer transition-colors',
                                selectedSignal?.id === signal.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {/* Action Badge */}
                                    <div className={clsx(
                                        'flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                                        getActionColor(signal.action)
                                    )}>
                                        {getActionIcon(signal.action)}
                                        <span>{signal.action}</span>
                                    </div>
                                    {/* Asset Name */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {signal.asset}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTime(signal.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                {/* Confidence & Potential */}
                                <div className="text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Confidence</span>
                                        <span className={clsx(
                                            'text-sm font-bold',
                                            signal.confidence >= 80 ? 'text-green-600' : signal.confidence >= 65 ? 'text-yellow-600' : 'text-red-600'
                                        )}>
                                            {signal.confidence.toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className={clsx(
                                        'text-xs font-medium',
                                        signal.potentialGain >= 0 ? 'text-green-600' : 'text-red-600'
                                    )}>
                                        {signal.potentialGain >= 0 ? '+' : ''}{signal.potentialGain.toFixed(1)}% potential
                                    </p>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {selectedSignal?.id === signal.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600"
                                    >
                                        {/* Price Info */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    ₹{signal.currentPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                                                <p className={clsx(
                                                    'text-sm font-semibold',
                                                    signal.action === 'BUY' ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    ₹{signal.targetPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Time Horizon</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {signal.timeHorizon}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mb-2">
                                            <div className="flex items-start space-x-2">
                                                <LightBulbIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300">
                                                        Signal Reason
                                                    </p>
                                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                                        {signal.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Explanation */}
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                                            <div className="flex items-start space-x-2">
                                                <BeakerIcon className="w-4 h-4 text-purple-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-medium text-purple-900 dark:text-purple-300">
                                                        AI Explanation
                                                    </p>
                                                    <p className="text-xs text-purple-700 dark:text-purple-400">
                                                        {signal.aiExplanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Level */}
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Risk Level:</span>
                                                <div className="flex items-center space-x-1">
                                                    <div className={clsx('w-2 h-2 rounded-full', getRiskColor(signal.riskLevel))} />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                        {signal.riskLevel}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                                Execute Trade
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                        {accuracy.signalsToday} signals today
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-3 h-3 inline mr-1 text-green-500" />
                        {accuracy.successfulPredictions} successful
                    </span>
                </div>
            </div>
        </div>
    )
}

export default AITradingSignals
