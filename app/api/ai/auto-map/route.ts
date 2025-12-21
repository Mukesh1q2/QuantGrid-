import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with fallback key support
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// Model configuration - default to gemini-3-flash-preview (latest Dec 2025)
// Options: gemini-3-flash-preview, gemini-2.5-pro-preview, gemini-2.0-flash
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview'

interface ColumnInfo {
    name: string
    type: string
    sampleValues: any[]
    uniqueCount?: number
}

interface MappingSuggestion {
    sourceColumn: string
    targetField: string
    confidence: number
    reason: string
}

// IEX Market Data Target Fields
const TARGET_FIELDS = [
    { id: 'timestamp', label: 'Timestamp', description: 'Date/Time column', required: true },
    { id: 'dam_price', label: 'DAM Price', description: 'Day-Ahead Market price (₹/MWh)' },
    { id: 'rtm_price', label: 'RTM Price', description: 'Real-Time Market price (₹/MWh)' },
    { id: 'so_price', label: 'SO Price', description: 'System Operator price' },
    { id: 'gtam_price', label: 'GTAM Price', description: 'Green Term Ahead Market price' },
    { id: 'mcp', label: 'MCP', description: 'Market Clearing Price' },
    { id: 'volume', label: 'Volume', description: 'Traded volume (MW or MWh)' },
    { id: 'demand', label: 'Demand', description: 'Energy demand' },
    { id: 'supply', label: 'Supply', description: 'Energy supply' },
    { id: 'region', label: 'Region', description: 'Geographic region' },
    { id: 'bid_price', label: 'Bid Price', description: 'Bid price for optimization' },
    { id: 'bid_quantity', label: 'Bid Quantity', description: 'Bid quantity' },
    { id: 'cost', label: 'Cost', description: 'Cost or value field' },
    { id: 'revenue', label: 'Revenue', description: 'Revenue or income field' },
]

export async function POST(request: NextRequest) {
    try {
        const { columns, dataPreview } = await request.json()

        if (!columns || columns.length === 0) {
            return NextResponse.json(
                { error: 'No columns provided' },
                { status: 400 }
            )
        }

        // Build prompt for Gemini
        const prompt = `You are an expert data analyst specializing in energy market data, particularly Indian Energy Exchange (IEX) data.

Analyze the following dataset columns and their sample values. Map each source column to the most appropriate target field for energy market analysis.

SOURCE COLUMNS:
${columns.map((col: ColumnInfo) =>
            `- "${col.name}" (type: ${col.type}, samples: ${col.sampleValues?.slice(0, 3).join(', ') || 'N/A'})`
        ).join('\n')}

AVAILABLE TARGET FIELDS:
${TARGET_FIELDS.map(f => `- "${f.id}": ${f.description}`).join('\n')}

RULES:
1. Analyze column names, data types, and sample values to determine the best mapping
2. For date/time columns, map to "timestamp"
3. For price-related columns, determine if it's DAM, RTM, SO, GTAM, MCP, bid_price, or general cost/revenue
4. For quantity columns, determine if it's volume, demand, supply, or bid_quantity
5. Column names like "value", "amount", "cost" should be mapped based on context
6. If a column clearly doesn't match any target, don't include it
7. Confidence should be 0.0-1.0 based on how certain the mapping is

Respond ONLY with a valid JSON array of mappings. Example format:
[
  {"sourceColumn": "Date", "targetField": "timestamp", "confidence": 0.95, "reason": "Column name indicates date/time data"},
  {"sourceColumn": "Price_DAM", "targetField": "dam_price", "confidence": 0.9, "reason": "Column contains DAM pricing data"}
]

If no good mappings can be made, return an empty array: []`

        try {
            // Use configurable Gemini model (default: gemini-2.0-flash)
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                const mappings: MappingSuggestion[] = JSON.parse(jsonMatch[0])

                // Validate and clean mappings
                const validMappings = mappings.filter(m =>
                    m.sourceColumn &&
                    m.targetField &&
                    TARGET_FIELDS.some(f => f.id === m.targetField) &&
                    columns.some((c: ColumnInfo) => c.name === m.sourceColumn)
                )

                return NextResponse.json({
                    success: true,
                    mappings: validMappings,
                    totalColumns: columns.length,
                    mappedColumns: validMappings.length,
                    message: validMappings.length > 0
                        ? `AI mapped ${validMappings.length} of ${columns.length} columns`
                        : 'Could not auto-map columns. Please map manually.'
                })
            }

            // Fallback to heuristic mapping if AI fails
            return NextResponse.json({
                success: true,
                mappings: heuristicMapping(columns),
                message: 'Using heuristic mapping (AI unavailable)'
            })

        } catch (aiError) {
            console.error('Gemini API error:', aiError)
            // Fallback to heuristic mapping
            return NextResponse.json({
                success: true,
                mappings: heuristicMapping(columns),
                message: 'Using heuristic mapping (AI error)'
            })
        }

    } catch (error) {
        console.error('Auto-map error:', error)
        return NextResponse.json(
            { error: 'Failed to auto-map columns' },
            { status: 500 }
        )
    }
}

