'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CalendarDaysIcon,
    ClockIcon,
    BoltIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    BellIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import toast from 'react-hot-toast'

/**
 * Calendar Page
 * 
 * Trading calendar showing market auctions, deadlines, and scheduled events.
 */

interface CalendarEvent {
    id: string
    title: string
    type: 'auction' | 'deadline' | 'maintenance' | 'holiday' | 'custom'
    date: Date
    time?: string
    market?: string
    description?: string
}

const eventTypeConfig = {
    auction: { color: 'bg-blue-500', label: 'Auction' },
    deadline: { color: 'bg-red-500', label: 'Deadline' },
    maintenance: { color: 'bg-yellow-500', label: 'Maintenance' },
    holiday: { color: 'bg-green-500', label: 'Holiday' },
    custom: { color: 'bg-purple-500', label: 'Custom' }
}

// Generate mock events
function generateEvents(year: number, month: number): CalendarEvent[] {
    const events: CalendarEvent[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // DAM auctions daily
    for (let day = 1; day <= daysInMonth; day++) {
        events.push({
            id: `dam-${day}`,
            title: 'DAM Auction',
            type: 'auction',
            date: new Date(year, month, day),
            time: '10:00 AM',
            market: 'DAM',
            description: 'Day Ahead Market auction closes'
        })
    }

    // RTM auctions
    for (let day = 1; day <= daysInMonth; day++) {
        if (day % 2 === 0) {
            events.push({
                id: `rtm-${day}`,
                title: 'RTM Session',
                type: 'auction',
                date: new Date(year, month, day),
                time: 'Continuous',
                market: 'RTM'
            })
        }
    }

    // Monthly deadlines
    events.push({
        id: 'compliance-deadline',
        title: 'Monthly Compliance Report',
        type: 'deadline',
        date: new Date(year, month, Math.min(15, daysInMonth)),
        time: '5:00 PM',
        description: 'Submit monthly compliance report'
    })

    // Maintenance windows
    if (month % 2 === 0) {
        events.push({
            id: 'maintenance',
            title: 'Scheduled Maintenance',
            type: 'maintenance',
            date: new Date(year, month, 20),
            time: '2:00 AM - 4:00 AM',
            description: 'Platform maintenance window'
        })
    }

    return events
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [events, setEvents] = useState<CalendarEvent[]>(() =>
        generateEvents(currentDate.getFullYear(), currentDate.getMonth())
    )
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'custom' as CalendarEvent['type'],
        time: '',
        market: '',
        description: ''
    })

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthName = currentDate.toLocaleString('default', { month: 'long' })

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const getEventsForDay = (day: number) => {
        return events.filter(e =>
            e.date.getDate() === day &&
            e.date.getMonth() === month &&
            e.date.getFullYear() === year
        )
    }

    const selectedEvents = selectedDate
        ? events.filter(e =>
            e.date.getDate() === selectedDate.getDate() &&
            e.date.getMonth() === selectedDate.getMonth()
        )
        : []

    const handleAddEvent = () => {
        if (!newEvent.title || !selectedDate) {
            toast.error('Please select a date and enter a title')
            return
        }

        const event: CalendarEvent = {
            id: `custom-${Date.now()}`,
            title: newEvent.title,
            type: newEvent.type,
            date: selectedDate,
            time: newEvent.time || undefined,
            market: newEvent.market || undefined,
            description: newEvent.description || undefined
        }

        setEvents(prev => [...prev, event])
        setShowAddModal(false)
        setNewEvent({ title: '', type: 'custom', time: '', market: '', description: '' })
        toast.success('Event added successfully!')
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
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <CalendarDaysIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Trading Calendar
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Market auctions, deadlines & events
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Event
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 pb-20">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Calendar Grid */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                        <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {monthName} {year}
                                    </h2>
                                    <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Days Header */}
                                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7">
                                    {/* Empty cells for days before first of month */}
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50" />
                                    ))}

                                    {/* Days of month */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1
                                        const dayEvents = getEventsForDay(day)
                                        const isToday = new Date().getDate() === day &&
                                            new Date().getMonth() === month &&
                                            new Date().getFullYear() === year
                                        const isSelected = selectedDate?.getDate() === day &&
                                            selectedDate?.getMonth() === month

                                        return (
                                            <motion.div
                                                key={day}
                                                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                                onClick={() => setSelectedDate(new Date(year, month, day))}
                                                className={clsx(
                                                    'h-24 p-2 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer',
                                                    isSelected && 'bg-blue-50 dark:bg-blue-900/20',
                                                    isToday && 'ring-2 ring-inset ring-blue-500'
                                                )}
                                            >
                                                <span className={clsx(
                                                    'text-sm font-medium',
                                                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                                )}>
                                                    {day}
                                                </span>
                                                <div className="mt-1 space-y-1">
                                                    {dayEvents.slice(0, 2).map(event => (
                                                        <div
                                                            key={event.id}
                                                            className={clsx(
                                                                'text-xs px-1.5 py-0.5 rounded truncate text-white',
                                                                eventTypeConfig[event.type].color
                                                            )}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{dayEvents.length - 2} more</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Event Details Sidebar */}
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            {/* Selected Day Events */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                        : 'Select a date'
                                    }
                                </h3>

                                {selectedEvents.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedEvents.map(event => (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={clsx(
                                                        'px-2 py-0.5 text-xs font-medium text-white rounded',
                                                        eventTypeConfig[event.type].color
                                                    )}>
                                                        {eventTypeConfig[event.type].label}
                                                    </span>
                                                    {event.time && (
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <ClockIcon className="h-3 w-3 mr-1" />
                                                            {event.time}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                                {event.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                                                )}
                                                {event.market && (
                                                    <span className="inline-flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                        <BoltIcon className="h-3 w-3 mr-1" />
                                                        {event.market}
                                                    </span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedDate ? 'No events for this date' : 'Click a date to see events'}
                                    </p>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Event Types</h3>
                                <div className="space-y-2">
                                    {Object.entries(eventTypeConfig).map(([key, conf]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <span className={clsx('w-3 h-3 rounded', conf.color)} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{conf.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <AIInsightsBar />
            </div>

            {/* Add Event Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 mx-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Event</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter event title"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Event Type
                                </label>
                                <select
                                    value={newEvent.type}
                                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="custom">Custom</option>
                                    <option value="auction">Auction</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="holiday">Holiday</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Time
                                    </label>
                                    <input
                                        type="text"
                                        value={newEvent.time}
                                        onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                                        placeholder="e.g. 10:00 AM"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Market
                                    </label>
                                    <select
                                        value={newEvent.market}
                                        onChange={e => setNewEvent(prev => ({ ...prev, market: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">None</option>
                                        <option value="DAM">DAM</option>
                                        <option value="RTM">RTM</option>
                                        <option value="TAM">TAM</option>
                                        <option value="GDAM">GDAM</option>
                                        <option value="HPDAM">HPDAM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Optional description"
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Selected date: {selectedDate
                                    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : 'Please select a date on the calendar first'
                                }
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEvent}
                                disabled={!newEvent.title || !selectedDate}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                            >
                                Add Event
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
