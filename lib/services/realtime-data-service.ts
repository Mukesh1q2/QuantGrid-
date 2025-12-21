// Real-time data service - used by SSE streaming endpoint

/**
 * Real-Time Data Service
 * 
 * Generates realistic simulated market data for the OptiBid Energy Dashboard.
 * Uses Brownian motion for price fluctuations and realistic patterns for
 * energy market behavior.
 * 
 * In production, this would be replaced with actual IEX India API integration.
 */

// Market zones for IEX India
export const MARKET_ZONES = [
    { id: 'N1', name: 'Northern Region', basePrice: 4.25 },
    { id: 'N2', name: 'Delhi', basePrice: 4.45 },
    { id: 'N3', name: 'Rajasthan', basePrice: 4.15 },
    { id: 'W1', name: 'Western Region', basePrice: 4.35 },
    { id: 'W2', name: 'Maharashtra', basePrice: 4.55 },
    { id: 'W3', name: 'Gujarat', basePrice: 4.30 },
    { id: 'S1', name: 'Southern Region', basePrice: 4.10 },
    { id: 'S2', name: 'Karnataka', basePrice: 4.20 },
    { id: 'S3', name: 'Tamil Nadu', basePrice: 4.05 },
    { id: 'E1', name: 'Eastern Region', basePrice: 3.95 },
    { id: 'E2', name: 'West Bengal', basePrice: 4.00 },
    { id: 'NE1', name: 'North-Eastern Region', basePrice: 3.85 }
]

// Energy sources
export const ENERGY_SOURCES = [
    { id: 'solar', name: 'Solar', color: '#fbbf24', baseGeneration: 45 },
    { id: 'wind', name: 'Wind', color: '#60a5fa', baseGeneration: 25 },
    { id: 'hydro', name: 'Hydro', color: '#34d399', baseGeneration: 15 },
    { id: 'thermal', name: 'Thermal', color: '#f87171', baseGeneration: 10 },
    { id: 'nuclear', name: 'Nuclear', color: '#a78bfa', baseGeneration: 5 }
]

// State to track price history for each zone
const priceHistory: Map<string, number[]> = new Map()

/**
 * Generates a price change using geometric Brownian motion
 * This creates realistic market-like price movements
 */
function generatePriceChange(currentPrice: number, volatility: number = 0.02): number {
    const drift = 0.0001 // Small positive drift
    const randomShock = (Math.random() - 0.5) * 2 // Random between -1 and 1
    const change = drift + volatility * randomShock
    return currentPrice * (1 + change)
}

/**
 * Get time-of-day factor for demand
 * Peak hours have higher prices
 */
function getTimeOfDayFactor(): number {
    const hour = new Date().getHours()
    // Peak: 9-11 AM and 6-9 PM (IST)
    if ((hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21)) {
        return 1.15 + Math.random() * 0.1
    }
    // Off-peak: 11 PM - 6 AM
    if (hour >= 23 || hour <= 6) {
        return 0.85 + Math.random() * 0.05
    }
    // Normal hours
    return 0.95 + Math.random() * 0.1
}

/**
 * Generate market price data for all zones
 */
