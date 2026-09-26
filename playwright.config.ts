import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the production build:  npm run build && npm run test:e2e
 * Port 3100 runs on sample data. Port 3101 runs with nothing connected (the state before the sheet exists).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 2,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: [
    { command: 'npx next start -p 3100', url: 'http://127.0.0.1:3100', timeout: 90_000, env: { DATA_MODE: 'sample', NEXT_TELEMETRY_DISABLED: '1' } },
    { command: 'npx next start -p 3101', url: 'http://127.0.0.1:3101', timeout: 90_000, env: { DATA_MODE: '', APPS_SCRIPT_URL: '', APPS_SCRIPT_SECRET: '', NEXT_TELEMETRY_DISABLED: '1' } },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
