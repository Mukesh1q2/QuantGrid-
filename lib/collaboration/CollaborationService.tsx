'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

// ========================
// Types
// ========================
export interface SharedDashboard {
    id: string
    dashboardId: string
    shareLink: string
    createdBy: string
    createdAt: Date
    expiresAt?: Date
    permission: 'view' | 'edit' | 'admin'
    password?: string
    accessCount: number
    lastAccessedAt?: Date
}

export interface DashboardTemplate {
    id: string
    name: string
    description: string
    thumbnail: string
    category: 'trading' | 'analytics' | 'executive' | 'custom'
    widgets: any[]
    layout: any
    createdBy: string
    isPublic: boolean
    usageCount: number
}

export interface Annotation {
    id: string
    widgetId: string
    x: number
    y: number
    content: string
    author: TeamMember
    createdAt: Date
    updatedAt: Date
    resolved: boolean
    replies: AnnotationReply[]
    mentions: string[]
    priority: 'low' | 'medium' | 'high'
}

export interface AnnotationReply {
    id: string
    content: string
    author: TeamMember
    createdAt: Date
    mentions: string[]
}

export interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'analyst' | 'trader' | 'viewer'
    status: 'online' | 'away' | 'offline'
    lastActive: Date
    currentView?: string
}

export interface ActivityItem {
    id: string
    type: 'comment' | 'annotation' | 'widget_add' | 'widget_remove' | 'share' | 'edit' | 'alert'
    user: TeamMember
    target: string
    details: string
    timestamp: Date
}

// ========================
// Collaboration Service
// ========================
class CollaborationService {
    private baseUrl = '/api/collaboration'

    // Mock team members for demo
    private mockTeam: TeamMember[] = [
        { id: '1', name: 'Priya Sharma', email: 'priya@optibid.com', avatar: '', role: 'admin', status: 'online', lastActive: new Date() },
        { id: '2', name: 'Rahul Patel', email: 'rahul@optibid.com', avatar: '', role: 'analyst', status: 'online', lastActive: new Date() },
        { id: '3', name: 'Anjali Singh', email: 'anjali@optibid.com', avatar: '', role: 'trader', status: 'away', lastActive: new Date(Date.now() - 10 * 60 * 1000) },
        { id: '4', name: 'Vikram Mehta', email: 'vikram@optibid.com', avatar: '', role: 'analyst', status: 'offline', lastActive: new Date(Date.now() - 60 * 60 * 1000) }
    ]

