'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

// Create query client with optimized defaults for energy trading dashboard
function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Stale time: how long data is considered fresh
                staleTime: 30 * 1000, // 30 seconds for market data

                // Cache time: how long to keep data in cache
                gcTime: 5 * 60 * 1000, // 5 minutes

                // Retry failed requests
                retry: 2,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

                // Refetch settings
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                refetchOnMount: true,
            },
            mutations: {
                retry: 1,
            },
        },
    })
}

// Query keys for caching
export const queryKeys = {
    // Market data
    marketData: ['market-data'] as const,
    marketPrices: (market: string) => ['market-prices', market] as const,
    demandSupply: ['demand-supply'] as const,
    renewables: ['renewables'] as const,

    // IEX data
    iexMarkets: ['iex-markets'] as const,
    iexPrices: (market: string, region?: string) => ['iex-prices', market, region] as const,

    // Portfolio
    portfolio: ['portfolio'] as const,
    portfolioMetrics: ['portfolio-metrics'] as const,
    positions: ['positions'] as const,

    // AI
    aiPredictions: (market: string, timeframe: string) => ['ai-predictions', market, timeframe] as const,
    aiAnomalies: ['ai-anomalies'] as const,

    // Analytics
    analytics: ['analytics'] as const,
    correlations: ['correlations'] as const,
    volumeBreakdown: ['volume-breakdown'] as const,

    // User/Dashboard
    dashboardState: (userId?: string) => ['dashboard-state', userId] as const,
    userPreferences: ['user-preferences'] as const,
}

// Provider component
export function QueryProvider({ children }: { children: ReactNode }) {
    // Create client once per component instance
    const [queryClient] = useState(() => createQueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

// Export query client for direct access (optional)
export { QueryClient }
