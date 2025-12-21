'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BuildingOffice2Icon,
    SunIcon,
    CloudIcon,
    BoltIcon,
    MapPinIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon,
    EllipsisVerticalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'

/**
 * Assets Page
 * 
 * Portfolio management for energy generation assets.
 * View capacity, status, performance, and manage asset settings.
 */

interface Asset {
    id: string
    name: string
    type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'battery'
    location: string
    region: string
    capacity: number // MW
    currentOutput: number // MW
    efficiency: number // %
    status: 'online' | 'offline' | 'maintenance' | 'partial'
    lastUpdated: Date
    monthlyGeneration: number // MWh
    revenue: number // ₹
    co2Saved: number // tonnes
}

const assetTypeConfig = {
    solar: { icon: SunIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
    wind: { icon: CloudIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    hydro: { icon: BoltIcon, color: 'text-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
    thermal: { icon: BoltIcon, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    battery: { icon: BoltIcon, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' }
}

const statusConfig = {
    online: { label: 'Online', color: 'bg-green-500' },
    offline: { label: 'Offline', color: 'bg-red-500' },
    maintenance: { label: 'Maintenance', color: 'bg-yellow-500' },
    partial: { label: 'Partial', color: 'bg-orange-500' }
}

// Mock assets data
const mockAssets: Asset[] = [
    { id: '1', name: 'Rajasthan Solar Farm', type: 'solar', location: 'Jaisalmer, Rajasthan', region: 'N3', capacity: 250, currentOutput: 198, efficiency: 79.2, status: 'online', lastUpdated: new Date(), monthlyGeneration: 45000, revenue: 20250000, co2Saved: 36000 },
    { id: '2', name: 'Gujarat Wind Park', type: 'wind', location: 'Kutch, Gujarat', region: 'W3', capacity: 180, currentOutput: 145, efficiency: 80.5, status: 'online', lastUpdated: new Date(), monthlyGeneration: 32000, revenue: 14400000, co2Saved: 25600 },
    { id: '3', name: 'Maharashtra Thermal', type: 'thermal', location: 'Nagpur, Maharashtra', region: 'W2', capacity: 500, currentOutput: 425, efficiency: 85.0, status: 'online', lastUpdated: new Date(), monthlyGeneration: 120000, revenue: 54000000, co2Saved: 0 },
    { id: '4', name: 'Karnataka Hydro', type: 'hydro', location: 'Shimoga, Karnataka', region: 'S2', capacity: 120, currentOutput: 95, efficiency: 79.2, status: 'partial', lastUpdated: new Date(), monthlyGeneration: 22000, revenue: 9900000, co2Saved: 17600 },
    { id: '5', name: 'Tamil Nadu Solar', type: 'solar', location: 'Tirunelveli, Tamil Nadu', region: 'S3', capacity: 320, currentOutput: 0, efficiency: 0, status: 'maintenance', lastUpdated: new Date(), monthlyGeneration: 52000, revenue: 23400000, co2Saved: 41600 },
    { id: '6', name: 'Delhi Battery Storage', type: 'battery', location: 'Ghaziabad, NCR', region: 'N2', capacity: 50, currentOutput: 35, efficiency: 70.0, status: 'online', lastUpdated: new Date(), monthlyGeneration: 8000, revenue: 3600000, co2Saved: 6400 },
    { id: '7', name: 'Andhra Wind Farm', type: 'wind', location: 'Anantapur, Andhra Pradesh', region: 'S1', capacity: 200, currentOutput: 0, efficiency: 0, status: 'offline', lastUpdated: new Date(), monthlyGeneration: 38000, revenue: 17100000, co2Saved: 30400 },
]

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>(mockAssets)
    const [filter, setFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showAddAssetModal, setShowAddAssetModal] = useState(false)
    const [newAsset, setNewAsset] = useState<Partial<Asset>>({
        name: '',
        type: 'solar',
        location: '',
        region: '',
        capacity: 0,
        status: 'online',
        efficiency: 80
    })

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'all' || asset.type === filter || asset.status === filter
        return matchesSearch && matchesFilter
    })

    const totalCapacity = assets.reduce((sum, a) => sum + a.capacity, 0)
    const totalOutput = assets.reduce((sum, a) => sum + a.currentOutput, 0)
    const onlineAssets = assets.filter(a => a.status === 'online').length
    const totalRevenue = assets.reduce((sum, a) => sum + a.revenue, 0)

    const handleAddAsset = () => {
        if (!newAsset.name || !newAsset.location) return

        const asset: Asset = {
            id: (assets.length + 1).toString(),
            name: newAsset.name,
            type: newAsset.type as Asset['type'],
            location: newAsset.location,
            region: newAsset.region || 'N1',
            capacity: newAsset.capacity || 100,
            currentOutput: Math.floor((newAsset.capacity || 100) * 0.7),
            efficiency: newAsset.efficiency || 80,
            status: newAsset.status as Asset['status'],
            lastUpdated: new Date(),
            monthlyGeneration: (newAsset.capacity || 100) * 180,
            revenue: (newAsset.capacity || 100) * 45000,
            co2Saved: (newAsset.capacity || 100) * 80
        }

        setAssets(prev => [...prev, asset])
        setShowAddAssetModal(false)
        setNewAsset({
            name: '',
            type: 'solar',
            location: '',
            region: '',
            capacity: 0,
            status: 'online',
            efficiency: 80
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className="transition-all duration-200"
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                    <BuildingOffice2Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Asset Portfolio
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Manage your energy generation assets
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddAssetModal(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Asset
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</span>
                                <BoltIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalCapacity.toLocaleString()}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">MW</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Current Output</span>
                                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalOutput.toLocaleString()}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">MW</span>
                                <span className="text-sm text-green-600 ml-2">({((totalOutput / totalCapacity) * 100).toFixed(1)}%)</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Assets Online</span>
                                <ChartBarIcon className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{onlineAssets}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">/ {assets.length}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</span>
                                <span className="text-green-600 text-sm font-medium">+12.5%</span>
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{(totalRevenue / 10000000).toFixed(1)}Cr</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="h-5 w-5 text-gray-400" />
                            {['all', 'solar', 'wind', 'hydro', 'online', 'offline'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={clsx(
                                        'px-3 py-1.5 text-sm rounded-lg capitalize transition-colors',
                                        filter === f
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAssets.map((asset, index) => {
                            const typeConf = assetTypeConfig[asset.type]
                            const statusConf = statusConfig[asset.status]
                            const TypeIcon = typeConf.icon

                            return (
                                <motion.div
                                    key={asset.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={clsx('p-2 rounded-lg', typeConf.bgColor)}>
                                                    <TypeIcon className={clsx('h-5 w-5', typeConf.color)} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{asset.name}</h3>
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                                                        {asset.location}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Status & Output */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                <span className={clsx('w-2 h-2 rounded-full mr-2', statusConf.color)} />
                                                {statusConf.label}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Region: {asset.region}
                                            </span>
                                        </div>

                                        {/* Capacity Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">Output</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {asset.currentOutput} / {asset.capacity} MW
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        'h-full rounded-full transition-all',
                                                        asset.efficiency > 70 ? 'bg-green-500' :
                                                            asset.efficiency > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    )}
                                                    style={{ width: `${asset.efficiency}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="text-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Efficiency</span>
                                                <p className="font-semibold text-gray-900 dark:text-white">{asset.efficiency}%</p>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Gen</span>
                                                <p className="font-semibold text-gray-900 dark:text-white">{(asset.monthlyGeneration / 1000).toFixed(0)}K</p>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">CO₂ Saved</span>
                                                <p className="font-semibold text-green-600">{(asset.co2Saved / 1000).toFixed(1)}K</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </main>

                <AIInsightsBar />
            </div>

            {/* Add Asset Modal */}
            <AnimatePresence>
                {showAddAssetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddAssetModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Asset</h2>
                                <button
                                    onClick={() => setShowAddAssetModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name *</label>
                                    <input
                                        type="text"
                                        value={newAsset.name}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Rajasthan Solar Farm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            value={newAsset.type}
                                            onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value as Asset['type'] }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="solar">Solar</option>
                                            <option value="wind">Wind</option>
                                            <option value="hydro">Hydro</option>
                                            <option value="thermal">Thermal</option>
                                            <option value="battery">Battery</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={newAsset.status}
                                            onChange={(e) => setNewAsset(prev => ({ ...prev, status: e.target.value as Asset['status'] }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="online">Online</option>
                                            <option value="offline">Offline</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="partial">Partial</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                                    <input
                                        type="text"
                                        value={newAsset.location}
                                        onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Jaisalmer, Rajasthan"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                                        <select
                                            value={newAsset.region}
                                            onChange={(e) => setNewAsset(prev => ({ ...prev, region: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="N1">N1 - Northern 1</option>
                                            <option value="N2">N2 - Northern 2</option>
                                            <option value="N3">N3 - Northern 3</option>
                                            <option value="S1">S1 - Southern 1</option>
                                            <option value="S2">S2 - Southern 2</option>
                                            <option value="S3">S3 - Southern 3</option>
                                            <option value="W1">W1 - Western 1</option>
                                            <option value="W2">W2 - Western 2</option>
                                            <option value="W3">W3 - Western 3</option>
                                            <option value="E1">E1 - Eastern 1</option>
                                            <option value="E2">E2 - Eastern 2</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (MW)</label>
                                        <input
                                            type="number"
                                            value={newAsset.capacity || ''}
                                            onChange={(e) => setNewAsset(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowAddAssetModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddAsset}
                                    disabled={!newAsset.name || !newAsset.location}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Asset
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
