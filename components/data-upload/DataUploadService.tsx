'use client'

import React, { useState, useCallback, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
    CloudArrowUpIcon,
    DocumentIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    TableCellsIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface UploadedFile {
    id: string
    file: File
    name: string
    size: number
    type: 'csv' | 'excel' | 'json' | 'xml' | 'unknown'
    status: 'uploading' | 'parsing' | 'ready' | 'error'
    progress: number
    data?: ParsedData
    error?: string
}

interface ParsedData {
    headers: string[]
    rows: any[][]
    totalRows: number
    columnTypes: ColumnType[]
    summary: DataSummary
}

interface ColumnType {
    name: string
    type: 'string' | 'number' | 'date' | 'boolean' | 'unknown'
    sampleValues: any[]
    nullCount: number
    uniqueCount: number
}

interface DataSummary {
    rowCount: number
    columnCount: number
    dateColumns: string[]
    numericColumns: string[]
    suggestedTimestamp?: string
    suggestedPriceColumn?: string
    suggestedVolumeColumn?: string
}

interface DataUploadServiceProps {
    onDataReady: (files: UploadedFile[]) => void
    onFileRemove?: (fileId: string) => void
    maxFiles?: number
    acceptedTypes?: string[]
}

const FILE_TYPE_MAP: Record<string, UploadedFile['type']> = {
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
    'application/json': 'json',
    'text/xml': 'xml',
    'application/xml': 'xml',
}

const FILE_ICONS: Record<UploadedFile['type'], string> = {
    csv: '📊',
    excel: '📗',
    json: '📋',
    xml: '📄',
    unknown: '📁',
}

export default function DataUploadService({
    onDataReady,
    onFileRemove,
    maxFiles = 5,
    acceptedTypes = ['.csv', '.xlsx', '.xls', '.json', '.xml']
}: DataUploadServiceProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const getFileType = (file: File): UploadedFile['type'] => {
        if (FILE_TYPE_MAP[file.type]) return FILE_TYPE_MAP[file.type]
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'csv') return 'csv'
        if (ext === 'xlsx' || ext === 'xls') return 'excel'
        if (ext === 'json') return 'json'
        if (ext === 'xml') return 'xml'
        return 'unknown'
    }

    const parseCSV = async (text: string): Promise<ParsedData> => {
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const rows = lines.slice(1, 51).map(line => {
            const values: any[] = []
            let current = ''
            let inQuotes = false
            for (const char of line) {
                if (char === '"') inQuotes = !inQuotes
                else if (char === ',' && !inQuotes) {
                    values.push(current.trim())
                    current = ''
                } else {
                    current += char
                }
            }
            values.push(current.trim())
            return values
        })

        const columnTypes = headers.map((name, idx) => {
            const sampleValues = rows.slice(0, 10).map(row => row[idx])
            const nonNullValues = sampleValues.filter(v => v !== '' && v !== null && v !== undefined)

            let type: ColumnType['type'] = 'string'
            if (nonNullValues.every(v => !isNaN(parseFloat(v)))) type = 'number'
            else if (nonNullValues.every(v => !isNaN(Date.parse(v)))) type = 'date'
            else if (nonNullValues.every(v => v === 'true' || v === 'false')) type = 'boolean'

            return {
                name,
                type,
                sampleValues: sampleValues.slice(0, 5),
                nullCount: sampleValues.filter(v => v === '' || v === null).length,
                uniqueCount: new Set(nonNullValues).size
            }
        })

        const dateColumns = columnTypes.filter(c => c.type === 'date').map(c => c.name)
        const numericColumns = columnTypes.filter(c => c.type === 'number').map(c => c.name)

        // Auto-detect IEX-relevant columns
        const lowerHeaders = headers.map(h => (h || '').toLowerCase())
        const suggestedTimestamp = headers.find((_, i) =>
            lowerHeaders[i]?.includes('time') || lowerHeaders[i]?.includes('date') || lowerHeaders[i]?.includes('hour')
        )
        const suggestedPriceColumn = headers.find((_, i) =>
            lowerHeaders[i]?.includes('price') || lowerHeaders[i]?.includes('mcp') || lowerHeaders[i]?.includes('dam') || lowerHeaders[i]?.includes('rtm')
        )
        const suggestedVolumeColumn = headers.find((_, i) =>
            lowerHeaders[i]?.includes('volume') || lowerHeaders[i]?.includes('quantity') || lowerHeaders[i]?.includes('mw')
        )

        return {
            headers,
            rows,
            totalRows: lines.length - 1,
            columnTypes,
            summary: {
                rowCount: lines.length - 1,
                columnCount: headers.length,
                dateColumns,
                numericColumns,
                suggestedTimestamp,
                suggestedPriceColumn,
                suggestedVolumeColumn
            }
        }
    }

    const parseJSON = async (text: string): Promise<ParsedData> => {
        const data = JSON.parse(text)
        const records = Array.isArray(data) ? data : [data]
        const headers = Object.keys(records[0] || {})
        const rows = records.slice(0, 50).map(record => headers.map(h => record[h]))

        const columnTypes = headers.map((name, idx) => {
            const sampleValues = rows.slice(0, 10).map(row => row[idx])
            const nonNullValues = sampleValues.filter(v => v !== null && v !== undefined)

            let type: ColumnType['type'] = 'string'
            if (nonNullValues.every(v => typeof v === 'number')) type = 'number'
            else if (nonNullValues.every(v => typeof v === 'boolean')) type = 'boolean'
            else if (nonNullValues.every(v => !isNaN(Date.parse(String(v))))) type = 'date'

            return {
                name,
                type,
                sampleValues: sampleValues.slice(0, 5),
                nullCount: sampleValues.filter(v => v === null || v === undefined).length,
                uniqueCount: new Set(nonNullValues).size
            }
        })

        return {
            headers,
            rows,
            totalRows: records.length,
            columnTypes,
            summary: {
                rowCount: records.length,
                columnCount: headers.length,
                dateColumns: columnTypes.filter(c => c.type === 'date').map(c => c.name),
                numericColumns: columnTypes.filter(c => c.type === 'number').map(c => c.name),
            }
        }
    }

    const parseExcel = async (file: File): Promise<ParsedData> => {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length === 0) {
            throw new Error('Excel file is empty')
        }

        const headers = jsonData[0].map(h => String(h || '').trim())
        const rows = jsonData.slice(1, 51)

        const columnTypes = headers.map((name, idx) => {
            const sampleValues = rows.slice(0, 10).map(row => row[idx])
            const nonNullValues = sampleValues.filter(v => v !== null && v !== undefined && v !== '')

            let type: ColumnType['type'] = 'string'
            if (nonNullValues.every(v => typeof v === 'number')) type = 'number'
            else if (nonNullValues.every(v => typeof v === 'boolean')) type = 'boolean'
            else if (nonNullValues.every(v => !isNaN(Date.parse(String(v))))) type = 'date'

            return {
                name,
                type,
                sampleValues: sampleValues.slice(0, 5),
                nullCount: sampleValues.filter(v => v === null || v === undefined || v === '').length,
                uniqueCount: new Set(nonNullValues).size
            }
        })

        const lowerHeaders = headers.map(h => (h || '').toLowerCase())
        const suggestedTimestamp = headers.find((_, i) =>
            lowerHeaders[i]?.includes('time') || lowerHeaders[i]?.includes('date') || lowerHeaders[i]?.includes('hour')
        )
        const suggestedPriceColumn = headers.find((_, i) =>
            lowerHeaders[i]?.includes('price') || lowerHeaders[i]?.includes('mcp') || lowerHeaders[i]?.includes('dam') || lowerHeaders[i]?.includes('rtm')
        )
        const suggestedVolumeColumn = headers.find((_, i) =>
            lowerHeaders[i]?.includes('volume') || lowerHeaders[i]?.includes('quantity') || lowerHeaders[i]?.includes('mw')
        )

        return {
            headers,
            rows,
            totalRows: jsonData.length - 1,
            columnTypes,
            summary: {
                rowCount: jsonData.length - 1,
                columnCount: headers.length,
                dateColumns: columnTypes.filter(c => c.type === 'date').map(c => c.name),
                numericColumns: columnTypes.filter(c => c.type === 'number').map(c => c.name),
                suggestedTimestamp,
                suggestedPriceColumn,
                suggestedVolumeColumn
            }
        }
    }

    const parseFile = async (file: File): Promise<ParsedData> => {
        const fileType = getFileType(file)

        switch (fileType) {
            case 'csv':
                const csvText = await file.text()
                return parseCSV(csvText)
            case 'json':
                const jsonText = await file.text()
                return parseJSON(jsonText)
            case 'xml':
                // Basic XML parsing - fallback to CSV parser for now
                const xmlText = await file.text()
                return parseCSV(xmlText)
            case 'excel':
                return parseExcel(file)
            default:
                throw new Error(`Unsupported file type: ${fileType}`)
        }
    }

    const processFile = async (file: File): Promise<UploadedFile> => {
        const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const uploadedFile: UploadedFile = {
            id,
            file,
            name: file.name,
            size: file.size,
            type: getFileType(file),
            status: 'uploading',
            progress: 0
        }

        try {
            // Simulate upload progress
            uploadedFile.progress = 50
            uploadedFile.status = 'parsing'

            const data = await parseFile(file)
            uploadedFile.data = data
            uploadedFile.status = 'ready'
            uploadedFile.progress = 100
        } catch (error) {
            uploadedFile.status = 'error'
            uploadedFile.error = error instanceof Error ? error.message : 'Failed to parse file'
        }

        return uploadedFile
    }

    const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length)

        const processedFiles = await Promise.all(fileArray.map(processFile))
        const updatedFiles = [...files, ...processedFiles]
        setFiles(updatedFiles)

        const readyFiles = updatedFiles.filter(f => f.status === 'ready')
        if (readyFiles.length > 0) {
            onDataReady(readyFiles)
        }
    }, [files, maxFiles, onDataReady])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }, [handleFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files)
        }
    }, [handleFiles])

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        onFileRemove?.(fileId)
    }, [onFileRemove])

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                    'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                    isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                />

                <CloudArrowUpIcon className={clsx(
                    'h-12 w-12 mx-auto mb-4 transition-colors',
                    isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                )} />

                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {isDragging ? 'Drop files here' : 'Drag & drop your data files'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    or click to browse
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                    {['CSV', 'Excel', 'JSON', 'XML'].map(type => (
                        <span
                            key={type}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Files ({files.length}/{maxFiles})
                    </h4>

                    {files.map(file => (
                        <div
                            key={file.id}
                            className={clsx(
                                'p-4 rounded-lg border transition-all',
                                file.status === 'ready' && 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
                                file.status === 'error' && 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
                                (file.status === 'uploading' || file.status === 'parsing') && 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{FILE_ICONS[file.type]}</span>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatFileSize(file.size)} • {file.type.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {file.status === 'ready' && (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    )}
                                    {file.status === 'error' && (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                    )}
                                    {(file.status === 'uploading' || file.status === 'parsing') && (
                                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                                    )}
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                        <XMarkIcon className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Data Summary */}
                            {file.status === 'ready' && file.data && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <TableCellsIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {file.data.summary.rowCount.toLocaleString()} rows
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {file.data.summary.columnCount} columns
                                            </span>
                                        </div>
                                        {file.data.summary.suggestedTimestamp && (
                                            <div className="text-blue-600 dark:text-blue-400">
                                                📅 {file.data.summary.suggestedTimestamp}
                                            </div>
                                        )}
                                        {file.data.summary.suggestedPriceColumn && (
                                            <div className="text-green-600 dark:text-green-400">
                                                💰 {file.data.summary.suggestedPriceColumn}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {file.status === 'error' && file.error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{file.error}</p>
                            )}

                            {/* Progress Bar */}
                            {(file.status === 'uploading' || file.status === 'parsing') && (
                                <div className="mt-3">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {file.status === 'uploading' ? 'Uploading...' : 'Parsing data...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
