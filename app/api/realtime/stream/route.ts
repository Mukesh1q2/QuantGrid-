import { NextRequest } from 'next/server'
import {
    generateDashboardUpdate,
    generateMarketPrices,
    generateRenewableMix,
    generateDemandSupply
} from '@/lib/services/realtime-data-service'

/**
 * Server-Sent Events (SSE) Endpoint for Real-Time Dashboard Updates
 * 
 * This endpoint streams real-time market data to connected clients.
 * Uses SSE instead of WebSocket because Next.js App Router doesn't support WebSocket.
 * 
 * Features:
 * - Market price updates every 5 seconds
 * - Renewable energy mix updates every 10 seconds
 * - Demand/supply balance updates every 15 seconds
 * - Full dashboard updates every 30 seconds
 * - Heartbeat every 30 seconds to keep connection alive
 * 
 * @example
 * // Client-side usage:
 * const eventSource = new EventSource('/api/realtime/stream');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('Received:', data);
 * };
 */

export const runtime = 'nodejs' // Use Node.js runtime for long-running connections
export const dynamic = 'force-dynamic' // Disable caching

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder()

    // Create a readable stream for SSE
    const stream = new ReadableStream({
        start(controller) {
            let isActive = true
            const intervals: NodeJS.Timeout[] = []

            // Helper to send SSE messages
            const sendEvent = (eventType: string, data: any) => {
                if (!isActive) return
                try {
                    const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
                    controller.enqueue(encoder.encode(message))
                } catch (error) {
                    console.error('Error sending SSE message:', error)
                }
            }

            // Send initial connection message
            sendEvent('connected', {
                message: 'Connected to OptiBid Energy real-time stream',
                timestamp: new Date().toISOString(),
                features: ['market_prices', 'renewable_mix', 'demand_supply', 'alerts']
            })

            // Send initial data immediately
            setTimeout(() => {
                sendEvent('dashboard_update', generateDashboardUpdate())
            }, 100)

            // Market prices - every 5 seconds
            intervals.push(setInterval(() => {
                sendEvent('market_prices', {
                    type: 'market_prices',
                    ...generateMarketPrices()
                })
            }, 5000))

            // Renewable mix - every 10 seconds
            intervals.push(setInterval(() => {
                sendEvent('renewable_mix', {
                    type: 'renewable_mix',
                    ...generateRenewableMix()
                })
            }, 10000))

            // Demand/Supply - every 15 seconds
            intervals.push(setInterval(() => {
                sendEvent('demand_supply', {
                    type: 'demand_supply',
                    ...generateDemandSupply()
                })
            }, 15000))

            // Full dashboard update - every 30 seconds
            intervals.push(setInterval(() => {
                sendEvent('dashboard_update', generateDashboardUpdate())
            }, 30000))

            // Heartbeat - every 30 seconds
            intervals.push(setInterval(() => {
                sendEvent('heartbeat', {
                    timestamp: new Date().toISOString(),
                    status: 'alive'
                })
            }, 30000))

            // Cleanup on close
            request.signal.addEventListener('abort', () => {
                isActive = false
                intervals.forEach(interval => clearInterval(interval))
                try {
                    controller.close()
                } catch (e) {
                    // Already closed
                }
            })
        }
    })

    // Return SSE response with proper headers
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    })
}
