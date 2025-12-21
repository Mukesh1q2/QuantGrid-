'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'

// ========================
// Types
// ========================
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface PriceData {
    market: string
    region: string
    price: number
    change: number
    changePercent: number
    volume: number
    timestamp: Date
}

export interface VolumeData {
    market: string
    volume: number
    trades: number
    timestamp: Date
}

export interface AlertData {
    id: string
    type: 'price_spike' | 'price_drop' | 'volume_spike' | 'grid_event'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    market: string
    value: number
    timestamp: Date
}

export interface TradeData {
    id: string
    market: string
    price: number
    quantity: number
    side: 'buy' | 'sell'
    timestamp: Date
}

// Channel types
export type ChannelType = 'prices.dam' | 'prices.rtm' | 'volume.live' | 'alerts.critical' | 'trades.live'

export interface ChannelMessage<T = any> {
    channel: ChannelType
    data: T
    timestamp: Date
}

// ========================
// WebSocket Service Class
// ========================
class WebSocketService {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private listeners: Map<string, Set<(data: any) => void>> = new Map()
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set()
    private isSimulated = true // Using simulated data since no real WS server
    private simulationIntervals: NodeJS.Timeout[] = []
    private _status: ConnectionStatus = 'disconnected'

    get status(): ConnectionStatus {
        return this._status
    }

    private setStatus(status: ConnectionStatus) {
        this._status = status
        this.statusListeners.forEach(listener => listener(status))
    }

    connect(url?: string) {
        if (this.isSimulated) {
            this.startSimulation()
            return
        }

        // Real WebSocket connection (for production)
        this.setStatus('connecting')

        try {
            this.ws = new WebSocket(url || 'wss://api.optibid.energy/ws')

            this.ws.onopen = () => {
                this.setStatus('connected')
                this.reconnectAttempts = 0
                console.log('[WebSocket] Connected')
            }

            this.ws.onmessage = (event) => {
                try {
                    const message: ChannelMessage = JSON.parse(event.data)
                    this.notifyListeners(message.channel, message.data)
                } catch (e) {
                    console.error('[WebSocket] Failed to parse message:', e)
                }
            }

            this.ws.onclose = () => {
                this.setStatus('disconnected')
                this.attemptReconnect(url)
            }

            this.ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error)
                this.setStatus('error')
            }
        } catch (error) {
            console.error('[WebSocket] Connection failed:', error)
            this.setStatus('error')
        }
    }

    private attemptReconnect(url?: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
            console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
            setTimeout(() => this.connect(url), delay)
        } else {
            console.error('[WebSocket] Max reconnection attempts reached')
            this.setStatus('error')
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
        this.stopSimulation()
        this.setStatus('disconnected')
    }

    subscribe(channel: ChannelType, callback: (data: any) => void) {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set())
        }
        this.listeners.get(channel)!.add(callback)

        // Return unsubscribe function
        return () => {
            this.listeners.get(channel)?.delete(callback)
        }
    }

    onStatusChange(callback: (status: ConnectionStatus) => void) {
        this.statusListeners.add(callback)
        return () => this.statusListeners.delete(callback)
    }

    private notifyListeners(channel: ChannelType, data: any) {
        this.listeners.get(channel)?.forEach(callback => callback(data))
    }

    // ========================
    // Simulation Mode
    // ========================
    private startSimulation() {
        this.setStatus('connecting')

        // Simulate connection delay
        setTimeout(() => {
            this.setStatus('connected')
            console.log('[WebSocket] Simulated connection established')

            // Start data generators
            this.simulatePrices()
            this.simulateVolume()
            this.simulateTrades()
            this.simulateAlerts()
        }, 800)
    }

    private stopSimulation() {
        this.simulationIntervals.forEach(interval => clearInterval(interval))
        this.simulationIntervals = []
    }

    private simulatePrices() {
        const markets = [
            { market: 'DAM', basePrice: 5.42 },
            { market: 'RTM', basePrice: 5.38 },
            { market: 'TAM', basePrice: 5.45 }
        ]
        const regions = ['Northern', 'Southern', 'Western', 'Eastern', 'NE']

        // Update prices every 2 seconds
        const interval = setInterval(() => {
            markets.forEach(({ market, basePrice }) => {
                regions.forEach(region => {
                    const change = (Math.random() - 0.5) * 0.2
                    const price = basePrice + change + (Math.random() * 0.3 - 0.15)

                    const data: PriceData = {
                        market,
                        region,
                        price: parseFloat(price.toFixed(2)),
                        change: parseFloat(change.toFixed(3)),
                        changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
                        volume: Math.floor(1000 + Math.random() * 5000),
                        timestamp: new Date()
                    }

                    this.notifyListeners(market === 'RTM' ? 'prices.rtm' : 'prices.dam', data)
                })
            })
        }, 2000)

        this.simulationIntervals.push(interval)
    }

    private simulateVolume() {
        const interval = setInterval(() => {
            const markets = ['DAM', 'RTM', 'TAM']
            markets.forEach(market => {
                const data: VolumeData = {
                    market,
                    volume: Math.floor(10000 + Math.random() * 50000),
                    trades: Math.floor(100 + Math.random() * 500),
                    timestamp: new Date()
                }
                this.notifyListeners('volume.live', data)
            })
        }, 3000)

        this.simulationIntervals.push(interval)
    }

    private simulateTrades() {
        const markets = ['DAM', 'RTM', 'TAM']

        const interval = setInterval(() => {
            const market = markets[Math.floor(Math.random() * markets.length)]
            const data: TradeData = {
                id: Date.now().toString(),
                market,
                price: parseFloat((5.2 + Math.random() * 0.5).toFixed(2)),
                quantity: Math.floor(100 + Math.random() * 900),
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                timestamp: new Date()
            }
            this.notifyListeners('trades.live', data)
        }, 1500)

        this.simulationIntervals.push(interval)
    }

    private simulateAlerts() {
        const alertTypes: AlertData['type'][] = ['price_spike', 'price_drop', 'volume_spike', 'grid_event']
        const severities: AlertData['severity'][] = ['low', 'medium', 'high', 'critical']
        const markets = ['DAM', 'RTM', 'TAM']

        const interval = setInterval(() => {
            // Only generate alerts occasionally (20% chance)
            if (Math.random() > 0.2) return

            const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
            const severity = severities[Math.floor(Math.random() * severities.length)]
            const market = markets[Math.floor(Math.random() * markets.length)]

            const messages: Record<AlertData['type'], string> = {
                price_spike: `Price spike detected in ${market}: +${(Math.random() * 15 + 5).toFixed(1)}%`,
                price_drop: `Price drop detected in ${market}: -${(Math.random() * 10 + 3).toFixed(1)}%`,
                volume_spike: `Unusual volume in ${market}: ${Math.floor(Math.random() * 50 + 20)}% above average`,
                grid_event: `Grid frequency deviation detected: ${(49.5 + Math.random() * 1).toFixed(2)} Hz`
            }

            const data: AlertData = {
                id: Date.now().toString(),
                type,
                severity,
                message: messages[type],
                market,
                value: parseFloat((Math.random() * 10).toFixed(2)),
                timestamp: new Date()
            }

            this.notifyListeners('alerts.critical', data)
        }, 10000) // Check every 10 seconds

        this.simulationIntervals.push(interval)
    }
}

