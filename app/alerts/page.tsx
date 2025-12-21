'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BellIcon,
    BellAlertIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'

/**
 * Alerts Page
 * 
 * Configure and manage trading alerts, price thresholds, and system notifications.
 */

interface Alert {
    id: string
    name: string
    type: 'price' | 'volume' | 'system' | 'custom'
    condition: 'above' | 'below' | 'equals' | 'changes'
    threshold: number
    market?: string
    zone?: string
    enabled: boolean
    triggered: boolean
    triggeredAt?: Date
    notifyEmail: boolean
    notifyPush: boolean
    notifySms: boolean
}

const typeConfig = {
    price: { icon: CurrencyDollarIcon, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Price Alert' },
    volume: { icon: ChartBarIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Volume Alert' },
    system: { icon: ExclamationTriangleIcon, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'System Alert' },
    custom: { icon: InformationCircleIcon, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'Custom Alert' }
}

const mockAlerts: Alert[] = [
    { id: '1', name: 'DAM Price Above ₹4800', type: 'price', condition: 'above', threshold: 4800, market: 'DAM', enabled: true, triggered: false, notifyEmail: true, notifyPush: true, notifySms: false },
    { id: '2', name: 'RTM Price Drop', type: 'price', condition: 'below', threshold: 4500, market: 'RTM', enabled: true, triggered: true, triggeredAt: new Date(Date.now() - 3600000), notifyEmail: true, notifyPush: true, notifySms: true },
    { id: '3', name: 'High Volume Northern', type: 'volume', condition: 'above', threshold: 15000, zone: 'N1', enabled: true, triggered: false, notifyEmail: true, notifyPush: false, notifySms: false },
    { id: '4', name: 'System Maintenance', type: 'system', condition: 'changes', threshold: 0, enabled: true, triggered: false, notifyEmail: true, notifyPush: true, notifySms: false },
    { id: '5', name: 'MCP Threshold', type: 'price', condition: 'above', threshold: 5000, market: 'DAM', enabled: false, triggered: false, notifyEmail: true, notifyPush: false, notifySms: false },
]

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
    const [filter, setFilter] = useState<'all' | 'enabled' | 'triggered'>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [newAlert, setNewAlert] = useState<Partial<Alert>>({
        name: '',
        type: 'price',
        condition: 'above',
        threshold: 0,
        market: 'DAM',
        enabled: true,
        notifyEmail: true,
        notifyPush: true,
        notifySms: false
    })

    const handleCreateAlert = () => {
        if (!newAlert.name) return

        const alert: Alert = {
            id: (alerts.length + 1).toString(),
            name: newAlert.name,
            type: newAlert.type as Alert['type'],
            condition: newAlert.condition as Alert['condition'],
            threshold: newAlert.threshold || 0,
            market: newAlert.market,
            zone: newAlert.zone,
            enabled: newAlert.enabled ?? true,
            triggered: false,
            notifyEmail: newAlert.notifyEmail ?? true,
            notifyPush: newAlert.notifyPush ?? true,
            notifySms: newAlert.notifySms ?? false
        }

        setAlerts(prev => [...prev, alert])
        setShowCreateModal(false)
        setNewAlert({
            name: '',
            type: 'price',
            condition: 'above',
            threshold: 0,
            market: 'DAM',
            enabled: true,
            notifyEmail: true,
            notifyPush: true,
            notifySms: false
        })
    }

    const toggleAlert = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        ))
    }

    const deleteAlert = (id: string) => {
        if (confirm('Are you sure you want to delete this alert?')) {
            setAlerts(prev => prev.filter(a => a.id !== id))
        }
    }

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'enabled') return a.enabled
        if (filter === 'triggered') return a.triggered
        return true
    })

    const enabledCount = alerts.filter(a => a.enabled).length
    const triggeredCount = alerts.filter(a => a.triggered).length

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
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                                    <BellAlertIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Alert Center
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Configure price, volume, and system alerts
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Create Alert
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</span>
                                <BellIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-green-600">{enabledCount}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">enabled</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Triggered Today</span>
                                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold text-orange-600">{triggeredCount}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">alerts</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center space-x-2">
                        {(['all', 'enabled', 'triggered'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    'px-4 py-2 text-sm rounded-lg capitalize transition-colors',
                                    filter === f
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-3">
                        {filteredAlerts.map((alert, index) => {
                            const conf = typeConfig[alert.type]
                            const TypeIcon = conf.icon

                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={clsx(
                                        'bg-white dark:bg-gray-800 rounded-xl border p-5',
                                        alert.triggered
                                            ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'
                                            : 'border-gray-200 dark:border-gray-700'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={clsx('p-2 rounded-lg', conf.bgColor)}>
                                                <TypeIcon className={clsx('h-5 w-5', conf.color)} />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                                                    {alert.triggered && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full">
                                                            Triggered
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {conf.label} • {alert.condition} {alert.threshold > 0 ? `₹${alert.threshold}` : ''}
                                                    {alert.market && ` • ${alert.market}`}
                                                    {alert.zone && ` • Zone ${alert.zone}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {/* Notification Icons */}
                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                {alert.notifyEmail && <span title="Email">📧</span>}
                                                {alert.notifyPush && <span title="Push">🔔</span>}
                                                {alert.notifySms && <span title="SMS">📱</span>}
                                            </div>

                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggleAlert(alert.id)}
                                                className={clsx(
                                                    'relative w-12 h-6 rounded-full transition-colors',
                                                    alert.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                )}
                                            >
                                                <span className={clsx(
                                                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                                                    alert.enabled ? 'left-7' : 'left-1'
                                                )} />
                                            </button>

                                            {/* Actions */}
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteAlert(alert.id)}
                                                className="p-2 text-gray-400 hover:text-red-500"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {filteredAlerts.length === 0 && (
                        <div className="text-center py-12">
                            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No alerts</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {filter === 'all' ? 'Create your first alert to get started.' : `No ${filter} alerts found.`}
                            </p>
                        </div>
                    )}
                </main>

                <AIInsightsBar />
            </div>

            {/* Create Alert Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
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
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Alert</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Name *</label>
                                    <input
                                        type="text"
                                        value={newAlert.name}
                                        onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., High DAM Price Alert"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            value={newAlert.type}
                                            onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as Alert['type'] }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="price">Price Alert</option>
                                            <option value="volume">Volume Alert</option>
                                            <option value="system">System Alert</option>
                                            <option value="custom">Custom Alert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                                        <select
                                            value={newAlert.condition}
                                            onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as Alert['condition'] }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="above">Above</option>
                                            <option value="below">Below</option>
                                            <option value="equals">Equals</option>
                                            <option value="changes">Changes</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold (₹)</label>
                                        <input
                                            type="number"
                                            value={newAlert.threshold || ''}
                                            onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="4500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Market</label>
                                        <select
                                            value={newAlert.market}
                                            onChange={(e) => setNewAlert(prev => ({ ...prev, market: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="DAM">DAM</option>
                                            <option value="RTM">RTM</option>
                                            <option value="TAM">TAM</option>
                                            <option value="GTAM">GTAM</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notification Preferences */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notifications</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newAlert.notifyEmail}
                                                onChange={(e) => setNewAlert(prev => ({ ...prev, notifyEmail: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">📧 Email</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newAlert.notifyPush}
                                                onChange={(e) => setNewAlert(prev => ({ ...prev, notifyPush: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">🔔 Push</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newAlert.notifySms}
                                                onChange={(e) => setNewAlert(prev => ({ ...prev, notifySms: e.target.checked }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">📱 SMS</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateAlert}
                                    disabled={!newAlert.name}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    Create Alert
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
