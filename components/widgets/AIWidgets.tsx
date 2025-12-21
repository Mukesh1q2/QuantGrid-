'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    SparklesIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
    useAI,
    usePredictions,
    useCopilot,
    PricePrediction,
    PredictionExplanation,
    ExplanationFactor
} from '@/lib/ai/AIIntelligenceService'

// ========================
// Enhanced AI Predictions Widget
// ========================
export function AIPredictionsWidget() {
    const { predictions, isLoading, refresh } = usePredictions('DAM')
    const { getExplanation } = useAI()
    const [selectedPrediction, setSelectedPrediction] = useState<PricePrediction | null>(null)
    const [explanation, setExplanation] = useState<PredictionExplanation | null>(null)
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)

    useEffect(() => {
        refresh()
    }, [refresh])

    const handleSelectPrediction = async (pred: PricePrediction) => {
        setSelectedPrediction(pred)
        setIsLoadingExplanation(true)
        try {
            const exp = await getExplanation(pred)
            setExplanation(exp)
        } finally {
            setIsLoadingExplanation(false)
        }
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">AI Price Predictions</span>
                </div>
                <button
                    onClick={() => refresh()}
                    disabled={isLoading}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {isLoading && predictions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                    <AnimatePresence>
                        {predictions.slice(0, 5).map((pred, idx) => (
                            <motion.div
                                key={`${pred.market}-${pred.region}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleSelectPrediction(pred)}
                                className={clsx(
                                    'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                                    selectedPrediction?.region === pred.region
                                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs text-gray-500">{pred.market} • {pred.region}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{pred.predictedPrice}
                                            </span>
                                            <span className={clsx(
                                                'text-sm font-medium flex items-center',
                                                pred.change >= 0 ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {pred.change >= 0 ? <ArrowUpIcon className="h-3 w-3 mr-0.5" /> : <ArrowDownIcon className="h-3 w-3 mr-0.5" />}
                                                {pred.change >= 0 ? '+' : ''}{pred.changePercent}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence Meter */}
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500">Confidence</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        'h-full rounded-full',
                                                        pred.confidence > 0.85 ? 'bg-green-500' :
                                                            pred.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                                    )}
                                                    style={{ width: `${pred.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {(pred.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Uncertainty Range */}
                                <div className="text-xs text-gray-500 mt-1">
                                    Range: ₹{pred.uncertaintyLow} - ₹{pred.uncertaintyHigh}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* XAI Panel */}
            {selectedPrediction && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-1 mb-2">
                        <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Why this prediction?</span>
                    </div>

                    {isLoadingExplanation ? (
                        <div className="text-xs text-gray-500">Analyzing factors...</div>
                    ) : explanation ? (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">{explanation.summary}</p>

                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-green-600">
                                    ✓ {explanation.historicalAccuracy}% historical accuracy
                                </span>
                                <span className="text-blue-600">
                                    📊 {explanation.similarScenarios} similar scenarios
                                </span>
                            </div>
                        </div>
                    ) : null}
                </motion.div>
            )}
        </div>
    )
}

// ========================
// Explainable AI Widget (Standalone)
// ========================
export function ExplainableAIWidget() {
    const { predictions, getExplanation } = useAI()
    const [explanation, setExplanation] = useState<PredictionExplanation | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (predictions.length > 0) {
            loadExplanation(predictions[0])
        }
    }, [predictions])

    const loadExplanation = async (pred: PricePrediction) => {
        setIsLoading(true)
        try {
            const exp = await getExplanation(pred)
            setExplanation(exp)
        } finally {
            setIsLoading(false)
        }
    }

    const getImpactColor = (impact: number, direction: string) => {
        if (direction === 'positive') {
            if (impact > 40) return 'bg-green-500'
            if (impact > 20) return 'bg-green-400'
            return 'bg-green-300'
        } else {
            if (impact > 40) return 'bg-red-500'
            if (impact > 20) return 'bg-red-400'
            return 'bg-red-300'
        }
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Explainable AI</span>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Analyzing prediction factors...</span>
                </div>
            ) : explanation ? (
                <div className="flex-1 overflow-y-auto space-y-3">
                    {/* Top Factors */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Impact Factors</h4>
                        <div className="space-y-2">
                            {explanation.factors.map((factor, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-lg">{factor.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{factor.name}</span>
                                            <span className={clsx(
                                                'text-xs font-medium',
                                                factor.direction === 'positive' ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {factor.direction === 'positive' ? '+' : '-'}{factor.impact}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={clsx('h-full rounded-full', getImpactColor(factor.impact, factor.direction))}
                                                style={{ width: `${Math.min(factor.impact, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{factor.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Model Statistics */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{explanation.historicalAccuracy}%</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{explanation.similarScenarios}</div>
                            <div className="text-xs text-gray-500">Scenarios</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{explanation.modelConfidence}</div>
                            <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Select a prediction to see explanation</span>
                </div>
            )}
        </div>
    )
}

// ========================
// AI Copilot Widget
// ========================
export function AICopilotWidget() {
    const { messages, ask, isLoading } = useCopilot()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const query = input
        setInput('')
        await ask(query)
    }

    const suggestedQueries = [
        'Why is the price spiking?',
        "What's tomorrow's forecast?",
        'Trade recommendations?',
        'Any anomalies?'
    ]

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">AI Copilot</span>
                <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded dark:bg-purple-900/30 dark:text-purple-400">Beta</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <SparklesIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Ask me anything</h4>
                        <p className="text-sm text-gray-500 mb-4">I can analyze market trends, explain predictions, and provide trading insights.</p>

                        {/* Suggested Queries */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedQueries.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => ask(query)}
                                    disabled={isLoading}
                                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                    'p-3 rounded-lg',
                                    msg.role === 'user'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 ml-8'
                                        : 'bg-gray-100 dark:bg-gray-800 mr-4'
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    {msg.role === 'assistant' && (
                                        <SparklesIcon className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div
                                        className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/\|(.+)\|/g, (match) => `<span class="font-mono text-xs">${match}</span>`)
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm">Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about prices, forecasts, strategies..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}

// ========================
// Anomaly Detection Widget
// ========================
export function AnomalyDetectionWidget() {
    const { anomalies } = useAI()

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            case 'high': return 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
            case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
            default: return 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
        }
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Anomaly Detection</span>
            </div>

            {anomalies.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mb-2" />
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">All Clear</h4>
                    <p className="text-sm text-gray-500">No anomalies detected</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                    <AnimatePresence>
                        {anomalies.map((anomaly) => (
                            <motion.div
                                key={anomaly.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={clsx(
                                    'p-3 rounded-lg border-l-4',
                                    getSeverityStyles(anomaly.severity)
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold">{anomaly.metric}</span>
                                    <span className="text-xs uppercase font-medium">{anomaly.severity}</span>
                                </div>
                                <p className="text-sm mb-2">{anomaly.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span>Value: {anomaly.value}</span>
                                    <span>Expected: {anomaly.expected}</span>
                                    <span className="font-medium">+{anomaly.deviation}% deviation</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