export function generateMarketPrices(): {
    timestamp: string
    prices: Array<{
        zoneId: string
        zoneName: string
        price: number
        change: number
        changePercent: number
        volume: number
        trend: 'up' | 'down' | 'stable'
    }>
    averagePrice: number
    totalVolume: number
} {
    const timeFactor = getTimeOfDayFactor()
    const prices = MARKET_ZONES.map(zone => {
        // Get or initialize price history
        let history = priceHistory.get(zone.id) || [zone.basePrice]
        const lastPrice = history[history.length - 1]

        // Generate new price
        const newPrice = generatePriceChange(lastPrice * timeFactor, 0.015)
        const clampedPrice = Math.max(2.50, Math.min(8.00, newPrice)) // IEX price bounds

        // Update history (keep last 100 prices)
        history.push(clampedPrice)
        if (history.length > 100) history.shift()
        priceHistory.set(zone.id, history)

        const change = clampedPrice - lastPrice
        const changePercent = (change / lastPrice) * 100

        return {
            zoneId: zone.id,
            zoneName: zone.name,
            price: Math.round(clampedPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            volume: Math.floor(5000 + Math.random() * 15000), // MW
            trend: change > 0.02 ? 'up' as const : change < -0.02 ? 'down' as const : 'stable' as const
        }
    })

    const averagePrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length
    const totalVolume = prices.reduce((sum, p) => sum + p.volume, 0)

    return {
        timestamp: new Date().toISOString(),
        prices,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalVolume
    }
}

/**
 * Generate renewable energy mix data
 */
export function generateRenewableMix(): {
    timestamp: string
    sources: Array<{
        id: string
        name: string
        color: string
        generation: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
    }>
    totalGeneration: number
    renewablePercentage: number
} {
    const hour = new Date().getHours()

    // Solar peaks during day, wind at night
    const solarFactor = hour >= 6 && hour <= 18
        ? Math.sin((hour - 6) / 12 * Math.PI)
        : 0.05
    const windFactor = hour >= 18 || hour <= 6
        ? 0.8 + Math.random() * 0.4
        : 0.4 + Math.random() * 0.3

    const sources = ENERGY_SOURCES.map(source => {
        let factor = 1
        if (source.id === 'solar') factor = solarFactor + 0.2
        if (source.id === 'wind') factor = windFactor

        const generation = source.baseGeneration * factor * (0.8 + Math.random() * 0.4)
        const trend = Math.random() > 0.7 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'

        return {
            id: source.id,
            name: source.name,
            color: source.color,
            generation: Math.round(generation * 100) / 100,
            percentage: 0, // Will be calculated
            trend: trend as 'up' | 'down' | 'stable'
        }
    })

    const totalGeneration = sources.reduce((sum, s) => sum + s.generation, 0)
    sources.forEach(s => {
        s.percentage = Math.round((s.generation / totalGeneration) * 100)
    })

    const renewableGen = sources
        .filter(s => ['solar', 'wind', 'hydro'].includes(s.id))
        .reduce((sum, s) => sum + s.generation, 0)

    return {
        timestamp: new Date().toISOString(),
        sources,
        totalGeneration: Math.round(totalGeneration * 100) / 100,
        renewablePercentage: Math.round((renewableGen / totalGeneration) * 100)
    }
}

/**
 * Generate demand-supply balance data
 */
export function generateDemandSupply(): {
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
} {
    const hour = new Date().getHours()

    // Base demand pattern (peaks at 10-11 AM and 7-9 PM)
    const demandPattern = [
        0.65, 0.60, 0.58, 0.55, 0.58, 0.65, // 0-5 AM
        0.75, 0.85, 0.92, 0.98, 1.00, 0.95, // 6-11 AM
        0.88, 0.85, 0.87, 0.90, 0.92, 0.95, // 12-5 PM
        0.98, 1.00, 0.95, 0.88, 0.78, 0.70  // 6-11 PM
    ]

    const baseDemand = 45000 // MW base demand
    const demand = baseDemand * demandPattern[hour] * (0.95 + Math.random() * 0.1)
    const supply = demand * (0.98 + Math.random() * 0.08)
    const balance = supply - demand

    // Generate 24-hour forecast
    const forecast = Array.from({ length: 24 }, (_, i) => {
        const forecastHour = (hour + i) % 24
        const forecastDemand = baseDemand * demandPattern[forecastHour] * (0.95 + Math.random() * 0.1)
        return {
            hour: forecastHour,
            demand: Math.round(forecastDemand),
            supply: Math.round(forecastDemand * (0.98 + Math.random() * 0.08))
        }
    })

    return {
        timestamp: new Date().toISOString(),
        demand: Math.round(demand),
        supply: Math.round(supply),
        balance: Math.round(balance),
        status: balance > 500 ? 'surplus' : balance < -500 ? 'deficit' : 'balanced',
        forecast
    }
}

/**
 * Generate system alerts
 */
export function generateSystemAlerts(): Array<{
    id: string
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    timestamp: string
    zone?: string
}> {
    const alerts = []

    // Random chance of generating alerts
    if (Math.random() > 0.7) {
        const alertTypes = [
            { type: 'info', title: 'Market Update', message: 'New bidding window opens in 15 minutes' },
            { type: 'warning', title: 'High Demand Alert', message: 'Expected peak demand in Northern Region' },
            { type: 'success', title: 'Trade Executed', message: 'Buy order for 500 MW completed successfully' },
            { type: 'info', title: 'Price Alert', message: 'MCP crossed ₹4.50/kWh threshold' }
        ]

        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
        alerts.push({
            id: `alert-${Date.now()}`,
            ...alert,
            type: alert.type as 'info' | 'warning' | 'error' | 'success',
            timestamp: new Date().toISOString(),
            zone: MARKET_ZONES[Math.floor(Math.random() * MARKET_ZONES.length)].id
        })
    }

    return alerts
}

/**
 * Generate complete dashboard update
 */
export function generateDashboardUpdate(): {
    type: 'dashboard_update'
    timestamp: string
    marketPrices: ReturnType<typeof generateMarketPrices>
    renewableMix: ReturnType<typeof generateRenewableMix>
    demandSupply: ReturnType<typeof generateDemandSupply>
    alerts: ReturnType<typeof generateSystemAlerts>
} {
    return {
        type: 'dashboard_update',
        timestamp: new Date().toISOString(),
        marketPrices: generateMarketPrices(),
        renewableMix: generateRenewableMix(),
        demandSupply: generateDemandSupply(),
        alerts: generateSystemAlerts()
    }
}
