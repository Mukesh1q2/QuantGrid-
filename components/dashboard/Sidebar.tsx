'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import {
    HomeIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    BoltIcon,
    BuildingOffice2Icon,
    BellIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    MoonIcon,
    SunIcon,
    SparklesIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline'

/**
 * Sidebar Navigation Component
 * 
 * Collapsible sidebar with primary navigation, user section, and theme toggle.
 * Keyboard shortcut: [ to toggle
 */

interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
    children?: NavItem[]
}

const primaryNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Trading', href: '/trading', icon: CurrencyDollarIcon, badge: 'Live' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Evaluation', href: '/evaluation', icon: CloudArrowUpIcon, badge: 'New' },
    { name: 'Reports', href: '/dashboard/reports', icon: DocumentTextIcon },
    { name: 'Markets', href: '/markets', icon: BoltIcon },
    { name: 'Assets', href: '/assets', icon: BuildingOffice2Icon },
    { name: 'Alerts', href: '/alerts', icon: BellIcon, badge: 3 },
]

const secondaryNav: NavItem[] = [
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
]

interface SidebarProps {
    defaultCollapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ defaultCollapsed = false, onCollapsedChange }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const pathname = usePathname()

    // Keyboard shortcut to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '[' && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement
                if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault()
                    toggleCollapsed()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isCollapsed])

    // Check initial dark mode
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'))
    }, [])

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const newValue = !prev
            onCollapsedChange?.(newValue)
            return newValue
        })
    }

    const toggleDarkMode = () => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDarkMode(false)
        } else {
            html.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDarkMode(true)
        }
    }

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BoltIcon className="h-5 w-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-gray-900 dark:text-white whitespace-nowrap"
                            >
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent ml-2">
                                    QuantGrid
                                </span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Primary Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="space-y-1">
                    {primaryNav.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'flex items-center px-3 py-2.5 rounded-lg transition-all group relative',
                                isActive(item.href)
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <item.icon className={clsx(
                                'h-5 w-5 flex-shrink-0',
                                isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            )} />

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="ml-3 text-sm font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Badge */}
                            {item.badge && (
                                <span className={clsx(
                                    'absolute right-2 px-1.5 py-0.5 text-xs font-medium rounded-full',
                                    typeof item.badge === 'string'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                    isCollapsed && 'right-1 top-1 w-2 h-2 p-0'
                                )}>
                                    {isCollapsed ? '' : item.badge}
                                </span>
                            )}

                            {/* Tooltip when collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

                {/* Secondary Navigation */}
                <div className="space-y-1">
                    {secondaryNav.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'flex items-center px-3 py-2.5 rounded-lg transition-all group relative',
                                isActive(item.href)
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="ml-3 text-sm font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                {/* AI Assistant Promo */}
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                        <div className="flex items-center space-x-2 mb-1">
                            <SparklesIcon className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">AI Insights</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get smart trading recommendations
                        </p>
                    </motion.div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDarkMode ? (
                        <SunIcon className="h-5 w-5 flex-shrink-0" />
                    ) : (
                        <MoonIcon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="ml-3 text-sm font-medium"
                            >
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapsed}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1"
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="h-5 w-5 flex-shrink-0" />
                    ) : (
                        <ChevronLeftIcon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="ml-3 text-sm"
                            >
                                Collapse <kbd className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">[</kbd>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    )
}

export default Sidebar
