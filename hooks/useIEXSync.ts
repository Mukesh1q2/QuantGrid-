'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

/**
 * IEX India Energy Data Types
 */
interface IEXMarketData {
    market: string
    marketName: string
    price: number
    change: number
    changePercent: number
    volume: number
    high24h: number
    low24h: number
    lastUpdated: string
}

interface IEXDemandSupply {
    totalDemand: number
    totalSupply: number
    surplus: number
    frequency: number
    lastUpdated: string
}

interface IEXRenewableMix {
    solar: number
    wind: number
    hydro: number
    thermal: number
    nuclear: number
    other: number
    totalRenewable: number
    lastUpdated: string
}

interface IEXDataState {
    markets: IEXMarketData[]
    demandSupply: IEXDemandSupply | null
    renewableMix: IEXRenewableMix | null
    isConnected: boolean
    lastSyncTime: Date | null
    nextSyncTime: Date | null
    error: string | null
}

interface UseIEXSyncOptions {
    syncIntervalMs?: number // Default: 5 minutes (300000ms)
    autoConnect?: boolean
    onDataUpdate?: (data: IEXDataState) => void
    onError?: (error: string) => void
}

/**
 * Generate realistic IEX market data
 */
function generateMarketData(): IEXMarketData[] {
    const markets = [
        { market: 'DAM', name: 'Day Ahead Market' },
        { market: 'RTM', name: 'Real Time Market' },
        { market: 'TAM', name: 'Term Ahead Market' },
        { market: 'GDAM', name: 'Green Day Ahead Market' },
        { market: 'HPDAM', name: 'HP Day Ahead Market' },
        { market: 'SCDAM', name: 'Solar DAM' }
    ]

    return markets.map(m => {
        const basePrice = 4000 + Math.random() * 1000
        const change = (Math.random() - 0.45) * 150
        return {
            market: m.market,
            marketName: m.name,
            price: Math.round(basePrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round((change / basePrice) * 10000) / 100,
            volume: Math.floor(5000 + Math.random() * 20000),
            high24h: Math.round((basePrice + Math.random() * 100) * 100) / 100,
            low24h: Math.round((basePrice - Math.random() * 100) * 100) / 100,
            lastUpdated: new Date().toISOString()
        }
    })
}

function generateDemandSupply(): IEXDemandSupply {
    const demand = 180000 + Math.random() * 20000
    const supply = demand + (Math.random() - 0.3) * 5000
    return {
        totalDemand: Math.round(demand),
        totalSupply: Math.round(supply),
        surplus: Math.round(supply - demand),
        frequency: 49.98 + Math.random() * 0.04,
        lastUpdated: new Date().toISOString()
    }
}

function generateRenewableMix(): IEXRenewableMix {
    const solar = 15 + Math.random() * 10
    const wind = 10 + Math.random() * 8
    const hydro = 12 + Math.random() * 5
    const nuclear = 3 + Math.random() * 2
    const other = 2 + Math.random() * 3
    const thermal = 100 - solar - wind - hydro - nuclear - other

    return {
        solar: Math.round(solar * 100) / 100,
        wind: Math.round(wind * 100) / 100,
        hydro: Math.round(hydro * 100) / 100,
        thermal: Math.round(thermal * 100) / 100,
        nuclear: Math.round(nuclear * 100) / 100,
        other: Math.round(other * 100) / 100,
        totalRenewable: Math.round((solar + wind + hydro) * 100) / 100,
        lastUpdated: new Date().toISOString()
    }
}

/**
 * Custom hook for IEX India data synchronization
 * Syncs data every 5-10 minutes (configurable)
 */
export function useIEXSync(options: UseIEXSyncOptions = {}) {
    const {
        syncIntervalMs = 5 * 60 * 1000, // Default 5 minutes
        autoConnect = true,
        onDataUpdate,
        onError
    } = options

    const [state, setState] = useState<IEXDataState>({
        markets: [],
        demandSupply: null,
        renewableMix: null,
        isConnected: false,
        lastSyncTime: null,
        nextSyncTime: null,
        error: null
    })

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const isMounted = useRef(true)
    const onDataUpdateRef = useRef(onDataUpdate)
    const onErrorRef = useRef(onError)

    // Keep refs updated
    useEffect(() => {
        onDataUpdateRef.current = onDataUpdate
        onErrorRef.current = onError
    }, [onDataUpdate, onError])

    const fetchData = useCallback(async () => {
        try {
            // In production, this would call actual IEX API endpoints
            // For now, generate realistic mock data

            const markets = generateMarketData()
            const demandSupply = generateDemandSupply()
            const renewableMix = generateRenewableMix()

            const now = new Date()
            const nextSync = new Date(now.getTime() + syncIntervalMs)

            const newState: IEXDataState = {
                markets,
                demandSupply,
                renewableMix,
                isConnected: true,
                lastSyncTime: now,
                nextSyncTime: nextSync,
                error: null
            }

            if (isMounted.current) {
                setState(newState)
                onDataUpdateRef.current?.(newState)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch IEX data'
            if (isMounted.current) {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    error: errorMessage
                }))
                onErrorRef.current?.(errorMessage)
            }
        }
    }, [syncIntervalMs])

    const connect = useCallback(() => {
        // Initial fetch
        fetchData()
        toast.success('Connected to IEX India data feed', { duration: 2000 })

        // Set up interval for periodic sync
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        intervalRef.current = setInterval(() => {
            fetchData()
            toast('IEX data synchronized', { icon: '🔄', duration: 1500 })
        }, syncIntervalMs)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [fetchData, syncIntervalMs])

    const disconnect = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setState(prev => ({
            ...prev,
            isConnected: false
        }))
        toast('Disconnected from IEX data feed', { duration: 2000 })
    }, [])

    const forceSync = useCallback(() => {
        toast.loading('Syncing IEX data...', { id: 'iex-sync' })
        fetchData().then(() => {
            toast.success('IEX data synced successfully', { id: 'iex-sync' })
        }).catch(() => {
            toast.error('Failed to sync IEX data', { id: 'iex-sync' })
        })
    }, [fetchData])

    // Auto-connect on mount if enabled
    useEffect(() => {
        isMounted.current = true
        if (autoConnect) {
            const cleanup = connect()
            return () => {
                isMounted.current = false
                cleanup()
            }
        }
        return () => {
            isMounted.current = false
        }
    }, [autoConnect, connect])

    return {
        ...state,
        connect,
        disconnect,
        forceSync,
        timeToNextSync: state.nextSyncTime
            ? Math.max(0, state.nextSyncTime.getTime() - Date.now())
            : null
    }
}

/**
 * Get market price for a specific market
 */
export function getMarketPrice(markets: IEXMarketData[], marketId: string): IEXMarketData | undefined {
    return markets.find(m => m.market === marketId)
}

/**
 * Calculate total market value
 */
export function calculateTotalVolume(markets: IEXMarketData[]): number {
    return markets.reduce((sum, m) => sum + m.volume, 0)
}

/**
 * Calculate average market price
 */
export function calculateAveragePrice(markets: IEXMarketData[]): number {
    if (markets.length === 0) return 0
    return markets.reduce((sum, m) => sum + m.price, 0) / markets.length
}

export type { IEXMarketData, IEXDemandSupply, IEXRenewableMix, IEXDataState }
