import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import {
  getDashboardConfig,
  saveDashboardConfig,
  deleteDashboardConfig,
  StoredDashboardConfig
} from '@/lib/storage/json-storage'

// Default dashboard configurations for new users
const DEFAULT_CONFIGS: { [key: string]: Partial<StoredDashboardConfig> } = {
  'admin': {
    name: 'Admin Dashboard',
    description: 'Full-featured admin dashboard with IEX India live data',
    widgets: [
      {
        id: 'iex-live-prices-1',
        type: 'iex-india-live-prices',
        title: 'IEX India Live Prices',
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: { market: 'DAM', region: 'All India', refreshInterval: '30s' },
        permissions: []
      },
      {
        id: 'portfolio-1',
        type: 'portfolio-analytics',
        title: 'Portfolio Performance',
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: { view: 'Full', benchmark: 'Market Index' },
        permissions: []
      },
      {
        id: 'ai-signals-1',
        type: 'ai-trading-signals',
        title: 'AI Trading Signals',
        position: { x: 0, y: 4, w: 4, h: 4 },
        config: { showConfidence: true, minConfidence: '70%' },
        permissions: []
      },
      {
        id: 'weather-1',
        type: 'weather-impact',
        title: 'Weather Impact',
        position: { x: 4, y: 4, w: 4, h: 4 },
        config: { location: 'All India', showForecast: true },
        permissions: []
      },
      {
        id: 'iex-demand-1',
        type: 'iex-india-demand-supply',
        title: 'Demand-Supply Balance',
        position: { x: 8, y: 4, w: 4, h: 4 },
        config: { region: 'All India', showForecast: true },
        permissions: []
      }
    ],
    theme: 'light',
    autoRefresh: '1m'
  }
}

// Helper to create a new user configuration
function createDefaultConfig(userId: string): StoredDashboardConfig {
  const defaultWidgets = DEFAULT_CONFIGS['admin']?.widgets || []

  return {
    id: `dashboard-${userId}`,
    userId,
    name: 'My Dashboard',
    description: 'Personal energy trading dashboard',
    widgets: defaultWidgets,
    layout: 'grid',
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    autoRefresh: '5m',
    notifications: {
      email: true,
      push: true,
      sms: false,
      priceAlerts: true,
      systemAlerts: true
    },
    privacy: {
      showOnlineStatus: true,
      shareAnalytics: true
    },
    performance: {
      reduceAnimations: false,
      lazyLoadWidgets: true
    },
    accessibility: {
      highContrast: false,
      largeText: false
    },
    permissions: [
      'dashboard.view',
      'dashboard.edit',
      'widget.view',
      'widget.create',
      'widget.edit',
      'widget.delete'
    ],
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Standard user permissions for response
const STANDARD_USER_PERMISSIONS = [
  'dashboard.view',
  'dashboard.create',
  'dashboard.edit',
  'dashboard.delete',
  'dashboard.share',
  'widget.view',
  'widget.create',
  'widget.edit',
  'widget.delete',
  'widget.configure',
  'data.view-energy',
  'data.view-market',
  'data.view-asset',
  'data.export',
  'team.view',
  'team.invite',
  'team.manage',
  'team.collaborate'
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = String(user.id || 'default-user')

    // Try to get existing config from persistent storage
    let userConfig = await getDashboardConfig(userId)

    // If no config exists, create a default one
    if (!userConfig) {
      userConfig = createDefaultConfig(userId)
      await saveDashboardConfig(userId, userConfig)
    }

    // Return with user permissions
    return NextResponse.json({
      success: true,
      data: {
        ...userConfig,
        userPermissions: STANDARD_USER_PERMISSIONS
      }
    })
  } catch (error) {
    console.error('Error fetching user dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, theme = 'light' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      )
    }

    const userId = String(user.id || 'default-user')

    // Create new dashboard configuration
    const newDashboard: StoredDashboardConfig = {
      id: `dashboard-${Date.now()}`,
      userId,
      name,
      description: description || '',
      widgets: [],
      layout: 'grid',
      theme,
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      autoRefresh: '5m',
      notifications: { email: true, push: true, sms: false, priceAlerts: true, systemAlerts: true },
      privacy: { showOnlineStatus: true, shareAnalytics: true },
      performance: { reduceAnimations: false, lazyLoadWidgets: true },
      accessibility: { highContrast: false, largeText: false },
      permissions: ['dashboard.view', 'dashboard.edit', 'widget.view', 'widget.create', 'widget.edit'],
      sharedWith: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to persistent storage
    await saveDashboardConfig(userId, newDashboard)

    return NextResponse.json({
      success: true,
      data: newDashboard
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      theme,
      widgets,
      layout,
      language,
      timezone,
      currency,
      autoRefresh,
      notifications,
      privacy,
      performance,
      accessibility
    } = body

    const userId = String(user.id || 'default-user')

    // Get existing config from persistent storage
    let existingConfig = await getDashboardConfig(userId)

    if (!existingConfig) {
      // Create a new config if one doesn't exist
      existingConfig = createDefaultConfig(userId)
    }

    // Update configuration with provided fields
    const updatedConfig: StoredDashboardConfig = {
      ...existingConfig,
      name: name !== undefined ? name : existingConfig.name,
      description: description !== undefined ? description : existingConfig.description,
      theme: theme !== undefined ? theme : existingConfig.theme,
      widgets: widgets !== undefined ? widgets : existingConfig.widgets,
      layout: layout !== undefined ? layout : existingConfig.layout,
      language: language !== undefined ? language : existingConfig.language,
      timezone: timezone !== undefined ? timezone : existingConfig.timezone,
      currency: currency !== undefined ? currency : existingConfig.currency,
      autoRefresh: autoRefresh !== undefined ? autoRefresh : existingConfig.autoRefresh,
      notifications: notifications !== undefined ? notifications : existingConfig.notifications,
      privacy: privacy !== undefined ? privacy : existingConfig.privacy,
      performance: performance !== undefined ? performance : existingConfig.performance,
      accessibility: accessibility !== undefined ? accessibility : existingConfig.accessibility,
      updatedAt: new Date().toISOString()
    }

    // Save to persistent storage
    await saveDashboardConfig(userId, updatedConfig)

    return NextResponse.json({
      success: true,
      data: updatedConfig
    })
  } catch (error) {
    console.error('Error updating dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = String(user.id || 'default-user')

    // Delete from persistent storage
    const deleted = await deleteDashboardConfig(userId)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Dashboard deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Dashboard configuration not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting dashboard config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}