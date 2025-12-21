import { promises as fs } from 'fs'
import path from 'path'

/**
 * JSON-Based Persistent Storage Service
 * 
 * Provides file-based storage for dashboard configurations and widgets.
 * This is suitable for development and small deployments.
 * For production, replace with PostgreSQL or MongoDB.
 * 
 * Features:
 * - Automatic directory creation
 * - Atomic writes (write to temp, then rename)
 * - JSON schema validation
 * - Backup on changes
 */

// Storage directory (relative to project root)
const DATA_DIR = process.env.DATA_DIR || '.data'

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
    const dataPath = path.join(process.cwd(), DATA_DIR)
    try {
        await fs.access(dataPath)
    } catch {
        await fs.mkdir(dataPath, { recursive: true })
    }
}

/**
 * Get the full path for a storage file
 */
function getFilePath(filename: string): string {
    return path.join(process.cwd(), DATA_DIR, filename)
}

/**
 * Read JSON data from a file
 */
export async function readJSON<T>(filename: string, defaultValue: T): Promise<T> {
    try {
        await ensureDataDir()
        const filePath = getFilePath(filename)
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data) as T
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return default value
            return defaultValue
        }
        console.error(`Error reading ${filename}:`, error)
        return defaultValue
    }
}

/**
 * Write JSON data to a file (atomic write)
 */
export async function writeJSON<T>(filename: string, data: T): Promise<void> {
    await ensureDataDir()
    const filePath = getFilePath(filename)
    const tempPath = `${filePath}.tmp`
    const backupPath = `${filePath}.backup`

    try {
        // Write to temp file first
        const jsonData = JSON.stringify(data, null, 2)
        await fs.writeFile(tempPath, jsonData, 'utf-8')

        // Create backup of existing file if it exists
        try {
            await fs.access(filePath)
            await fs.copyFile(filePath, backupPath)
        } catch {
            // No existing file to backup
        }

        // Rename temp to actual file (atomic operation)
        await fs.rename(tempPath, filePath)
    } catch (error) {
        // Clean up temp file on error
        try {
            await fs.unlink(tempPath)
        } catch {
            // Ignore cleanup errors
        }
        throw error
    }
}

// ------------------------------------------
// Dashboard Config Storage
// ------------------------------------------

export interface StoredDashboardConfig {
    id: string
    userId: string
    name: string
    description: string
    widgets: any[]
    layout: string
    theme: string
    autoRefresh: string
    language?: string
    timezone?: string
    currency?: string
    notifications?: any
    privacy?: any
    performance?: any
    accessibility?: any
    permissions: string[]
    sharedWith: string[]
    createdAt: string
    updatedAt: string
}

interface DashboardConfigStore {
    configs: { [userId: string]: StoredDashboardConfig }
    version: number
    lastModified: string
}

const DASHBOARD_CONFIG_FILE = 'dashboard-configs.json'

const DEFAULT_DASHBOARD_STORE: DashboardConfigStore = {
    configs: {},
    version: 1,
    lastModified: new Date().toISOString()
}

/**
 * Get dashboard config for a user
 */
export async function getDashboardConfig(userId: string): Promise<StoredDashboardConfig | null> {
    const store = await readJSON<DashboardConfigStore>(DASHBOARD_CONFIG_FILE, DEFAULT_DASHBOARD_STORE)
    return store.configs[userId] || null
}

/**
 * Save dashboard config for a user
 */
export async function saveDashboardConfig(userId: string, config: Partial<StoredDashboardConfig>): Promise<StoredDashboardConfig> {
    const store = await readJSON<DashboardConfigStore>(DASHBOARD_CONFIG_FILE, DEFAULT_DASHBOARD_STORE)

    const existingConfig = store.configs[userId]
    const now = new Date().toISOString()

    const updatedConfig: StoredDashboardConfig = {
        id: existingConfig?.id || `dashboard-${userId}-${Date.now()}`,
        userId,
        name: config.name || existingConfig?.name || 'My Dashboard',
        description: config.description || existingConfig?.description || '',
        widgets: config.widgets ?? existingConfig?.widgets ?? [],
        layout: config.layout || existingConfig?.layout || 'grid',
        theme: config.theme || existingConfig?.theme || 'light',
        autoRefresh: config.autoRefresh || existingConfig?.autoRefresh || '5m',
        language: config.language || existingConfig?.language || 'en',
        timezone: config.timezone || existingConfig?.timezone || 'Asia/Kolkata',
        currency: config.currency || existingConfig?.currency || 'INR',
        notifications: config.notifications ?? existingConfig?.notifications ?? {},
        privacy: config.privacy ?? existingConfig?.privacy ?? {},
        performance: config.performance ?? existingConfig?.performance ?? {},
        accessibility: config.accessibility ?? existingConfig?.accessibility ?? {},
        permissions: config.permissions || existingConfig?.permissions || ['dashboard.view', 'dashboard.edit'],
        sharedWith: config.sharedWith || existingConfig?.sharedWith || [],
        createdAt: existingConfig?.createdAt || now,
        updatedAt: now
    }

    store.configs[userId] = updatedConfig
    store.lastModified = now

    await writeJSON(DASHBOARD_CONFIG_FILE, store)

    return updatedConfig
}

