'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useIEXSync, IEXMarketData, IEXDemandSupply, IEXRenewableMix } from '@/hooks/useIEXSync'

// ========================
// Enhanced Realtime Data Types
// ========================
export interface LiveMarketData {
    market: string
    marketName: string
    price: number
    change: number
    changePercent: number
    volume: number
    high24h: number
    low24h: number
    lastUpdated: string
    isLive: boolean
}

export interface LiveDemandSupply {
    totalDemand: number
    totalSupply: number
    surplus: number
    frequency: number
    lastUpdated: string
}

export interface LiveRenewableMix {
    solar: number
    wind: number
    hydro: number
    thermal: number
    nuclear: number
    other: number
    totalRenewable: number
    lastUpdated: string
}

// ========================
// Context Types
// ========================
interface LiveDataContextValue {
    // IEX Data
    markets: LiveMarketData[]
    demandSupply: LiveDemandSupply | null
    renewableMix: LiveRenewableMix | null

    // Connection status
    isConnected: boolean
    isLiveData: boolean
    lastSyncTime: Date | null
    nextSyncTime: Date | null
    error: string | null

    // Actions
    refresh: () => void

    // Legacy compatibility
    priceData: Map<string, any>
    volumeData: Map<string, any>
    trades: any[]
    alerts: any[]
    status: 'connecting' | 'connected' | 'disconnected' | 'error'
    latency: number
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null)

// ========================
// Provider Component
// ========================
export function LiveDataProvider({ children }: { children: ReactNode }) {
    // Use existing IEX sync hook
    const {
        markets: iexMarkets,
        demandSupply: iexDemandSupply,
        renewableMix: iexRenewableMix,
        isConnected,
        lastSyncTime,
        nextSyncTime,
        error: iexError,
        forceSync
    } = useIEXSync({
        syncIntervalMs: 30000, // 30 seconds
        autoConnect: true
    })

    // Transform IEX data to LiveMarketData format
    const markets: LiveMarketData[] = iexMarkets.map(m => ({
        market: m.market,
        marketName: m.marketName,
        price: m.price,
        change: m.change,
        changePercent: m.changePercent,
        volume: m.volume,
        high24h: m.high24h,
        low24h: m.low24h,
        lastUpdated: m.lastUpdated,
        isLive: isConnected
    }))

    // Transform demand supply
    const demandSupply: LiveDemandSupply | null = iexDemandSupply ? {
        totalDemand: iexDemandSupply.totalDemand,
        totalSupply: iexDemandSupply.totalSupply,
        surplus: iexDemandSupply.surplus,
        frequency: iexDemandSupply.frequency,
        lastUpdated: iexDemandSupply.lastUpdated
    } : null

    // Transform renewable mix
    const renewableMix: LiveRenewableMix | null = iexRenewableMix ? {
        solar: iexRenewableMix.solar,
        wind: iexRenewableMix.wind,
        hydro: iexRenewableMix.hydro,
        thermal: iexRenewableMix.thermal,
        nuclear: iexRenewableMix.nuclear,
        other: iexRenewableMix.other,
        totalRenewable: iexRenewableMix.totalRenewable,
        lastUpdated: iexRenewableMix.lastUpdated
    } : null

    // Legacy compatibility: Convert to Map format for existing widgets
    const priceData = new Map<string, any>()
    markets.forEach(m => {
        const key = `${m.market}-All`
        priceData.set(key, {
            market: m.market,
            region: 'All India',
            price: m.price,
            change: m.change,
            changePercent: m.changePercent,
            volume: m.volume,
            timestamp: new Date(m.lastUpdated)
        })
    })

    // Volume data from markets
    const volumeData = new Map<string, any>()
    markets.forEach(m => {
        volumeData.set(m.market, {
            market: m.market,
            volume: m.volume,
            trades: Math.floor(m.volume / 100),
            timestamp: new Date(m.lastUpdated)
        })
    })

    // Simulated trades and alerts (enhance later with real data)
    const [trades, setTrades] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [latency, setLatency] = useState(25)

    // Generate simulated trades based on real market data
    useEffect(() => {
        if (markets.length === 0) return

        const interval = setInterval(() => {
            const market = markets[Math.floor(Math.random() * markets.length)]
            if (!market) return

            const newTrade = {
                id: Date.now().toString(),
                market: market.market,
                price: market.price + (Math.random() - 0.5) * 0.1,
                quantity: Math.floor(100 + Math.random() * 900),
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                timestamp: new Date()
            }
            setTrades(prev => [newTrade, ...prev.slice(0, 49)])
            setLatency(Math.floor(15 + Math.random() * 30))
        }, 2000)

        return () => clearInterval(interval)
    }, [markets])

    // Generate alerts based on price movements
    useEffect(() => {
        if (markets.length === 0) return

        markets.forEach(market => {
            if (Math.abs(market.changePercent) > 3) {
                const alert = {
                    id: Date.now().toString() + market.market,
                    type: market.changePercent > 0 ? 'price_spike' : 'price_drop',
                    severity: Math.abs(market.changePercent) > 5 ? 'high' : 'medium',
                    message: `${market.market} ${market.changePercent > 0 ? 'up' : 'down'} ${Math.abs(market.changePercent).toFixed(1)}%`,
                    market: market.market,
                    value: market.changePercent,
                    timestamp: new Date()
                }
                setAlerts(prev => {
                    // Avoid duplicate alerts
                    if (prev.some(a => a.market === alert.market && a.type === alert.type)) return prev
                    return [alert, ...prev.slice(0, 19)]
                })
            }
        })
    }, [markets])

    const value: LiveDataContextValue = {
        // Enhanced data
        markets,
        demandSupply,
        renewableMix,

        // Status
        isConnected,
        isLiveData: isConnected && !iexError,
        lastSyncTime,
        nextSyncTime,
        error: iexError,

        // Actions
        refresh: forceSync,

        // Legacy compatibility
        priceData,
        volumeData,
        trades,
        alerts,
        status: isConnected ? 'connected' : 'connecting',
        latency
    }

    return (
        <LiveDataContext.Provider value={value}>
            {children}
        </LiveDataContext.Provider>
    )
}

