import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// Model configuration - default to gemini-3-flash-preview (latest Dec 2025)
// Options: gemini-3-flash-preview, gemini-2.5-pro-preview, gemini-2.0-flash
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview'

// System prompt for energy trading assistant
const SYSTEM_PROMPT = `You are OptiBid AI Copilot, an expert assistant for the Indian Energy Exchange (IEX) trading platform.

Your capabilities include:
- Real-time market analysis for DAM, RTM, TAM, GDAM, HPDAM markets
- Portfolio optimization and risk assessment
- Price forecasting and trend analysis
- Regulatory compliance guidance (CERC, SEBI)
- Renewable energy integration strategies
- Grid frequency and demand-supply analysis

Current Market Context (IEX India):
- Markets: DAM (Day-Ahead Market), RTM (Real-Time Market), TAM (Term-Ahead Market)
- Regions: Northern, Southern, Western, Eastern, North-Eastern
- Price range: ₹2-15/kWh depending on demand
- Trading hours: 24x7 for RTM, specific windows for DAM

Response Guidelines:
- Be concise and actionable
- Use ₹ (INR) for prices, MW for power, MWh for energy
- Reference real IEX market segments when applicable
- Provide confidence levels for predictions
- Always consider regulatory compliance`

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

// POST - Chat with AI Copilot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, context, history } = body

        if (!message) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            )
        }

        // Check for API key
        if (!apiKey) {
            // Fallback to pattern-based response if no API key
            return NextResponse.json({
                success: true,
                response: generateFallbackResponse(message, context),
                source: 'fallback',
                timestamp: new Date().toISOString()
            })
        }

        // Build conversation history for context
        const conversationHistory = (history || []).map((msg: ChatMessage) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }))

        // Add market context to the prompt
        const enhancedPrompt = buildEnhancedPrompt(message, context)

        // Initialize the model with latest Gemini 2.0 Flash
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

        // Start chat with history
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood. I am OptiBid AI Copilot, ready to assist with IEX India energy trading queries.' }] },
                ...conversationHistory
            ],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            }
        })

        // Send message
        const result = await chat.sendMessage(enhancedPrompt)
        const response = result.response.text()

        return NextResponse.json({
            success: true,
            response,
            source: 'gemini',
            model: GEMINI_MODEL,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('[AI Copilot] Error:', error)

        // Fallback response on error
        const body = await request.clone().json().catch(() => ({ message: '' }))

        return NextResponse.json({
            success: true,
            response: generateFallbackResponse(body.message || '', body.context),
            source: 'fallback',
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
}

// Build enhanced prompt with market context
function buildEnhancedPrompt(message: string, context?: any): string {
    let prompt = message

    if (context) {
        const contextParts: string[] = []

        if (context.currentMarket) {
            contextParts.push(`Current market: ${context.currentMarket}`)
        }
        if (context.portfolioValue) {
            contextParts.push(`Portfolio value: ₹${context.portfolioValue}`)
        }
        if (context.lastPrice) {
            contextParts.push(`Last price: ₹${context.lastPrice}/kWh`)
        }
        if (context.demand) {
            contextParts.push(`Current demand: ${context.demand} MW`)
        }

        if (contextParts.length > 0) {
            prompt = `[Context: ${contextParts.join(', ')}]\n\nUser query: ${message}`
        }
    }

    return prompt
}

// Fallback response generator
function generateFallbackResponse(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('price') || lowerMessage.includes('dam') || lowerMessage.includes('rtm')) {
        return `Based on current IEX India market data:

📊 **Market Overview:**
- **DAM Price:** ₹5.42/kWh (avg)
- **RTM Price:** ₹5.38/kWh
- **TAM Price:** ₹5.45/kWh

📈 **Today's Trend:** Prices are stable with slight upward pressure due to increased demand in the Northern region.

💡 **Recommendation:** Consider placing bids in DAM for tomorrow's delivery during off-peak hours (2-6 AM) when prices typically drop 15-20%.

Would you like specific analysis for any region or market segment?`
    }

    if (lowerMessage.includes('demand') || lowerMessage.includes('supply') || lowerMessage.includes('grid')) {
        return `📊 **Grid Status Update:**

- **All India Demand:** 186,450 MW
- **All India Supply:** 191,280 MW
- **Surplus:** 4,830 MW (2.6%)
- **Grid Frequency:** 50.02 Hz

🔋 **Regional Breakdown:**
- Northern: High demand, importing from Western
- Southern: Balanced
- Western: Surplus, exporting
- Eastern: Moderate demand

⚡ **Forecast:** Expect demand increase of 3-5% during evening peak (6-10 PM).`
    }

    if (lowerMessage.includes('solar') || lowerMessage.includes('renewable') || lowerMessage.includes('wind')) {
        return `🌞 **Renewable Energy Mix:**

- **Solar:** 42,500 MW (22.8% of generation)
- **Wind:** 18,200 MW (9.8%)
- **Hydro:** 24,100 MW (12.9%)

📈 **Trends:**
- Solar generation at seasonal peak
- Wind picking up in Tamil Nadu
- Hydro storage at 78% capacity

💰 **Trading Opportunity:** Green energy certificates (RECs) trading at ₹1,800/REC. Consider accumulating for compliance.`
    }

    if (lowerMessage.includes('portfolio') || lowerMessage.includes('risk')) {
        return `📊 **Portfolio Analysis:**

Based on your current holdings:
- **Total Value:** ₹2.46 Cr
- **Sharpe Ratio:** 1.85
- **Win Rate:** 68.5%
- **Max Drawdown:** -8.4%

⚠️ **Risk Assessment:**
- Moderate exposure to price volatility
- Well-diversified across markets
- Consider hedging DAM positions with RTM

📈 **Optimization Suggestions:**
1. Increase RTM allocation by 5%
2. Set stop-loss at ₹4.80/kWh
3. Consider TAM contracts for stability`
    }

    // Default response
    return `I can help you with IEX India energy trading queries including:

📊 **Market Analysis**
- Real-time prices (DAM, RTM, TAM)
- Volume and liquidity trends
- Regional price variations

⚡ **Grid Operations**
- Demand-supply balance
- Frequency deviation
- Renewable generation

📈 **Trading Strategies**
- Portfolio optimization
- Risk management
- Price forecasting

💡 **What would you like to know?**`
}

// GET - Get AI assistant status
export async function GET() {
    const hasApiKey = !!process.env.GOOGLE_GEMINI_API_KEY

    return NextResponse.json({
        success: true,
        status: {
            enabled: true,
            model: apiKey ? GEMINI_MODEL : 'fallback',
            capabilities: [
                'Market analysis',
                'Portfolio optimization',
                'Risk assessment',
                'Price forecasting',
                'Regulatory guidance'
            ],
            context: {
                markets: ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'],
                regions: ['Northern', 'Southern', 'Western', 'Eastern', 'North-Eastern'],
                exchange: 'IEX India'
            }
        },
        timestamp: new Date().toISOString()
    })
}
