'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    LightBulbIcon,
    SparklesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface ColumnType {
    name: string
    type: 'string' | 'number' | 'date' | 'boolean' | 'unknown'
    sampleValues: any[]
    nullCount: number
    uniqueCount: number
}

interface ColumnMapping {
    sourceColumn: string
    targetField: string
    confidence: number
}

interface AIMappingSuggestion {
    sourceColumn: string
    targetField: string
    confidence: number
    reason: string
}

interface SchemaMapperProps {
    columns: ColumnType[]
    onMappingComplete: (mappings: ColumnMapping[]) => void
    suggestedMappings?: Partial<Record<string, string>>
}

// IEX Market Data Fields
const TARGET_FIELDS = [
    { id: 'timestamp', label: 'Timestamp', description: 'Date/Time column', required: true, acceptedTypes: ['date', 'string', 'number'] },
    { id: 'dam_price', label: 'DAM Price', description: 'Day-Ahead Market price (₹/MWh)', required: false, acceptedTypes: ['number'] },
    { id: 'rtm_price', label: 'RTM Price', description: 'Real-Time Market price (₹/MWh)', required: false, acceptedTypes: ['number'] },
    { id: 'so_price', label: 'SO Price', description: 'System Operator price', required: false, acceptedTypes: ['number'] },
    { id: 'gtam_price', label: 'GTAM Price', description: 'Green Term Ahead Market price', required: false, acceptedTypes: ['number'] },
    { id: 'mcp', label: 'MCP', description: 'Market Clearing Price', required: false, acceptedTypes: ['number'] },
    { id: 'volume', label: 'Volume', description: 'Traded volume (MW or MWh)', required: false, acceptedTypes: ['number'] },
    { id: 'demand', label: 'Demand', description: 'Energy demand', required: false, acceptedTypes: ['number'] },
    { id: 'supply', label: 'Supply', description: 'Energy supply', required: false, acceptedTypes: ['number'] },
    { id: 'region', label: 'Region', description: 'Geographic region', required: false, acceptedTypes: ['string'] },
    { id: 'cost', label: 'Cost/Value', description: 'Cost or value field', required: false, acceptedTypes: ['number'] },
    { id: 'revenue', label: 'Revenue', description: 'Revenue or income', required: false, acceptedTypes: ['number'] },
]

