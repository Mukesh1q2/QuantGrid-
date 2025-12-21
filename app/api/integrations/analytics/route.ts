import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import { Matrix } from 'ml-matrix';
import jwt from 'jsonwebtoken';

// Analytics Engine for advanced metrics and KPIs
class AnalyticsEngine {
  
  // Calculate moving average
  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(0);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
        result.push(average);
      }
    }
    
    return result;
  }
  
  // Calculate exponential moving average
  calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first value
    if (data.length > 0) {
      result.push(data[0]);
      
      for (let i = 1; i < data.length; i++) {
        const ema = (data[i] * multiplier) + (result[i - 1] * (1 - multiplier));
        result.push(ema);
      }
    }
    
    return result;
  }
  
  // Calculate volatility
  calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / (data.length - 1);
    
    return Math.sqrt(variance);
  }
  
  // Calculate correlation coefficient
  calculateCorrelation(data1: number[], data2: number[]): number {
    if (data1.length !== data2.length || data1.length === 0) return 0;
    
    const n = data1.length;
    const mean1 = data1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = data2.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let sumSquared1 = 0;
    let sumSquared2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSquared1 += diff1 * diff1;
      sumSquared2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSquared1 * sumSquared2);
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  // Calculate Sharpe ratio
  calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;
    
    const excessReturns = returns.map(r => r - (riskFreeRate / 252)); // Daily risk-free rate
    const meanExcessReturn = excessReturns.reduce((sum, val) => sum + val, 0) / excessReturns.length;
    const volatility = this.calculateVolatility(returns);
    
    return volatility === 0 ? 0 : (meanExcessReturn * Math.sqrt(252)) / (volatility * Math.sqrt(252));
  }
  
  // Calculate Value at Risk (VaR)
  calculateVaR(returns: number[], confidenceLevel: number = 0.05): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidenceLevel * sortedReturns.length);
    
    return sortedReturns[index] || 0;
  }
  
  // Calculate maximum drawdown
  calculateMaxDrawdown(prices: number[]): number {
    if (prices.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i];
      } else {
        const drawdown = (peak - prices[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }
  
  // Energy-specific metrics
  calculateEnergyMetrics(data: Array<{
    timestamp: string;
    powerOutput: number;
    efficiency: number;
    price: number;
    demand: number;
  }>) {
    const powerOutputs = data.map(d => d.powerOutput);
    const efficiencies = data.map(d => d.efficiency);
    const prices = data.map(d => d.price);
    const demands = data.map(d => d.demand);
    
    return {
      averagePowerOutput: powerOutputs.reduce((sum, val) => sum + val, 0) / powerOutputs.length,
      averageEfficiency: efficiencies.reduce((sum, val) => sum + val, 0) / efficiencies.length,
      averagePrice: prices.reduce((sum, val) => sum + val, 0) / prices.length,
      totalEnergyProduced: powerOutputs.reduce((sum, val) => sum + val, 0),
      priceVolatility: this.calculateVolatility(prices),
      demandCorrelation: this.calculateCorrelation(demands, prices),
      efficiencyTrend: this.calculateEMA(efficiencies, 7)
    };
  }
  
  // Performance benchmarking
  benchmarkPerformance(metrics: {
    returns: number[];
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }) {
    const benchmarks = {
      excellent: { sharpe: 2.0, volatility: 0.15, drawdown: 0.10 },
      good: { sharpe: 1.5, volatility: 0.20, drawdown: 0.15 },
      average: { sharpe: 1.0, volatility: 0.25, drawdown: 0.20 },
      belowAverage: { sharpe: 0.5, volatility: 0.30, drawdown: 0.25 }
    };
    
    let rating = 'poor';
    let score = 0;
    
    if (metrics.sharpeRatio >= benchmarks.excellent.sharpe && 
        metrics.volatility <= benchmarks.excellent.volatility && 
        metrics.maxDrawdown <= benchmarks.excellent.drawdown) {
      rating = 'excellent';
      score = 95;
    } else if (metrics.sharpeRatio >= benchmarks.good.sharpe && 
               metrics.volatility <= benchmarks.good.volatility && 
               metrics.maxDrawdown <= benchmarks.good.drawdown) {
      rating = 'good';
      score = 85;
    } else if (metrics.sharpeRatio >= benchmarks.average.sharpe && 
               metrics.volatility <= benchmarks.average.volatility && 
               metrics.maxDrawdown <= benchmarks.average.drawdown) {
      rating = 'average';
      score = 75;
    } else if (metrics.sharpeRatio >= benchmarks.belowAverage.sharpe && 
               metrics.volatility <= benchmarks.belowAverage.volatility && 
               metrics.maxDrawdown <= benchmarks.belowAverage.drawdown) {
      rating = 'belowAverage';
      score = 65;
    } else {
      score = 50;
    }
    
    return {
      rating,
      score,
      benchmarks,
      metrics,
      percentileRank: this.calculatePercentileRank(metrics.sharpeRatio, [0.5, 1.0, 1.5, 2.0, 2.5])
    };
  }
  
  // Calculate percentile rank
  calculatePercentileRank(value: number, benchmarkValues: number[]): number {
    const sortedBenchmarks = [...benchmarkValues].sort((a, b) => a - b);
    const index = sortedBenchmarks.findIndex(benchmark => benchmark >= value);
    
    if (index === -1) return 100;
    if (index === 0) return 0;
    
    return Math.round((index / sortedBenchmarks.length) * 100);
  }
}

// Initialize analytics engine
const analyticsEngine = new AnalyticsEngine();

// Generate mock energy data for analytics
function generateMockEnergyData(days: number = 30) {
  const data = [];
  const baseDate = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Generate realistic energy trading data
    const basePower = 100 + Math.random() * 50; // 100-150 MW
    const efficiency = 0.85 + Math.random() * 0.10; // 85-95%
    const price = 0.045 + (Math.random() - 0.5) * 0.020; // ±10% variance
    const demand = 200 + Math.random() * 100; // 200-300 MW
    
    data.push({
      timestamp: date.toISOString(),
      powerOutput: Math.round(basePower * 10) / 10,
      efficiency: Math.round(efficiency * 1000) / 1000,
      price: Math.round(price * 1000) / 1000,
      demand: Math.round(demand * 10) / 10
    });
  }
  
  return data;
}

