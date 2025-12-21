'use client'

import { useEffect, useCallback } from 'react'

// ========================
// Types
// ========================
export interface DashboardWidget {
    id: string
    type: string
    title: string
    position: { x: number; y: number; w: number; h: number }
    config?: Record<string, any>
}

export interface DashboardState {
    version: string
    lastSaved: string
    widgets: DashboardWidget[]
    layout: any
    preferences: {
        theme: 'light' | 'dark' | 'system'
        sidebarCollapsed: boolean
        refreshInterval: number
    }
}

const STORAGE_KEY = 'optibid-dashboard-state'
const STATE_VERSION = '1.0.0'

// ========================
// Core Functions
// ========================

// Save dashboard state to localStorage
export function saveDashboardState(state: Partial<DashboardState>): void {
    try {
        const existing = loadDashboardState()
        const newState: DashboardState = {
            version: STATE_VERSION,
            lastSaved: new Date().toISOString(),
            widgets: state.widgets ?? existing?.widgets ?? [],
            layout: state.layout ?? existing?.layout ?? null,
            preferences: {
                ...existing?.preferences,
                ...state.preferences,
                theme: state.preferences?.theme ?? existing?.preferences?.theme ?? 'dark',
                sidebarCollapsed: state.preferences?.sidebarCollapsed ?? existing?.preferences?.sidebarCollapsed ?? false,
                refreshInterval: state.preferences?.refreshInterval ?? existing?.preferences?.refreshInterval ?? 30000,
            }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch (error) {
        console.error('[Persistence] Failed to save dashboard state:', error)
    }
}

// Load dashboard state from localStorage
export function loadDashboardState(): DashboardState | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return null

        const state = JSON.parse(saved) as DashboardState

        // Version migration if needed
        if (state.version !== STATE_VERSION) {
            console.log('[Persistence] Migrating state from', state.version, 'to', STATE_VERSION)
            // Add migration logic here if needed
        }

        return state
    } catch (error) {
        console.error('[Persistence] Failed to load dashboard state:', error)
        return null
    }
}

// Clear dashboard state
export function clearDashboardState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('[Persistence] Failed to clear dashboard state:', error)
    }
}

// ========================
// Widget Persistence
// ========================

export function saveWidgets(widgets: DashboardWidget[]): void {
    saveDashboardState({ widgets })
}

export function loadWidgets(): DashboardWidget[] {
    return loadDashboardState()?.widgets ?? []
}

// ========================
// Layout Persistence
// ========================

export function saveLayout(layout: any): void {
    saveDashboardState({ layout })
}

export function loadLayout(): any {
    return loadDashboardState()?.layout ?? null
}

// ========================
// Preferences Persistence
// ========================

export function savePreferences(preferences: Partial<DashboardState['preferences']>): void {
    saveDashboardState({ preferences: preferences as DashboardState['preferences'] })
}

export function loadPreferences(): DashboardState['preferences'] {
    return loadDashboardState()?.preferences ?? {
        theme: 'dark',
        sidebarCollapsed: false,
        refreshInterval: 30000
    }
}

// ========================
// React Hook
// ========================

export function useDashboardPersistence() {
    // Load initial state
    const loadState = useCallback(() => {
        return loadDashboardState()
    }, [])

    // Save state with debounce
    const saveState = useCallback((state: Partial<DashboardState>) => {
        saveDashboardState(state)
    }, [])

    // Auto-save on changes
    const autoSave = useCallback((state: Partial<DashboardState>, debounceMs: number = 1000) => {
        const timeoutId = setTimeout(() => {
            saveDashboardState(state)
        }, debounceMs)
        return () => clearTimeout(timeoutId)
    }, [])

    return {
        loadState,
        saveState,
        autoSave,
        clearState: clearDashboardState
    }
}

// ========================
// Export/Import
// ========================

export function exportDashboardState(): string {
    const state = loadDashboardState()
    if (!state) return ''
    return JSON.stringify(state, null, 2)
}

export function importDashboardState(json: string): boolean {
    try {
        const state = JSON.parse(json) as DashboardState
        if (!state.version || !state.widgets) {
            throw new Error('Invalid dashboard state format')
        }
        saveDashboardState(state)
        return true
    } catch (error) {
        console.error('[Persistence] Failed to import dashboard state:', error)
        return false
    }
}