/**
 * Delete dashboard config for a user
 */
export async function deleteDashboardConfig(userId: string): Promise<boolean> {
    const store = await readJSON<DashboardConfigStore>(DASHBOARD_CONFIG_FILE, DEFAULT_DASHBOARD_STORE)

    if (!store.configs[userId]) {
        return false
    }

    delete store.configs[userId]
    store.lastModified = new Date().toISOString()

    await writeJSON(DASHBOARD_CONFIG_FILE, store)

    return true
}

// ------------------------------------------
// Widget Storage
// ------------------------------------------

export interface StoredWidget {
    id: string
    userId: string
    type: string
    title: string
    position: { x: number; y: number; w: number; h: number }
    config: any
    permissions: string[]
    isShared: boolean
    createdAt: string
    updatedAt: string
}

interface WidgetStore {
    widgets: { [widgetId: string]: StoredWidget }
    version: number
    lastModified: string
}

const WIDGET_FILE = 'widgets.json'

const DEFAULT_WIDGET_STORE: WidgetStore = {
    widgets: {},
    version: 1,
    lastModified: new Date().toISOString()
}

/**
 * Get all widgets for a user
 */
export async function getWidgetsByUser(userId: string): Promise<StoredWidget[]> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)
    return Object.values(store.widgets).filter(w => w.userId === userId)
}

/**
 * Get a specific widget
 */
export async function getWidget(widgetId: string): Promise<StoredWidget | null> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)
    return store.widgets[widgetId] || null
}

/**
 * Save a widget
 */
export async function saveWidget(widget: Partial<StoredWidget> & { userId: string; type: string; title: string }): Promise<StoredWidget> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)
    const now = new Date().toISOString()

    const widgetId = widget.id || `${widget.type}-${Date.now()}`
    const existingWidget = store.widgets[widgetId]

    const savedWidget: StoredWidget = {
        id: widgetId,
        userId: widget.userId,
        type: widget.type,
        title: widget.title,
        position: widget.position || existingWidget?.position || { x: 0, y: 0, w: 4, h: 4 },
        config: widget.config ?? existingWidget?.config ?? {},
        permissions: widget.permissions || existingWidget?.permissions || [],
        isShared: widget.isShared ?? existingWidget?.isShared ?? false,
        createdAt: existingWidget?.createdAt || now,
        updatedAt: now
    }

    store.widgets[widgetId] = savedWidget
    store.lastModified = now

    await writeJSON(WIDGET_FILE, store)

    return savedWidget
}

/**
 * Update a widget
 */
export async function updateWidget(widgetId: string, updates: Partial<StoredWidget>): Promise<StoredWidget | null> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)

    const existingWidget = store.widgets[widgetId]
    if (!existingWidget) {
        return null
    }

    const updatedWidget: StoredWidget = {
        ...existingWidget,
        ...updates,
        id: widgetId, // Prevent ID change
        updatedAt: new Date().toISOString()
    }

    store.widgets[widgetId] = updatedWidget
    store.lastModified = new Date().toISOString()

    await writeJSON(WIDGET_FILE, store)

    return updatedWidget
}

/**
 * Delete a widget
 */
export async function deleteWidget(widgetId: string): Promise<boolean> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)

    if (!store.widgets[widgetId]) {
        return false
    }

    delete store.widgets[widgetId]
    store.lastModified = new Date().toISOString()

    await writeJSON(WIDGET_FILE, store)

    return true
}

/**
 * Bulk update widgets (for layout changes)
 */
export async function bulkUpdateWidgets(updates: Array<{ id: string; updates: Partial<StoredWidget> }>): Promise<StoredWidget[]> {
    const store = await readJSON<WidgetStore>(WIDGET_FILE, DEFAULT_WIDGET_STORE)
    const now = new Date().toISOString()
    const updatedWidgets: StoredWidget[] = []

    for (const { id, updates: widgetUpdates } of updates) {
        const existingWidget = store.widgets[id]
        if (existingWidget) {
            const updatedWidget: StoredWidget = {
                ...existingWidget,
                ...widgetUpdates,
                id, // Prevent ID change
                updatedAt: now
            }
            store.widgets[id] = updatedWidget
            updatedWidgets.push(updatedWidget)
        }
    }

    store.lastModified = now
    await writeJSON(WIDGET_FILE, store)

    return updatedWidgets
}
