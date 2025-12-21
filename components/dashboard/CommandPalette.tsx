'use client'

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react'
import { Dialog, Combobox, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MagnifyingGlassIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    PlusIcon,
    ArrowPathIcon,
    ShareIcon,
    UsersIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    BoltIcon,
    SunIcon,
    CloudIcon,
    CurrencyDollarIcon,
    ChartPieIcon,
    Battery100Icon,
    GlobeAltIcon,
    ExclamationTriangleIcon,
    BeakerIcon,
    ClockIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

/**
 * Command Palette Item
 */
interface CommandItem {
    id: string
    name: string
    description?: string
    icon: React.ComponentType<{ className?: string }>
    category: 'navigation' | 'action' | 'widget' | 'settings'
    shortcut?: string
    action: () => void
    keywords?: string[]
}

/**
 * Command Palette Props
 */
interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onAddWidget?: (widgetType: string) => void
    onOpenSettings?: () => void
    onOpenCollaboration?: () => void
    onRefreshDashboard?: () => void
    onShareDashboard?: () => void
    onExportDashboard?: () => void
}

/**
 * Premium Command Palette Component
 * 
 * A Spotlight/Linear-style command palette for quick navigation and actions.
 * Accessible via ⌘+K (Mac) or Ctrl+K (Windows/Linux)
 */