// ========================
// Custom Hooks
// ========================
export function useLiveData() {
    const context = useContext(LiveDataContext)
    if (!context) {
        throw new Error('useLiveData must be used within LiveDataProvider')
    }
    return context
}

export function useLiveMarkets() {
    const { markets, isLiveData, refresh, lastSyncTime } = useLiveData()
    return { markets, isLiveData, refresh, lastSyncTime }
}

export function useLiveDemandSupply() {
    const { demandSupply, isLiveData, refresh } = useLiveData()
    return { demandSupply, isLiveData, refresh }
}

export function useLiveRenewables() {
    const { renewableMix, isLiveData, refresh } = useLiveData()
    return { renewableMix, isLiveData, refresh }
}

// Legacy compatibility hooks
export function useRealtime() {
    const context = useLiveData()
    return {
        status: context.status,
        latency: context.latency,
        lastUpdate: context.lastSyncTime,
        priceData: context.priceData,
        volumeData: context.volumeData,
        trades: context.trades,
        alerts: context.alerts,
        subscribe: () => () => { } // No-op for now
    }
}

export function usePriceStream(market: string, region?: string) {
    const { priceData, status } = useLiveData()
    const prices = Array.from(priceData.values()).filter(p =>
        p.market === market && (!region || p.region === region)
    )
    return { prices, status }
}

export function useTradeStream() {
    const { trades, status } = useLiveData()
    return { trades, status }
}

export function useAlerts() {
    const { alerts, status } = useLiveData()
    return { alerts, status }
}

export function useConnectionStatus() {
    const { status, latency, lastSyncTime } = useLiveData()
    return { status, latency, lastUpdate: lastSyncTime }
}
