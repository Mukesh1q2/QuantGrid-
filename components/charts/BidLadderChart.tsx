'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface BidStackItem {
    price: number;
    volume: number;
    cumulativeVolume: number;
    type: 'buy' | 'sell';
}

interface BidLadderChartProps {
    buyBids?: BidStackItem[];
    sellBids?: BidStackItem[];
    mcp?: number;
    mcv?: number;
    height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    Volume: {label} MW
                </p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {entry.name}: {entry.value} Rs/kWh
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function BidLadderChart({
    buyBids = [],
    sellBids = [],
    mcp = 4.5,
    mcv = 500,
    height = 400
}: BidLadderChartProps) {
    // Generate sample data if none provided (for visualization)
    const generateSampleData = () => {
        const data = [];

        // Generate Buy Bids (Demand) - Downward sloping
        // Price high -> low as volume increases
        let currentVol = 0;
        for (let price = 10; price >= 0; price -= 0.5) {
            const vol = 50 + Math.random() * 50;
            currentVol += vol;
            data.push({
                volume: currentVol,
                buyPrice: price,
                sellPrice: null,
                type: 'buy'
            });
        }

        // Generate Sell Bids (Supply) - Upward sloping
        // Price low -> high as volume increases
        currentVol = 0;
        for (let price = 0; price <= 10; price += 0.5) {
            const vol = 50 + Math.random() * 50;
            currentVol += vol;
            data.push({
                volume: currentVol,
                buyPrice: null,
                sellPrice: price,
                type: 'sell'
            });
        }

        // Sort by volume for the chart x-axis
        return data.sort((a, b) => a.volume - b.volume);
    };

    const chartData = (buyBids.length === 0 && sellBids.length === 0)
        ? generateSampleData()
        : [
            ...buyBids.map(b => ({ volume: b.cumulativeVolume, buyPrice: b.price, sellPrice: null })),
            ...sellBids.map(s => ({ volume: s.cumulativeVolume, buyPrice: null, sellPrice: s.price }))
        ].sort((a, b) => a.volume - b.volume);

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Market Bid Ladder
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Demand (Buy) vs Supply (Sell) curves with Market Clearing Price
                    </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-gray-600 dark:text-gray-300">Buy Bids</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-gray-600 dark:text-gray-300">Sell Bids</span>
                    </div>
                </div>
            </div>

            <div style={{ height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="volume"
                            type="number"
                            label={{
                                value: 'Cumulative Volume (MW)',
                                position: 'bottom',
                                offset: 0,
                                fill: '#6B7280'
                            }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis
                            label={{
                                value: 'Price (Rs/kWh)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#6B7280'
                            }}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            domain={[0, 12]}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Buy Bids Curve (Demand) */}
                        <Line
                            type="stepAfter"
                            dataKey="buyPrice"
                            name="Buy Bid"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />

                        {/* Sell Bids Curve (Supply) */}
                        <Line
                            type="stepAfter"
                            dataKey="sellPrice"
                            name="Sell Bid"
                            stroke="#EAB308"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />

                        {/* Market Clearing Points */}
                        <ReferenceLine
                            y={mcp}
                            stroke="#10B981"
                            strokeDasharray="5 5"
                            label={{
                                value: `MCP: ₹${mcp}`,
                                position: 'right',
                                fill: '#10B981',
                                fontSize: 12
                            }}
                        />
                        <ReferenceLine
                            x={mcv}
                            stroke="#8B5CF6"
                            strokeDasharray="5 5"
                            label={{
                                value: `MCV: ${mcv} MW`,
                                position: 'top',
                                fill: '#8B5CF6',
                                fontSize: 12
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Market Clearing Price</p>
                    <p className="text-lg font-bold text-green-600">₹{mcp}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Market Clearing Volume</p>
                    <p className="text-lg font-bold text-purple-600">{mcv} MW</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Buy Bids</p>
                    <p className="text-lg font-bold text-blue-600">
                        {chartData.filter(d => d.buyPrice !== null).length} Bids
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Sell Bids</p>
                    <p className="text-lg font-bold text-yellow-600">
                        {chartData.filter(d => d.sellPrice !== null).length} Bids
                    </p>
                </div>
            </div>
        </div>
    );
}
