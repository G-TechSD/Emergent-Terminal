/**
 * Visual UI test for Emergent Terminal
 * Run with: npx playwright test test-ui.ts --headed
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const TOKEN_FILE = path.join(__dirname, '.local-storage/emergent-token.json')
const BASE_URL = 'http://localhost:3100'

test.describe('Emergent Terminal E2E', () => {
  let token: string

  test.beforeAll(() => {
    // Load token
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
    token = tokenData.token
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto(BASE_URL)
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    
    // Check login form elements
    await expect(page.locator('h1')).toContainText('Emergent Terminal')
    await expect(page.locator('input#token')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true })
  })

  test('can authenticate with token', async ({ page }) => {
    await page.goto(BASE_URL)
    
    // Fill in token
    await page.fill('input#token', token)
    await page.click('button[type="submit"]')
    
    // Should redirect to main terminal
    await expect(page).toHaveURL(BASE_URL + '/')
    
    // Wait for terminal to load
    await page.waitForSelector('#terminal', { timeout: 5000 })
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/02-terminal-loaded.png', fullPage: true })
  })

  test('terminal is interactive', async ({ page }) => {
    // Go directly with token
    await page.goto(`${BASE_URL}/?token=${token}`)
    
    // Wait for terminal
    await page.waitForSelector('#terminal', { timeout: 5000 })
    await page.waitForTimeout(2000) // Wait for WebSocket connection
    
    // Type a command
    await page.keyboard.type('echo "Hello from Playwright test"')
    await page.keyboard.press('Enter')
    
    // Wait for output
    await page.waitForTimeout(1000)
    
    // Screenshot showing command output
    await page.screenshot({ path: 'screenshots/03-terminal-interactive.png', fullPage: true })
  })

  test('header buttons are functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/?token=${token}`)
    await page.waitForSelector('#terminal', { timeout: 5000 })
    
    // Check header elements
    await expect(page.locator('.logo')).toContainText('Emergent Terminal')
    await expect(page.locator('#clearBtn')).toBeVisible()
    await expect(page.locator('#newSessionBtn')).toBeVisible()
    
    // Click clear button
    await page.click('#clearBtn')
    await page.waitForTimeout(500)
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/04-after-clear.png', fullPage: true })
  })

  test('status bar shows connection status', async ({ page }) => {
    await page.goto(`${BASE_URL}/?token=${token}`)
    await page.waitForSelector('#terminal', { timeout: 5000 })
    await page.waitForTimeout(2000)
    
    // Check status
    const statusDot = page.locator('#statusDot')
    await expect(statusDot).toHaveClass(/connected/)
    
    const statusText = page.locator('#statusText')
    await expect(statusText).toContainText('Connected')
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/05-connected-status.png', fullPage: true })
  })
})
