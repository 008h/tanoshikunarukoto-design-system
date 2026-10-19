import { defineConfig, devices } from '@playwright/test';

const PORT = 4341;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `pnpm playground:build && pnpm playground:preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
  projects: [
    { name: 'light', use: { ...devices['Desktop Chrome'], colorScheme: 'light' }, grepInvert: /\[mobile\]/ },
    { name: 'dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' }, grepInvert: /\[mobile\]/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /\[mobile\]|full page screenshot/ },
  ],
});
