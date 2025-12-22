'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRealtimeStream } from '../../hooks/useRealtimeStream'
import { useIEXSync } from '../../hooks/useIEXSync'
import { DashboardLayout } from '../../components/dashboard/DashboardLayout'
import { DashboardHeader } from '../../components/dashboard/DashboardHeader'
import { WidgetLibrary } from '../../components/dashboard/WidgetLibrary'
import { TeamCollaboration } from '../../components/dashboard/TeamCollaboration'
import { RoleBasedAccess } from '../../components/dashboard/RoleBasedAccess'
import { CommandPalette, useCommandPalette } from '../../components/dashboard/CommandPalette'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { ErrorNotification, ServiceUnavailableBanner } from '../../components/ui/ErrorNotification'
import {
  handleAPIResponse,
  handleNetworkError,
  APIError,
  APIErrorType,
  safeStateUpdate
} from '../../lib/api-error-handler'
import toast from 'react-hot-toast'
import { Sidebar } from '../../components/dashboard/Sidebar'
import { AIInsightsBar } from '../../components/dashboard/AIInsightsBar'
import { RealtimeProvider } from '../../lib/realtime/RealtimeService'
import { AIProvider } from '../../lib/ai/AIIntelligenceService'
import { CollaborationProvider } from '../../lib/collaboration/CollaborationService'
import { AnalyticsProvider } from '../../lib/analytics/AnalyticsService'
import { QueryProvider } from '../../lib/query/QueryProvider'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false)
  const [apiError, setApiError] = useState<APIError | null>(null)
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // IEX India data sync with 5-minute interval
  const iexSync = useIEXSync({
    syncIntervalMs: 5 * 60 * 1000, // 5 minutes
    autoConnect: true,
    onDataUpdate: (data) => {
      console.log('IEX Data Updated:', data.lastSyncTime)
    }
  })

  // Command palette for quick navigation (⌘+K)
  const commandPalette = useCommandPalette()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load dashboard data based on user permissions
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  // Reload fresh data when user returns to page
  // Validates: Requirements 8.4 - Reload dashboard data when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user) {
        console.log('Page became visible, reloading fresh data...')
        loadDashboardData()
      }
    }

    const handleFocus = () => {
      if (isAuthenticated && user) {
        console.log('Window focused, checking for stale data...')
        // Only reload if data is older than 1 minute
        const lastUpdate = dashboardData?.updated_at
        if (lastUpdate) {
          const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime()
          if (timeSinceUpdate > 60000) {
            console.log('Data is stale, reloading...')
            loadDashboardData()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, user, dashboardData?.updated_at])

  // Auto-refresh effect
  useEffect(() => {
    if (!dashboardData || !isAuthenticated) return

    const refreshInterval = dashboardData.autoRefresh || '5m'
    if (refreshInterval === 'off') return

    const intervalMs: { [key: string]: number } = {
      '30s': 30000,
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000
    }

    const ms = intervalMs[refreshInterval] || 300000

    console.log(`Auto-refresh enabled: ${refreshInterval} (${ms}ms)`)

    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...')
      loadDashboardData()
    }, ms)

    return () => {
      console.log('Auto-refresh disabled')
      clearInterval(interval)
    }
  }, [dashboardData?.autoRefresh, isAuthenticated])

  // Real-time data streaming using SSE (Server-Sent Events)
  const {
    connectionStatus,
    isConnected,
    marketPrices,
    averagePrice,
    renewableMix,
    demandSupply,
    alerts,
    lastUpdate
  } = useRealtimeStream({
    autoConnect: isAuthenticated,
    onAlert: (alert) => {
      // Show toast for new alerts
      if (alert.type === 'warning' || alert.type === 'error') {
        toast.error(`${alert.title}: ${alert.message}`, { duration: 5000 })
      } else if (alert.type === 'success') {
        toast.success(`${alert.title}: ${alert.message}`, { duration: 4000 })
      } else {
        toast(`${alert.title}: ${alert.message}`, { duration: 3000, icon: 'ℹ️' })
      }
    },
    onDashboardUpdate: (data) => {
      console.log('📊 Real-time dashboard update received:', data.timestamp)
    }
  })

  const loadDashboardData = async () => {
    console.log('🔵 Loading dashboard data...')
    setApiError(null)
    setIsServiceUnavailable(false)

    try {
      // Fetch user's dashboard configuration
      const response = await fetch('/api/dashboard/user-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔵 Dashboard config response:', response.status)

      // Use centralized error handler for non-ok responses
      // Validates: Requirements 7.1, 7.2, 7.3
      if (!response.ok) {
        try {
          await handleAPIResponse(response, {
            showToast: false, // We'll handle display ourselves
            redirectOnAuth: true,
            onError: (error) => {
              if (error.type === APIErrorType.SERVICE_UNAVAILABLE) {
                setIsServiceUnavailable(true)
              } else {
                setApiError(error)
              }
            }
          })
        } catch (error) {
          // Error already handled, load defaults
          console.log('⚠️ API error, loading defaults')
          await loadDefaultWidgets()
          return
        }
      }

      const result = await response.json()
      console.log('🔵 Dashboard config data:', result)

      if (result.success && result.data) {
        // Merge with defaults to ensure all fields exist
        const config = {
          name: result.data.name || 'My Dashboard',
          theme: result.data.theme || 'light',
          autoRefresh: result.data.autoRefresh || '5m',
          language: result.data.language || 'en',
          timezone: result.data.timezone || 'America/New_York',
          currency: result.data.currency || 'USD',
          widgets: result.data.widgets || [],
          layout: result.data.layout || 'grid',
          permissions: result.data.permissions || user?.permissions || [],
          ...result.data
        }

        console.log('✅ Setting dashboard data:', config)
        setDashboardData(config)
        return
      }

      // Load default widgets on error or no data
      console.log('⚠️ No saved config, loading defaults')
      await loadDefaultWidgets()
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)

      // Handle network errors with centralized handler
      // Validates: Requirements 7.5
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = handleNetworkError(error, { showToast: false })
        setApiError(networkError)
      }

      // Load default widgets as fallback
      await loadDefaultWidgets()
    }
  }

  const loadDefaultWidgets = async () => {
    try {
      const response = await fetch('/api/dashboard/widgets/default')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setDashboardData({
            ...result.data,
            theme: 'light',
            permissions: user?.permissions || ['view-energy-data', 'view-market-data', 'view-asset-data']
          })
          return
        }
      }
    } catch (error) {
      console.error('Failed to load default widgets:', error)
    }

    // Final fallback with mock data
    setDashboardData(getMockDashboardData())
  }

  const getMockDashboardData = () => ({
    widgets: [
      {
        id: 'demo-energy-chart',
        type: 'energy-generation-chart',
        title: 'Real-time Energy Generation',
        position: { x: 0, y: 0, w: 8, h: 4 },
        config: {
          dataSource: 'all',
          timeRange: '24h',
          aggregation: 'sum'
        },
        permissions: ['view-energy-data']
      },
      {
        id: 'demo-market-prices',
        type: 'market-prices-widget',
        title: 'Market Prices - PJM Zone',
        position: { x: 8, y: 0, w: 4, h: 4 },
        config: {
          marketZone: 'PJM',
          priceType: 'LMP',
          showTrend: true
        },
        permissions: ['view-market-data']
      },
      {
        id: 'demo-asset-grid',
        type: 'asset-status-grid',
        title: 'Asset Status Overview',
        position: { x: 0, y: 4, w: 12, h: 3 },
        config: {
          assetTypes: ['solar', 'wind', 'battery'],
          showMetrics: true,
          refreshInterval: '1m'
        },
        permissions: ['view-asset-data']
      }
    ],
    layout: 'grid',
    theme: 'light',
    permissions: user?.permissions || ['view-energy-data', 'view-market-data', 'view-asset-data']
  })

  const handleWidgetAdd = useCallback(async (widgetConfig: any) => {
    console.log('🔵 Adding widget with config:', widgetConfig)

    // Validate required fields before making API call
    if (!widgetConfig.type) {
      toast.error('Widget type is required')
      return
    }
    if (!widgetConfig.title) {
      toast.error('Widget title is required')
      return
    }

    // Show loading toast
    const loadingToast = toast.loading('Adding widget...')

    try {
      // Ensure widget has all required fields per Requirements 3.5
      const completeWidget = {
        type: widgetConfig.type,
        title: widgetConfig.title,
        position: widgetConfig.position || { x: 0, y: 0, w: 4, h: 4 },
        config: widgetConfig.config || {},
        permissions: widgetConfig.permissions || []
      }

      // Validate position structure
      const { position } = completeWidget
      if (typeof position.x !== 'number' || typeof position.y !== 'number' ||
        typeof position.w !== 'number' || typeof position.h !== 'number') {
        toast.dismiss(loadingToast)
        toast.error('Invalid widget position configuration')
        return
      }

      console.log('🔵 Complete widget:', completeWidget)

      // Make POST request to /api/dashboard/widgets per Requirements 3.1
      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeWidget)
      })

      console.log('🔵 API Response status:', response.status)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Use centralized error handler for API responses
      // Validates: Requirements 7.1, 7.3, 7.4
      if (!response.ok) {
        try {
          await handleAPIResponse(response, {
            showToast: true,
            redirectOnAuth: true,
            customMessages: {
              400: 'Invalid widget configuration. Please check your settings.',
              403: 'You do not have permission to add widgets.'
            }
          })
        } catch (apiError) {
          console.error('❌ API Error:', apiError)
          // Error already handled by handleAPIResponse
          return
        }
      }

      const result = await response.json()
      console.log('🔵 API Response data:', result)

      // Handle both response formats: {success: true, data: widget} or just widget
      const newWidget = result.data || result
      console.log('🔵 New widget to add:', newWidget)

      // Update state to add new widget per Requirements 3.2, 3.6
      setDashboardData((prev: any) => {
        console.log('🔵 Previous widgets count:', prev?.widgets?.length || 0)

        if (!prev) {
          console.log('🔵 No previous data, creating new')
          return { widgets: [newWidget] }
        }

        const updated = {
          ...prev,
          widgets: [...(prev.widgets || []), newWidget]
        }

        console.log('✅ Updated widgets count:', updated.widgets.length)
        return updated
      })

      // Show success toast per Requirements 3.4
      toast.success(`Widget "${newWidget.title || widgetConfig.title}" added successfully!`)
      console.log('✅ Widget added successfully!')
    } catch (error) {
      // Handle network/unexpected errors per Requirements 3.4
      // Validates: Requirements 7.5
      toast.dismiss(loadingToast)
      console.error('❌ Failed to add widget:', error)

      if (error instanceof TypeError && error.message.includes('fetch')) {
        handleNetworkError(error as Error, { showToast: true })
      } else if (!(error as any).type) {
        // Not an APIError, show generic message
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to add widget. Please try again.'
        toast.error(errorMessage)
      }
      // If it's an APIError, it was already handled
    }
  }, [])

  const handleWidgetUpdate = async (widgetId: string, updates: any) => {
    try {
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedWidget = await response.json()
        setDashboardData((prev: any) => ({
          ...prev,
          widgets: prev.widgets.map((w: any) =>
            w.id === widgetId ? updatedWidget : w
          )
        }))
      }
    } catch (error) {
      console.error('Failed to update widget:', error)
    }
  }

  const handleWidgetDelete = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quantgrid_access_token')}`
        }
      })

      if (response.ok) {
        setDashboardData((prev: any) => ({
          ...prev,
          widgets: prev.widgets.filter((w: any) => w.id !== widgetId)
        }))
      }
    } catch (error) {
      console.error('Failed to delete widget:', error)
    }
  }

  const handleLayoutUpdate = async (newLayout: any) => {
    // Store previous state for rollback
    const previousData = dashboardData ? { ...dashboardData } : null

    try {
      // Merge the new widget positions with existing dashboard data
      // The newLayout contains { widgets: [...] } with updated positions
      const updatedWidgets = newLayout.widgets || dashboardData?.widgets || []

      // Create updated dashboard config
      const updatedConfig = {
        ...dashboardData,
        widgets: updatedWidgets,
        updated_at: new Date().toISOString()
      }

      // Optimistic update - keep widget positions locally
      // Note: We don't call setDashboardData here to avoid triggering useEffect reset
      // The child component already has the updated state

      // Save to API in background (don't await to prevent blocking)
      fetch('/api/dashboard/user-config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedConfig)
      }).then(async (response) => {
        if (!response.ok) {
          console.warn('Failed to save layout to API, changes are local only')
        } else {
          console.log('✅ Layout saved to API')
        }
      }).catch((error) => {
        console.warn('Failed to save layout:', error)
      })
    } catch (error) {
      console.error('Failed to update configuration:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <QueryProvider>
      <RealtimeProvider>
        <AIProvider>
          <CollaborationProvider>
            <AnalyticsProvider>
              <ErrorBoundary>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Sidebar onCollapsedChange={setSidebarCollapsed} />

                  <div
                    className="transition-all duration-200"
                    style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
                  >
                    <DashboardHeader
                      onOpenWidgetLibrary={() => setIsWidgetLibraryOpen(true)}
                      onOpenCollaboration={() => setIsCollaborationOpen(true)}
                      user={user}
                      isConnected={iexSync.isConnected || isConnected}
                      connectionStatus={iexSync.isConnected ? 'connected' : connectionStatus}
                      lastUpdate={iexSync.lastSyncTime || lastUpdate}
                    />

                    <main className="py-6 px-6">
                      {/* Service Unavailable Banner - Validates: Requirements 7.5 */}
                      {isServiceUnavailable && (
                        <ServiceUnavailableBanner
                          onRetry={loadDashboardData}
                          retryCountdown={30}
                          className="mb-6"
                        />
                      )}

                      {/* API Error Notification - Validates: Requirements 7.1 */}
                      {apiError && !isServiceUnavailable && (
                        <ErrorNotification
                          error={apiError}
                          onDismiss={() => setApiError(null)}
                          onRetry={apiError.retryable ? loadDashboardData : undefined}
                          className="mb-6"
                          autoDismiss={10000}
                        />
                      )}
                      <RoleBasedAccess user={user}>
                        <DashboardLayout
                          user={user}
                          dashboardData={dashboardData}
                          organizationId={String(user?.id || 'default-org')}
                          onWidgetAdd={handleWidgetAdd}
                          onWidgetUpdate={handleWidgetUpdate}
                          onWidgetDelete={handleWidgetDelete}
                          onLayoutUpdate={handleLayoutUpdate}
                          onFeaturesUpdated={() => loadDashboardData()}
                        />
                      </RoleBasedAccess>
                    </main>

                    {/* Widget Library Modal */}
                    <WidgetLibrary
                      isOpen={isWidgetLibraryOpen}
                      onClose={() => setIsWidgetLibraryOpen(false)}
                      onWidgetAdd={handleWidgetAdd}
                      userPermissions={user?.permissions || []}
                      existingWidgets={dashboardData?.widgets || []}
                    />

                    {/* Team Collaboration Panel */}
                    {isCollaborationOpen && (
                      <TeamCollaboration
                        onClose={() => setIsCollaborationOpen(false)}
                        user={user}
                      />
                    )}

                    {/* Command Palette (⌘+K) */}
                    <CommandPalette
                      isOpen={commandPalette.isOpen}
                      onClose={commandPalette.close}
                      onAddWidget={(widgetType) => {
                        handleWidgetAdd({
                          type: widgetType,
                          title: widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                          position: { x: 0, y: 0, w: 4, h: 4 },
                          config: {}
                        })
                      }}
                      onOpenSettings={() => { }}
                      onOpenCollaboration={() => setIsCollaborationOpen(true)}
                      onRefreshDashboard={loadDashboardData}
                      onShareDashboard={() => toast('Share feature coming soon!', { icon: '🔗' })}
                      onExportDashboard={() => toast('Export feature coming soon!', { icon: '📊' })}
                    />

                    <AIInsightsBar />
                  </div>
                </div>
              </ErrorBoundary>
            </AnalyticsProvider>
          </CollaborationProvider>
        </AIProvider>
      </RealtimeProvider>
    </QueryProvider>
  )
}