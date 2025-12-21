'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// ========================
// Types
// ========================
export interface PortfolioMetrics {
    totalValue: number
    totalPnL: number
    totalPnLPercent: number
    todayPnL: number
    todayPnLPercent: number
    sharpeRatio: number
    sortinoRatio: number
    maxDrawdown: number
    winRate: number
    avgTradeSize: number
    totalTrades: number
    profitFactor: number
}

export interface TradeExecution {
    id: string
    timestamp: Date
    market: string
    side: 'buy' | 'sell'
    quantity: number
    price: number
    executedPrice: number
    slippage: number
    latency: number
    status: 'filled' | 'partial' | 'cancelled'
}

export interface PnLAttribution {
    factor: string
    contribution: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
}

export interface CorrelationData {
    asset1: string
    asset2: string
    correlation: number
    period: string
}

export interface PerformancePoint {
    date: string
    portfolioValue: number
    benchmark: number
    pnl: number
}

export interface VolumeBreakdown {
    market: string
    volume: number
    percentage: number
    trend: number
    avgPrice: number
}

export interface ReportConfig {
    id: string
    name: string
    type: 'daily' | 'weekly' | 'monthly' | 'custom'
    sections: string[]
    format: 'pdf' | 'excel' | 'csv'
    schedule?: string
    recipients?: string[]
    lastGenerated?: Date
}

export interface GeneratedReport {
    id: string
    name: string
    format: 'pdf' | 'excel' | 'csv'
    size: string
    generatedAt: Date
    downloadUrl: string
}

// ========================
// Analytics Service
// ========================
class AnalyticsService {
    // Get portfolio performance metrics
    async getPortfolioMetrics(): Promise<PortfolioMetrics> {
        await new Promise(r => setTimeout(r, 400))

        return {
            totalValue: 24567890,
            totalPnL: 1234567,
            totalPnLPercent: 5.28,
            todayPnL: 45678,
            todayPnLPercent: 0.19,
            sharpeRatio: 1.85,
            sortinoRatio: 2.12,
            maxDrawdown: -3.45,
            winRate: 68.5,
            avgTradeSize: 2500,
            totalTrades: 1247,
            profitFactor: 1.92
        }
    }

    // Get trade execution metrics
    async getTradeExecutions(limit: number = 20): Promise<TradeExecution[]> {
        await new Promise(r => setTimeout(r, 300))

        const markets = ['DAM', 'RTM', 'TAM']
        const executions: TradeExecution[] = []

        for (let i = 0; i < limit; i++) {
            const price = 5.2 + Math.random() * 0.5
            const slippage = (Math.random() - 0.5) * 0.02

            executions.push({
                id: `exec-${Date.now()}-${i}`,
                timestamp: new Date(Date.now() - i * 60000 * Math.random() * 60),
                market: markets[Math.floor(Math.random() * markets.length)],
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                quantity: Math.floor(100 + Math.random() * 900),
                price,
                executedPrice: price + slippage,
                slippage: parseFloat((slippage * 100).toFixed(3)),
                latency: Math.floor(10 + Math.random() * 90),
                status: Math.random() > 0.1 ? 'filled' : 'partial'
            })
        }

        return executions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    // Get P&L attribution
    async getPnLAttribution(): Promise<PnLAttribution[]> {
        await new Promise(r => setTimeout(r, 300))

        return [
            { factor: 'Market Direction', contribution: 456789, percentage: 37.2, trend: 'up' },
            { factor: 'Regional Spreads', contribution: 312456, percentage: 25.4, trend: 'up' },
            { factor: 'Time-of-Day', contribution: 234567, percentage: 19.1, trend: 'stable' },
            { factor: 'Weather Impact', contribution: 123456, percentage: 10.0, trend: 'down' },
            { factor: 'Volume Delta', contribution: 102345, percentage: 8.3, trend: 'up' }
        ]
    }

    // Get correlation matrix data
    async getCorrelationMatrix(): Promise<CorrelationData[]> {
        await new Promise(r => setTimeout(r, 400))

        const assets = ['DAM-N', 'DAM-S', 'DAM-W', 'DAM-E', 'RTM-N', 'RTM-S']
        const correlations: CorrelationData[] = []

        for (let i = 0; i < assets.length; i++) {
            for (let j = i + 1; j < assets.length; j++) {
                // Similar regions have higher correlation
                const sameMarket = assets[i].split('-')[0] === assets[j].split('-')[0]
                const baseCorr = sameMarket ? 0.7 : 0.3

                correlations.push({
                    asset1: assets[i],
                    asset2: assets[j],
                    correlation: parseFloat((baseCorr + Math.random() * 0.25).toFixed(2)),
                    period: '30d'
                })
            }
        }

        return correlations
    }

    // Get performance chart data
    async getPerformanceData(days: number = 30): Promise<PerformancePoint[]> {
        await new Promise(r => setTimeout(r, 300))

        const data: PerformancePoint[] = []
        let portfolioValue = 24000000
        let benchmarkValue = 24000000

        for (let i = days; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const dailyReturn = (Math.random() - 0.45) * 0.02 // Slight positive bias
            const benchmarkReturn = (Math.random() - 0.5) * 0.015

            portfolioValue *= (1 + dailyReturn)
            benchmarkValue *= (1 + benchmarkReturn)

            data.push({
                date: date.toISOString().split('T')[0],
                portfolioValue: Math.round(portfolioValue),
                benchmark: Math.round(benchmarkValue),
                pnl: Math.round(portfolioValue - 24000000)
            })
        }

        return data
    }

    // Get volume breakdown
    async getVolumeBreakdown(): Promise<VolumeBreakdown[]> {
        await new Promise(r => setTimeout(r, 250))

        return [
            { market: 'DAM Northern', volume: 45678000, percentage: 28.5, trend: 5.2, avgPrice: 5.42 },
            { market: 'DAM Southern', volume: 38234000, percentage: 23.8, trend: -2.1, avgPrice: 5.28 },
            { market: 'DAM Western', volume: 32456000, percentage: 20.2, trend: 8.4, avgPrice: 5.35 },
            { market: 'RTM Northern', volume: 23456000, percentage: 14.6, trend: 12.3, avgPrice: 5.48 },
            { market: 'RTM Southern', volume: 20678000, percentage: 12.9, trend: -0.5, avgPrice: 5.22 }
        ]
    }

    // Generate report
    async generateReport(config: Partial<ReportConfig>): Promise<GeneratedReport> {
        await new Promise(r => setTimeout(r, 1500)) // Simulate generation time

        const format = config.format || 'pdf'
        const sizes = { pdf: '2.4 MB', excel: '1.8 MB', csv: '456 KB' }

        return {
            id: `report-${Date.now()}`,
            name: config.name || `Trading Report - ${new Date().toLocaleDateString()}`,
            format,
            size: sizes[format],
            generatedAt: new Date(),
            downloadUrl: `https://optibid.energy/reports/download/${Date.now()}.${format}`
        }
    }

    // Export data
    async exportData(type: string, format: 'csv' | 'excel' | 'json'): Promise<string> {
        await new Promise(r => setTimeout(r, 800))

        // In real app, would generate actual file
        return `https://optibid.energy/exports/${type}_${Date.now()}.${format}`
    }
}

// Singleton
export const analyticsService = new AnalyticsService()

// ========================
// React Context
// ========================
interface AnalyticsContextValue {
    metrics: PortfolioMetrics | null
    executions: TradeExecution[]
    attribution: PnLAttribution[]
    correlations: CorrelationData[]
    performance: PerformancePoint[]
    volumeBreakdown: VolumeBreakdown[]
    isLoading: boolean

