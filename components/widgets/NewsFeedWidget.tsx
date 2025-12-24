'use client';

import React from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';

export function NewsFeedWidget() {
    const newsItems = [
        { title: 'IEX Volume Hits Record High in Q3', time: '2h ago', source: 'Energy Weekly' },
        { title: 'New Solar Policy Announced by Govt', time: '4h ago', source: 'Power India' },
        { title: 'Coal Reserves Stable Across Plants', time: '6h ago', source: 'Grid News' },
        { title: 'Wind Generation Peaks in Southern Grid', time: '1d ago', source: 'Renewable Watch' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <NewspaperIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Market News
                </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto">
                {newsItems.map((item, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight mb-1">
                            {item.title}
                        </h4>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{item.source}</span>
                            <span>{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
