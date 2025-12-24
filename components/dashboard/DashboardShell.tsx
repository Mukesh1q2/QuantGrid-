'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
    children: React.ReactNode
    className?: string
}

/**
 * DashboardShell
 * 
 * Provides the standard layout structure for dashboard pages:
 * - Collapsible Sidebar
 * - specific main content area with proper margin/transition
 */
export function DashboardShell({ children, className = '' }: DashboardShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onCollapsedChange={setSidebarCollapsed} />

            <div
                className={`transition-all duration-200 ${className}`}
                style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
            >
                {children}
            </div>
        </div>
    )
}
