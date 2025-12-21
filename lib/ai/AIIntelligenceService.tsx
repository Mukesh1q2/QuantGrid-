'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// ========================
// Types
// ========================
export interface PricePrediction {
    market: string
    region: string
    currentPrice: number
    predictedPrice: number
    change: number
    changePercent: number
    confidence: number
    uncertaintyLow: number
    uncertaintyHigh: number
    timeframe: '1h' | '4h' | '24h' | '7d'
    timestamp: Date
    modelVersion: string
}

export interface ExplanationFactor {
    name: string
    impact: number // -100 to +100
    direction: 'positive' | 'negative'
    description: string
    icon: string
}

export interface PredictionExplanation {
    predictionId: string
    factors: ExplanationFactor[]
    historicalAccuracy: number
    similarScenarios: number
    modelConfidence: string
    summary: string
}

export interface DemandForecast {
    time: string
    predicted: number
    actual?: number
    lowerBound: number
    upperBound: number
}

export interface AnomalyAlert {
    id: string
    type: 'price' | 'volume' | 'pattern' | 'grid'
    severity: 'low' | 'medium' | 'high' | 'critical'
    metric: string
    value: number
    expected: number
    deviation: number
    timestamp: Date
    description: string
}

export interface CopilotMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    context?: {
        markets?: string[]
        predictions?: PricePrediction[]
        charts?: string[]
        source?: string
        model?: string
    }
}

// ========================
// AI Service Class
// ========================
class AIIntelligenceService {
    private modelVersion = 'v2.1.0-transformer'

