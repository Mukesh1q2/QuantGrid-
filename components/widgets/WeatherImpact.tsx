'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    SunIcon,
    CloudIcon,
    CloudArrowDownIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * Weather Impact Predictor Widget
 * 
 * Premium widget showing weather conditions and their predicted impact on:
 * - Solar generation
 * - Wind generation
 * - Energy demand
 * - Price forecasts
 */

interface WeatherData {
    current: {
        temperature: number
        condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy'
        humidity: number
        windSpeed: number
        cloudCover: number
        uvIndex: number
    }
    forecast: Array<{
        hour: number
        temperature: number
        condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy'
        windSpeed: number
        cloudCover: number
    }>
    impact: {
        solarGeneration: number // % of capacity
        windGeneration: number // % of capacity
        demandFactor: number // multiplier
        priceImpact: number // % change
    }
    alerts: Array<{
        type: 'heatwave' | 'storm' | 'fog' | 'cold-snap'
        severity: 'low' | 'medium' | 'high'
        message: string
        startTime: string
        endTime: string
    }>
}

interface WeatherImpactProps {
    className?: string
    compact?: boolean
}

// Generate realistic weather data
function generateWeatherData(): WeatherData {
    const hour = new Date().getHours()
    const conditions: Array<WeatherData['current']['condition']> = ['sunny', 'cloudy', 'rainy', 'windy', 'stormy']
    const currentCondition = conditions[Math.floor(Math.random() * 3)] // Bias towards good weather

    // Temperature based on time of day (India)
    const baseTemp = 28 + Math.sin((hour - 6) / 12 * Math.PI) * 8
    const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 4)

    const windSpeed = currentCondition === 'windy' ? 25 + Math.random() * 15 : 8 + Math.random() * 12
    const cloudCover = currentCondition === 'sunny' ? 10 + Math.random() * 20 :
        currentCondition === 'cloudy' ? 50 + Math.random() * 30 :
            currentCondition === 'rainy' ? 80 + Math.random() * 20 : 40 + Math.random() * 30

    // Calculate impacts
    const solarFactor = (1 - cloudCover / 100) * (hour >= 6 && hour <= 18 ? Math.sin((hour - 6) / 12 * Math.PI) : 0.05)
    const windFactor = Math.min(1, windSpeed / 25) * 0.85
    const demandFactor = 1 + (temperature > 35 ? 0.2 : temperature < 20 ? 0.15 : 0)
    const priceImpact = (1 - solarFactor * 0.3 - windFactor * 0.2) * demandFactor

    return {
        current: {
            temperature,
            condition: currentCondition,
            humidity: 40 + Math.random() * 40,
            windSpeed: Math.round(windSpeed),
            cloudCover: Math.round(cloudCover),
            uvIndex: currentCondition === 'sunny' ? 7 + Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 3)
        },
        forecast: Array.from({ length: 12 }, (_, i) => {
            const forecastHour = (hour + i + 1) % 24
            const forecastTemp = 28 + Math.sin((forecastHour - 6) / 12 * Math.PI) * 8 + (Math.random() - 0.5) * 4
            return {
                hour: forecastHour,
                temperature: Math.round(forecastTemp),
                condition: conditions[Math.floor(Math.random() * 3)],
                windSpeed: Math.round(8 + Math.random() * 20),
                cloudCover: Math.round(20 + Math.random() * 60)
            }
        }),
        impact: {
            solarGeneration: Math.round(solarFactor * 100),
            windGeneration: Math.round(windFactor * 100),
            demandFactor: Math.round(demandFactor * 100) / 100,
            priceImpact: Math.round((priceImpact - 1) * 100)
        },
        alerts: Math.random() > 0.7 ? [{
            type: temperature > 38 ? 'heatwave' : 'storm',
            severity: 'medium',
            message: temperature > 38 ? 'High temperature expected, demand surge likely' : 'Thunderstorm approaching, monitor grid stability',
            startTime: '14:00',
            endTime: '18:00'
        }] : []
    }
}

