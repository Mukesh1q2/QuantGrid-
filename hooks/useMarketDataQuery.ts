'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/QueryProvider'

// ========================
// Types
// ========================
interface MarketData {
    market: string
    price: number
    change: number
    changePercent: number
    volume: number
    timestamp: string
}

interface DemandSupply {
    totalDemand: number
    totalSupply: number
    surplus: number
    frequency: number
}

interface PortfolioMetrics {
    totalValue: number
    totalPnL: number
    totalPnLPercent: number
    sharpeRatio: number
    winRate: number
}

// ========================
// Market Data Hooks
// ========================

// Fetch IEX market data with caching
export function useMarketDataQuery(market?: string) {
    return useQuery({
        queryKey: market ? queryKeys.marketPrices(market) : queryKeys.marketData,
        queryFn: async () => {
            const response = await fetch('/api/quantum/applications/india-energy-market')
            if (!response.ok) throw new Error('Failed to fetch market data')
            const data = await response.json()
            return data.data?.marketOverview || data.data
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Auto-refetch every minute
    })
}

// Fetch demand/supply data
export function useDemandSupplyQuery() {
    return useQuery({
        queryKey: queryKeys.demandSupply,
        queryFn: async () => {
            const response = await fetch('/api/quantum/applications/india-energy-market')
            if (!response.ok) throw new Error('Failed to fetch demand/supply')
            const data = await response.json()

            // Extract demand/supply from IEX data
            return {
                totalDemand: data.data?.marketOverview?.currentDemand || 186450,
                totalSupply: data.data?.marketOverview?.currentSupply || 191280,
                surplus: data.data?.marketOverview?.surplus || 4830,
                frequency: data.data?.marketOverview?.gridFrequency || 50.02
            } as DemandSupply
        },
        staleTime: 60 * 1000, // 1 minute
    })
}

// Fetch renewable energy mix
export function useRenewablesQuery() {
    return useQuery({
        queryKey: queryKeys.renewables,
        queryFn: async () => {
            const response = await fetch('/api/quantum/applications/india-energy-market')
            if (!response.ok) throw new Error('Failed to fetch renewables')
            const data = await response.json()
            return data.data?.renewablesData || {
                solar: 42500,
                wind: 18200,
                hydro: 24100,
                thermal: 95000,
                nuclear: 6800
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// ========================
// Portfolio Hooks
// ========================

export function usePortfolioQuery() {
    return useQuery({
        queryKey: queryKeys.portfolioMetrics,
        queryFn: async () => {
            // Simulated - connect to real API when available
            return {
                totalValue: 24600000,
                totalPnL: 432000,
                totalPnLPercent: 1.79,
                sharpeRatio: 1.85,
                winRate: 68.5,
                maxDrawdown: -8.4,
                todayPnL: 54000,
                todayPnLPercent: 0.22
            } as PortfolioMetrics & { maxDrawdown: number; todayPnL: number; todayPnLPercent: number }
        },
        staleTime: 30 * 1000,
    })
}

// ========================
// AI Predictions Hooks
// ========================

export function usePredictionsQuery(market: string = 'DAM', timeframe: string = '24h') {
    return useQuery({
        queryKey: queryKeys.aiPredictions(market, timeframe),
        queryFn: async () => {
            const response = await fetch(`/api/ai/predictions?market=${market}&timeframe=${timeframe}`)
            if (!response.ok) throw new Error('Failed to fetch predictions')
            return response.json()
        },
        staleTime: 5 * 60 * 1000, // 5 minutes for AI predictions
    })
}

export function useAnomaliesQuery() {
    return useQuery({
        queryKey: queryKeys.aiAnomalies,
        queryFn: async () => {
            const response = await fetch('/api/ai/anomaly-detection')
            if (!response.ok) throw new Error('Failed to fetch anomalies')
            return response.json()
        },
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 2 * 60 * 1000, // Check for new anomalies every 2 minutes
    })
}

// ========================
// Dashboard State Hooks
// ========================

export function useDashboardStateQuery(userId?: string) {
    return useQuery({
        queryKey: queryKeys.dashboardState(userId),
        queryFn: async () => {
            // First try localStorage
            const saved = localStorage.getItem('dashboard-state')
            if (saved) {
                return JSON.parse(saved)
            }

            // Then try API
            try {
                const response = await fetch('/api/dashboard/user-config')
                if (response.ok) {
                    return response.json()
                }
            } catch {
                // Ignore API errors, return null
            }

            return null
        },
        staleTime: Infinity, // Dashboard state doesn't go stale
    })
}

export function useSaveDashboardState() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (state: any) => {
            // Save to localStorage
            localStorage.setItem('dashboard-state', JSON.stringify(state))

            // Optionally sync to API
            try {
                await fetch('/api/dashboard/user-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state)
                })
            } catch {
                // Continue even if API fails
            }

            return state
        },
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(queryKeys.dashboardState(), data)
        }
    })
}

// ========================
// Prefetch Helpers
// ========================

export function usePrefetchMarketData() {
    const queryClient = useQueryClient()

    return () => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.marketData,
            queryFn: async () => {
                const response = await fetch('/api/quantum/applications/india-energy-market')
                return response.json()
            }
        })
    }
}

// ========================
// Invalidation Helpers
// ========================

export function useInvalidateMarketData() {
    const queryClient = useQueryClient()

    return () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.marketData })
        queryClient.invalidateQueries({ queryKey: queryKeys.demandSupply })
        queryClient.invalidateQueries({ queryKey: queryKeys.renewables })
    }
}
