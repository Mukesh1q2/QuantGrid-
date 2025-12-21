'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * SSE Connection Status
 */
export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Market Price Data
 */
export interface MarketPrice {
    zoneId: string
    zoneName: string
    price: number
    change: number
    changePercent: number
    volume: number
    trend: 'up' | 'down' | 'stable'
}

/**
 * Renewable Energy Source Data
 */
export interface RenewableSource {
    id: string
    name: string
    color: string
    generation: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
}

/**
 * Demand Supply Data
 */
export interface DemandSupplyData {
    timestamp: string
    demand: number
    supply: number
    balance: number
    status: 'surplus' | 'deficit' | 'balanced'
    forecast: Array<{
        hour: number
        demand: number
        supply: number
    }>
}

/**
 * System Alert
 */
export interface SystemAlert {
    id: string
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    timestamp: string
    zone?: string
}

/**
 * Dashboard Update Event
 */
export interface DashboardUpdate {
    type: string
    timestamp: string
    marketPrices?: {
        prices: MarketPrice[]
        averagePrice: number
        totalVolume: number
    }
    renewableMix?: {
        sources: RenewableSource[]
        totalGeneration: number
        renewablePercentage: number
    }
    demandSupply?: DemandSupplyData
    alerts?: SystemAlert[]
}

/**
 * SSE Hook Options
 */
interface UseRealtimeStreamOptions {
    autoConnect?: boolean
    onMarketPrices?: (data: DashboardUpdate['marketPrices']) => void
    onRenewableMix?: (data: DashboardUpdate['renewableMix']) => void
    onDemandSupply?: (data: DashboardUpdate['demandSupply']) => void
    onAlert?: (alert: SystemAlert) => void
    onDashboardUpdate?: (data: DashboardUpdate) => void
}

/**
 * SSE Hook Return Type
 */
interface UseRealtimeStreamReturn {
    connectionStatus: SSEConnectionStatus
    isConnected: boolean
    lastUpdate: Date | null
    marketPrices: MarketPrice[]
    averagePrice: number
    renewableMix: RenewableSource[]
    demandSupply: DemandSupplyData | null
    alerts: SystemAlert[]
    connect: () => void
    disconnect: () => void
    error: Error | null
}

/**
 * Custom hook for connecting to the SSE real-time stream
 * 
 * @example
 * ```tsx
 * const { 
 *   isConnected, 
 *   marketPrices, 
 *   renewableMix,
 *   demandSupply 
 * } = useRealtimeStream({ autoConnect: true })
 * ```
 */
export function useRealtimeStream(options: UseRealtimeStreamOptions = {}): UseRealtimeStreamReturn {
    const {
        autoConnect = true,
        onMarketPrices,
        onRenewableMix,
        onDemandSupply,
        onAlert,
        onDashboardUpdate
    } = options

    const [connectionStatus, setConnectionStatus] = useState<SSEConnectionStatus>('disconnected')
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([])
    const [averagePrice, setAveragePrice] = useState(0)
    const [renewableMix, setRenewableMix] = useState<RenewableSource[]>([])
    const [demandSupply, setDemandSupply] = useState<DemandSupplyData | null>(null)
    const [alerts, setAlerts] = useState<SystemAlert[]>([])
    const [error, setError] = useState<Error | null>(null)

    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5
    const baseReconnectDelay = 1000

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }
        setConnectionStatus('disconnected')
    }, [])

    const connect = useCallback(() => {
        // Don't create multiple connections
        if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            return
        }

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        setConnectionStatus('connecting')
        setError(null)

        try {
            const eventSource = new EventSource('/api/realtime/stream')
            eventSourceRef.current = eventSource

            eventSource.onopen = () => {
                console.log('SSE: Connected to real-time stream')
                setConnectionStatus('connected')
                setError(null)
                reconnectAttempts.current = 0
            }

            // Handle specific event types
            eventSource.addEventListener('connected', (event) => {
                console.log('SSE: Received connection confirmation')
                setConnectionStatus('connected')
            })

            eventSource.addEventListener('market_prices', (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setMarketPrices(data.prices || [])
                    setAveragePrice(data.averagePrice || 0)
                    setLastUpdate(new Date())
                    onMarketPrices?.(data)
                } catch (e) {
                    console.error('SSE: Error parsing market_prices:', e)
                }
            })

            eventSource.addEventListener('renewable_mix', (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setRenewableMix(data.sources || [])
                    setLastUpdate(new Date())
                    onRenewableMix?.(data)
                } catch (e) {
                    console.error('SSE: Error parsing renewable_mix:', e)
                }
            })

            eventSource.addEventListener('demand_supply', (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setDemandSupply(data)
                    setLastUpdate(new Date())
                    onDemandSupply?.(data)
                } catch (e) {
                    console.error('SSE: Error parsing demand_supply:', e)
                }
            })

            eventSource.addEventListener('dashboard_update', (event) => {
                try {
                    const data: DashboardUpdate = JSON.parse(event.data)

                    if (data.marketPrices) {
                        setMarketPrices(data.marketPrices.prices || [])
                        setAveragePrice(data.marketPrices.averagePrice || 0)
                    }
                    if (data.renewableMix) {
                        setRenewableMix(data.renewableMix.sources || [])
                    }
                    if (data.demandSupply) {
                        setDemandSupply(data.demandSupply)
                    }
                    if (data.alerts) {
                        data.alerts.forEach(alert => {
                            setAlerts(prev => [alert, ...prev].slice(0, 50)) // Keep last 50 alerts
                            onAlert?.(alert)
                        })
                    }

                    setLastUpdate(new Date())
                    onDashboardUpdate?.(data)
                } catch (e) {
                    console.error('SSE: Error parsing dashboard_update:', e)
                }
            })

            eventSource.addEventListener('heartbeat', () => {
                // Connection is alive, no action needed
            })

            eventSource.onerror = (event) => {
                console.error('SSE: Connection error', event)
                setConnectionStatus('error')
                setError(new Error('Connection to real-time stream failed'))

                eventSource.close()
                eventSourceRef.current = null

                // Attempt to reconnect with exponential backoff
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current)
                    console.log(`SSE: Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttempts.current++
                        connect()
                    }, delay)
                } else {
                    console.error('SSE: Max reconnection attempts reached')
                    setConnectionStatus('error')
                }
            }
        } catch (e) {
            console.error('SSE: Failed to create EventSource:', e)
            setError(e as Error)
            setConnectionStatus('error')
        }
    }, [onMarketPrices, onRenewableMix, onDemandSupply, onAlert, onDashboardUpdate])

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect()
        }

        return () => {
            disconnect()
        }
    }, []) // Empty deps - only run on mount/unmount

    return {
        connectionStatus,
        isConnected: connectionStatus === 'connected',
        lastUpdate,
        marketPrices,
        averagePrice,
        renewableMix,
        demandSupply,
        alerts,
        connect,
        disconnect,
        error
    }
}

/**
 * Helper hook for just market prices
 */
export function useMarketPrices() {
    const { marketPrices, averagePrice, isConnected, lastUpdate } = useRealtimeStream()
    return { marketPrices, averagePrice, isConnected, lastUpdate }
}

/**
 * Helper hook for renewable energy mix
 */
export function useRenewableMix() {
    const { renewableMix, isConnected, lastUpdate } = useRealtimeStream()
    return { renewableMix, isConnected, lastUpdate }
}

/**
 * Helper hook for demand/supply balance
 */
export function useDemandSupply() {
    const { demandSupply, isConnected, lastUpdate } = useRealtimeStream()
    return { demandSupply, isConnected, lastUpdate }
}
