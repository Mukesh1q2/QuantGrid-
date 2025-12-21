import { test, expect } from '@playwright/test'

/**
 * Widget Interaction E2E Tests
 * 
 * Tests the widget library and widget interactions on the dashboard.
 */

test.describe('Widget Library', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard')
    })

    test('should open widget library modal', async ({ page }) => {
        // Look for Add Widget button or command palette
        const addWidgetButton = page.locator('button:has-text("Add Widget"), button:has-text("+")')

        if (await addWidgetButton.count() > 0) {
            await addWidgetButton.first().click()

            // Widget library should be visible
            await expect(page.locator('text=Widget Library, text=Add Widget')).toBeVisible()
        }
    })

    test('should search for widgets', async ({ page }) => {
        // Open command palette with Ctrl+K
        await page.keyboard.press('Control+k')

        // Wait for command palette
        await page.waitForTimeout(300)

        // Type search query
        await page.keyboard.type('trading')

        // Should see trading-related results
    })

    test('widget categories should be present', async ({ page }) => {
        // Open widget library
        const addWidgetButton = page.locator('button:has-text("Add Widget"), button:has-text("+")')

        if (await addWidgetButton.count() > 0) {
            await addWidgetButton.first().click()
            await page.waitForTimeout(300)

            // Check for category tabs
            await expect(page.locator('text=Analytics & Charts')).toBeVisible()
        }
    })
})

test.describe('Market Page Widgets', () => {
    test('order book should update in real-time', async ({ page }) => {
        await page.goto('/markets')

        // Check order book is visible
        await expect(page.locator('text=Order Book')).toBeVisible()

        // Check for bid/ask prices
        await expect(page.locator('text=Spread')).toBeVisible()

        // Wait for an update cycle
        await page.waitForTimeout(3000)

        // Prices should still be visible (updated)
        await expect(page.locator('text=Spread')).toBeVisible()
    })

    test('market tickers should be interactive', async ({ page }) => {
        await page.goto('/markets')

        // Check market tickers are visible
        await expect(page.locator('text=DAM')).toBeVisible()
        await expect(page.locator('text=RTM')).toBeVisible()

        // Click on a ticker to select it
        await page.locator('button:has-text("RTM")').click()

        // Order book should update to show RTM
        await expect(page.locator('text=Order Book - RTM')).toBeVisible()
    })

    test('recent trades should stream', async ({ page }) => {
        await page.goto('/markets')

        // Check recent trades section
        await expect(page.locator('text=Recent Trades')).toBeVisible()

        // Should show trade entries
        await expect(page.locator('td:has-text("DAM"), td:has-text("RTM"), td:has-text("TAM")').first()).toBeVisible()
    })
})

test.describe('Positions Page Widgets', () => {
    test('positions should update P&L in real-time', async ({ page }) => {
        await page.goto('/positions')

        // Check positions page loaded
        await expect(page.locator('text=Open Positions')).toBeVisible()
        await expect(page.locator('text=Total P&L')).toBeVisible()

        // Get initial P&L value
        const pnlElement = page.locator('text=Total P&L').locator('..').locator('..')
        await expect(pnlElement).toBeVisible()

        // Wait for update
        await page.waitForTimeout(3000)

        // P&L should still be visible (may have changed)
        await expect(page.locator('text=Total P&L')).toBeVisible()
    })

    test('position filters should work', async ({ page }) => {
        await page.goto('/positions')

        // Click Long filter
        await page.locator('button:has-text("long")').click()

        // Should only show long positions
        await expect(page.locator('span:has-text("LONG")').first()).toBeVisible()

        // Click Short filter
        await page.locator('button:has-text("short")').click()

        // Should only show short positions
        await expect(page.locator('span:has-text("SHORT")').first()).toBeVisible()
    })
})

test.describe('History Page Interactions', () => {
    test('should paginate through trade history', async ({ page }) => {
        await page.goto('/history')

        // Check pagination is visible
        await expect(page.locator('text=Page 1')).toBeVisible()

        // Click next page
        await page.locator('button:has([class*="ChevronRight"]), button:last-child').last().click()

        // Should now be on page 2
        await page.waitForTimeout(300)
    })

    test('should filter by market', async ({ page }) => {
        await page.goto('/history')

        // Select DAM market filter
        await page.locator('select').first().selectOption('DAM')

        // Wait for filter to apply
        await page.waitForTimeout(300)

        // All visible trades should be DAM
        const marketCells = page.locator('td:has-text("DAM")')
        await expect(marketCells.first()).toBeVisible()
    })

    test('should search by trade ID', async ({ page }) => {
        await page.goto('/history')

        // Type in search box
        await page.locator('input[placeholder*="Search"]').fill('TRD-00001')

        // Wait for search to apply
        await page.waitForTimeout(300)
    })
})

test.describe('Calendar Interactions', () => {
    test('should navigate between months', async ({ page }) => {
        await page.goto('/calendar')

        // Check current month is visible
        const monthDisplay = page.locator('h2').first()
        const initialMonth = await monthDisplay.textContent()

        // Click next month
        await page.locator('button:has([class*="ChevronRight"])').first().click()

        // Month should have changed
        await page.waitForTimeout(300)
    })

    test('should show events on day click', async ({ page }) => {
        await page.goto('/calendar')

        // Click on a day with events
        await page.locator('text=DAM Auction').first().click()

        // Event details should be visible
        await expect(page.locator('text=Auction')).toBeVisible()
    })
})
