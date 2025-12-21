'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    BoltIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * AI Insights Bar Component
 * 
 * A persistent bar at the bottom of the dashboard that cycles through
 * AI-generated insights, predictions, and recommendations.
 */

interface Insight {
    id: string
    type: 'prediction' | 'recommendation' | 'alert' | 'opportunity'
    title: string
    description: string
    confidence?: number
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    timestamp: Date
}

// Mock insights - in production, these would come from an AI service
const mockInsights: Insight[] = [
    {
        id: '1',
        type: 'prediction',
        title: 'Price Surge Expected',
        description: 'Market analysis indicates a 15% price increase in Northern Region within the next 2 hours due to demand spike.',
        confidence: 87,
        action: { label: 'View Analysis', href: '/dashboard/analytics' },
        timestamp: new Date()
    },
    {
        id: '2',
        type: 'recommendation',
        title: 'Optimal Bidding Window',
        description: 'Based on historical patterns, placing DAM bids between 2-3 PM yields 12% better execution rates.',
        confidence: 92,
        action: { label: 'Open Trading', href: '/trading' },
        timestamp: new Date()
    },
    {
        id: '3',
        type: 'alert',
        title: 'Solar Output Below Forecast',
        description: 'Cloud cover affecting Western Region. Solar generation 23% below predictions. Consider adjusting portfolio.',
        confidence: 94,
        action: { label: 'Check Weather', href: '#' },
        timestamp: new Date()
    },
    {
        id: '4',
        type: 'opportunity',
        title: 'Arbitrage Opportunity Detected',
        description: 'Price differential between Southern and Northern regions exceeds 8%. Potential for profitable inter-regional trading.',
        confidence: 78,
        action: { label: 'Execute Trade', href: '/trading' },
        timestamp: new Date()
    },
    {
        id: '5',
        type: 'prediction',
        title: 'Weekend Demand Pattern',
        description: 'AI models predict 18% lower demand this weekend. Consider reducing forward positions.',
        confidence: 85,
        timestamp: new Date()
    }
]

const typeConfig = {
    prediction: {
        icon: ArrowTrendingUpIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        label: 'AI Prediction'
    },
    recommendation: {
        icon: LightBulbIcon,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        label: 'Recommendation'
    },
    alert: {
        icon: ExclamationTriangleIcon,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        label: 'Alert'
    },
    opportunity: {
        icon: BoltIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        label: 'Opportunity'
    }
}

interface AIInsightsBarProps {
    className?: string
}

export function AIInsightsBar({ className = '' }: AIInsightsBarProps) {
    const [insights] = useState<Insight[]>(mockInsights)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isMinimized, setIsMinimized] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const currentInsight = insights[currentIndex]
    const config = typeConfig[currentInsight?.type || 'prediction']

    // Auto-cycle through insights
    useEffect(() => {
        if (isPaused || isMinimized) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % insights.length)
        }, 8000) // 8 seconds per insight

        return () => clearInterval(interval)
    }, [isPaused, isMinimized, insights.length])

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev - 1 + insights.length) % insights.length)
    }

    const goToNext = () => {
        setCurrentIndex(prev => (prev + 1) % insights.length)
    }

    if (isMinimized) {
        return (
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsMinimized(false)}
                className={clsx(
                    'fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-4 py-2',
                    'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg',
                    'hover:shadow-xl transition-shadow',
                    className
                )}
            >
                <SparklesIcon className="h-5 w-5" />
                <span className="text-sm font-medium">AI Insights</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.button>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'fixed bottom-0 left-0 right-0 z-40',
                'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700',
                'shadow-lg',
                className
            )}
            style={{ marginLeft: 'inherit' }} // Respect sidebar margin
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Icon and Label */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                                <SparklesIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                AI Insights
                            </span>
                        </div>

                        {/* Type Badge */}
                        <span className={clsx(
                            'flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            config.bgColor,
                            config.color
                        )}>
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                        </span>
                    </div>

                    {/* Center: Insight Content */}
                    <div className="flex-1 mx-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentInsight?.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {currentInsight?.title}
                                        </h4>
                                        {currentInsight?.confidence && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {currentInsight.confidence}% confidence
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                        {currentInsight?.description}
                                    </p>
                                </div>

                                {/* Action Button */}
                                {currentInsight?.action && (
                                    <a
                                        href={currentInsight.action.href}
                                        className={clsx(
                                            'ml-4 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                            'bg-blue-50 text-blue-700 hover:bg-blue-100',
                                            'dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                                        )}
                                    >
                                        {currentInsight.action.label}
                                    </a>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right: Navigation and Close */}
                    <div className="flex items-center space-x-2">
                        {/* Progress Dots */}
                        <div className="flex space-x-1 mr-2">
                            {insights.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={clsx(
                                        'w-1.5 h-1.5 rounded-full transition-all',
                                        i === currentIndex
                                            ? 'bg-blue-500 w-4'
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                    )}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <button
                            onClick={goToPrevious}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>

                        {/* Minimize */}
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default AIInsightsBar
