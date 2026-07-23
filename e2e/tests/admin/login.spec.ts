import { test, expect } from '@playwright/test';
import { adminUiLogin } from '../../helpers/admin';

test.describe('管理端登录与佣金页', () => {
  test('admin 登录成功进入后台', async ({ page }) => {
    await adminUiLogin(page);
    // 登录后不应停留在 login
    await expect(page).not.toHaveURL(/\/login/);
    // 侧栏/首页常见文字（兼容不同落地页）
    await expect(page.locator('body')).toContainText(/Dashboard|仪表|用户|佣金|分销|系统|概览|首页/i);
  });

  test('可打开佣金管理列表', async ({ page }) => {
    await adminUiLogin(page);
    await page.goto('/finance/commission');
    await expect(page.locator('body')).toContainText(/佣金|分润|状态|金额|待结算|已发放|PENDING|PAID|列表/i, {
      timeout: 20_000,
    });
  });
});