    loadMetrics: () => Promise<void>
    loadExecutions: () => Promise<void>
    loadAttribution: () => Promise<void>
    loadCorrelations: () => Promise<void>
    loadPerformance: (days?: number) => Promise<void>
    loadVolumeBreakdown: () => Promise<void>
    generateReport: (config: Partial<ReportConfig>) => Promise<GeneratedReport>
    exportData: (type: string, format: 'csv' | 'excel' | 'json') => Promise<string>
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
    const [executions, setExecutions] = useState<TradeExecution[]>([])
    const [attribution, setAttribution] = useState<PnLAttribution[]>([])
    const [correlations, setCorrelations] = useState<CorrelationData[]>([])
    const [performance, setPerformance] = useState<PerformancePoint[]>([])
    const [volumeBreakdown, setVolumeBreakdown] = useState<VolumeBreakdown[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const loadMetrics = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await analyticsService.getPortfolioMetrics()
            setMetrics(data)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadExecutions = useCallback(async () => {
        const data = await analyticsService.getTradeExecutions()
        setExecutions(data)
    }, [])

    const loadAttribution = useCallback(async () => {
        const data = await analyticsService.getPnLAttribution()
        setAttribution(data)
    }, [])

    const loadCorrelations = useCallback(async () => {
        const data = await analyticsService.getCorrelationMatrix()
        setCorrelations(data)
    }, [])

    const loadPerformance = useCallback(async (days: number = 30) => {
        const data = await analyticsService.getPerformanceData(days)
        setPerformance(data)
    }, [])

    const loadVolumeBreakdown = useCallback(async () => {
        const data = await analyticsService.getVolumeBreakdown()
        setVolumeBreakdown(data)
    }, [])

    const generateReportFn = useCallback(async (config: Partial<ReportConfig>) => {
        return analyticsService.generateReport(config)
    }, [])

    const exportDataFn = useCallback(async (type: string, format: 'csv' | 'excel' | 'json') => {
        return analyticsService.exportData(type, format)
    }, [])

    return (
        <AnalyticsContext.Provider value={{
            metrics,
            executions,
            attribution,
            correlations,
            performance,
            volumeBreakdown,
            isLoading,
            loadMetrics,
            loadExecutions,
            loadAttribution,
            loadCorrelations,
            loadPerformance,
            loadVolumeBreakdown,
            generateReport: generateReportFn,
            exportData: exportDataFn
        }}>
            {children}
        </AnalyticsContext.Provider>
    )
}

export function useAnalytics() {
    const context = useContext(AnalyticsContext)
    if (!context) {
        throw new Error('useAnalytics must be used within AnalyticsProvider')
    }
    return context
}

export function usePortfolioMetrics() {
    const { metrics, loadMetrics, isLoading } = useAnalytics()
    return { metrics, refresh: loadMetrics, isLoading }
}

export function usePerformanceChart(days: number = 30) {
    const { performance, loadPerformance } = useAnalytics()
    return { data: performance, refresh: () => loadPerformance(days) }
}
