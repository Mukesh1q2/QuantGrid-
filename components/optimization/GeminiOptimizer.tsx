'use client'

import React, { useState } from 'react'
import {
    SparklesIcon,
    CpuChipIcon,
    LightBulbIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface OptimizationConfig {
    modelType: 'bidding' | 'portfolio' | 'scheduling' | 'risk' | 'custom'
    objective: 'maximize_revenue' | 'minimize_cost' | 'maximize_profit' | 'minimize_risk' | 'custom'
    marketTypes: ('DAM' | 'RTM' | 'SO' | 'GTAM')[]
    timeHorizon: 'hourly' | 'daily' | 'weekly' | 'monthly'
    riskTolerance: 'low' | 'medium' | 'high'
    constraints: Constraint[]
    useAI: boolean
}

interface Constraint {
    type: 'min_price' | 'max_price' | 'min_volume' | 'max_volume' | 'time_window' | 'custom'
    value: number
    unit?: string
    description?: string
}

interface GeminiOptimizerProps {
    config: OptimizationConfig
    onConfigChange: (config: OptimizationConfig) => void
    onRunOptimization: () => void
    isRunning?: boolean
    dataLoaded?: boolean
}

const MODEL_TYPES = [
    { id: 'bidding', label: 'Bidding Strategy', description: 'Optimize bid prices for DAM/RTM', icon: '💰' },
    { id: 'portfolio', label: 'Portfolio', description: 'Asset allocation optimization', icon: '📊' },
    { id: 'scheduling', label: 'Scheduling', description: 'Generation scheduling', icon: '📅' },
    { id: 'risk', label: 'Risk Management', description: 'Risk-adjusted returns', icon: '🛡️' },
]

const OBJECTIVES = [
    { id: 'maximize_revenue', label: 'Maximize Revenue', description: 'Focus on top-line growth' },
    { id: 'minimize_cost', label: 'Minimize Cost', description: 'Reduce operational costs' },
    { id: 'maximize_profit', label: 'Maximize Profit', description: 'Balance revenue and costs' },
    { id: 'minimize_risk', label: 'Minimize Risk', description: 'Conservative approach' },
]

const MARKETS = [
    { id: 'DAM', label: 'Day-Ahead Market', color: 'blue' },
    { id: 'RTM', label: 'Real-Time Market', color: 'orange' },
    { id: 'SO', label: 'System Operator', color: 'purple' },
    { id: 'GTAM', label: 'Green Term Ahead', color: 'green' },
]

export default function GeminiOptimizer({
    config,
    onConfigChange,
    onRunOptimization,
    isRunning = false,
    dataLoaded = false
}: GeminiOptimizerProps) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)

    const updateConfig = (partial: Partial<OptimizationConfig>) => {
        onConfigChange({ ...config, ...partial })
    }

    const toggleMarket = (marketId: string) => {
        const markets = config.marketTypes.includes(marketId as any)
            ? config.marketTypes.filter(m => m !== marketId)
            : [...config.marketTypes, marketId as any]
        updateConfig({ marketTypes: markets })
    }

    const getAISuggestion = async () => {
        setIsLoadingSuggestion(true)

        // Simulate AI suggestion - in production this calls the Gemini API
        await new Promise(resolve => setTimeout(resolve, 1500))

        const suggestions = [
            "Based on current market volatility, I recommend focusing on DAM with a medium risk tolerance. Peak hours (8-10 AM, 6-9 PM) show 15-20% higher clearing prices.",
            "Your dataset shows strong correlation between volume and price during evening peaks. Consider maximizing RTM participation during 18:00-21:00 blocks.",
            "Low overnight prices (00:00-05:00) present arbitrage opportunities. Consider scheduling flexible loads during off-peak hours for cost optimization.",
        ]

        setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
        setIsLoadingSuggestion(false)
    }

    const addConstraint = () => {
        const newConstraint: Constraint = {
            type: 'min_price',
            value: 0,
            description: ''
        }
        updateConfig({ constraints: [...config.constraints, newConstraint] })
    }

    const removeConstraint = (index: number) => {
        const newConstraints = config.constraints.filter((_, i) => i !== index)
        updateConfig({ constraints: newConstraints })
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Gemini AI Optimizer</h3>
                        <p className="text-sm text-purple-200">AI-powered optimization configuration</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Model Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Optimization Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {MODEL_TYPES.map(model => (
                            <button
                                key={model.id}
                                onClick={() => updateConfig({ modelType: model.id as any })}
                                className={clsx(
                                    'p-3 rounded-lg border text-left transition-all',
                                    config.modelType === model.id
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                                )}
                            >
                                <span className="text-xl mr-2">{model.icon}</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {model.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Objective */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Optimization Objective
                    </label>
                    <select
                        value={config.objective}
                        onChange={(e) => updateConfig({ objective: e.target.value as any })}
                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                    >
                        {OBJECTIVES.map(obj => (
                            <option key={obj.id} value={obj.id}>{obj.label}</option>
                        ))}
                    </select>
                </div>

                {/* Market Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Markets
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {MARKETS.map(market => (
                            <button
                                key={market.id}
                                onClick={() => toggleMarket(market.id)}
                                className={clsx(
                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                    config.marketTypes.includes(market.id as any)
                                        ? `bg-${market.color}-500 text-white`
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                )}
                                style={config.marketTypes.includes(market.id as any) ? {
                                    backgroundColor: market.color === 'blue' ? '#3B82F6' :
                                        market.color === 'orange' ? '#F97316' :
                                            market.color === 'purple' ? '#A855F7' : '#10B981'
                                } : {}}
                            >
                                {market.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Risk Tolerance */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Risk Tolerance
                    </label>
                    <div className="flex space-x-2">
                        {['low', 'medium', 'high'].map(level => (
                            <button
                                key={level}
                                onClick={() => updateConfig({ riskTolerance: level as any })}
                                className={clsx(
                                    'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
                                    config.riskTolerance === level
                                        ? level === 'low' ? 'bg-green-500 text-white' :
                                            level === 'medium' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                )}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Horizon */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Horizon
                    </label>
                    <div className="flex space-x-2">
                        {['hourly', 'daily', 'weekly', 'monthly'].map(horizon => (
                            <button
                                key={horizon}
                                onClick={() => updateConfig({ timeHorizon: horizon as any })}
                                className={clsx(
                                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                                    config.timeHorizon === horizon
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                )}
                            >
                                {horizon.charAt(0).toUpperCase() + horizon.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Toggle */}
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <CpuChipIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable AI Analysis</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Get Gemini AI insights and recommendations</p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateConfig({ useAI: !config.useAI })}
                        className={clsx(
                            'relative w-12 h-6 rounded-full transition-colors',
                            config.useAI ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                        )}
                    >
                        <span className={clsx(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            config.useAI ? 'translate-x-7' : 'translate-x-1'
                        )} />
                    </button>
                </div>

                {/* AI Suggestion Button */}
                <button
                    onClick={getAISuggestion}
                    disabled={!dataLoaded || isLoadingSuggestion}
                    className={clsx(
                        'w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2',
                        dataLoaded
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                    )}
                >
                    {isLoadingSuggestion ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                        <LightBulbIcon className="h-4 w-4" />
                    )}
                    <span>{isLoadingSuggestion ? 'Getting AI suggestion...' : 'Get AI Recommendation'}</span>
                </button>

                {/* AI Suggestion Display */}
                {aiSuggestion && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start space-x-2">
                            <SparklesIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{aiSuggestion}</p>
                        </div>
                    </div>
                )}

                {/* Advanced Settings Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Constraints
                </button>

                {/* Advanced Constraints */}
                {showAdvanced && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Constraints
                            </label>
                            <button
                                onClick={addConstraint}
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                + Add Constraint
                            </button>
                        </div>

                        {config.constraints.map((constraint, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <select
                                    value={constraint.type}
                                    onChange={(e) => {
                                        const newConstraints = [...config.constraints]
                                        newConstraints[index] = { ...constraint, type: e.target.value as any }
                                        updateConfig({ constraints: newConstraints })
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                                >
                                    <option value="min_price">Min Price</option>
                                    <option value="max_price">Max Price</option>
                                    <option value="min_volume">Min Volume</option>
                                    <option value="max_volume">Max Volume</option>
                                </select>
                                <input
                                    type="number"
                                    value={constraint.value}
                                    onChange={(e) => {
                                        const newConstraints = [...config.constraints]
                                        newConstraints[index] = { ...constraint, value: parseFloat(e.target.value) }
                                        updateConfig({ constraints: newConstraints })
                                    }}
                                    className="w-24 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700"
                                />
                                <button
                                    onClick={() => removeConstraint(index)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Run Button */}
                <button
                    onClick={onRunOptimization}
                    disabled={!dataLoaded || isRunning || config.marketTypes.length === 0}
                    className={clsx(
                        'w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2',
                        dataLoaded && config.marketTypes.length > 0 && !isRunning
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                            : 'bg-gray-400 cursor-not-allowed'
                    )}
                >
                    {isRunning ? (
                        <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span>Running Optimization...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Run Evaluation</span>
                        </>
                    )}
                </button>

                {!dataLoaded && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Upload a dataset to enable optimization
                    </p>
                )}
            </div>
        </div>
    )
}
