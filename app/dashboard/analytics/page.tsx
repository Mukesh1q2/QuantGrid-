'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    BoltIcon,
    GlobeAltIcon,
    DocumentChartBarIcon,
    FunnelIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart
} from 'recharts'

// Mock data
const revenueData = [
    { month: 'Jan', revenue: 2450000, cost: 2100000, profit: 350000 },
    { month: 'Feb', revenue: 2680000, cost: 2250000, profit: 430000 },
    { month: 'Mar', revenue: 2890000, cost: 2400000, profit: 490000 },
    { month: 'Apr', revenue: 3120000, cost: 2550000, profit: 570000 },
    { month: 'May', revenue: 2980000, cost: 2480000, profit: 500000 },
    { month: 'Jun', revenue: 3450000, cost: 2800000, profit: 650000 },
]

const generationBySource = [
    { source: 'Solar', value: 45, color: '#fbbf24' },
    { source: 'Wind', value: 28, color: '#3b82f6' },
    { source: 'Hydro', value: 15, color: '#06b6d4' },
    { source: 'Thermal', value: 12, color: '#ef4444' },
]

const tradingVolume = [
    { day: 'Mon', DAM: 12000, RTM: 8000, TAM: 4000 },
    { day: 'Tue', DAM: 14000, RTM: 7500, TAM: 4500 },
    { day: 'Wed', DAM: 11000, RTM: 9000, TAM: 3800 },
    { day: 'Thu', DAM: 16000, RTM: 8500, TAM: 5200 },
    { day: 'Fri', DAM: 13500, RTM: 9200, TAM: 4800 },
    { day: 'Sat', DAM: 8000, RTM: 4500, TAM: 2200 },
    { day: 'Sun', DAM: 6500, RTM: 3800, TAM: 1800 },
]

const priceHistory = Array.from({ length: 30 }, (_, i) => ({
    date: `Dec ${i + 1}`,
    price: 4200 + Math.sin(i / 3) * 300 + Math.random() * 100,
    average: 4400,
    high: 4600 + Math.random() * 200,
    low: 4000 - Math.random() * 200
}))

const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    demand: 35000 + Math.sin((hour - 6) / 12 * Math.PI) * 10000 + Math.random() * 2000,
    supply: 36000 + Math.sin((hour - 6) / 12 * Math.PI) * 9500 + Math.random() * 2000,
    price: 4000 + Math.sin((hour - 6) / 12 * Math.PI) * 500 + Math.random() * 100
}))

const kpis = [
    { label: 'Total Revenue', value: '₹17.57M', change: 12.5, trend: 'up', icon: CurrencyDollarIcon, color: 'blue' },
    { label: 'Generation (GWh)', value: '482.5', change: 8.2, trend: 'up', icon: BoltIcon, color: 'green' },
    { label: 'Trading Volume', value: '234,500 MWh', change: -2.1, trend: 'down', icon: ChartBarIcon, color: 'purple' },
    { label: 'Avg MCP', value: '₹4,532/MWh', change: 5.4, trend: 'up', icon: ArrowTrendingUpIcon, color: 'orange' },
]