// Calculate returns from price data
function calculateReturns(prices: number[]): number[] {
  const returns = [];
  
  for (let i = 1; i < prices.length; i++) {
    const returnRate = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(returnRate);
  }
  
  return returns;
}

// Analytics API endpoints
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const timeframe = searchParams.get('timeframe') || '30d';
  
  try {
    if (action === 'overview') {
      const energyData = generateMockEnergyData(parseInt(timeframe.replace('d', '')));
      const metrics = analyticsEngine.calculateEnergyMetrics(energyData);
      const priceReturns = calculateReturns(energyData.map(d => d.price));
      
      const performance = analyticsEngine.benchmarkPerformance({
        returns: priceReturns,
        volatility: analyticsEngine.calculateVolatility(priceReturns),
        sharpeRatio: analyticsEngine.calculateSharpeRatio(priceReturns),
        maxDrawdown: analyticsEngine.calculateMaxDrawdown(energyData.map(d => d.price))
      });
      
      return createApiResponse({
        overview: {
          totalDataPoints: energyData.length,
          timeframe,
          lastUpdated: new Date().toISOString()
        },
        metrics,
        performance,
        technicalAnalysis: {
          movingAverages: {
            sma7: analyticsEngine.calculateMovingAverage(energyData.map(d => d.price), 7),
            ema14: analyticsEngine.calculateEMA(energyData.map(d => d.price), 14)
          },
          volatility: analyticsEngine.calculateVolatility(priceReturns),
          correlation: analyticsEngine.calculateCorrelation(
            energyData.map(d => d.demand),
            energyData.map(d => d.price)
          )
        }
      });
    }
    
    if (action === 'risk-metrics') {
      const energyData = generateMockEnergyData(parseInt(timeframe.replace('d', '')));
      const priceReturns = calculateReturns(energyData.map(d => d.price));
      
      return createApiResponse({
        riskMetrics: {
          var95: analyticsEngine.calculateVaR(priceReturns, 0.05),
          var99: analyticsEngine.calculateVaR(priceReturns, 0.01),
          maxDrawdown: analyticsEngine.calculateMaxDrawdown(energyData.map(d => d.price)),
          volatility: analyticsEngine.calculateVolatility(priceReturns),
          sharpeRatio: analyticsEngine.calculateSharpeRatio(priceReturns)
        },
        riskAssessment: {
          level: 'medium',
          recommendation: 'Monitor price volatility and adjust trading strategy accordingly',
          nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    if (action === 'custom-metric') {
      const metric = searchParams.get('metric');
      const energyData = generateMockEnergyData(parseInt(timeframe.replace('d', '')));
      
      if (!metric) {
        return createApiError('Metric parameter is required', 'MISSING_METRIC', 400);
      }
      
      const result = {
        metric,
        timeframe,
        data: []
      };
      
      switch (metric) {
        case 'efficiency_trend':
          result.data = analyticsEngine.calculateEMA(energyData.map(d => d.efficiency), 7);
          break;
        case 'price_volatility':
          result.data = analyticsEngine.calculateVolatility(energyData.map(d => d.price));
          break;
        case 'demand_correlation':
          result.data = analyticsEngine.calculateCorrelation(
            energyData.map(d => d.demand),
            energyData.map(d => d.price)
          );
          break;
        default:
          return createApiError('Unknown metric', 'UNKNOWN_METRIC', 400);
      }
      
      return createApiResponse(result);
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'ANALYTICS_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }
  
  try {
    const requestData = await req.json();
    const { action, data, parameters } = requestData;
    
    if (action === 'calculate') {
      const { metric, values } = parameters;
      
      if (!metric || !values || !Array.isArray(values)) {
        return createApiError('Missing required parameters: metric, values', 'MISSING_PARAMETERS', 400);
      }
      
      let result: any;
      
      switch (metric) {
        case 'moving_average':
          result = analyticsEngine.calculateMovingAverage(values, parameters.windowSize || 7);
          break;
        case 'exponential_moving_average':
          result = analyticsEngine.calculateEMA(values, parameters.period || 14);
          break;
        case 'volatility':
          result = analyticsEngine.calculateVolatility(values);
          break;
        case 'correlation':
          if (!parameters.secondSeries) {
            return createApiError('Second series required for correlation', 'MISSING_SECOND_SERIES', 400);
          }
          result = analyticsEngine.calculateCorrelation(values, parameters.secondSeries);
          break;
        case 'sharpe_ratio':
          result = analyticsEngine.calculateSharpeRatio(values, parameters.riskFreeRate || 0.02);
          break;
        default:
          return createApiError('Unknown metric', 'UNKNOWN_METRIC', 400);
      }
      
      return createApiResponse({
        metric,
        result,
        parameters,
        calculatedAt: new Date().toISOString()
      });
    }
    
    return createApiError('Invalid action', 'INVALID_ACTION', 400);
    
  } catch (error: any) {
    return createApiError(error.message, 'ANALYTICS_CALCULATION_ERROR', 500);
  }
}