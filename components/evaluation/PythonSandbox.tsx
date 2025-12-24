'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, ArrowPathIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export function PythonSandbox() {
    const [code, setCode] = useState(`# Define your custom model logic here
import pandas as pd
import numpy as np

def calculate_forecast(data):
    # Example: Simple moving average
    return data['price'].rolling(window=24).mean()

# Access available datasets
print("Loading market data...")
print("Ready to execute.")`)

    const [output, setOutput] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)

    const handleRun = () => {
        setIsRunning(true)
        setOutput([])

        // Simulate execution
        setTimeout(() => {
            setOutput(prev => [...prev, '> Initializing environment...'])
        }, 500)

        setTimeout(() => {
            setOutput(prev => [...prev, '> Loading libraries (pandas, numpy, scikit-learn)...'])
        }, 1500)

        setTimeout(() => {
            setOutput(prev => [...prev, '> Connecting to secure data context...'])
        }, 2500)

        setTimeout(() => {
            setIsRunning(false)
            setOutput(prev => [...prev, '> Execution completed successfully.', '>', '> Output:', '> Market Forecast Model generated.', '> Accuracy Score: 94.2% (Validated on Test Set)'])
        }, 4000)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <CodeBracketIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Python Sandbox</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Custom Model Environment (Isolated)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">
                        Production Preview
                    </span>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={clsx(
                            "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                            isRunning
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                        )}
                    >
                        {isRunning ? (
                            <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                            <PlayIcon className="h-4 w-4 mr-1.5" />
                        )}
                        {isRunning ? 'Running...' : 'Run Model'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Editor Area */}
                <div className="flex-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex-1 relative">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Console Output */}
                <div className="w-full md:w-1/3 bg-gray-900 text-gray-300 font-mono text-xs p-4 overflow-y-auto flex flex-col">
                    <div className="mb-2 text-gray-500 uppercase tracking-wider font-bold text-[10px]">Console Output</div>
                    <div className="space-y-1">
                        <div className="text-green-500">$ python3 model_script.py</div>
                        {output.map((line, i) => (
                            <div key={i} className="break-words">{line}</div>
                        ))}
                        {isRunning && (
                            <div className="animate-pulse">_</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