export function CommandPalette({
    isOpen,
    onClose,
    onAddWidget,
    onOpenSettings,
    onOpenCollaboration,
    onRefreshDashboard,
    onShareDashboard,
    onExportDashboard
}: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setSelectedCategory(null)
        }
    }, [isOpen])

    // Define all available commands
    const commands = useMemo<CommandItem[]>(() => [
        // Navigation
        {
            id: 'dashboard',
            name: 'Go to Dashboard',
            description: 'View your dashboard',
            icon: ChartBarIcon,
            category: 'navigation',
            shortcut: 'D',
            action: () => { onClose(); window.location.href = '/dashboard' },
            keywords: ['home', 'main', 'overview']
        },
        {
            id: 'trading',
            name: 'Go to Trading',
            description: 'Open trading interface',
            icon: CurrencyDollarIcon,
            category: 'navigation',
            shortcut: 'T',
            action: () => { onClose(); window.location.href = '/trading' },
            keywords: ['buy', 'sell', 'order', 'market']
        },
        {
            id: 'analytics',
            name: 'Go to Analytics',
            description: 'View detailed analytics',
            icon: ChartPieIcon,
            category: 'navigation',
            shortcut: 'A',
            action: () => { onClose(); window.location.href = '/analytics' },
            keywords: ['reports', 'data', 'insights']
        },

        // Actions
        {
            id: 'refresh',
            name: 'Refresh Dashboard',
            description: 'Reload all widget data',
            icon: ArrowPathIcon,
            category: 'action',
            shortcut: 'R',
            action: () => { onClose(); onRefreshDashboard?.() },
            keywords: ['reload', 'update', 'sync']
        },
        {
            id: 'share',
            name: 'Share Dashboard',
            description: 'Share with team members',
            icon: ShareIcon,
            category: 'action',
            action: () => { onClose(); onShareDashboard?.() },
            keywords: ['invite', 'collaborate', 'send']
        },
        {
            id: 'export',
            name: 'Export Dashboard',
            description: 'Download as PDF or Excel',
            icon: ArrowDownTrayIcon,
            category: 'action',
            shortcut: 'E',
            action: () => { onClose(); onExportDashboard?.() },
            keywords: ['download', 'save', 'pdf', 'excel']
        },
        {
            id: 'collaboration',
            name: 'Team Collaboration',
            description: 'Open team panel',
            icon: UsersIcon,
            category: 'action',
            shortcut: 'C',
            action: () => { onClose(); onOpenCollaboration?.() },
            keywords: ['team', 'chat', 'comments']
        },

        // Widgets
        {
            id: 'add-energy-chart',
            name: 'Add Energy Generation Chart',
            description: 'Real-time energy generation visualization',
            icon: BoltIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('energy-generation-chart') },
            keywords: ['power', 'generation', 'electricity']
        },
        {
            id: 'add-market-prices',
            name: 'Add Market Prices Widget',
            description: 'Live IEX India market prices',
            icon: CurrencyDollarIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('iex-india-live-prices') },
            keywords: ['price', 'cost', 'mcp', 'iex']
        },
        {
            id: 'add-renewable-mix',
            name: 'Add Renewable Mix Widget',
            description: 'Solar, wind, hydro breakdown',
            icon: SunIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('iex-india-renewable-mix') },
            keywords: ['solar', 'wind', 'green', 'clean']
        },
        {
            id: 'add-demand-supply',
            name: 'Add Demand/Supply Widget',
            description: 'Grid balance visualization',
            icon: ChartBarIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('iex-india-demand-supply') },
            keywords: ['grid', 'balance', 'load']
        },
        {
            id: 'add-weather',
            name: 'Add Weather Widget',
            description: 'Weather impact on generation',
            icon: CloudIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('weather-impact') },
            keywords: ['forecast', 'temperature', 'sun', 'wind']
        },
        {
            id: 'add-asset-status',
            name: 'Add Asset Status Widget',
            description: 'Monitor all energy assets',
            icon: Battery100Icon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('asset-status-grid') },
            keywords: ['plant', 'farm', 'station', 'equipment']
        },
        {
            id: 'add-alerts',
            name: 'Add Alerts Widget',
            description: 'System notifications and alerts',
            icon: ExclamationTriangleIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('real-time-alerts') },
            keywords: ['warning', 'notification', 'alarm']
        },
        {
            id: 'add-ai-prediction',
            name: 'Add AI Price Prediction',
            description: 'ML-powered price forecasting',
            icon: BeakerIcon,
            category: 'widget',
            action: () => { onClose(); onAddWidget?.('ai-price-prediction') },
            keywords: ['machine learning', 'forecast', 'predict']
        },

        // Settings
        {
            id: 'settings',
            name: 'Dashboard Settings',
            description: 'Configure dashboard preferences',
            icon: Cog6ToothIcon,
            category: 'settings',
            shortcut: 'S',
            action: () => { onClose(); onOpenSettings?.() },
            keywords: ['preferences', 'options', 'configure']
        },
        {
            id: 'theme',
            name: 'Toggle Dark Mode',
            description: 'Switch between light and dark',
            icon: SunIcon,
            category: 'settings',
            action: () => {
                document.documentElement.classList.toggle('dark')
                onClose()
            },
            keywords: ['dark', 'light', 'mode', 'appearance']
        }
    ], [onClose, onAddWidget, onOpenSettings, onOpenCollaboration, onRefreshDashboard, onShareDashboard, onExportDashboard])

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query && !selectedCategory) return commands

        return commands.filter(command => {
            // Category filter
            if (selectedCategory && command.category !== selectedCategory) return false

            // Text search
            if (!query) return true
            const searchText = query.toLowerCase()
            return (
                command.name.toLowerCase().includes(searchText) ||
                command.description?.toLowerCase().includes(searchText) ||
                command.keywords?.some(k => k.toLowerCase().includes(searchText))
            )
        })
    }, [commands, query, selectedCategory])

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: { [key: string]: CommandItem[] } = {
            navigation: [],
            action: [],
            widget: [],
            settings: []
        }
        filteredCommands.forEach(cmd => {
            groups[cmd.category].push(cmd)
        })
        return groups
    }, [filteredCommands])

    const categoryLabels: { [key: string]: string } = {
        navigation: 'Navigation',
        action: 'Actions',
        widget: 'Add Widget',
        settings: 'Settings'
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-150"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                            <Combobox onChange={(command: CommandItem) => command.action()}>
                                {/* Search Input */}
                                <div className="relative">
                                    <MagnifyingGlassIcon
                                        className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    <Combobox.Input
                                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                        placeholder="Search commands or type to filter..."
                                        onChange={(event) => setQuery(event.target.value)}
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-4 top-3 flex items-center gap-1">
                                        <kbd className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-400">
                                            ⌘
                                        </kbd>
                                        <kbd className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-400">
                                            K
                                        </kbd>
                                    </div>
                                </div>

                                {/* Category Tabs */}
                                <div className="flex gap-2 p-2 border-b border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={clsx(
                                            'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                                            !selectedCategory
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        )}
                                    >
                                        All
                                    </button>
                                    {Object.entries(categoryLabels).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedCategory(key)}
                                            className={clsx(
                                                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                                                selectedCategory === key
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Results */}
                                {filteredCommands.length > 0 && (
                                    <Combobox.Options static className="max-h-80 scroll-py-2 overflow-y-auto p-2">
                                        {Object.entries(groupedCommands).map(([category, items]) =>
                                            items.length > 0 && (
                                                <div key={category} className="mb-2">
                                                    <h3 className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        {categoryLabels[category]}
                                                    </h3>
                                                    {items.map((command) => (
                                                        <Combobox.Option
                                                            key={command.id}
                                                            value={command}
                                                            className={({ active }) =>
                                                                clsx(
                                                                    'flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 transition-colors',
                                                                    active ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                                                )
                                                            }
                                                        >
                                                            {({ active }) => (
                                                                <>
                                                                    <command.icon
                                                                        className={clsx(
                                                                            'h-5 w-5 flex-none',
                                                                            active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                    <div className="ml-3 flex-auto">
                                                                        <p className={clsx(
                                                                            'text-sm font-medium',
                                                                            active ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                                                        )}>
                                                                            {command.name}
                                                                        </p>
                                                                        {command.description && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {command.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {command.shortcut && (
                                                                        <kbd className="ml-3 flex-none text-xs font-medium text-gray-400 dark:text-gray-500">
                                                                            ⌘{command.shortcut}
                                                                        </kbd>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </Combobox.Options>
                                )}

                                {/* Empty State */}
                                {query && filteredCommands.length === 0 && (
                                    <div className="px-6 py-14 text-center sm:px-14">
                                        <CommandLineIcon
                                            className="mx-auto h-8 w-8 text-gray-400"
                                            aria-hidden="true"
                                        />
                                        <p className="mt-4 text-sm text-gray-900 dark:text-white font-semibold">
                                            No commands found
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Try searching with different keywords
                                        </p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex flex-wrap items-center bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">↑↓</kbd>
                                        to navigate
                                    </span>
                                    <span className="mx-2">·</span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">↵</kbd>
                                        to select
                                    </span>
                                    <span className="mx-2">·</span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">esc</kbd>
                                        to close
                                    </span>
                                </div>
                            </Combobox>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

/**
 * Hook to manage command palette state and keyboard shortcuts
 */
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev)
    }
}
