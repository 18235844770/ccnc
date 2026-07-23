import { test, expect } from '@playwright/test';
import { healthCheck } from '../../helpers/api';
import { H5_URL, ADMIN_URL, API_URL } from '../../helpers/env';

test.describe('A. 环境冒烟', () => {
  test('API Swagger 可访问', async ({ request }) => {
    await healthCheck();
    const res = await request.get(`${API_URL}/api/docs`);
    expect(res.ok()).toBeTruthy();
  });

  test('H5 可打开登录页', async ({ page }) => {
    await page.goto(`${H5_URL}/#/pages/login/index`);
    await expect(page.getByText('碳中和服务平台')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('登录').first()).toBeVisible();
  });

  test('管理端登录页可打开', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await expect(page.getByText('Admin Login')).toBeVisible({ timeout: 15_000 });
  });
});