    // Generate price predictions with confidence
    async getPricePredictions(market: string, timeframe: '1h' | '4h' | '24h' | '7d' = '24h'): Promise<PricePrediction[]> {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 500))

        const regions = ['Northern', 'Southern', 'Western', 'Eastern', 'NE']
        const basePrice = market === 'DAM' ? 5.42 : market === 'RTM' ? 5.38 : 5.45

        return regions.map(region => {
            const change = (Math.random() - 0.4) * 0.5 // Slight positive bias
            const predictedPrice = basePrice + change
            const confidence = 0.75 + Math.random() * 0.20 // 75-95%
            const uncertainty = (1 - confidence) * 0.3

            return {
                market,
                region,
                currentPrice: basePrice + (Math.random() * 0.1 - 0.05),
                predictedPrice: parseFloat(predictedPrice.toFixed(2)),
                change: parseFloat(change.toFixed(3)),
                changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                uncertaintyLow: parseFloat((predictedPrice - uncertainty).toFixed(2)),
                uncertaintyHigh: parseFloat((predictedPrice + uncertainty).toFixed(2)),
                timeframe,
                timestamp: new Date(),
                modelVersion: this.modelVersion
            }
        })
    }

    // Get explanation for a prediction
    async getExplanation(prediction: PricePrediction): Promise<PredictionExplanation> {
        await new Promise(r => setTimeout(r, 300))

        const factors: ExplanationFactor[] = [
            {
                name: 'Weather Forecast',
                impact: Math.floor(Math.random() * 60) + 20,
                direction: 'positive' as const,
                description: 'High temperature expected, increasing cooling demand',
                icon: '🌡️'
            },
            {
                name: 'Historical Pattern',
                impact: Math.floor(Math.random() * 40) + 10,
                direction: (prediction.change > 0 ? 'positive' : 'negative') as 'positive' | 'negative',
                description: 'Similar price movement observed in past 7 days',
                icon: '📊'
            },
            {
                name: 'Supply Status',
                impact: Math.floor(Math.random() * 50) + 15,
                direction: (prediction.change > 0 ? 'positive' : 'negative') as 'positive' | 'negative',
                description: 'Thermal unit outage affecting Northern grid',
                icon: '⚡'
            },
            {
                name: 'Renewable Generation',
                impact: Math.floor(Math.random() * 35) + 5,
                direction: 'negative' as const,
                description: 'Solar generation 12% below average due to cloud cover',
                icon: '☁️'
            },
            {
                name: 'Demand Trend',
                impact: Math.floor(Math.random() * 45) + 10,
                direction: (prediction.change > 0 ? 'positive' : 'negative') as 'positive' | 'negative',
                description: 'Industrial demand rising with factory schedules',
                icon: '🏭'
            }
        ].sort((a, b) => b.impact - a.impact)

        const changeDir = prediction.change > 0 ? 'increase' : 'decrease'
        const topFactor = factors[0]

        return {
            predictionId: `pred-${Date.now()}`,
            factors,
            historicalAccuracy: parseFloat((85 + Math.random() * 10).toFixed(1)),
            similarScenarios: Math.floor(Math.random() * 50) + 20,
            modelConfidence: prediction.confidence > 0.85 ? 'High' : prediction.confidence > 0.7 ? 'Medium' : 'Low',
            summary: `Price ${changeDir} of ${Math.abs(prediction.changePercent)}% driven primarily by ${topFactor.name.toLowerCase()} (${topFactor.description.toLowerCase()}). Model has ${(prediction.confidence * 100).toFixed(0)}% confidence based on ${Math.floor(50 + Math.random() * 30)} similar historical scenarios.`
        }
    }

    // Get demand forecast
    async getDemandForecast(hours: number = 24): Promise<DemandForecast[]> {
        await new Promise(r => setTimeout(r, 400))

        const forecasts: DemandForecast[] = []
        const baseLoad = 180 // GW

        for (let i = 0; i < hours; i++) {
            const hour = (new Date().getHours() + i) % 24
            // Daily load curve: lower at night, peaks at 10am and 7pm
            const timeMultiplier = hour < 6 ? 0.7 : hour < 10 ? 0.85 + (hour - 6) * 0.05 :
                hour < 14 ? 1.0 - (hour - 10) * 0.02 :
                    hour < 19 ? 0.92 + (hour - 14) * 0.02 :
                        hour < 22 ? 1.0 - (hour - 19) * 0.05 : 0.75

            const predicted = baseLoad * timeMultiplier * (0.95 + Math.random() * 0.1)
            const margin = predicted * 0.05

            forecasts.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                predicted: parseFloat(predicted.toFixed(1)),
                lowerBound: parseFloat((predicted - margin).toFixed(1)),
                upperBound: parseFloat((predicted + margin).toFixed(1)),
                actual: i < 3 ? parseFloat((predicted * (0.98 + Math.random() * 0.04)).toFixed(1)) : undefined
            })
        }

        return forecasts
    }

    // Detect anomalies
    async detectAnomalies(): Promise<AnomalyAlert[]> {
        await new Promise(r => setTimeout(r, 300))

        // Only return anomalies ~30% of the time
        if (Math.random() > 0.3) return []

        const types: AnomalyAlert['type'][] = ['price', 'volume', 'pattern', 'grid']
        const type = types[Math.floor(Math.random() * types.length)]

        const anomalyTemplates = {
            price: {
                metric: 'Price Spike',
                description: 'Unusual price deviation detected in DAM market'
            },
            volume: {
                metric: 'Volume Anomaly',
                description: 'Trading volume 45% above normal for this time period'
            },
            pattern: {
                metric: 'Pattern Break',
                description: 'Price pattern deviating from historical model predictions'
            },
            grid: {
                metric: 'Grid Frequency',
                description: 'Grid frequency approaching threshold limits'
            }
        }

        const template = anomalyTemplates[type]
        const value = 50 + Math.random() * 50
        const expected = value * 0.7

        return [{
            id: `anomaly-${Date.now()}`,
            type,
            severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
            metric: template.metric,
            value: parseFloat(value.toFixed(2)),
            expected: parseFloat(expected.toFixed(2)),
            deviation: parseFloat(((value - expected) / expected * 100).toFixed(1)),
            timestamp: new Date(),
            description: template.description
        }]
    }

    // AI Copilot query - uses Gemini API
    async askCopilot(query: string, context?: any): Promise<CopilotMessage> {
        try {
            // Call Gemini API endpoint
            const response = await fetch('/api/ai/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    context: context || {},
                    history: [] // Could maintain history here
                })
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()

            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: data.response || this.generateCopilotResponse(query.toLowerCase()),
                timestamp: new Date(),
                context: {
                    ...context,
                    source: data.source || 'api',
                    model: data.model
                }
            }
        } catch (error) {
            console.error('[AI Copilot] Error calling API:', error)
            // Fallback to local pattern matching
            return {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: this.generateCopilotResponse(query.toLowerCase()),
                timestamp: new Date(),
                context: { source: 'fallback' }
            }
        }
    }

    private generateCopilotResponse(query: string): string {
        if (query.includes('price') && (query.includes('spike') || query.includes('high') || query.includes('why'))) {
            return `📊 **Today's price spike analysis:**

The ₹6.82/kWh peak (↑18%) in the Northern region is driven by:

1. **🌡️ Heat Wave Impact** - Cooling demand up 23% across Delhi NCR
2. **⚡ Supply Constraint** - 1,200 MW thermal unit offline at Dadri
3. **☁️ Solar Shortfall** - Cloud cover reducing solar output by 15%

**Forecast:** Prices likely to remain elevated until 18:00 IST when solar generation improves.

**Recommendation:** Consider shifting non-critical loads to off-peak hours (22:00-06:00).`
        }

        if (query.includes('forecast') || query.includes('tomorrow') || query.includes('predict')) {
            return `📈 **24-Hour Price Forecast:**

| Time | DAM Price | Confidence |
|------|-----------|------------|
| 06:00-10:00 | ₹4.85-5.10 | 87% |
| 10:00-14:00 | ₹5.20-5.45 | 82% |
| 14:00-18:00 | ₹5.60-6.10 | 79% |
| 18:00-22:00 | ₹5.80-6.40 | 75% |
| 22:00-06:00 | ₹4.40-4.70 | 89% |

**Key Drivers:**
- Industrial demand expected to rise 8%
- Solar generation forecast: 48 GW peak
- No major grid events scheduled`
        }

        if (query.includes('recommend') || query.includes('strategy') || query.includes('trade')) {
            return `🎯 **Trading Strategy Recommendations:**

Based on current market conditions and AI analysis:

**Short-term (Next 4 hours):**
- ⚠️ **Hold** positions in Northern region (high volatility)
- ✅ **Buy** opportunity in Southern grid at ₹4.92
- 📊 Expected move: +3.2% by 14:00 IST

**Risk Assessment:**
- Portfolio VaR (95%): ₹12,500
- Sharpe Ratio: 1.85 (above benchmark)
- Max recommended position: 2,000 MWh

**Confidence:** 78% based on 847 similar historical scenarios`
        }

        if (query.includes('alert') || query.includes('anomal') || query.includes('unusual')) {
            return `🔔 **Active Anomalies:**

1. **Price Deviation** (Medium Priority)
   - Northern DAM showing +12% deviation from model
   - Likely cause: Unscheduled thermal outage
   
2. **Volume Spike** (Low Priority)
   - RTM trading volume 34% above average
   - Pattern consistent with end-of-month settlements

**No critical anomalies detected in the last 24 hours.**`
        }

        // Default response
        return `I can help you with:

• **Price Analysis** - "Why is the price spiking?"
• **Forecasts** - "What's the price forecast for tomorrow?"
• **Trading Strategy** - "What trades do you recommend?"
• **Anomaly Detection** - "Are there any unusual patterns?"
• **Market Intelligence** - "What's driving demand today?"

How can I assist you?`
    }
}