const regionPerformance = [
    { region: 'Northern', volume: 45000, revenue: 5.2, efficiency: 92 },
    { region: 'Western', volume: 38000, revenue: 4.8, efficiency: 89 },
    { region: 'Southern', volume: 52000, revenue: 5.8, efficiency: 94 },
    { region: 'Eastern', volume: 28000, revenue: 3.2, efficiency: 86 },
    { region: 'North-East', volume: 12000, revenue: 1.4, efficiency: 82 },
]

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('30d')
    const [selectedMetric, setSelectedMetric] = useState('revenue')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className="transition-all duration-200"
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                    <DocumentChartBarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Analytics Dashboard
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Comprehensive business intelligence & insights
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                    {['7d', '30d', '90d', '1y'].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={clsx(
                                                'px-3 py-1.5 text-sm rounded-md transition-all font-medium',
                                                timeRange === range
                                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                            )}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map((kpi, i) => (
                            <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={clsx(
                                        'p-2 rounded-lg',
                                        kpi.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30',
                                        kpi.color === 'green' && 'bg-green-100 dark:bg-green-900/30',
                                        kpi.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30',
                                        kpi.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/30'
                                    )}>
                                        <kpi.icon className={clsx(
                                            'h-5 w-5',
                                            kpi.color === 'blue' && 'text-blue-600',
                                            kpi.color === 'green' && 'text-green-600',
                                            kpi.color === 'purple' && 'text-purple-600',
                                            kpi.color === 'orange' && 'text-orange-600'
                                        )} />
                                    </div>
                                    <span className={clsx(
                                        'flex items-center text-sm font-medium px-2 py-0.5 rounded-full',
                                        kpi.trend === 'up'
                                            ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                            : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                                    )}>
                                        {kpi.trend === 'up' ? (
                                            <ArrowTrendingUpIcon className="h-3.5 w-3.5 mr-1" />
                                        ) : (
                                            <ArrowTrendingDownIcon className="h-3.5 w-3.5 mr-1" />
                                        )}
                                        {Math.abs(kpi.change)}%
                                    </span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {kpi.value}
                                    </span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {kpi.label}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Revenue & Profit Chart */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Revenue & Profit Analysis
                                    </h3>
                                    <div className="flex space-x-2">
                                        {['revenue', 'profit', 'cost'].map(metric => (
                                            <button
                                                key={metric}
                                                onClick={() => setSelectedMetric(metric)}
                                                className={clsx(
                                                    'px-3 py-1 text-sm rounded-md capitalize',
                                                    selectedMetric === metric
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                )}
                                            >
                                                {metric}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                            <XAxis dataKey="month" stroke="#9ca3af" />
                                            <YAxis
                                                stroke="#9ca3af"
                                                tickFormatter={v => `₹${(v / 1000000).toFixed(1)}M`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                                labelStyle={{ color: '#fff' }}
                                                formatter={(value: number) => [`₹${(value / 1000000).toFixed(2)}M`, '']}
                                            />
                                            <Legend />
                                            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="cost" name="Cost" fill="#6b7280" radius={[4, 4, 0, 0]} />
                                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Generation Mix */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 h-full">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Energy Generation Mix
                                </h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={generationBySource}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {generationBySource.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value}%`, '']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {generationBySource.map(item => (
                                        <div key={item.source} className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {item.source} ({item.value}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Hourly Pattern */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    24-Hour Demand/Supply Pattern
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hourlyPattern}>
                                            <defs>
                                                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} />
                                            <YAxis stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Legend />
                                            <Area type="monotone" dataKey="demand" name="Demand" stroke="#ef4444" fillOpacity={1} fill="url(#demandGrad)" />
                                            <Area type="monotone" dataKey="supply" name="Supply" stroke="#10b981" fillOpacity={1} fill="url(#supplyGrad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Trading Volume */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Weekly Trading Volume by Market
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={tradingVolume}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                            <XAxis dataKey="day" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" tickFormatter={v => `${v / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                                                labelStyle={{ color: '#fff' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="DAM" stackId="a" fill="#3b82f6" name="Day Ahead" />
                                            <Bar dataKey="RTM" stackId="a" fill="#10b981" name="Real Time" />
                                            <Bar dataKey="TAM" stackId="a" fill="#f59e0b" name="Term Ahead" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Regional Performance */}
                        <div className="col-span-12">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Regional Performance Summary
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Region</th>
                                                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Volume (MWh)</th>
                                                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Revenue (₹M)</th>
                                                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Efficiency</th>
                                                <th className="pb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {regionPerformance.map(region => (
                                                <tr key={region.region} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="py-4 font-medium text-gray-900 dark:text-white">{region.region}</td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-300">{region.volume.toLocaleString()}</td>
                                                    <td className="py-4 text-gray-600 dark:text-gray-300">₹{region.revenue}M</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                                                                <div
                                                                    className={clsx(
                                                                        'h-2 rounded-full',
                                                                        region.efficiency >= 90 ? 'bg-green-500' :
                                                                            region.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    )}
                                                                    style={{ width: `${region.efficiency}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">{region.efficiency}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="inline-flex items-center text-green-600">
                                                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                                            +{Math.floor(Math.random() * 10 + 2)}%
                                                        </span>
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
