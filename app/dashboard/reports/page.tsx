'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DocumentTextIcon,
    ArrowDownTrayIcon,
    CalendarIcon,
    ChartBarIcon,
    TableCellsIcon,
    PrinterIcon,
    EnvelopeIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AIInsightsBar } from '@/components/dashboard/AIInsightsBar'
import toast from 'react-hot-toast'

/**
 * Dashboard Reports Page
 * 
 * Generate and download trading, compliance, and performance reports
 */

interface Report {
    id: string
    name: string
    type: 'trading' | 'compliance' | 'performance' | 'billing'
    status: 'ready' | 'generating' | 'scheduled'
    generatedAt: string
    size: string
    format: 'PDF' | 'Excel' | 'CSV'
}

const reportTemplates = [
    { id: 'daily-trading', name: 'Daily Trading Summary', type: 'trading', description: 'Daily trading activity, volumes, and P&L' },
    { id: 'weekly-performance', name: 'Weekly Performance', type: 'performance', description: 'Weekly KPIs, trends, and benchmarks' },
    { id: 'monthly-compliance', name: 'Monthly Compliance', type: 'compliance', description: 'Regulatory compliance and audit trail' },
    { id: 'quarterly-billing', name: 'Quarterly Billing', type: 'billing', description: 'Billing summary and invoice details' },
    { id: 'custom-analytics', name: 'Custom Analytics', type: 'performance', description: 'Customizable analytics report' }
]

const recentReports: Report[] = [
    { id: '1', name: 'Trading Report - Dec 19', type: 'trading', status: 'ready', generatedAt: '2 hours ago', size: '2.4 MB', format: 'PDF' },
    { id: '2', name: 'Weekly Performance - Week 51', type: 'performance', status: 'ready', generatedAt: '1 day ago', size: '1.8 MB', format: 'Excel' },
    { id: '3', name: 'Compliance Audit - Q4', type: 'compliance', status: 'generating', generatedAt: 'In progress', size: '-', format: 'PDF' },
    { id: '4', name: 'Billing Summary - Nov', type: 'billing', status: 'ready', generatedAt: '3 days ago', size: '856 KB', format: 'PDF' },
    { id: '5', name: 'Custom Analysis - Solar', type: 'performance', status: 'scheduled', generatedAt: 'Tomorrow 6:00 AM', size: '-', format: 'CSV' }
]

export default function ReportsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState('last-30')
    const [format, setFormat] = useState('PDF')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateReport = async () => {
        if (!selectedTemplate) return
        setIsGenerating(true)

        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate and download based on format
        const template = reportTemplates.find(t => t.id === selectedTemplate)
        downloadReport(template?.name || 'Report', format)

        setIsGenerating(false)
        toast.success(`${format} report generated successfully!`)
    }

    const downloadReport = (name: string, fmt: string) => {
        const fileName = `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
        let content = ''
        let mimeType = ''
        let extension = ''

        if (fmt === 'CSV') {
            content = generateCSVContent()
            mimeType = 'text/csv'
            extension = 'csv'
        } else if (fmt === 'Excel') {
            // For Excel, we create a simple TSV that Excel can open
            content = generateCSVContent('\t')
            mimeType = 'application/vnd.ms-excel'
            extension = 'xls'
        } else {
            // For PDF, create a text summary (real app would use jsPDF)
            content = generateTextContent(name)
            mimeType = 'text/plain'
            extension = 'txt' // Would be pdf with jsPDF
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.${extension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const generateCSVContent = (delimiter = ',') => {
        const headers = ['Date', 'Market', 'Volume (MWh)', 'Price (₹/MWh)', 'Revenue (₹)', 'P&L (₹)']
        const rows = [
            ['2024-12-19', 'DAM', '1250', '4532.50', '5665625', '+125000'],
            ['2024-12-19', 'RTM', '850', '4789.00', '4070650', '+85000'],
            ['2024-12-18', 'DAM', '1450', '4480.20', '6496290', '+145000'],
            ['2024-12-18', 'TAM', '620', '4345.75', '2694365', '+62000'],
            ['2024-12-17', 'GDAM', '380', '4120.00', '1565600', '+38000'],
        ]
        return [headers.join(delimiter), ...rows.map(r => r.join(delimiter))].join('\n')
    }

    const generateTextContent = (name: string) => {
        return `OptiBid Energy - ${name}\n\nGenerated: ${new Date().toLocaleString()}\nDate Range: ${dateRange}\n\n--- Trading Summary ---\nTotal Volume: 4,550 MWh\nTotal Revenue: ₹20,492,530\nNet P&L: +₹455,000\n\n--- By Market ---\nDAM: 2,700 MWh (₹12.2M)\nRTM: 850 MWh (₹4.1M)\nTAM: 620 MWh (₹2.7M)\nGDAM: 380 MWh (₹1.5M)`
    }

    const handleDownloadExisting = (report: Report) => {
        downloadReport(report.name, report.format)
        toast.success(`Downloading ${report.name}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className="transition-all duration-200"
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                                    <DocumentTextIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Reports
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Generate and download reports
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Report Generator */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Generate Report
                                </h2>

                                {/* Template Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Report Template
                                    </label>
                                    <div className="space-y-2">
                                        {reportTemplates.map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(template.id)}
                                                className={clsx(
                                                    'w-full text-left p-3 rounded-lg border-2 transition-all',
                                                    selectedTemplate === template.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                )}
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {template.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {template.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Date Range
                                    </label>
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="today">Today</option>
                                        <option value="last-7">Last 7 Days</option>
                                        <option value="last-30">Last 30 Days</option>
                                        <option value="last-90">Last 90 Days</option>
                                        <option value="this-month">This Month</option>
                                        <option value="this-quarter">This Quarter</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {/* Format */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Format
                                    </label>
                                    <div className="flex space-x-2">
                                        {['PDF', 'Excel', 'CSV'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFormat(f)}
                                                className={clsx(
                                                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                                                    format === f
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                )}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={!selectedTemplate}
                                        className="w-full flex items-center justify-center py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <ChartBarIcon className="h-5 w-5 mr-2" />
                                        Generate Report
                                    </button>
                                    <button
                                        className="w-full flex items-center justify-center py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                                    >
                                        <CalendarIcon className="h-5 w-5 mr-2" />
                                        Schedule Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reports */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Recent Reports
                                    </h2>
                                    <button className="text-sm text-blue-500 hover:text-blue-600">
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {recentReports.map(report => (
                                        <motion.div
                                            key={report.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={clsx(
                                                    'p-2 rounded-lg',
                                                    report.type === 'trading' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                                                    report.type === 'compliance' && 'bg-green-100 dark:bg-green-900/30 text-green-600',
                                                    report.type === 'performance' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
                                                    report.type === 'billing' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                                                )}>
                                                    <DocumentTextIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {report.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <span>{report.generatedAt}</span>
                                                        <span>•</span>
                                                        <span>{report.size}</span>
                                                        <span>•</span>
                                                        <span>{report.format}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {report.status === 'ready' && (
                                                    <>
                                                        <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors" title="Download">
                                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                                        </button>
                                                        <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors" title="Print">
                                                            <PrinterIcon className="h-5 w-5" />
                                                        </button>
                                                        <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors" title="Email">
                                                            <EnvelopeIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {report.status === 'generating' && (
                                                    <span className="flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm">
                                                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Generating
                                                    </span>
                                                )}
                                                {report.status === 'scheduled' && (
                                                    <span className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        Scheduled
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <AIInsightsBar />
            </div>
        </div>
    )
}
