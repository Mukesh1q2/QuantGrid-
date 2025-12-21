'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChartBarIcon,
  MapIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  BoltIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  CpuChipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface Widget {
  id: string
  name: string
  description: string
  category: string
  icon: any
  preview: string
  configSchema: any
  permissions: string[]
  isCustom?: boolean
  tags: string[]
  popularity: number
  lastUpdated: string
}

interface WidgetLibraryProps {
  isOpen: boolean
  onClose: () => void
  onWidgetAdd: (widgetConfig: any) => void
  userPermissions: string[]
  existingWidgets?: any[] // Optional: for calculating smart placement
}

// Smart placement helper - finds the next available position in the grid
const findNextAvailablePosition = (
  existingWidgets: any[] = [],
  newWidth: number = 4,
  newHeight: number = 4,
  gridCols: number = 12
): { x: number; y: number } => {
  if (existingWidgets.length === 0) {
    return { x: 0, y: 0 }
  }

  // Create a grid map to track occupied cells
  const occupied: boolean[][] = []
  let maxY = 0

  // Mark all occupied cells
  existingWidgets.forEach(widget => {
    const pos = widget.position || { x: 0, y: 0, w: 4, h: 4 }
    for (let row = pos.y; row < pos.y + pos.h; row++) {
      for (let col = pos.x; col < pos.x + pos.w; col++) {
        if (!occupied[row]) occupied[row] = []
        occupied[row][col] = true
        maxY = Math.max(maxY, row + 1)
      }
    }
  })

  // Find the first position where the new widget fits
  for (let y = 0; y <= maxY + newHeight; y++) {
    for (let x = 0; x <= gridCols - newWidth; x++) {
      let canPlace = true
      for (let dy = 0; dy < newHeight && canPlace; dy++) {
        for (let dx = 0; dx < newWidth && canPlace; dx++) {
          if (occupied[y + dy]?.[x + dx]) {
            canPlace = false
          }
        }
      }
      if (canPlace) {
        return { x, y }
      }
    }
  }

  // Fallback: place at the bottom
  return { x: 0, y: maxY }
}

const WIDGET_CATEGORIES = [
  { id: 'analytics', name: 'Analytics & Charts', icon: ChartBarIcon, color: 'blue' },
  { id: 'metrics', name: 'KPI Metrics', icon: CubeIcon, color: 'green' },
  { id: 'real-time', name: 'Real-time Data', icon: ClockIcon, color: 'red' },
  { id: 'geographic', name: 'Geographic', icon: MapIcon, color: 'purple' },
  { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon, color: 'yellow' },
  { id: 'team', name: 'Team & Collaboration', icon: UsersIcon, color: 'indigo' },
  { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon, color: 'gray' },
  { id: 'energy', name: 'Energy Specific', icon: BoltIcon, color: 'emerald' },
  { id: 'trading', name: 'Trading Tools', icon: ArrowTrendingUpIcon, color: 'orange' }
]