export default function SchemaMapper({
    columns,
    onMappingComplete,
    suggestedMappings = {}
}: SchemaMapperProps) {
    const [mappings, setMappings] = useState<Record<string, string>>({})
    const [aiMappings, setAiMappings] = useState<AIMappingSuggestion[]>([])
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [aiMessage, setAiMessage] = useState<string>('')
    const [aiApplied, setAiApplied] = useState(false)

    // Auto-call AI mapping on mount
    useEffect(() => {
        if (columns.length > 0 && !aiApplied) {
            runAiAutoMapping()
        }
    }, [columns])

    // Run AI auto-mapping
    const runAiAutoMapping = useCallback(async () => {
        setIsAiLoading(true)
        setAiMessage('AI is analyzing your data structure...')

        try {
            const response = await fetch('/api/ai/auto-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ columns })
            })

            if (response.ok) {
                const result = await response.json()

                if (result.success && result.mappings?.length > 0) {
                    setAiMappings(result.mappings)

                    // AUTO-APPLY the AI mappings
                    const newMappings: Record<string, string> = {}
                    result.mappings.forEach((m: AIMappingSuggestion) => {
                        if (m.targetField && m.sourceColumn) {
                            newMappings[m.targetField] = m.sourceColumn
                        }
                    })
                    setMappings(newMappings)
                    setAiMessage(`✓ AI auto-mapped ${result.mappings.length} columns. Review and adjust if needed.`)
                    setAiApplied(true)
                } else {
                    setAiMessage('AI could not find matching columns. Please map manually.')
                }
            } else {
                // Fallback to local heuristic mapping
                applyLocalHeuristics()
            }
        } catch (error) {
            console.error('AI mapping error:', error)
            applyLocalHeuristics()
        } finally {
            setIsAiLoading(false)
        }
    }, [columns])

    // Fallback local heuristic mapping
    const applyLocalHeuristics = () => {
        const hints: Record<string, string[]> = {
            timestamp: ['time', 'date', 'datetime', 'hour', 'period', 'unnamed: 0'],
            dam_price: ['dam', 'day_ahead', 'dayahead'],
            rtm_price: ['rtm', 'realtime', 'real_time'],
            mcp: ['mcp', 'price', 'clearing'],
            volume: ['volume', 'quantity', 'mw', 'mwh'],
            cost: ['cost', 'value', 'amount', 'expense'],
            revenue: ['revenue', 'income'],
            region: ['region', 'area', 'zone', 'state'],
        }

        const newMappings: Record<string, string> = {}
        const mappedColumns = new Set<string>()

        columns.forEach(col => {
            if (!col.name) return
            const lowerName = col.name.toLowerCase().replace(/[^a-z0-9]/g, '')

            for (const [target, patterns] of Object.entries(hints)) {
                if (!newMappings[target] && patterns.some(p => lowerName.includes(p))) {
                    newMappings[target] = col.name
                    mappedColumns.add(col.name)
                    break
                }
            }
        })

        // If we have unmapped number columns and no cost/value, assign first one
        const unmappedNumeric = columns.find(c =>
            c.type === 'number' && !mappedColumns.has(c.name)
        )
        if (unmappedNumeric && !newMappings['cost'] && !newMappings['revenue']) {
            newMappings['cost'] = unmappedNumeric.name
        }

        setMappings(newMappings)
        setAiMessage(Object.keys(newMappings).length > 0
            ? `Auto-mapped ${Object.keys(newMappings).length} columns using pattern matching.`
            : 'Could not auto-detect mappings. Please map manually.')
        setAiApplied(true)
    }

    const handleDragStart = (columnName: string) => {
        setDraggedColumn(columnName)
    }

    const handleDragEnd = () => {
        setDraggedColumn(null)
    }

    const handleDrop = (targetFieldId: string) => {
        if (draggedColumn) {
            setMappings(prev => ({
                ...prev,
                [targetFieldId]: draggedColumn
            }))
        }
        setDraggedColumn(null)
    }

    const handleSelect = (targetFieldId: string, columnName: string) => {
        if (columnName === '') {
            const newMappings = { ...mappings }
            delete newMappings[targetFieldId]
            setMappings(newMappings)
        } else {
            setMappings(prev => ({
                ...prev,
                [targetFieldId]: columnName
            }))
        }
    }

    const handleComplete = () => {
        const mappingArray: ColumnMapping[] = Object.entries(mappings).map(([target, source]) => ({
            sourceColumn: source,
            targetField: target,
            confidence: aiMappings.find(m => m.targetField === target)?.confidence || 0.8
        }))
        onMappingComplete(mappingArray)
    }

    const getMappedCount = () => Object.keys(mappings).length
    const getRequiredMapped = () => TARGET_FIELDS.filter(f => f.required && mappings[f.id]).length
    const getRequiredCount = () => TARGET_FIELDS.filter(f => f.required).length

    const getAiReason = (targetField: string): string | undefined => {
        return aiMappings.find(m => m.targetField === targetField)?.reason
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
        if (confidence >= 0.5) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Map Your Columns
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        AI has auto-mapped your columns. Review and adjust as needed.
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={runAiAutoMapping}
                        disabled={isAiLoading}
                        className={clsx(
                            'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                            isAiLoading
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                        )}
                    >
                        {isAiLoading ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                            <SparklesIcon className="h-4 w-4" />
                        )}
                        <span>{isAiLoading ? 'Analyzing...' : 'Re-run AI Mapping'}</span>
                    </button>

                    <div className="text-sm text-gray-500">
                        {getMappedCount()} mapped • {getRequiredMapped()}/{getRequiredCount()} required
                    </div>
                </div>
            </div>

            {/* AI Status Message */}
            {aiMessage && (
                <div className={clsx(
                    'flex items-center space-x-3 p-3 rounded-lg',
                    aiMessage.startsWith('✓')
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                )}>
                    {aiMessage.startsWith('✓') ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                        <LightBulbIcon className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{aiMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source Columns */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Source Columns ({columns.length})
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {columns.map(col => {
                            const isMapped = Object.values(mappings).includes(col.name)
                            const mapping = aiMappings.find(m => m.sourceColumn === col.name)

                            return (
                                <div
                                    key={col.name}
                                    draggable
                                    onDragStart={() => handleDragStart(col.name)}
                                    onDragEnd={handleDragEnd}
                                    className={clsx(
                                        'p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all',
                                        isMapped
                                            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500',
                                        draggedColumn === col.name && 'ring-2 ring-blue-500 scale-105'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {col.name || '(unnamed)'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {col.type} • {col.uniqueCount} unique
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {mapping && (
                                                <span className={clsx('text-xs', getConfidenceColor(mapping.confidence))}>
                                                    {Math.round(mapping.confidence * 100)}%
                                                </span>
                                            )}
                                            {isMapped && (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 truncate">
                                        Sample: {col.sampleValues?.slice(0, 3).map(v => String(v)).join(', ') || 'N/A'}
                                    </div>
                                    {mapping?.reason && (
                                        <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 italic">
                                            AI: {mapping.reason}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Target Fields */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target Fields
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {TARGET_FIELDS.map(field => {
                            const aiReason = getAiReason(field.id)
                            const aiMapping = aiMappings.find(m => m.targetField === field.id)

                            return (
                                <div
                                    key={field.id}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(field.id)}
                                    className={clsx(
                                        'p-3 rounded-lg border transition-all',
                                        mappings[field.id]
                                            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800',
                                        field.required && !mappings[field.id] && 'border-red-200 dark:border-red-800'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                {field.label}
                                            </span>
                                            {field.required && (
                                                <span className="text-xs text-red-500">*required</span>
                                            )}
                                            {aiMapping && (
                                                <span className={clsx(
                                                    'text-xs px-1.5 py-0.5 rounded',
                                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                )}>
                                                    AI
                                                </span>
                                            )}
                                        </div>
                                        {mappings[field.id] && (
                                            <ArrowsRightLeftIcon className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        {field.description}
                                    </p>

                                    <select
                                        value={mappings[field.id] || ''}
                                        onChange={(e) => handleSelect(field.id, e.target.value)}
                                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">-- Select column --</option>
                                        {columns
                                            .filter(col => field.acceptedTypes.includes(col.type))
                                            .map(col => (
                                                <option key={col.name} value={col.name}>
                                                    {col.name || '(unnamed)'} ({col.type})
                                                </option>
                                            ))}
                                        {/* Also show all columns if none match type */}
                                        {columns.filter(col => !field.acceptedTypes.includes(col.type)).length > 0 && (
                                            <optgroup label="Other columns">
                                                {columns
                                                    .filter(col => !field.acceptedTypes.includes(col.type))
                                                    .map(col => (
                                                        <option key={col.name} value={col.name}>
                                                            {col.name || '(unnamed)'} ({col.type})
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* AI Suggestions Summary */}
            {aiMappings.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start space-x-3">
                        <SparklesIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                                AI Mapping Summary
                            </p>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {aiMappings.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {m.sourceColumn} → <span className="font-medium text-purple-700 dark:text-purple-400">{m.targetField}</span>
                                        </span>
                                        <span className={getConfidenceColor(m.confidence)}>
                                            {Math.round(m.confidence * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setMappings({})}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    Clear All
                </button>
                <button
                    onClick={handleComplete}
                    disabled={getRequiredMapped() < getRequiredCount()}
                    className={clsx(
                        'px-6 py-2 rounded-lg font-medium transition-all',
                        getRequiredMapped() >= getRequiredCount()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    )}
                >
                    Continue to Evaluation
                </button>
            </div>
        </div>
    )
}
