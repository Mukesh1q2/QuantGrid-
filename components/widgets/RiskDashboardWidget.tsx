'use client';

import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function RiskDashboardWidget() {
    const riskMetrics = [
        { label: 'Value at Risk (VaR)', value: '₹12.5L', status: 'normal', change: '-2.1%' },
        { label: 'Sharpe Ratio', value: '2.4', status: 'good', change: '+0.3' },
        { label: 'Portfolio Beta', value: '0.85', status: 'normal', change: '0.0' },
        { label: 'Volatility (30d)', value: '14.2%', status: 'warning', change: '+1.5%' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Risk Management
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    Safe
                </span>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
                {riskMetrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</p>
                        </div>
                        <div className={`text-sm font-medium ${metric.status === 'good' ? 'text-green-600' :
                                metric.status === 'warning' ? 'text-yellow-600' :
                                    'text-gray-600 dark:text-gray-300'
                            }`}>
                            {metric.change}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