// Singleton instance
export const wsService = new WebSocketService()

// ========================
// React Context
// ========================
interface RealtimeContextValue {
    status: ConnectionStatus
    latency: number
    lastUpdate: Date | null
    priceData: Map<string, PriceData>
    volumeData: Map<string, VolumeData>
    trades: TradeData[]
    alerts: AlertData[]
    subscribe: <T>(channel: ChannelType, callback: (data: T) => void) => () => void
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected')
    const [latency, setLatency] = useState(0)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [priceData, setPriceData] = useState<Map<string, PriceData>>(new Map())
    const [volumeData, setVolumeData] = useState<Map<string, VolumeData>>(new Map())
    const [trades, setTrades] = useState<TradeData[]>([])
    const [alerts, setAlerts] = useState<AlertData[]>([])

    useEffect(() => {
        // Connect on mount
        wsService.connect()

        // Listen for status changes
        const unsubscribeStatus = wsService.onStatusChange(setStatus)

        // Subscribe to channels
        const unsubDam = wsService.subscribe('prices.dam', (data: PriceData) => {
            const key = `${data.market}-${data.region}`
            setPriceData(prev => new Map(prev).set(key, data))
            setLastUpdate(new Date())
            setLatency(Math.floor(Math.random() * 50) + 10) // Simulated latency
        })

        const unsubRtm = wsService.subscribe('prices.rtm', (data: PriceData) => {
            const key = `${data.market}-${data.region}`
            setPriceData(prev => new Map(prev).set(key, data))
            setLastUpdate(new Date())
        })

        const unsubVolume = wsService.subscribe('volume.live', (data: VolumeData) => {
            setVolumeData(prev => new Map(prev).set(data.market, data))
        })

        const unsubTrades = wsService.subscribe('trades.live', (data: TradeData) => {
            setTrades(prev => [data, ...prev.slice(0, 49)]) // Keep last 50 trades
        })

        const unsubAlerts = wsService.subscribe('alerts.critical', (data: AlertData) => {
            setAlerts(prev => [data, ...prev.slice(0, 19)]) // Keep last 20 alerts
        })

        return () => {
            unsubscribeStatus()
            unsubDam()
            unsubRtm()
            unsubVolume()
            unsubTrades()
            unsubAlerts()
            wsService.disconnect()
        }
    }, [])

    const subscribe = useCallback(<T,>(channel: ChannelType, callback: (data: T) => void) => {
        return wsService.subscribe(channel, callback)
    }, [])

    return (
        <RealtimeContext.Provider value={{
            status,
            latency,
            lastUpdate,
            priceData,
            volumeData,
            trades,
            alerts,
            subscribe
        }}>
            {children}
        </RealtimeContext.Provider>
    )
}

// ========================
// Custom Hooks
// ========================
export function useRealtime() {
    const context = useContext(RealtimeContext)
    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider')
    }
    return context
}

export function usePriceStream(market: string, region?: string) {
    const { priceData, status } = useRealtime()

    const prices = Array.from(priceData.values()).filter(p =>
        p.market === market && (!region || p.region === region)
    )

    return { prices, status }
}

export function useTradeStream() {
    const { trades, status } = useRealtime()
    return { trades, status }
}

export function useAlerts() {
    const { alerts, status } = useRealtime()
    return { alerts, status }
}

export function useConnectionStatus() {
    const { status, latency, lastUpdate } = useRealtime()
    return { status, latency, lastUpdate }
}
