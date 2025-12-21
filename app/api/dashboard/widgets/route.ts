import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import {
  getWidget,
  getWidgetsByUser,
  saveWidget,
  updateWidget,
  deleteWidget,
  bulkUpdateWidgets,
  StoredWidget
} from '@/lib/storage/json-storage'

// Helper function to get default permissions for widget type
function getDefaultPermissions(widgetType: string): string[] {
  const permissionMap: { [key: string]: string[] } = {
    'energy-generation-chart': ['data.view-energy'],
    'market-prices-widget': ['data.view-market'],
    'asset-status-grid': ['data.view-asset'],
    'performance-kpis': ['data.view-energy'],
    'trading-dashboard': ['data.view-market'],
    'team-activity-feed': ['team.collaborate'],
    'compliance-report': ['admin.audit'],
    'geographic-map': ['data.view-asset'],
    'iex-india-live-prices': ['data.view-market'],
    'iex-india-market-volume': ['data.view-market'],
    'iex-india-price-forecast': ['data.view-market'],
    'iex-india-renewable-mix': ['data.view-energy'],
    'iex-india-demand-supply': ['data.view-energy'],
    'ai-price-prediction': ['data.view-market'],
    'quantum-optimization': ['data.view-market'],
    'real-time-alerts': ['data.view-market'],
    'portfolio-analytics': ['data.view-market', 'data.view-energy'],
    'ai-trading-signals': ['data.view-market'],
    'weather-impact': ['data.view-energy']
  }

  return permissionMap[widgetType] || ['widget.view']
}

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

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')
    const userId = String(queryUserId || user.id || 'default-user')

    // Get widgets for the user from persistent storage
    const userWidgets = await getWidgetsByUser(userId)

    return NextResponse.json({
      success: true,
      data: {
        widgets: userWidgets,
        total: userWidgets.length
      }
    })
  } catch (error) {
    console.error('Error fetching widgets:', error)
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
    const {
      type,
      title,
      position,
      config = {},
      permissions = []
    } = body

    // Validate required fields
    if (!type || !title || !position) {
      return NextResponse.json(
        { error: 'Type, title, and position are required' },
        { status: 400 }
      )
    }

    // Validate position structure
    if (typeof position.x !== 'number' || typeof position.y !== 'number' ||
      typeof position.w !== 'number' || typeof position.h !== 'number') {
      return NextResponse.json(
        { error: 'Position must contain x, y, w, h as numbers' },
        { status: 400 }
      )
    }

    const userId = String(user.id || 'default-user')

    // Create new widget
    const widgetId = `${type}-${Date.now()}`
    const newWidget: StoredWidget = {
      id: widgetId,
      userId,
      type,
      title,
      position,
      config,
      permissions: permissions.length > 0 ? permissions : getDefaultPermissions(type),
      createdBy: userId,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to persistent storage
    await saveWidget(newWidget)

    return NextResponse.json({
      success: true,
      data: newWidget
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating widget:', error)
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    // Check if widget exists
    const existingWidget = await getWidget(id)
    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check permissions (user can only update their own widgets unless admin)
    const userId = String(user.id || 'default-user')
    if (existingWidget.createdBy !== userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this widget' },
        { status: 403 }
      )
    }

    // Validate position if provided
    if (updates.position) {
      const { x, y, w, h } = updates.position
      if (typeof x !== 'number' || typeof y !== 'number' ||
        typeof w !== 'number' || typeof h !== 'number') {
        return NextResponse.json(
          { error: 'Position must contain x, y, w, h as numbers' },
          { status: 400 }
        )
      }
    }

    // Update widget in persistent storage
    const updatedWidget = await updateWidget(id, updates)

    if (!updatedWidget) {
      return NextResponse.json(
        { error: 'Failed to update widget' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedWidget
    })
  } catch (error) {
    console.error('Error updating widget:', error)
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

    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('id')

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      )
    }

    // Check if widget exists
    const existingWidget = await getWidget(widgetId)
    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check permissions (user can only delete their own widgets unless admin)
    const userId = String(user.id || 'default-user')
    if (existingWidget.createdBy !== userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this widget' },
        { status: 403 }
      )
    }

    // Delete from persistent storage
    const deleted = await deleteWidget(widgetId)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Widget deleted successfully',
        deletedWidgetId: widgetId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete widget' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk operations
export async function PATCH(request: NextRequest) {
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
    const { operation, widgets } = body

    if (operation !== 'bulk-update') {
      return NextResponse.json(
        { error: 'Unsupported operation' },
        { status: 400 }
      )
    }

    if (!Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Widgets must be an array' },
        { status: 400 }
      )
    }

    const userId = String(user.id || 'default-user')

    // Filter widgets to only those owned by user (unless admin)
    const widgetUpdates = []
    for (const widgetUpdate of widgets) {
      const { id, ...updates } = widgetUpdate

      if (!id) continue

      const existingWidget = await getWidget(id)
      if (!existingWidget) continue

      // Check permissions
      if (existingWidget.createdBy !== userId && user.role !== 'admin') {
        continue
      }

      widgetUpdates.push({ id, updates })
    }

    // Perform bulk update
    const updatedWidgets = await bulkUpdateWidgets(widgetUpdates)

    return NextResponse.json({
      success: true,
      message: 'Bulk update completed',
      data: {
        updatedWidgets,
        totalUpdated: updatedWidgets.length
      }
    })
  } catch (error) {
    console.error('Error in bulk widget operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}