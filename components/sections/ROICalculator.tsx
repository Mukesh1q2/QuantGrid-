'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalculatorIcon, CurrencyDollarIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ROIInputs {
    monthlyEnergySpend: number
    tradingVolume: number
    teamSize: number
    currentAccuracy: number
}

interface ROIResults {
    annualSavings: number
    efficiencyGain: number
    timesSaved: number
    paybackMonths: number
}

export function ROICalculator() {
    const [inputs, setInputs] = useState<ROIInputs>({
        monthlyEnergySpend: 500000,
        tradingVolume: 1000,
        teamSize: 5,
        currentAccuracy: 70
    })

    const [results, setResults] = useState<ROIResults>({
        annualSavings: 0,
        efficiencyGain: 0,
        timesSaved: 0,
        paybackMonths: 0
    })

    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional')

    const planCosts = {
        starter: 299 * 12,
        professional: 899 * 12,
        enterprise: 5000 * 12
    }

    // Calculate ROI whenever inputs change
    useEffect(() => {
        const optibidAccuracy = 94.2
        const accuracyImprovement = optibidAccuracy - inputs.currentAccuracy

        // Calculate savings based on improved forecasting
        const forecastingValuePerPercent = inputs.monthlyEnergySpend * 0.002 // 0.2% per accuracy point
        const monthlySavingsFromAccuracy = forecastingValuePerPercent * accuracyImprovement

        // Calculate efficiency gains (time savings)
        const hoursPerWeekManual = inputs.teamSize * 8 // 8 hours/week per team member
        const automationFactor = 0.7 // OptiBid automates 70% of manual work
        const hoursSaved = hoursPerWeekManual * automationFactor * 52
        const laborCostPerHour = 75
        const laborSavings = hoursSaved * laborCostPerHour

        // Trading optimization savings
        const tradingOptimization = inputs.tradingVolume * 0.03 * 12 // 3% optimization on volume

        // Total annual savings
        const annualSavings = (monthlySavingsFromAccuracy * 12) + laborSavings + tradingOptimization

        // Efficiency gain percentage
        const efficiencyGain = Math.min((accuracyImprovement / inputs.currentAccuracy) * 100, 50)

        // Time saved per week in hours
        const timesSaved = Math.round(hoursSaved / 52)

        // Payback period in months
        const annualCost = planCosts[selectedPlan]
        const paybackMonths = Math.max(1, Math.round((annualCost / annualSavings) * 12))

        setResults({
            annualSavings: Math.round(annualSavings),
            efficiencyGain: Math.round(efficiencyGain * 10) / 10,
            timesSaved,
            paybackMonths
        })
    }, [inputs, selectedPlan])

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`
        }
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`
        }
        return `$${value}`
    }

    return (
        <section className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <CalculatorIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Calculate Your ROI
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        See how much you could save with OptiBid's AI-powered energy trading platform
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Your Current Operations
                        </h3>

                        {/* Monthly Energy Spend */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Energy Spend
                            </label>
                            <div className="flex items-center">
                                <span className="text-gray-500 dark:text-gray-400 mr-2">$</span>
                                <input
                                    type="range"
                                    min="50000"
                                    max="5000000"
                                    step="50000"
                                    value={inputs.monthlyEnergySpend}
                                    onChange={(e) => setInputs({ ...inputs, monthlyEnergySpend: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white w-24 text-right">
                                    {formatCurrency(inputs.monthlyEnergySpend)}
                                </span>
                            </div>
                        </div>

                        {/* Trading Volume */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Trading Volume (MWh)
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="100"
                                    max="50000"
                                    step="100"
                                    value={inputs.tradingVolume}
                                    onChange={(e) => setInputs({ ...inputs, tradingVolume: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white w-24 text-right">
                                    {inputs.tradingVolume.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Team Size */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Energy Team Size
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={inputs.teamSize}
                                    onChange={(e) => setInputs({ ...inputs, teamSize: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white w-24 text-right">
                                    {inputs.teamSize} people
                                </span>
                            </div>
                        </div>

                        {/* Current Forecast Accuracy */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Forecast Accuracy
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="50"
                                    max="90"
                                    step="1"
                                    value={inputs.currentAccuracy}
                                    onChange={(e) => setInputs({ ...inputs, currentAccuracy: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white w-24 text-right">
                                    {inputs.currentAccuracy}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                OptiBid achieves 94.2% accuracy
                            </p>
                        </div>

                        {/* Plan Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Plan
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['starter', 'professional', 'enterprise'] as const).map((plan) => (
                                    <button
                                        key={plan}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${selectedPlan === plan
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                            }`}
                                    >
                                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div>
                        <motion.div
                            key={results.annualSavings}
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white mb-6"
                        >
                            <h3 className="text-lg font-medium opacity-90 mb-2">Estimated Annual Savings</h3>
                            <div className="text-5xl font-bold mb-4">
                                {formatCurrency(results.annualSavings)}
                            </div>
                            <p className="text-sm opacity-80">
                                Based on your inputs and OptiBid's proven performance metrics
                            </p>
                        </motion.div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                                <div className="flex items-center mb-2">
                                    <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency Gain</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    +{results.efficiencyGain}%
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                                <div className="flex items-center mb-2">
                                    <ClockIcon className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Hours Saved/Week</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {results.timesSaved}h
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                                <div className="flex items-center mb-2">
                                    <CurrencyDollarIcon className="w-5 h-5 text-purple-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round((results.annualSavings / planCosts[selectedPlan]) * 100)}%
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                                <div className="flex items-center mb-2">
                                    <CalculatorIcon className="w-5 h-5 text-orange-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Payback Period</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {results.paybackMonths} mo
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-6">
                            <a
                                href="/demo"
                                className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-xl transition-colors"
                            >
                                Schedule a Demo to Validate Your Savings
                            </a>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Get a personalized ROI analysis from our energy experts
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
