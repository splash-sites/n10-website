import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('redirects to a language and shows the roster', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveURL(/\/(en|fr|nl)$/)
    await expect(page).toHaveTitle(/Numéro 10/)
    await expect(page.locator('#talents')).toBeVisible()
  })
})