// Fallback heuristic mapping when AI is unavailable
function heuristicMapping(columns: ColumnInfo[]): MappingSuggestion[] {
    const mappings: MappingSuggestion[] = []
    const usedTargets = new Set<string>()

    const mappingRules: { pattern: RegExp; target: string; priority: number }[] = [
        { pattern: /date|time|timestamp|datetime|period|hour/i, target: 'timestamp', priority: 1 },
        { pattern: /dam|day.?ahead/i, target: 'dam_price', priority: 2 },
        { pattern: /rtm|real.?time/i, target: 'rtm_price', priority: 2 },
        { pattern: /so|system.?operator|ancillary/i, target: 'so_price', priority: 2 },
        { pattern: /gtam|green|renewable|ras/i, target: 'gtam_price', priority: 2 },
        { pattern: /mcp|clearing.?price/i, target: 'mcp', priority: 2 },
        { pattern: /volume|quantity|mw|mwh|energy/i, target: 'volume', priority: 3 },
        { pattern: /demand|load|consumption/i, target: 'demand', priority: 3 },
        { pattern: /supply|generation|output/i, target: 'supply', priority: 3 },
        { pattern: /region|area|zone|state/i, target: 'region', priority: 4 },
        { pattern: /bid.?price|offer.?price/i, target: 'bid_price', priority: 3 },
        { pattern: /bid.?qty|bid.?quantity/i, target: 'bid_quantity', priority: 3 },
        { pattern: /cost|expense/i, target: 'cost', priority: 4 },
        { pattern: /revenue|income|value/i, target: 'revenue', priority: 4 },
        { pattern: /price/i, target: 'mcp', priority: 5 }, // Generic price -> MCP
    ]

    // Sort by priority
    const sortedRules = [...mappingRules].sort((a, b) => a.priority - b.priority)

    for (const col of columns) {
        if (!col.name) continue

        for (const rule of sortedRules) {
            if (rule.pattern.test(col.name) && !usedTargets.has(rule.target)) {
                mappings.push({
                    sourceColumn: col.name,
                    targetField: rule.target,
                    confidence: 0.7,
                    reason: `Column name "${col.name}" matches pattern for ${rule.target}`
                })
                usedTargets.add(rule.target)
                break
            }
        }
    }

    // Special case: if we have a number column with no mapping, consider it as a value
    for (const col of columns) {
        if (col.type === 'number' && !mappings.some(m => m.sourceColumn === col.name)) {
            if (!usedTargets.has('cost') && !usedTargets.has('revenue')) {
                mappings.push({
                    sourceColumn: col.name,
                    targetField: 'cost',
                    confidence: 0.5,
                    reason: 'Numeric column, could be cost/value data'
                })
                break
            }
        }
    }

    return mappings
}

export async function GET() {
    return NextResponse.json({
        message: 'AI Schema Auto-Mapping API',
        usage: 'POST with { columns: ColumnInfo[], dataPreview?: any[] }',
        description: 'Uses Gemini AI to automatically map dataset columns to IEX market fields'
    })
}
