import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'test-ui.ts',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3100',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
})
