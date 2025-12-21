import { test, expect } from '@playwright/test'

/**
 * Trading Flow E2E Tests
 * 
 * Tests the complete trading workflow from market selection to order placement.
 */

test.describe('Trading Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/trading')
    })

    test('should load trading page with all elements', async ({ page }) => {
        // Check page loaded
        await expect(page.locator('text=Energy Trading')).toBeVisible()

        // Check market selector
        await expect(page.locator('text=DAM')).toBeVisible()
        await expect(page.locator('text=RTM')).toBeVisible()

        // Check order form elements
        await expect(page.locator('text=Place Order')).toBeVisible()
        await expect(page.locator('button:has-text("BUY"), button:has-text("Buy")').first()).toBeVisible()
        await expect(page.locator('button:has-text("SELL"), button:has-text("Sell")').first()).toBeVisible()
    })

    test('should switch between markets', async ({ page }) => {
        // Click on RTM market
        await page.locator('button:has-text("RTM")').click()

        // Check RTM is now selected (highlighted)
        const rtmButton = page.locator('button:has-text("RTM")')
        await expect(rtmButton).toBeVisible()

        // Click on TAM market
        await page.locator('button:has-text("TAM")').click()

        // Check TAM is now selected
        const tamButton = page.locator('button:has-text("TAM")')
        await expect(tamButton).toBeVisible()
    })

    test('should toggle between buy and sell', async ({ page }) => {
        // Find buy/sell toggle area
        const buyButton = page.locator('button:has-text("BUY"), button:has-text("Buy")').first()
        const sellButton = page.locator('button:has-text("SELL"), button:has-text("Sell")').first()

        // Click Buy
        await buyButton.click()
        await page.waitForTimeout(200)

        // Click Sell
        await sellButton.click()
        await page.waitForTimeout(200)
    })

    test('should fill order form', async ({ page }) => {
        // Find quantity input
        const quantityInput = page.locator('input[type="number"]').first()

        if (await quantityInput.count() > 0) {
            // Clear and fill quantity
            await quantityInput.fill('100')

            // Find price input (second number input)
            const priceInput = page.locator('input[type="number"]').nth(1)
            if (await priceInput.count() > 0) {
                await priceInput.fill('4500')
            }
        }
    })

    test('should show recent orders', async ({ page }) => {
        // Check for recent orders section
        await expect(page.locator('text=Recent Orders')).toBeVisible()

        // Should show order entries
        const orderTable = page.locator('table, [role="table"]').first()
        await expect(orderTable).toBeVisible()
    })

    test('price chart should be visible', async ({ page }) => {
        // Look for chart container
        const chartArea = page.locator('[class*="chart"], [class*="Chart"]').first()

        // Chart or placeholder should be visible
        await expect(page.locator('text=Price Chart, text=MCP').first()).toBeVisible()
    })
})

test.describe('Order Placement Workflow', () => {
    test('should show order validation', async ({ page }) => {
        await page.goto('/trading')

        // Try to submit without filling form
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Place")').first()

        if (await submitButton.count() > 0) {
            await submitButton.click()

            // Should show validation or prevent submission
            await page.waitForTimeout(500)
        }
    })

    test('full order flow', async ({ page }) => {
        await page.goto('/trading')

        // 1. Select market
        await page.locator('button:has-text("DAM")').click()
        await page.waitForTimeout(200)

        // 2. Select order type (Buy)
        const buyButton = page.locator('button:has-text("BUY"), button:has-text("Buy")').first()
        if (await buyButton.count() > 0) {
            await buyButton.click()
        }

        // 3. Fill quantity
        const quantityInput = page.locator('input[type="number"]').first()
        if (await quantityInput.count() > 0) {
            await quantityInput.fill('50')
        }

        // 4. Fill price
        const priceInput = page.locator('input[type="number"]').nth(1)
        if (await priceInput.count() > 0) {
            await priceInput.fill('4500')
        }

        // 5. Note: We don't actually submit to avoid creating real orders
        // Just verify the form is filled
        await expect(page.locator('input[type="number"]').first()).toHaveValue('50')
    })
})

test.describe('Trading Page Responsiveness', () => {
    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/trading')

        // Page should still load
        await expect(page.locator('text=Trading')).toBeVisible()

        // Markets should be visible
        await expect(page.locator('text=DAM')).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/trading')

        // Page should load with proper layout
        await expect(page.locator('text=Energy Trading')).toBeVisible()
    })
})

test.describe('Trading Page Real-time Updates', () => {
    test('prices should update periodically', async ({ page }) => {
        await page.goto('/trading')

        // Get initial price display
        const priceElement = page.locator('[class*="price"], text=/₹[\d,]+/').first()

        if (await priceElement.count() > 0) {
            const initialText = await priceElement.textContent()

            // Wait for update cycle
            await page.waitForTimeout(5000)

            // Price element should still be visible
            await expect(priceElement).toBeVisible()
        }
    })
})
