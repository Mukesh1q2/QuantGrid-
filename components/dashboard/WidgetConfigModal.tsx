'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { motion } from 'framer-motion'
import {
    XMarkIcon,
    Cog6ToothIcon,
    PaintBrushIcon,
    BellIcon,
    ArrowPathIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface WidgetConfigModalProps {
    isOpen: boolean
    onClose: () => void
    widget: any
    onSave: (widgetId: string, updates: any) => void
}

// Widget configuration schemas by type
const WIDGET_CONFIG_SCHEMAS: { [key: string]: any } = {
    'iex-india-live-prices': {
        data: {
            market: {
                type: 'select',
                label: 'Market',
                options: ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'],
                description: 'Select the electricity market'
            },
            region: {
                type: 'select',
                label: 'Region',
                options: ['All India', 'Northern', 'Southern', 'Western', 'Eastern', 'North-Eastern'],
                description: 'Geographic region for price data'
            },
            refreshInterval: {
                type: 'select',
                label: 'Refresh Interval',
                options: ['10s', '30s', '1m', '5m'],
                description: 'How often to update data'
            }
        },
        appearance: {
            chartType: {
                type: 'select',
                label: 'Chart Type',
                options: ['Area', 'Line', 'Bar'],
                description: 'Visualization style'
            },
            colorScheme: {
                type: 'select',
                label: 'Color Scheme',
                options: ['Green', 'Blue', 'Purple', 'Orange'],
                description: 'Chart color theme'
            },
            showGrid: {
                type: 'boolean',
                label: 'Show Grid Lines',
                description: 'Display background grid'
            }
        },
        alerts: {
            priceAbove: {
                type: 'number',
                label: 'Alert when price above (₹/kWh)',
                description: 'Get notified when price exceeds this value'
            },
            priceBelow: {
                type: 'number',
                label: 'Alert when price below (₹/kWh)',
                description: 'Get notified when price drops below this value'
            },
            enableAlerts: {
                type: 'boolean',
                label: 'Enable Price Alerts',
                description: 'Receive notifications for price changes'
            }
        }
    },
    'portfolio-analytics': {
        data: {
            benchmark: {
                type: 'select',
                label: 'Benchmark',
                options: ['Market Index', 'Custom', 'None'],
                description: 'Compare performance against'
            },
            timeframe: {
                type: 'select',
                label: 'Time Frame',
                options: ['1D', '1W', '1M', '3M', '1Y'],
                description: 'Analysis period'
            },
            showRiskMetrics: {
                type: 'boolean',
                label: 'Show Risk Metrics',
                description: 'Display VaR, Sharpe ratio, etc.'
            }
        },
        appearance: {
            view: {
                type: 'select',
                label: 'View Mode',
                options: ['Full', 'Compact'],
                description: 'Layout density'
            },
            showPnLChart: {
                type: 'boolean',
                label: 'Show P&L Chart',
                description: 'Display profit/loss trend'
            }
        }
    },
    // Default config for widgets without specific schema
    'default': {
        data: {
            refreshInterval: {
                type: 'select',
                label: 'Refresh Interval',
                options: ['30s', '1m', '5m', '15m'],
                description: 'How often to update data'
            }
        },
        appearance: {
            showTitle: {
                type: 'boolean',
                label: 'Show Title',
                description: 'Display widget header'
            }
        }
    }
}

export function WidgetConfigModal({ isOpen, onClose, widget, onSave }: WidgetConfigModalProps) {
    const [config, setConfig] = useState<any>({})
    const [activeTab, setActiveTab] = useState(0)

    // Get the schema for this widget type
    const schema = WIDGET_CONFIG_SCHEMAS[widget?.type] || WIDGET_CONFIG_SCHEMAS['default']
    const tabs = Object.keys(schema)

    useEffect(() => {
        if (widget) {
            // Initialize config from widget's current config
            setConfig(widget.config || {})
        }
    }, [widget])

    const handleChange = (key: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSave = () => {
        onSave(widget.id, { config })
        onClose()
    }

    const renderField = (key: string, fieldSchema: any) => {
        const value = config[key]

        switch (fieldSchema.type) {
            case 'select':
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {fieldSchema.label}
                        </label>
                        <select
                            value={value || fieldSchema.options[0]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fieldSchema.options.map((option: string) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{fieldSchema.description}</p>
                    </div>
                )

            case 'boolean':
                return (
                    <div key={key} className="mb-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                {fieldSchema.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{fieldSchema.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value || false}
                                onChange={(e) => handleChange(key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )

            case 'number':
                return (
                    <div key={key} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {fieldSchema.label}
                        </label>
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.1"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{fieldSchema.description}</p>
                    </div>
                )

            default:
                return null
        }
    }

    const getTabIcon = (tabName: string) => {
        switch (tabName) {
            case 'data': return <ChartBarIcon className="h-4 w-4" />
            case 'appearance': return <PaintBrushIcon className="h-4 w-4" />
            case 'alerts': return <BellIcon className="h-4 w-4" />
            default: return <Cog6ToothIcon className="h-4 w-4" />
        }
    }

    if (!widget) return null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Cog6ToothIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Configure Widget
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{widget.title}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                                    <Tab.List className="flex space-x-1 p-4 bg-gray-50 dark:bg-gray-900/50">
                                        {tabs.map((tab) => (
                                            <Tab
                                                key={tab}
                                                className={({ selected }) =>
                                                    clsx(
                                                        'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                        selected
                                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    )
                                                }
                                            >
                                                {getTabIcon(tab)}
                                                <span className="capitalize">{tab}</span>
                                            </Tab>
                                        ))}
                                    </Tab.List>

                                    <Tab.Panels className="p-6">
                                        {tabs.map((tab) => (
                                            <Tab.Panel key={tab}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {Object.entries(schema[tab]).map(([key, fieldSchema]: [string, any]) =>
                                                        renderField(key, fieldSchema)
                                                    )}
                                                </motion.div>
                                            </Tab.Panel>
                                        ))}
                                    </Tab.Panels>
                                </Tab.Group>

                                {/* Footer */}
                                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <button
                                        onClick={() => setConfig({})}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <ArrowPathIcon className="h-4 w-4" />
                                        <span>Reset to Default</span>
                                    </button>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
