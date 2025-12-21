'use client'

import React, { useState, useCallback } from 'react'
import {
    CloudArrowUpIcon,
    CodeBracketIcon,
    DocumentIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface CustomModelUploadProps {
    onModelUploaded: (file: File) => void
    onRunModel: () => void
    status: 'idle' | 'uploading' | 'ready' | 'running' | 'complete' | 'error'
    modelFile: File | null
    results?: any
}

export default function CustomModelUpload({
    onModelUploaded,
    onRunModel,
    status,
    modelFile,
    results
}: CustomModelUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        setError(null)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            validateAndUpload(files[0])
        }
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)
        const files = e.target.files
        if (files && files[0]) {
            validateAndUpload(files[0])
        }
    }, [])

    const validateAndUpload = (file: File) => {
        // Check file extension
        const validExtensions = ['.py', '.ipynb', '.pickle', '.pkl', '.joblib', '.h5', '.onnx']
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()

        if (!validExtensions.includes(ext)) {
            setError(`Invalid file type. Supported: ${validExtensions.join(', ')}`)
            return
        }

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('File too large. Maximum 50MB allowed.')
            return
        }

        onModelUploaded(file)
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'uploading':
            case 'running':
                return <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
            case 'ready':
            case 'complete':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />
            case 'error':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            default:
                return <CodeBracketIcon className="h-5 w-5 text-gray-400" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Uploading model...'
            case 'ready':
                return 'Model ready to run'
            case 'running':
                return 'Executing model...'
            case 'complete':
                return 'Execution complete!'
            case 'error':
                return 'Execution failed'
            default:
                return 'No model uploaded'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CodeBracketIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Custom Optimization Model
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Upload and run your own Python optimization model
                    </p>
                </div>
            </div>

            {/* Supported Formats Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Supported Formats
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
                    <div className="flex items-center space-x-2">
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">.py</span>
                        <span>Python script</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">.ipynb</span>
                        <span>Jupyter Notebook</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">.pickle/.pkl</span>
                        <span>Serialized model</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">.onnx/.h5</span>
                        <span>ML model format</span>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={clsx(
                    'relative border-2 border-dashed rounded-xl p-8 text-center transition-all',
                    dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                )}
            >
                <input
                    type="file"
                    accept=".py,.ipynb,.pickle,.pkl,.joblib,.h5,.onnx"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {modelFile ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-3">
                            {getStatusIcon()}
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {modelFile.name}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(modelFile.size / 1024).toFixed(1)} KB • {getStatusText()}
                        </p>
                    </div>
                ) : (
                    <>
                        <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                            Drag & drop your model file here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            or click to browse (max 50MB)
                        </p>
                    </>
                )}
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Model Requirements Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Requirements
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Python script must define a <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">run_optimization(data, config)</code> function</li>
                    <li>• Input: DataFrame with mapped columns, optimization config dict</li>
                    <li>• Output: dict with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">results</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">metrics</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">recommendations</code></li>
                    <li>• Supported libraries: pandas, numpy, scipy, scikit-learn, cvxpy, ortools</li>
                </ul>
            </div>

            {/* Run Button */}
            <button
                onClick={onRunModel}
                disabled={!modelFile || status === 'running' || status === 'uploading'}
                className={clsx(
                    'w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all',
                    modelFile && status !== 'running' && status !== 'uploading'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                )}
            >
                {status === 'running' ? (
                    <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>Running Model...</span>
                    </>
                ) : (
                    <>
                        <PlayIcon className="h-5 w-5" />
                        <span>Run Custom Model</span>
                    </>
                )}
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Custom models run in a sandboxed environment. Execution time limit: 60 seconds.
            </p>
        </div>
    )
}