const WeatherIcon = ({ condition, className }: { condition: WeatherData['current']['condition'], className?: string }) => {
    switch (condition) {
        case 'sunny':
            return <SunIcon className={clsx(className, 'text-yellow-500')} />
        case 'cloudy':
            return <CloudIcon className={clsx(className, 'text-gray-400')} />
        case 'rainy':
            return <CloudArrowDownIcon className={clsx(className, 'text-blue-400')} />
        case 'windy':
            return <BoltIcon className={clsx(className, 'text-cyan-400')} />
        case 'stormy':
            return <BoltIcon className={clsx(className, 'text-purple-500')} />
        default:
            return <SunIcon className={clsx(className, 'text-yellow-500')} />
    }
}

export function WeatherImpact({ className, compact = false }: WeatherImpactProps) {
    const [data, setData] = useState<WeatherData | null>(null)

    useEffect(() => {
        setData(generateWeatherData())
        // Refresh every 5 minutes
        const interval = setInterval(() => {
            setData(generateWeatherData())
        }, 300000)
        return () => clearInterval(interval)
    }, [])

    if (!data) {
        return (
            <div className={clsx('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}>
                <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={clsx('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                            <CloudIcon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Weather Impact
                        </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Updated now
                    </span>
                </div>
            </div>

            {/* Current Weather */}
            <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <WeatherIcon condition={data.current.condition} className="w-12 h-12" />
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {data.current.temperature}°C
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {data.current.condition}
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <div className="flex items-center justify-end space-x-2 text-gray-600 dark:text-gray-400">
                            <span>💨 {data.current.windSpeed} km/h</span>
                        </div>
                        <div className="flex items-center justify-end space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                            <span>💧 {Math.round(data.current.humidity)}%</span>
                        </div>
                        <div className="flex items-center justify-end space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                            <span>☁️ {data.current.cloudCover}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                    Generation Impact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {/* Solar Impact */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <SunIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Solar</span>
                            </div>
                            <span className={clsx(
                                'text-sm font-bold',
                                data.impact.solarGeneration >= 70 ? 'text-green-600' :
                                    data.impact.solarGeneration >= 40 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                                {data.impact.solarGeneration}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.impact.solarGeneration}%` }}
                                className="bg-yellow-500 h-2 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Wind Impact */}
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <BoltIcon className="w-4 h-4 text-cyan-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Wind</span>
                            </div>
                            <span className={clsx(
                                'text-sm font-bold',
                                data.impact.windGeneration >= 70 ? 'text-green-600' :
                                    data.impact.windGeneration >= 40 ? 'text-yellow-600' : 'text-red-600'
                            )}>
                                {data.impact.windGeneration}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.impact.windGeneration}%` }}
                                className="bg-cyan-500 h-2 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Demand & Price */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Demand Factor</span>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.impact.demandFactor}x
                            </span>
                            {data.impact.demandFactor > 1 && (
                                <ArrowTrendingUpIcon className="w-3 h-3 text-red-500" />
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Price Impact</span>
                        <div className="flex items-center space-x-1">
                            <span className={clsx(
                                'text-sm font-semibold',
                                data.impact.priceImpact > 0 ? 'text-red-600' : 'text-green-600'
                            )}>
                                {data.impact.priceImpact > 0 ? '+' : ''}{data.impact.priceImpact}%
                            </span>
                            {data.impact.priceImpact > 0 ? (
                                <ArrowTrendingUpIcon className="w-3 h-3 text-red-500" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-3 h-3 text-green-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 12-Hour Forecast */}
            {!compact && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                        12-Hour Forecast
                    </h4>
                    <div className="flex overflow-x-auto space-x-3 pb-2">
                        {data.forecast.slice(0, 8).map((hour, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center min-w-[3rem] text-center"
                            >
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {hour.hour}:00
                                </span>
                                <WeatherIcon condition={hour.condition} className="w-6 h-6 my-1" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {hour.temperature}°
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weather Alerts */}
            {data.alerts.length > 0 && (
                <div className="px-4 py-3">
                    {data.alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={clsx(
                                'flex items-start space-x-2 p-2 rounded-lg',
                                alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                                    alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                                        'bg-blue-50 dark:bg-blue-900/20'
                            )}
                        >
                            <ExclamationTriangleIcon className={clsx(
                                'w-4 h-4 mt-0.5',
                                alert.severity === 'high' ? 'text-red-500' :
                                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                            )} />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                    {alert.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {alert.startTime} - {alert.endTime}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats Footer */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>UV Index: {data.current.uvIndex}</span>
                    <span>Location: All India</span>
                </div>
            </div>
        </div>
    )
}

export default WeatherImpact
