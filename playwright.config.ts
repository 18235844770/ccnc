import { defineConfig, devices } from '@playwright/test';

const H5_BASE = process.env.E2E_H5_URL || 'http://localhost:5174';
const ADMIN_BASE = process.env.E2E_ADMIN_URL || 'http://localhost:5173';
const API_BASE = process.env.E2E_API_URL || 'http://localhost:3000';

/**
 * CCNC 页面流程化测试
 * 前置：已启动后端 / H5 / 管理端（见 docs/手动流程测试步骤清单.md）
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/playwright-report' }]],
  outputDir: 'e2e/test-results',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'zh-CN',
  },
  projects: [
    {
      name: 'h5',
      use: {
        ...devices['Pixel 7'],
        baseURL: H5_BASE,
        channel: 'chrome',
      },
      testMatch: /h5\/.*\.spec\.ts/,
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ADMIN_BASE,
        channel: 'chrome',
      },
      testMatch: /admin\/.*\.spec\.ts/,
    },
    {
      name: 'api',
      use: {
        baseURL: API_BASE,
        channel: 'chrome',
      },
      testMatch: /api\/.*\.spec\.ts/,
    },
  ],
});
