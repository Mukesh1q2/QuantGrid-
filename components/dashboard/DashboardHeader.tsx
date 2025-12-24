'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
  UsersIcon,
  FolderIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  onOpenWidgetLibrary: () => void
  onOpenCollaboration: () => void
  onOpenSettings?: () => void
  onNavigateAnalytics?: () => void
  user: any
  isConnected?: boolean
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastUpdate?: Date | null
}

export function DashboardHeader({ onOpenWidgetLibrary, onOpenCollaboration, onOpenSettings, onNavigateAnalytics, user, isConnected = false, connectionStatus = 'disconnected', lastUpdate = null }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Market Alert',
      message: 'Solar Farm A exceeded daily generation target',
      time: '5 minutes ago',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Trade Executed',
      message: 'Sold 500 MWh at ₹4.20/kWh on IEX DAM',
      time: '12 minutes ago',
      type: 'success',
      read: false
    },
    {
      id: 3,
      title: 'Risk Warning',
      message: 'Volatility index spike detected in Western Region',
      time: '1 hour ago',
      type: 'warning',
      read: true
    },
    {
      id: 4,
      title: 'System Update',
      message: 'New ML models deployed for price forecasting',
      time: '2 hours ago',
      type: 'info',
      read: true
    }
  ])

  // Simulate incoming notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        title: Math.random() > 0.5 ? 'Market Update' : 'Trade Alert',
        message: Math.random() > 0.5
          ? `Spot price increased by ${(Math.random() * 5).toFixed(1)}% in last hour`
          : `Buy order filled: ${Math.floor(Math.random() * 100)} MWh @ ₹${(3 + Math.random() * 2).toFixed(2)}`,
        time: 'Just now',
        type: Math.random() > 0.7 ? 'warning' : 'success',
        read: false
      }
      setNotifications(prev => [newNotification, ...prev].slice(0, 10))
    }, 30000) // New notification every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const quickActions = [
    {
      name: 'Add Widget',
      icon: PlusIcon,
      action: onOpenWidgetLibrary,
      shortcut: 'W'
    },
    {
      name: 'Team Collaboration',
      icon: UsersIcon,
      action: onOpenCollaboration,
      shortcut: 'C'
    },
    {
      name: 'Dashboard Settings',
      icon: Cog6ToothIcon,
      action: onOpenSettings || (() => { }),
      shortcut: 'S'
    },
    {
      name: 'Analytics',
      icon: ChartBarIcon,
      action: onNavigateAnalytics || (() => { }),
      shortcut: 'A'
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '⚠'
      case 'warning':
        return '⚠'
      case 'comment':
        return '💬'
      default:
        return 'ℹ'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'comment':
        return 'text-blue-500'
      default:
        return 'text-blue-500'
    }
  }

  // Format relative time (e.g., "2s ago", "1m ago")
  const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 5) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  // Keyboard shortcuts
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent hidden md:block">
                  QuantGrid
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enterprise Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={clsx(
                  "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200",
                  isSearchFocused && "ring-1 ring-blue-500 border-blue-500"
                )}
                placeholder="Search widgets, data, or press ⌘K for commands..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Real-Time Connection Status */}
            <div className="hidden sm:flex items-center gap-2">
              <div className={clsx(
                'flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all',
                connectionStatus === 'connected' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                connectionStatus === 'connecting' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                connectionStatus === 'disconnected' && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                connectionStatus === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                <div className={clsx(
                  'w-2 h-2 rounded-full mr-1.5',
                  connectionStatus === 'connected' && 'bg-green-500 animate-pulse',
                  connectionStatus === 'connecting' && 'bg-yellow-500 animate-pulse',
                  connectionStatus === 'disconnected' && 'bg-gray-400',
                  connectionStatus === 'error' && 'bg-red-500'
                )} />
                <span className="hidden md:inline">
                  {connectionStatus === 'connected' && 'Live'}
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'disconnected' && 'Offline'}
                  {connectionStatus === 'error' && 'Error'}
                </span>
              </div>
              {/* Last Update Time */}
              {lastUpdate && connectionStatus === 'connected' && (
                <span className="hidden lg:inline text-xs text-gray-500 dark:text-gray-400">
                  Updated {formatRelativeTime(lastUpdate)}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors relative group"
                  title={`${action.name} (${action.shortcut})`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-gray-200 dark:bg-gray-600 text-xs px-1 rounded text-gray-600 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.shortcut}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Notifications */}
            <Menu as="div" className="relative">
              <Menu.Button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <div
                              className={clsx(
                                'p-3 rounded-lg cursor-pointer transition-colors',
                                active && 'bg-gray-50 dark:bg-gray-700',
                                !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                              )}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <span className={clsx('text-lg', getNotificationColor(notification.type))}>
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                <UserCircleIcon className="h-8 w-8" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role || 'User'}
                  </p>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={clsx(
                            'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                            active && 'bg-gray-100 dark:bg-gray-700',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <UserCircleIcon className="mr-3 h-5 w-5" />
                          Profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={clsx(
                            'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                            active && 'bg-gray-100 dark:bg-gray-700',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <Cog6ToothIcon className="mr-3 h-5 w-5" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={clsx(
                            'flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors',
                            active && 'bg-gray-100 dark:bg-gray-700',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}