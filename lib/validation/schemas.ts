import { z } from 'zod'

/**
 * API Validation Schemas
 * 
 * Zod schemas for validating API request bodies, query params, and responses.
 * Provides runtime type safety and automatic error messages.
 */

// ============================================================================
// Common Schemas
// ============================================================================

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const timestampSchema = z.string().datetime().or(z.date())

export const idSchema = z.string().min(1).max(100)

// ============================================================================
// Widget Schemas
// ============================================================================

export const widgetPositionSchema = z.object({
    x: z.number().int().min(0).max(12),
    y: z.number().int().min(0),
    w: z.number().int().min(1).max(12),
    h: z.number().int().min(1).max(8)
})

export const widgetConfigSchema = z.record(z.unknown()).default({})

export const createWidgetSchema = z.object({
    type: z.string().min(1).max(50),
    title: z.string().min(1).max(100),
    position: widgetPositionSchema,
    config: widgetConfigSchema.optional(),
    permissions: z.array(z.string()).optional()
})

export const updateWidgetSchema = z.object({
    id: idSchema,
    title: z.string().min(1).max(100).optional(),
    position: widgetPositionSchema.optional(),
    config: widgetConfigSchema.optional(),
    permissions: z.array(z.string()).optional()
})

export const bulkUpdateWidgetsSchema = z.object({
    operation: z.literal('bulk-update'),
    widgets: z.array(updateWidgetSchema)
})

// ============================================================================
// Dashboard Config Schemas
// ============================================================================

export const dashboardThemeSchema = z.enum(['light', 'dark', 'system'])

export const notificationSettingsSchema = z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    priceAlerts: z.boolean().default(true),
    systemAlerts: z.boolean().default(true)
})

export const privacySettingsSchema = z.object({
    showOnlineStatus: z.boolean().default(true),
    shareAnalytics: z.boolean().default(true)
})

export const performanceSettingsSchema = z.object({
    reduceAnimations: z.boolean().default(false),
    lazyLoadWidgets: z.boolean().default(true)
})

export const accessibilitySettingsSchema = z.object({
    highContrast: z.boolean().default(false),
    largeText: z.boolean().default(false)
})

export const createDashboardSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    theme: dashboardThemeSchema.default('light')
})

export const updateDashboardSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    theme: dashboardThemeSchema.optional(),
    widgets: z.array(z.unknown()).optional(),
    layout: z.enum(['grid', 'free']).optional(),
    language: z.string().length(2).optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3).optional(),
    autoRefresh: z.string().optional(),
    notifications: notificationSettingsSchema.optional(),
    privacy: privacySettingsSchema.optional(),
    performance: performanceSettingsSchema.optional(),
    accessibility: accessibilitySettingsSchema.optional()
})

// ============================================================================
// Trading Schemas
// ============================================================================

export const marketSchema = z.enum(['DAM', 'RTM', 'TAM', 'GDAM', 'HPDAM'])

export const orderTypeSchema = z.enum(['buy', 'sell'])

export const orderStatusSchema = z.enum(['pending', 'filled', 'partial', 'cancelled', 'rejected'])

export const createOrderSchema = z.object({
    market: marketSchema,
    type: orderTypeSchema,
    quantity: z.number().positive().max(10000), // Max 10,000 MWh
    price: z.number().positive().max(20), // Max ₹20/kWh
    validUntil: timestampSchema.optional()
})

export const cancelOrderSchema = z.object({
    orderId: idSchema,
    reason: z.string().max(200).optional()
})

// ============================================================================
// Alert Schemas
// ============================================================================

export const alertTypeSchema = z.enum(['price', 'volume', 'system', 'custom'])

export const alertConditionSchema = z.enum(['above', 'below', 'equals', 'changes'])

export const createAlertSchema = z.object({
    name: z.string().min(1).max(100),
    type: alertTypeSchema,
    condition: alertConditionSchema,
    threshold: z.number(),
    zone: z.string().optional(),
    market: marketSchema.optional(),
    enabled: z.boolean().default(true),
    notifyEmail: z.boolean().default(true),
    notifyPush: z.boolean().default(true)
})

// ============================================================================
// Report Schemas
// ============================================================================

export const reportFormatSchema = z.enum(['PDF', 'Excel', 'CSV'])

export const reportTypeSchema = z.enum(['trading', 'compliance', 'performance', 'billing', 'custom'])

export const generateReportSchema = z.object({
    templateId: z.string().min(1),
    format: reportFormatSchema,
    dateRange: z.object({
        start: timestampSchema,
        end: timestampSchema
    }),
    filters: z.record(z.unknown()).optional()
})

// ============================================================================
// Validation Helpers
// ============================================================================

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: z.ZodError }

/**
 * Validate data against a schema
 */
export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    return { success: false, errors: result.error }
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}

    for (const issue of error.issues) {
        const path = issue.path.join('.') || 'root'
        if (!formatted[path]) {
            formatted[path] = []
        }
        formatted[path].push(issue.message)
    }

    return formatted
}

/**
 * Create error response from Zod error
 */
export function createValidationErrorResponse(error: z.ZodError): Response {
    return new Response(
        JSON.stringify({
            error: 'Validation failed',
            details: formatValidationErrors(error)
        }),
        {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}

export default {
    // Widget
    createWidgetSchema,
    updateWidgetSchema,
    bulkUpdateWidgetsSchema,

    // Dashboard
    createDashboardSchema,
    updateDashboardSchema,

    // Trading
    createOrderSchema,
    cancelOrderSchema,

    // Alerts
    createAlertSchema,

    // Reports
    generateReportSchema,

    // Helpers
    validate,
    formatValidationErrors,
    createValidationErrorResponse
}