    // Generate share link
    async createShareLink(dashboardId: string, options: {
        permission: 'view' | 'edit' | 'admin'
        expiresInDays?: number
        password?: string
    }): Promise<SharedDashboard> {
        await new Promise(r => setTimeout(r, 500))

        const shareId = Math.random().toString(36).substring(2, 10)

        return {
            id: shareId,
            dashboardId,
            shareLink: `https://optibid.energy/share/${shareId}`,
            createdBy: 'current-user',
            createdAt: new Date(),
            expiresAt: options.expiresInDays ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000) : undefined,
            permission: options.permission,
            password: options.password,
            accessCount: 0,
            lastAccessedAt: undefined
        }
    }

    // Get dashboard templates
    async getTemplates(): Promise<DashboardTemplate[]> {
        await new Promise(r => setTimeout(r, 300))

        return [
            {
                id: 'trading-pro',
                name: 'Trading Pro',
                description: 'Optimized for active traders with order book, positions, and live prices',
                thumbnail: '📊',
                category: 'trading',
                widgets: ['order-book', 'position-monitor', 'iex-india-live-prices', 'trade-ticker'],
                layout: {},
                createdBy: 'system',
                isPublic: true,
                usageCount: 1247
            },
            {
                id: 'analytics-dashboard',
                name: 'Analytics Hub',
                description: 'Deep dive analytics with AI predictions and risk metrics',
                thumbnail: '📈',
                category: 'analytics',
                widgets: ['ai-predictions', 'risk-dashboard', 'heat-map', 'explainable-ai'],
                layout: {},
                createdBy: 'system',
                isPublic: true,
                usageCount: 892
            },
            {
                id: 'executive-view',
                name: 'Executive Overview',
                description: 'High-level KPIs and summaries for leadership',
                thumbnail: '👔',
                category: 'executive',
                widgets: ['portfolio-analytics', 'session-stats', 'ai-copilot'],
                layout: {},
                createdBy: 'system',
                isPublic: true,
                usageCount: 456
            }
        ]
    }

    // Get team members
    async getTeamMembers(): Promise<TeamMember[]> {
        await new Promise(r => setTimeout(r, 200))
        return this.mockTeam
    }

    // Get annotations for a widget
    async getAnnotations(widgetId: string): Promise<Annotation[]> {
        await new Promise(r => setTimeout(r, 200))

        // Return sample annotations
        return [
            {
                id: 'ann-1',
                widgetId,
                x: 75,
                y: 25,
                content: 'Note the price spike here - correlates with the thermal outage mentioned in news.',
                author: this.mockTeam[0],
                createdAt: new Date(Date.now() - 30 * 60 * 1000),
                updatedAt: new Date(Date.now() - 30 * 60 * 1000),
                resolved: false,
                replies: [
                    {
                        id: 'reply-1',
                        content: 'Good catch! Let me investigate the correlation further.',
                        author: this.mockTeam[1],
                        createdAt: new Date(Date.now() - 15 * 60 * 1000),
                        mentions: []
                    }
                ],
                mentions: ['rahul@optibid.com'],
                priority: 'high'
            }
        ]
    }

    // Create annotation
    async createAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Annotation> {
        await new Promise(r => setTimeout(r, 300))

        return {
            ...annotation,
            id: `ann-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            replies: []
        }
    }

    // Add reply to annotation
    async addReply(annotationId: string, content: string, author: TeamMember): Promise<AnnotationReply> {
        await new Promise(r => setTimeout(r, 200))

        return {
            id: `reply-${Date.now()}`,
            content,
            author,
            createdAt: new Date(),
            mentions: this.extractMentions(content)
        }
    }

    // Get activity feed
    async getActivityFeed(limit: number = 20): Promise<ActivityItem[]> {
        await new Promise(r => setTimeout(r, 300))

        const activities: ActivityItem[] = [
            {
                id: 'act-1',
                type: 'annotation',
                user: this.mockTeam[0],
                target: 'AI Predictions Widget',
                details: 'Added annotation about price correlation',
                timestamp: new Date(Date.now() - 5 * 60 * 1000)
            },
            {
                id: 'act-2',
                type: 'widget_add',
                user: this.mockTeam[1],
                target: 'Risk Dashboard',
                details: 'Added Risk Dashboard to trading view',
                timestamp: new Date(Date.now() - 15 * 60 * 1000)
            },
            {
                id: 'act-3',
                type: 'share',
                user: this.mockTeam[2],
                target: 'Analytics Dashboard',
                details: 'Shared dashboard with external partner',
                timestamp: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
                id: 'act-4',
                type: 'comment',
                user: this.mockTeam[1],
                target: 'Position Monitor',
                details: 'Replied: "Good catch! Let me investigate..."',
                timestamp: new Date(Date.now() - 45 * 60 * 1000)
            },
            {
                id: 'act-5',
                type: 'alert',
                user: this.mockTeam[0],
                target: 'DAM Prices',
                details: 'Price spike alert triggered at ₹6.82/kWh',
                timestamp: new Date(Date.now() - 60 * 60 * 1000)
            }
        ]

        return activities.slice(0, limit)
    }

    private extractMentions(content: string): string[] {
        const mentionRegex = /@(\w+)/g
        const matches = content.match(mentionRegex)
        return matches ? matches.map(m => m.substring(1)) : []
    }
}

// Singleton
export const collaborationService = new CollaborationService()

// ========================
// React Context
// ========================
interface CollaborationContextValue {
    team: TeamMember[]
    onlineCount: number
    annotations: Map<string, Annotation[]>
    activities: ActivityItem[]
    templates: DashboardTemplate[]
    sharedDashboards: SharedDashboard[]
    isLoading: boolean

    // Actions
    loadTeam: () => Promise<void>
    createShare: (dashboardId: string, options: any) => Promise<SharedDashboard>
    loadAnnotations: (widgetId: string) => Promise<void>
    addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => Promise<Annotation>
    replyToAnnotation: (annotationId: string, content: string) => Promise<void>
    loadActivities: () => Promise<void>
    loadTemplates: () => Promise<void>
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null)

export function CollaborationProvider({ children }: { children: ReactNode }) {
    const [team, setTeam] = useState<TeamMember[]>([])
    const [annotations, setAnnotations] = useState<Map<string, Annotation[]>>(new Map())
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [templates, setTemplates] = useState<DashboardTemplate[]>([])
    const [sharedDashboards, setSharedDashboards] = useState<SharedDashboard[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const onlineCount = team.filter(m => m.status === 'online').length

    const loadTeam = useCallback(async () => {
        const members = await collaborationService.getTeamMembers()
        setTeam(members)
    }, [])

    const createShare = useCallback(async (dashboardId: string, options: any) => {
        const share = await collaborationService.createShareLink(dashboardId, options)
        setSharedDashboards(prev => [...prev, share])
        return share
    }, [])

    const loadAnnotations = useCallback(async (widgetId: string) => {
        const anns = await collaborationService.getAnnotations(widgetId)
        setAnnotations(prev => new Map(prev).set(widgetId, anns))
    }, [])

    const addAnnotation = useCallback(async (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt' | 'replies'>) => {
        const newAnn = await collaborationService.createAnnotation(annotation)
        setAnnotations(prev => {
            const map = new Map(prev)
            const existing = map.get(annotation.widgetId) || []
            map.set(annotation.widgetId, [...existing, newAnn])
            return map
        })
        return newAnn
    }, [])

    const replyToAnnotation = useCallback(async (annotationId: string, content: string) => {
        // Find the annotation and add reply
        const mockAuthor = team[0] || { id: 'current', name: 'You', email: '', role: 'analyst', status: 'online', lastActive: new Date() }
        await collaborationService.addReply(annotationId, content, mockAuthor as TeamMember)
        // In real app, would update the specific annotation's replies
    }, [team])

    const loadActivities = useCallback(async () => {
        const acts = await collaborationService.getActivityFeed()
        setActivities(acts)
    }, [])

    const loadTemplates = useCallback(async () => {
        const temps = await collaborationService.getTemplates()
        setTemplates(temps)
    }, [])

    // Load initial data
    useEffect(() => {
        loadTeam()
        loadActivities()
        loadTemplates()
    }, [loadTeam, loadActivities, loadTemplates])

    return (
        <CollaborationContext.Provider value={{
            team,
            onlineCount,
            annotations,
            activities,
            templates,
            sharedDashboards,
            isLoading,
            loadTeam,
            createShare,
            loadAnnotations,
            addAnnotation,
            replyToAnnotation,
            loadActivities,
            loadTemplates
        }}>
            {children}
        </CollaborationContext.Provider>
    )
}

export function useCollaboration() {
    const context = useContext(CollaborationContext)
    if (!context) {
        throw new Error('useCollaboration must be used within CollaborationProvider')
    }
    return context
}

export function useTeam() {
    const { team, onlineCount, loadTeam } = useCollaboration()
    return { team, onlineCount, refresh: loadTeam }
}

export function useAnnotations(widgetId: string) {
    const { annotations, loadAnnotations, addAnnotation, replyToAnnotation } = useCollaboration()

    useEffect(() => {
        loadAnnotations(widgetId)
    }, [widgetId, loadAnnotations])

    return {
        annotations: annotations.get(widgetId) || [],
        addAnnotation,
        replyToAnnotation
    }
}

export function useActivities() {
    const { activities, loadActivities } = useCollaboration()
    return { activities, refresh: loadActivities }
}