const AVAILABLE_WIDGETS: Widget[] = [
  // IEX India Energy Market Widgets (Live Data)
  {
    id: 'iex-india-live-prices',
    name: 'IEX India Live Prices',
    description: 'Real-time electricity prices from Indian Energy Exchange with live updates',
    category: 'real-time',
    icon: BoltIcon,
    preview: 'chart-line',
    configSchema: {
      market: { type: 'select', options: ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'] },
      region: { type: 'select', options: ['All India', 'Northern', 'Southern', 'Western', 'Eastern', 'North-Eastern'] },
      refreshInterval: { type: 'select', options: ['10s', '30s', '1m', '5m'] }
    },
    permissions: [], // No permission required - available to all
    tags: ['IEX', 'India', 'live', 'prices', 'real-time'],
    popularity: 99,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'iex-india-market-volume',
    name: 'IEX Market Volume',
    description: 'Trading volume and cleared volume from IEX India markets',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'chart-bar',
    configSchema: {
      market: { type: 'select', options: ['DAM', 'RTM', 'TAM', 'All Markets'] },
      timeRange: { type: 'select', options: ['Today', '7 Days', '30 Days', '90 Days'] },
      showComparison: { type: 'boolean' }
    },
    permissions: [],
    tags: ['IEX', 'India', 'volume', 'trading'],
    popularity: 96,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'iex-india-price-forecast',
    name: 'IEX Price Forecast',
    description: 'AI-powered price forecasting for Indian electricity markets',
    category: 'analytics',
    icon: ArrowTrendingUpIcon,
    preview: 'chart-area',
    configSchema: {
      forecastHorizon: { type: 'select', options: ['24 Hours', '48 Hours', '7 Days'] },
      confidenceInterval: { type: 'select', options: ['80%', '90%', '95%'] },
      showHistorical: { type: 'boolean' }
    },
    permissions: [],
    tags: ['IEX', 'India', 'forecast', 'AI', 'prediction'],
    popularity: 94,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'iex-india-renewable-mix',
    name: 'India Renewable Energy Mix',
    description: 'Real-time renewable energy generation mix across India',
    category: 'energy',
    icon: GlobeAltIcon,
    preview: 'pie-chart',
    configSchema: {
      energyType: { type: 'multiselect', options: ['Solar', 'Wind', 'Hydro', 'Biomass', 'Nuclear'] },
      region: { type: 'select', options: ['All India', 'Northern', 'Southern', 'Western', 'Eastern'] },
      showTrend: { type: 'boolean' }
    },
    permissions: [],
    tags: ['IEX', 'India', 'renewable', 'solar', 'wind'],
    popularity: 92,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'iex-india-demand-supply',
    name: 'India Demand-Supply Balance',
    description: 'Real-time demand and supply balance across Indian power grid',
    category: 'real-time',
    icon: PresentationChartLineIcon,
    preview: 'chart-dual',
    configSchema: {
      region: { type: 'select', options: ['All India', 'Northern', 'Southern', 'Western', 'Eastern', 'North-Eastern'] },
      showForecast: { type: 'boolean' },
      alertThreshold: { type: 'select', options: ['5%', '10%', '15%', '20%'] }
    },
    permissions: [],
    tags: ['IEX', 'India', 'demand', 'supply', 'grid'],
    popularity: 91,
    lastUpdated: '2024-12-01'
  },
  // Standard Energy Widgets
  {
    id: 'energy-generation-chart',
    name: 'Energy Generation Chart',
    description: 'Track energy generation across different assets with time-series visualization',
    category: 'energy',
    icon: BoltIcon,
    preview: 'chart-line',
    configSchema: {
      dataSource: { type: 'select', options: ['solar', 'wind', 'hydro', 'all'] },
      timeRange: { type: 'select', options: ['1h', '24h', '7d', '30d'] },
      aggregation: { type: 'select', options: ['sum', 'average', 'max', 'min'] }
    },
    permissions: [],
    tags: ['energy', 'generation', 'renewable'],
    popularity: 95,
    lastUpdated: '2024-01-15'
  },
  {
    id: 'market-prices-widget',
    name: 'Market Prices Tracker',
    description: 'Real-time electricity market prices with trend analysis',
    category: 'financial',
    icon: CurrencyDollarIcon,
    preview: 'chart-area',
    configSchema: {
      marketZone: { type: 'select', options: ['PJM', 'CAISO', 'ERCOT', 'NYISO', 'IEX-India'] },
      priceType: { type: 'select', options: ['LMP', 'Energy', 'Capacity', 'MCP'] },
      showTrend: { type: 'boolean' }
    },
    permissions: [],
    tags: ['market', 'prices', 'trading'],
    popularity: 88,
    lastUpdated: '2024-01-20'
  },
  {
    id: 'asset-status-grid',
    name: 'Asset Status Grid',
    description: 'Visual grid showing status of all energy assets with real-time updates',
    category: 'energy',
    icon: CubeIcon,
    preview: 'grid',
    configSchema: {
      assetTypes: { type: 'multiselect', options: ['solar', 'wind', 'battery', 'thermal'] },
      showMetrics: { type: 'boolean' },
      refreshInterval: { type: 'select', options: ['30s', '1m', '5m'] }
    },
    permissions: [],
    tags: ['assets', 'status', 'grid'],
    popularity: 92,
    lastUpdated: '2024-01-18'
  },
  {
    id: 'performance-kpis',
    name: 'Performance KPIs',
    description: 'Key performance indicators with targets and current values',
    category: 'metrics',
    icon: PresentationChartLineIcon,
    preview: 'kpi-cards',
    configSchema: {
      kpiType: { type: 'select', options: ['generation', 'revenue', 'efficiency', 'all'] },
      comparisonPeriod: { type: 'select', options: ['previous-period', 'target', 'industry'] }
    },
    permissions: [],
    tags: ['kpi', 'performance', 'targets'],
    popularity: 85,
    lastUpdated: '2024-01-12'
  },
  {
    id: 'geographic-map',
    name: 'Geographic Asset Map',
    description: 'Interactive map showing asset locations with real-time status',
    category: 'geographic',
    icon: MapIcon,
    preview: 'map',
    configSchema: {
      mapType: { type: 'select', options: ['satellite', 'terrain', 'street'] },
      showClusters: { type: 'boolean' },
      highlightBy: { type: 'select', options: ['status', 'capacity', 'generation'] }
    },
    permissions: [],
    tags: ['map', 'geographic', 'assets'],
    popularity: 76,
    lastUpdated: '2024-01-10'
  },
  {
    id: 'trading-dashboard',
    name: 'Trading Dashboard',
    description: 'Comprehensive trading interface with bid tracking and market analysis',
    category: 'financial',
    icon: ArrowTrendingUpIcon,
    preview: 'trading',
    configSchema: {
      marketZone: { type: 'select', options: ['PJM', 'CAISO', 'ERCOT', 'NYISO', 'MISO', 'IEX-India'] },
      showOrders: { type: 'boolean' },
      timeHorizon: { type: 'select', options: ['day-ahead', 'real-time', 'ancillary'] }
    },
    permissions: [],
    tags: ['trading', 'bids', 'market'],
    popularity: 82,
    lastUpdated: '2024-01-22'
  },
  {
    id: 'team-activity-feed',
    name: 'Team Activity Feed',
    description: 'Real-time feed of team member activities and collaborations',
    category: 'team',
    icon: ChatBubbleLeftRightIcon,
    preview: 'activity',
    configSchema: {
      teamMembers: { type: 'multiselect', options: [] },
      activityTypes: { type: 'multiselect', options: ['comments', 'edits', 'shares', 'all'] }
    },
    permissions: [],
    tags: ['team', 'activity', 'collaboration'],
    popularity: 68,
    lastUpdated: '2024-01-08'
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Generate compliance reports for regulatory requirements',
    category: 'reports',
    icon: ShieldCheckIcon,
    preview: 'report',
    configSchema: {
      reportType: { type: 'select', options: ['monthly', 'quarterly', 'annual'] },
      includeCharts: { type: 'boolean' },
      format: { type: 'select', options: ['pdf', 'excel', 'both'] }
    },
    permissions: [],
    tags: ['compliance', 'reports', 'regulatory'],
    popularity: 74,
    lastUpdated: '2024-01-14'
  },
  // AI & Quantum Widgets
  {
    id: 'ai-price-prediction',
    name: 'AI Price Prediction',
    description: 'Machine learning powered price predictions with 94% accuracy',
    category: 'analytics',
    icon: ArrowTrendingUpIcon,
    preview: 'ai-chart',
    configSchema: {
      model: { type: 'select', options: ['LSTM', 'Transformer', 'XGBoost', 'Ensemble'] },
      horizon: { type: 'select', options: ['1h', '4h', '24h', '7d'] },
      showConfidence: { type: 'boolean' }
    },
    permissions: [],
    tags: ['AI', 'prediction', 'machine-learning'],
    popularity: 90,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'quantum-optimization',
    name: 'Quantum Portfolio Optimizer',
    description: 'Quantum-enhanced portfolio optimization for energy assets',
    category: 'analytics',
    icon: CubeIcon,
    preview: 'quantum',
    configSchema: {
      algorithm: { type: 'select', options: ['QAOA', 'VQE', 'Quantum Annealing'] },
      riskTolerance: { type: 'select', options: ['Low', 'Medium', 'High'] },
      rebalanceFrequency: { type: 'select', options: ['Daily', 'Weekly', 'Monthly'] }
    },
    permissions: [],
    tags: ['quantum', 'optimization', 'portfolio'],
    popularity: 85,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'real-time-alerts',
    name: 'Real-time Alerts',
    description: 'Customizable alerts for price changes, grid events, and market conditions',
    category: 'real-time',
    icon: ClockIcon,
    preview: 'alerts',
    configSchema: {
      alertTypes: { type: 'multiselect', options: ['Price Spike', 'Grid Emergency', 'Volume Surge', 'Forecast Deviation'] },
      threshold: { type: 'select', options: ['5%', '10%', '15%', '20%'] },
      notificationMethod: { type: 'select', options: ['In-App', 'Email', 'SMS', 'All'] }
    },
    permissions: [],
    tags: ['alerts', 'notifications', 'real-time'],
    popularity: 88,
    lastUpdated: '2024-12-01'
  },
  // Premium Widgets
  {
    id: 'portfolio-analytics',
    name: 'Portfolio Performance Analytics',
    description: 'Comprehensive portfolio metrics with P&L, risk analysis, Sharpe ratio, and benchmark comparison',
    category: 'financial',
    icon: ChartBarIcon,
    preview: 'portfolio',
    configSchema: {
      view: { type: 'select', options: ['Full', 'Compact'] },
      benchmark: { type: 'select', options: ['Market Index', 'Custom', 'None'] },
      timeframe: { type: 'select', options: ['1D', '1W', '1M', '3M', '1Y'] }
    },
    permissions: [],
    tags: ['portfolio', 'analytics', 'P&L', 'risk', 'premium'],
    popularity: 97,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'ai-trading-signals',
    name: 'AI Trading Signals',
    description: 'ML-powered buy/sell recommendations with confidence scores and explainable AI insights',
    category: 'analytics',
    icon: ArrowTrendingUpIcon,
    preview: 'ai-signals',
    configSchema: {
      showConfidence: { type: 'boolean' },
      minConfidence: { type: 'select', options: ['60%', '70%', '80%', '90%'] },
      autoExecute: { type: 'boolean' }
    },
    permissions: [],
    tags: ['AI', 'trading', 'signals', 'ML', 'premium'],
    popularity: 95,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'weather-impact',
    name: 'Weather Impact Predictor',
    description: 'Weather conditions and their predicted impact on solar/wind generation, demand, and prices',
    category: 'energy',
    icon: GlobeAltIcon,
    preview: 'weather',
    configSchema: {
      location: { type: 'select', options: ['All India', 'Northern', 'Southern', 'Western', 'Eastern'] },
      showForecast: { type: 'boolean' },
      showAlerts: { type: 'boolean' }
    },
    permissions: [],
    tags: ['weather', 'forecast', 'solar', 'wind', 'premium'],
    popularity: 93,
    lastUpdated: '2024-12-01'
  },
  // Premium Trading Widgets
  {
    id: 'order-book',
    name: 'Order Book',
    description: 'Real-time bid/ask visualization with depth bars and spread indicator for any market',
    category: 'trading',
    icon: TableCellsIcon,
    preview: 'orderbook',
    configSchema: {
      market: { type: 'select', options: ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'] },
      depth: { type: 'select', options: ['5 levels', '10 levels', '15 levels', '20 levels'] },
      showSpread: { type: 'boolean' }
    },
    permissions: [],
    tags: ['orderbook', 'trading', 'bids', 'asks', 'premium', 'depth'],
    popularity: 96,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'trade-ticker',
    name: 'Trade Ticker',
    description: 'Live streaming feed of executed trades across all markets with price direction and volume',
    category: 'trading',
    icon: ClockIcon,
    preview: 'ticker',
    configSchema: {
      markets: { type: 'multiselect', options: ['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'] },
      maxTrades: { type: 'select', options: ['10', '15', '20', '25', '50'] },
      showAnimations: { type: 'boolean' }
    },
    permissions: [],
    tags: ['trades', 'ticker', 'live', 'streaming', 'premium'],
    popularity: 94,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'position-monitor',
    name: 'Position Monitor',
    description: 'Track open trading positions with real-time P&L calculations, entry/current prices, and risk metrics',
    category: 'trading',
    icon: ChartBarIcon,
    preview: 'positions',
    configSchema: {
      showPnL: { type: 'boolean' },
      showRisk: { type: 'boolean' },
      groupBy: { type: 'select', options: ['Market', 'Type', 'None'] }
    },
    permissions: [],
    tags: ['positions', 'P&L', 'portfolio', 'trading', 'premium', 'risk'],
    popularity: 95,
    lastUpdated: '2024-12-20'
  },
  // Phase 2 - Analytics & Intelligence Widgets
  {
    id: 'depth-chart',
    name: 'Depth Chart',
    description: 'Visual bid/ask depth visualization showing cumulative order volume at each price level',
    category: 'trading',
    icon: ChartBarIcon,
    preview: 'depth',
    configSchema: {
      priceRange: { type: 'select', options: ['±5%', '±10%', '±20%'] },
      showMidPrice: { type: 'boolean' }
    },
    permissions: [],
    tags: ['depth', 'orderbook', 'trading', 'visualization', 'phase2'],
    popularity: 94,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'risk-dashboard',
    name: 'Risk Dashboard',
    description: 'Comprehensive risk metrics including VaR, Sharpe ratio, exposure analysis, and concentration',
    category: 'analytics',
    icon: ShieldCheckIcon,
    preview: 'risk',
    configSchema: {
      varConfidence: { type: 'select', options: ['95%', '99%'] },
      showExposure: { type: 'boolean' },
      showConcentration: { type: 'boolean' }
    },
    permissions: [],
    tags: ['risk', 'VaR', 'sharpe', 'exposure', 'phase2'],
    popularity: 92,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'news-feed',
    name: 'Energy News Feed',
    description: 'Real-time energy sector news with sentiment analysis from major sources',
    category: 'real-time',
    icon: DocumentChartBarIcon,
    preview: 'news',
    configSchema: {
      sources: { type: 'multiselect', options: ['Economic Times', 'Bloomberg', 'Reuters', 'CERC'] },
      showSentiment: { type: 'boolean' }
    },
    permissions: [],
    tags: ['news', 'sentiment', 'intelligence', 'phase2'],
    popularity: 88,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'economic-calendar',
    name: 'Economic Calendar',
    description: 'Upcoming grid maintenance, auctions, regulatory events, and market sessions',
    category: 'reports',
    icon: CalendarIcon,
    preview: 'calendar',
    configSchema: {
      eventTypes: { type: 'multiselect', options: ['Auctions', 'Maintenance', 'Regulatory', 'Market'] },
      showImpact: { type: 'boolean' }
    },
    permissions: [],
    tags: ['calendar', 'events', 'maintenance', 'regulatory', 'phase2'],
    popularity: 86,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'session-stats',
    name: 'Session Statistics',
    description: 'Daily/weekly trading session statistics with price range, volume, and market status',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'stats',
    configSchema: {
      period: { type: 'select', options: ['Today', 'Week', 'Month'] },
      showSessions: { type: 'boolean' }
    },
    permissions: [],
    tags: ['session', 'statistics', 'daily', 'volume', 'phase2'],
    popularity: 84,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'heat-map',
    name: 'Price Heat Map',
    description: 'Regional price comparison heat map across DAM, RTM, and TAM markets',
    category: 'analytics',
    icon: MapIcon,
    preview: 'heatmap',
    configSchema: {
      regions: { type: 'multiselect', options: ['Northern', 'Southern', 'Western', 'Eastern', 'NE'] },
      markets: { type: 'multiselect', options: ['DAM', 'RTM', 'TAM'] }
    },
    permissions: [],
    tags: ['heatmap', 'regional', 'comparison', 'prices', 'phase2'],
    popularity: 90,
    lastUpdated: '2024-12-20'
  },
  // Phase 4 - AI Intelligence Widgets
  {
    id: 'ai-predictions',
    name: 'AI Price Predictions',
    description: 'ML-powered price predictions with confidence scores and uncertainty ranges',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'ai-predictions',
    configSchema: {
      market: { type: 'select', options: ['DAM', 'RTM', 'TAM'] },
      timeframe: { type: 'select', options: ['1h', '4h', '24h', '7d'] }
    },
    permissions: [],
    tags: ['AI', 'predictions', 'ML', 'confidence', 'phase4'],
    popularity: 98,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'explainable-ai',
    name: 'Explainable AI',
    description: 'Understand why AI made each prediction with factor analysis and impact scores',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'xai',
    configSchema: {
      showFactors: { type: 'boolean' },
      showAccuracy: { type: 'boolean' }
    },
    permissions: [],
    tags: ['XAI', 'explainability', 'factors', 'transparency', 'phase4'],
    popularity: 92,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'ai-copilot',
    name: 'AI Copilot',
    description: 'Natural language interface for market analysis, forecasts, and trading insights',
    category: 'analytics',
    icon: ChatBubbleLeftRightIcon,
    preview: 'copilot',
    configSchema: {
      contextMarkets: { type: 'multiselect', options: ['DAM', 'RTM', 'TAM'] }
    },
    permissions: [],
    tags: ['copilot', 'NLP', 'chat', 'insights', 'phase4'],
    popularity: 96,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    description: 'Real-time anomaly detection for price, volume, and pattern deviations',
    category: 'analytics',
    icon: ShieldCheckIcon,
    preview: 'anomaly',
    configSchema: {
      sensitivity: { type: 'select', options: ['Low', 'Medium', 'High'] },
      types: { type: 'multiselect', options: ['Price', 'Volume', 'Pattern', 'Grid'] }
    },
    permissions: [],
    tags: ['anomaly', 'detection', 'alerts', 'monitoring', 'phase4'],
    popularity: 94,
    lastUpdated: '2024-12-20'
  },
  // Phase 5 - Collaboration Widgets
  {
    id: 'team-presence',
    name: 'Team Presence',
    description: 'See who is online, their status, and quickly connect with team members',
    category: 'reports',
    icon: UserGroupIcon,
    preview: 'team',
    configSchema: {
      showOffline: { type: 'boolean' }
    },
    permissions: [],
    tags: ['team', 'presence', 'collaboration', 'phase5'],
    popularity: 88,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    description: 'Track team actions, comments, and dashboard changes in real-time',
    category: 'reports',
    icon: ClockIcon,
    preview: 'activity',
    configSchema: {
      limit: { type: 'select', options: ['10', '20', '50'] }
    },
    permissions: [],
    tags: ['activity', 'feed', 'timeline', 'collaboration', 'phase5'],
    popularity: 85,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'dashboard-templates',
    name: 'Dashboard Templates',
    description: 'Browse and apply pre-built dashboard configurations for quick setup',
    category: 'reports',
    icon: DocumentDuplicateIcon,
    preview: 'templates',
    configSchema: {
      showSystem: { type: 'boolean' },
      showCustom: { type: 'boolean' }
    },
    permissions: [],
    tags: ['templates', 'presets', 'layouts', 'phase5'],
    popularity: 82,
    lastUpdated: '2024-12-20'
  },
  // Phase 6 - Analytics Widgets
  {
    id: 'portfolio-performance',
    name: 'Portfolio Performance',
    description: 'Key portfolio metrics including Sharpe ratio, win rate, and P&L tracking',
    category: 'analytics',
    icon: PresentationChartLineIcon,
    preview: 'portfolio',
    configSchema: {
      period: { type: 'select', options: ['1D', '1W', '1M', '3M', 'YTD'] }
    },
    permissions: [],
    tags: ['portfolio', 'performance', 'metrics', 'phase6'],
    popularity: 95,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'pnl-attribution',
    name: 'P&L Attribution',
    description: 'Breakdown of profit/loss by contributing factors with trend analysis',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'attribution',
    configSchema: {
      topFactors: { type: 'select', options: ['3', '5', '10'] }
    },
    permissions: [],
    tags: ['pnl', 'attribution', 'factors', 'phase6'],
    popularity: 88,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'correlation-matrix',
    name: 'Correlation Matrix',
    description: 'Visual correlation analysis between market regions and assets',
    category: 'analytics',
    icon: TableCellsIcon,
    preview: 'matrix',
    configSchema: {
      period: { type: 'select', options: ['7d', '30d', '90d'] }
    },
    permissions: [],
    tags: ['correlation', 'matrix', 'analysis', 'phase6'],
    popularity: 85,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'volume-breakdown',
    name: 'Volume Breakdown',
    description: 'Trading volume analysis by market with trends and average prices',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'volume',
    configSchema: {
      markets: { type: 'multiselect', options: ['DAM', 'RTM', 'TAM'] }
    },
    permissions: [],
    tags: ['volume', 'breakdown', 'markets', 'phase6'],
    popularity: 83,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'report-generator',
    name: 'Report Generator',
    description: 'Generate and export trading reports in PDF, Excel, or CSV format',
    category: 'reports',
    icon: DocumentChartBarIcon,
    preview: 'reports',
    configSchema: {
      defaultFormat: { type: 'select', options: ['PDF', 'Excel', 'CSV'] }
    },
    permissions: [],
    tags: ['reports', 'export', 'pdf', 'excel', 'phase6'],
    popularity: 90,
    lastUpdated: '2024-12-20'
  },
  // Phase 7 - Performance Widgets
  {
    id: 'performance-monitor',
    name: 'Performance Monitor',
    description: 'Real-time FPS, memory usage, and widget count monitoring',
    category: 'analytics',
    icon: CpuChipIcon,
    preview: 'performance',
    configSchema: {},
    permissions: [],
    tags: ['performance', 'fps', 'memory', 'monitoring', 'phase7'],
    popularity: 85,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'render-profiler',
    name: 'Render Profiler',
    description: 'Profile component render times and optimization opportunities',
    category: 'analytics',
    icon: ChartBarIcon,
    preview: 'profiler',
    configSchema: {},
    permissions: [],
    tags: ['profiler', 'renders', 'optimization', 'phase7'],
    popularity: 70,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'bundle-size',
    name: 'Bundle Size',
    description: 'Visualize JavaScript bundle sizes and code splitting',
    category: 'analytics',
    icon: CubeIcon,
    preview: 'bundle',
    configSchema: {},
    permissions: [],
    tags: ['bundle', 'size', 'code-splitting', 'phase7'],
    popularity: 65,
    lastUpdated: '2024-12-20'
  },
  {
    id: 'loading-states',
    name: 'Loading States',
    description: 'Demo of skeleton loaders and loading animations',
    category: 'reports',
    icon: ArrowPathIcon,
    preview: 'loading',
    configSchema: {},
    permissions: [],
    tags: ['loading', 'skeleton', 'animations', 'phase7'],
    popularity: 60,
    lastUpdated: '2024-12-20'
  }
]

export function WidgetLibrary({ isOpen, onClose, onWidgetAdd, userPermissions, existingWidgets = [] }: WidgetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [widgets, setWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [filteredWidgets, setFilteredWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [widgetConfig, setWidgetConfig] = useState<any>({})
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'recent'>('popularity')

  useEffect(() => {
    filterAndSortWidgets()
  }, [selectedCategory, searchQuery, sortBy])

  const filterAndSortWidgets = () => {
    let filtered = widgets

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(widget => widget.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by user permissions - WITH FALLBACK
    if (userPermissions && userPermissions.length > 0) {
      filtered = filtered.filter(widget =>
        widget.permissions.length === 0 || // Widgets with no permission requirements
        widget.permissions.some(permission => userPermissions.includes(permission))
      )
    }
    // If no permissions set, show all widgets (don't filter them out)

    // Sort widgets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    setFilteredWidgets(filtered)
  }

  const handleWidgetSelect = (widget: Widget) => {
    setSelectedWidget(widget)
    // Initialize config with default values
    const defaultConfig: any = {}
    Object.entries(widget.configSchema).forEach(([key, schema]: [string, any]) => {
      switch (schema.type) {
        case 'boolean':
          defaultConfig[key] = false
          break
        case 'select':
          defaultConfig[key] = schema.options[0]
          break
        case 'multiselect':
          defaultConfig[key] = []
          break
        default:
          defaultConfig[key] = ''
      }
    })
    setWidgetConfig(defaultConfig)
    setShowConfigPanel(true)
  }

  const handleConfigChange = (key: string, value: any) => {
    setWidgetConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleAddWidget = () => {
    if (selectedWidget) {
      // Calculate smart widget size based on widget type
      const widgetSize = getWidgetDefaultSize(selectedWidget.id)

      // Find the best available position using smart placement
      const position = findNextAvailablePosition(
        existingWidgets,
        widgetSize.w,
        widgetSize.h,
        12 // 12-column grid
      )

      const newWidget = {
        id: `${selectedWidget.id}-${Date.now()}`,
        type: selectedWidget.id,
        title: selectedWidget.name,
        position: { ...position, w: widgetSize.w, h: widgetSize.h },
        config: widgetConfig,
        permissions: selectedWidget.permissions
      }

      onWidgetAdd(newWidget)
      setShowConfigPanel(false)
      setSelectedWidget(null)
      onClose()
    }
  }

  // Get default widget size based on type (some widgets need more space)
  const getWidgetDefaultSize = (widgetType: string): { w: number; h: number } => {
    const sizeMap: { [key: string]: { w: number; h: number } } = {
      'portfolio-analytics': { w: 8, h: 4 },
      'iex-india-live-prices': { w: 4, h: 4 },
      'iex-india-demand-supply': { w: 6, h: 4 },
      'iex-india-market-volume': { w: 4, h: 4 },
      'geographic-map': { w: 6, h: 5 },
      'trading-dashboard': { w: 8, h: 5 },
      'weather-impact': { w: 4, h: 4 },
      'order-book': { w: 4, h: 5 },
      'trade-ticker': { w: 4, h: 4 },
      'position-monitor': { w: 6, h: 4 },
      'ai-trading-signals': { w: 4, h: 4 },
      'real-time-alerts': { w: 4, h: 4 },
      // Phase 2 widgets
      'depth-chart': { w: 4, h: 4 },
      'risk-dashboard': { w: 4, h: 5 },
      'news-feed': { w: 4, h: 5 },
      'economic-calendar': { w: 4, h: 5 },
      'session-stats': { w: 4, h: 5 },
      'heat-map': { w: 6, h: 4 },
      // Phase 4 - AI widgets
      'ai-predictions': { w: 4, h: 5 },
      'explainable-ai': { w: 4, h: 5 },
      'ai-copilot': { w: 4, h: 6 },
      'anomaly-detection': { w: 4, h: 4 },
      // Phase 5 - Collaboration widgets
      'team-presence': { w: 3, h: 5 },
      'activity-feed': { w: 4, h: 5 },
      'dashboard-templates': { w: 3, h: 5 },
      // Phase 6 - Analytics widgets
      'portfolio-performance': { w: 4, h: 5 },
      'pnl-attribution': { w: 4, h: 5 },
      'correlation-matrix': { w: 4, h: 5 },
      'volume-breakdown': { w: 4, h: 5 },
      'report-generator': { w: 3, h: 5 },
      // Phase 7 - Performance widgets
      'performance-monitor': { w: 3, h: 5 },
      'render-profiler': { w: 3, h: 5 },
      'bundle-size': { w: 3, h: 5 },
      'loading-states': { w: 3, h: 4 },
    }
    return sizeMap[widgetType] || { w: 4, h: 4 }
  }

  const renderConfigField = (key: string, schema: any) => {
    switch (schema.type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={widgetConfig[key] || false}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
          </label>
        )

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <select
              value={widgetConfig[key] || ''}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              {schema.options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )

      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {schema.options.map((option: string) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={widgetConfig[key]?.includes(option) || false}
                    onChange={(e) => {
                      const current = widgetConfig[key] || []
                      if (e.target.checked) {
                        handleConfigChange(key, [...current, option])
                      } else {
                        handleConfigChange(key, current.filter((item: string) => item !== option))
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex h-[80vh]">
                  {/* Main Widget Library */}
                  <div className={`flex-1 flex flex-col ${showConfigPanel ? 'w-2/3' : 'w-full'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                          Widget Library
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add powerful widgets to enhance your dashboard
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1 relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search widgets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="popularity">Most Popular</option>
                          <option value="name">Name</option>
                          <option value="recent">Recently Updated</option>
                        </select>
                      </div>

                      {/* Category Tabs */}
                      <div className="flex space-x-1 overflow-x-auto">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={clsx(
                            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                            selectedCategory === 'all'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                          )}
                        >
                          All Widgets
                        </button>
                        {WIDGET_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={clsx(
                              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                              selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            )}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Widget Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {filteredWidgets.length === 0 ? (
                        <div className="text-center py-12">
                          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No widgets found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredWidgets.map((widget) => (
                            <motion.div
                              key={widget.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => handleWidgetSelect(widget)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <widget.icon className="h-8 w-8 text-blue-500 mr-3" />
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                      {widget.name}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                        {WIDGET_CATEGORIES.find(c => c.id === widget.category)?.name}
                                      </span>
                                      <div className="flex items-center">
                                        <span className="text-xs text-yellow-500 mr-1">★</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {widget.popularity}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {widget.description}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {widget.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Updated {new Date(widget.lastUpdated).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleWidgetSelect(widget)
                                  }}
                                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Add
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuration Panel */}
                  <AnimatePresence>
                    {showConfigPanel && selectedWidget && (
                      <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Configure Widget
                          </h3>
                          <button
                            onClick={() => setShowConfigPanel(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {selectedWidget.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {selectedWidget.description}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {Object.entries(selectedWidget.configSchema).map(([key, schema]) => (
                              <div key={key}>
                                {renderConfigField(key, schema)}
                              </div>
                            ))}
                          </div>

                          <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={handleAddWidget}
                              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add Widget
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}