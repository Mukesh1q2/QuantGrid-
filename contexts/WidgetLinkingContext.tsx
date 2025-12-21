'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/**
 * Widget Linking System
 * 
 * Allows widgets to share context and filter data based on selections.
 * When a user selects a zone in one widget, other linked widgets update.
 */

export interface LinkContext {
    // Location/Zone filter
    zone?: string
    zoneName?: string

    // Time range filter
    timeRange?: {
        start: Date
        end: Date
        preset?: '1h' | '4h' | '24h' | '7d' | '30d' | '90d' | '1y'
    }

    // Market filter
    market?: 'DAM' | 'RTM' | 'TAM' | 'GDAM' | 'HPDAM' | 'all'

    // Asset filter
    assetType?: 'solar' | 'wind' | 'hydro' | 'thermal' | 'all'
    assetId?: string

    // Trading context
    orderId?: string
    tradeId?: string

    // Custom data
    customFilters?: Record<string, unknown>
}

interface WidgetLinkingContextType {
    // Current link context
    linkContext: LinkContext

    // Update methods
    setZone: (zone: string, zoneName?: string) => void
    setTimeRange: (range: LinkContext['timeRange']) => void
    setMarket: (market: LinkContext['market']) => void
    setAssetType: (type: LinkContext['assetType']) => void
    setAsset: (assetId: string) => void
    setOrder: (orderId: string) => void
    setTrade: (tradeId: string) => void
    setCustomFilter: (key: string, value: unknown) => void

    // Batch update
    updateContext: (updates: Partial<LinkContext>) => void

    // Reset
    clearContext: () => void
    clearField: (field: keyof LinkContext) => void

    // Subscription tracking
    linkedWidgets: Set<string>
    registerWidget: (widgetId: string) => void
    unregisterWidget: (widgetId: string) => void
}

const WidgetLinkingContext = createContext<WidgetLinkingContextType | null>(null)

const DEFAULT_CONTEXT: LinkContext = {
    zone: undefined,
    timeRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date(), preset: '24h' },
    market: 'all',
    assetType: 'all'
}

export function WidgetLinkingProvider({ children }: { children: ReactNode }) {
    const [linkContext, setLinkContext] = useState<LinkContext>(DEFAULT_CONTEXT)
    const [linkedWidgets, setLinkedWidgets] = useState<Set<string>>(new Set())

    const setZone = useCallback((zone: string, zoneName?: string) => {
        setLinkContext(prev => ({ ...prev, zone, zoneName }))
    }, [])

    const setTimeRange = useCallback((range: LinkContext['timeRange']) => {
        setLinkContext(prev => ({ ...prev, timeRange: range }))
    }, [])

    const setMarket = useCallback((market: LinkContext['market']) => {
        setLinkContext(prev => ({ ...prev, market }))
    }, [])

    const setAssetType = useCallback((type: LinkContext['assetType']) => {
        setLinkContext(prev => ({ ...prev, assetType: type }))
    }, [])

    const setAsset = useCallback((assetId: string) => {
        setLinkContext(prev => ({ ...prev, assetId }))
    }, [])

    const setOrder = useCallback((orderId: string) => {
        setLinkContext(prev => ({ ...prev, orderId }))
    }, [])

    const setTrade = useCallback((tradeId: string) => {
        setLinkContext(prev => ({ ...prev, tradeId }))
    }, [])

    const setCustomFilter = useCallback((key: string, value: unknown) => {
        setLinkContext(prev => ({
            ...prev,
            customFilters: { ...prev.customFilters, [key]: value }
        }))
    }, [])

    const updateContext = useCallback((updates: Partial<LinkContext>) => {
        setLinkContext(prev => ({ ...prev, ...updates }))
    }, [])

    const clearContext = useCallback(() => {
        setLinkContext(DEFAULT_CONTEXT)
    }, [])

    const clearField = useCallback((field: keyof LinkContext) => {
        setLinkContext(prev => {
            const updated = { ...prev }
            delete updated[field]
            return updated
        })
    }, [])

    const registerWidget = useCallback((widgetId: string) => {
        setLinkedWidgets(prev => new Set(prev).add(widgetId))
    }, [])

    const unregisterWidget = useCallback((widgetId: string) => {
        setLinkedWidgets(prev => {
            const next = new Set(prev)
            next.delete(widgetId)
            return next
        })
    }, [])

    return (
        <WidgetLinkingContext.Provider
            value={{
                linkContext,
                setZone,
                setTimeRange,
                setMarket,
                setAssetType,
                setAsset,
                setOrder,
                setTrade,
                setCustomFilter,
                updateContext,
                clearContext,
                clearField,
                linkedWidgets,
                registerWidget,
                unregisterWidget
            }}
        >
            {children}
        </WidgetLinkingContext.Provider>
    )
}

/**
 * Hook to access widget linking context
 */
export function useWidgetLinking() {
    const context = useContext(WidgetLinkingContext)
    if (!context) {
        throw new Error('useWidgetLinking must be used within a WidgetLinkingProvider')
    }
    return context
}

/**
 * Hook for widgets to register themselves and get filtered data
 */
export function useLinkedWidget(widgetId: string) {
    const context = useWidgetLinking()

    // Register on mount, unregister on unmount
    // (should be done in useEffect in the component)

    return {
        ...context,
        isLinked: context.linkedWidgets.has(widgetId),
        register: () => context.registerWidget(widgetId),
        unregister: () => context.unregisterWidget(widgetId)
    }
}

/**
 * Helper to filter data based on link context
 */
export function filterByLinkContext<T extends Record<string, unknown>>(
    data: T[],
    context: LinkContext,
    config: {
        zoneField?: keyof T
        marketField?: keyof T
        assetTypeField?: keyof T
        timeField?: keyof T
    }
): T[] {
    let filtered = data

    if (context.zone && config.zoneField) {
        filtered = filtered.filter(item => item[config.zoneField!] === context.zone)
    }

    if (context.market && context.market !== 'all' && config.marketField) {
        filtered = filtered.filter(item => item[config.marketField!] === context.market)
    }

    if (context.assetType && context.assetType !== 'all' && config.assetTypeField) {
        filtered = filtered.filter(item => item[config.assetTypeField!] === context.assetType)
    }

    if (context.timeRange && config.timeField) {
        filtered = filtered.filter(item => {
            const itemTime = new Date(item[config.timeField!] as string)
            return itemTime >= context.timeRange!.start && itemTime <= context.timeRange!.end
        })
    }

    return filtered
}

export default WidgetLinkingProvider