// Singleton
export const aiService = new AIIntelligenceService()

// ========================
// React Context & Hooks
// ========================
interface AIContextValue {
    predictions: PricePrediction[]
    isLoadingPredictions: boolean
    getPredictions: (market: string, timeframe?: '1h' | '4h' | '24h' | '7d') => Promise<void>
    getExplanation: (prediction: PricePrediction) => Promise<PredictionExplanation>
    demandForecast: DemandForecast[]
    anomalies: AnomalyAlert[]
    copilotMessages: CopilotMessage[]
    askCopilot: (query: string) => Promise<void>
    isLoadingCopilot: boolean
}

const AIContext = createContext<AIContextValue | null>(null)

export function AIProvider({ children }: { children: ReactNode }) {
    const [predictions, setPredictions] = useState<PricePrediction[]>([])
    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
    const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([])
    const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
    const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([])
    const [isLoadingCopilot, setIsLoadingCopilot] = useState(false)

    const getPredictions = useCallback(async (market: string, timeframe: '1h' | '4h' | '24h' | '7d' = '24h') => {
        setIsLoadingPredictions(true)
        try {
            const preds = await aiService.getPricePredictions(market, timeframe)
            setPredictions(preds)

            // Also load demand forecast and anomalies
            const [forecast, alerts] = await Promise.all([
                aiService.getDemandForecast(),
                aiService.detectAnomalies()
            ])
            setDemandForecast(forecast)
            if (alerts.length > 0) {
                setAnomalies(prev => [...alerts, ...prev].slice(0, 10))
            }
        } finally {
            setIsLoadingPredictions(false)
        }
    }, [])

    const getExplanationFn = useCallback(async (prediction: PricePrediction) => {
        return aiService.getExplanation(prediction)
    }, [])

    const askCopilotFn = useCallback(async (query: string) => {
        setIsLoadingCopilot(true)

        // Add user message
        const userMsg: CopilotMessage = {
            id: `msg-${Date.now()}-user`,
            role: 'user',
            content: query,
            timestamp: new Date()
        }
        setCopilotMessages(prev => [...prev, userMsg])

        try {
            const response = await aiService.askCopilot(query)
            setCopilotMessages(prev => [...prev, response])
        } finally {
            setIsLoadingCopilot(false)
        }
    }, [])

    return (
        <AIContext.Provider value={{
            predictions,
            isLoadingPredictions,
            getPredictions,
            getExplanation: getExplanationFn,
            demandForecast,
            anomalies,
            copilotMessages,
            askCopilot: askCopilotFn,
            isLoadingCopilot
        }}>
            {children}
        </AIContext.Provider>
    )
}

export function useAI() {
    const context = useContext(AIContext)
    if (!context) {
        throw new Error('useAI must be used within AIProvider')
    }
    return context
}

export function usePredictions(market: string = 'DAM') {
    const { predictions, isLoadingPredictions, getPredictions } = useAI()
    return { predictions, isLoading: isLoadingPredictions, refresh: () => getPredictions(market) }
}

export function useCopilot() {
    const { copilotMessages, askCopilot, isLoadingCopilot } = useAI()
    return { messages: copilotMessages, ask: askCopilot, isLoading: isLoadingCopilot }
}
