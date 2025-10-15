import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e/specs',
  reporter: [
    ['list'], 
    ['junit', { outputFile: 'artifacts/junit-e2e.xml' }], 
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }]
  ],
  use: { 
    baseURL: 'http://localhost:3000', 
    trace: 'on-first-retry' 
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile', use: { ...devices['Pixel 7'] } }
  ]
});




