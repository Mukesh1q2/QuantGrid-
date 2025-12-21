import { test, expect } from '@playwright/test'

/**
 * Dashboard Navigation E2E Tests
 * 
 * Tests the main navigation flow across all dashboard pages.
 */

test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should load the main dashboard page', async ({ page }) => {
        await page.goto('/dashboard')

        // Check page title
        await expect(page).toHaveTitle(/OptiBid Energy/)

        // Check for main dashboard elements
        await expect(page.locator('text=Dashboard').first()).toBeVisible()
    })

    test('should navigate to trading page', async ({ page }) => {
        await page.goto('/trading')

        // Check trading page elements
        await expect(page.locator('text=Energy Trading')).toBeVisible()
        await expect(page.locator('text=DAM')).toBeVisible()
    })

    test('should navigate to markets page', async ({ page }) => {
        await page.goto('/markets')

        // Check markets page elements
        await expect(page.locator('text=Live Markets')).toBeVisible()
        await expect(page.locator('text=Order Book')).toBeVisible()
    })

    test('should navigate to assets page', async ({ page }) => {
        await page.goto('/assets')

        // Check assets page elements
        await expect(page.locator('text=Asset Portfolio')).toBeVisible()
        await expect(page.locator('text=Total Capacity')).toBeVisible()
    })

    test('should navigate to alerts page', async ({ page }) => {
        await page.goto('/alerts')

        // Check alerts page elements
        await expect(page.locator('text=Alert Center')).toBeVisible()
        await expect(page.locator('text=Create Alert')).toBeVisible()
    })

    test('should navigate to calendar page', async ({ page }) => {
        await page.goto('/calendar')

        // Check calendar page elements
        await expect(page.locator('text=Trading Calendar')).toBeVisible()
    })

    test('should navigate to positions page', async ({ page }) => {
        await page.goto('/positions')

        // Check positions page elements
        await expect(page.locator('text=Open Positions')).toBeVisible()
        await expect(page.locator('text=Total P&L')).toBeVisible()
    })

    test('should navigate to history page', async ({ page }) => {
        await page.goto('/history')

        // Check history page elements
        await expect(page.locator('text=Trade History')).toBeVisible()
        await expect(page.locator('text=Export CSV')).toBeVisible()
    })

    test('should navigate to analytics page', async ({ page }) => {
        await page.goto('/dashboard/analytics')

        // Check analytics page elements
        await expect(page.locator('text=Analytics Dashboard')).toBeVisible()
    })

    test('should navigate to reports page', async ({ page }) => {
        await page.goto('/dashboard/reports')

        // Check reports page elements
        await expect(page.locator('text=Reports')).toBeVisible()
    })
})

test.describe('Sidebar Navigation', () => {
    test('sidebar should be visible on dashboard pages', async ({ page }) => {
        await page.goto('/markets')

        // Check sidebar is visible
        await expect(page.locator('text=OptiBid').first()).toBeVisible()
        await expect(page.locator('text=Dashboard').first()).toBeVisible()
        await expect(page.locator('text=Trading').first()).toBeVisible()
    })

    test('sidebar collapse should work with keyboard shortcut', async ({ page }) => {
        await page.goto('/markets')

        // Press [ to collapse sidebar
        await page.keyboard.press('[')

        // Wait for animation
        await page.waitForTimeout(300)

        // The sidebar should now be collapsed (width reduced)
        // We can check by looking for the tooltip behavior
    })
})

test.describe('AI Insights Bar', () => {
    test('AI insights bar should be visible', async ({ page }) => {
        await page.goto('/markets')

        // Check AI insights bar is present
        await expect(page.locator('text=AI Insights').first()).toBeVisible()
    })

    test('AI insights should cycle through predictions', async ({ page }) => {
        await page.goto('/markets')

        // AI bar should show various insight types
        const insightBar = page.locator('text=AI Insights').first()
        await expect(insightBar).toBeVisible()
    })
})
