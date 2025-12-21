'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ShareIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    PlusIcon,
    LinkIcon,
    EyeIcon,
    PencilIcon,
    ShieldCheckIcon,
    ClockIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import {
    useTeam,
    useActivities,
    useCollaboration,
    TeamMember,
    ActivityItem,
    DashboardTemplate
} from '@/lib/collaboration/CollaborationService'

// ========================
// Team Presence Widget
// ========================
export function TeamPresenceWidget() {
    const { team, onlineCount, refresh } = useTeam()

    useEffect(() => {
        refresh()
    }, [refresh])

    const getStatusColor = (status: TeamMember['status']) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-yellow-500'
            default: return 'bg-gray-400'
        }
    }

    const getRoleColor = (role: TeamMember['role']) => {
        switch (role) {
            case 'admin': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
            case 'trader': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
            case 'analyst': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
        }
    }

    const formatLastActive = (date: Date) => {
        const mins = Math.floor((Date.now() - date.getTime()) / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        return `${Math.floor(mins / 60)}h ago`
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Team</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                    {onlineCount} online
                </span>
            </div>

            {/* Team List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {team.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={clsx(
                                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                                getStatusColor(member.status)
                            )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {member.name}
                                </span>
                                <span className={clsx(
                                    'text-xs px-1.5 py-0.5 rounded',
                                    getRoleColor(member.role)
                                )}>
                                    {member.role}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {member.status === 'online' ? 'Active now' : formatLastActive(member.lastActive)}
                            </span>
                        </div>

                        {/* Quick Actions */}
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Invite Button */}
            <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Invite Team Member
            </button>
        </div>
    )
}

// ========================
// Activity Feed Widget
// ========================
export function ActivityFeedWidget() {
    const { activities, refresh } = useActivities()

    useEffect(() => {
        refresh()
    }, [refresh])

    const getActivityIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'annotation': return { icon: '📝', color: 'text-blue-600 bg-blue-100' }
            case 'comment': return { icon: '💬', color: 'text-purple-600 bg-purple-100' }
            case 'widget_add': return { icon: '➕', color: 'text-green-600 bg-green-100' }
            case 'widget_remove': return { icon: '➖', color: 'text-red-600 bg-red-100' }
            case 'share': return { icon: '🔗', color: 'text-orange-600 bg-orange-100' }
            case 'edit': return { icon: '✏️', color: 'text-yellow-600 bg-yellow-100' }
            case 'alert': return { icon: '🔔', color: 'text-red-600 bg-red-100' }
            default: return { icon: '📄', color: 'text-gray-600 bg-gray-100' }
        }
    }

    const formatTime = (date: Date) => {
        const mins = Math.floor((Date.now() - date.getTime()) / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
        return `${Math.floor(mins / 1440)}d ago`
    }

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Activity</span>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto">
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    <div className="space-y-4">
                        <AnimatePresence>
                            {activities.map((activity, idx) => {
                                const { icon, color } = getActivityIcon(activity.type)
                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative flex gap-3 pl-1"
                                    >
                                        {/* Icon */}
                                        <div className={clsx(
                                            'w-6 h-6 rounded-full flex items-center justify-center text-xs z-10',
                                            color
                                        )}>
                                            {icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {activity.user.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {formatTime(activity.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                {activity.details}
                                            </p>
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                on {activity.target}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========================
// Share Dashboard Modal
// ========================
interface ShareDashboardModalProps {
    isOpen: boolean
    onClose: () => void
    dashboardId: string
    dashboardName: string
}

export function ShareDashboardModal({ isOpen, onClose, dashboardId, dashboardName }: ShareDashboardModalProps) {
    const { createShare, templates } = useCollaboration()
    const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view')
    const [expiresInDays, setExpiresInDays] = useState<number | undefined>(7)
    const [shareLink, setShareLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateLink = async () => {
        setIsGenerating(true)
        try {
            const share = await createShare(dashboardId, { permission, expiresInDays })
            setShareLink(share.shareLink)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <ShareIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Share Dashboard</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dashboard
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {dashboardName}
                        </div>
                    </div>

                    {/* Permission Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Permission Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'view', label: 'View', icon: EyeIcon, desc: 'Can view only' },
                                { value: 'edit', label: 'Edit', icon: PencilIcon, desc: 'Can modify' },
                                { value: 'admin', label: 'Admin', icon: ShieldCheckIcon, desc: 'Full access' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setPermission(opt.value as any)}
                                    className={clsx(
                                        'p-3 rounded-lg border-2 transition-all text-center',
                                        permission === opt.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    )}
                                >
                                    <opt.icon className={clsx(
                                        'h-5 w-5 mx-auto mb-1',
                                        permission === opt.value ? 'text-blue-600' : 'text-gray-400'
                                    )} />
                                    <span className={clsx(
                                        'text-sm font-medium block',
                                        permission === opt.value ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                                    )}>
                                        {opt.label}
                                    </span>
                                    <span className="text-xs text-gray-500">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link Expiration
                        </label>
                        <select
                            value={expiresInDays || 'never'}
                            onChange={(e) => setExpiresInDays(e.target.value === 'never' ? undefined : parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="1">1 day</option>
                            <option value="7">7 days</option>
                            <option value="30">30 days</option>
                            <option value="never">Never</option>
                        </select>
                    </div>

                    {/* Generated Link */}
                    {shareLink ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                ✓ Share Link Generated
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateLink}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-4 w-4" />
                                    Generate Share Link
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

// ========================
// Dashboard Templates Widget
// ========================
export function DashboardTemplatesWidget() {
    const { templates, loadTemplates } = useCollaboration()

    useEffect(() => {
        loadTemplates()
    }, [loadTemplates])

    return (
        <div className="h-full flex flex-col p-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Templates</span>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {templates.map((template) => (
                    <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{template.thumbnail}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-400">
                                        📊 {template.widgets.length} widgets
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        👥 {template.usageCount.toLocaleString()} uses
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create New */}
            <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Create Template
            </button>
        </div>
    )
}
