import { type Page, expect } from '@playwright/test';
import { ACCOUNTS, h5Path } from './env';
import { userLogin, getMe } from './api';

/** UI 登录（走表单）。wot-design 的 placeholder 不在 input 属性上。 */
export async function h5Login(
  page: Page,
  username = ACCOUNTS.promoter.username,
  password = ACCOUNTS.promoter.password,
) {
  await page.goto(h5Path('/pages/login/index'));
  await expect(page.getByText('碳中和服务平台')).toBeVisible({ timeout: 20_000 });

  const inputs = page.locator('input');
  await expect(inputs.first()).toBeVisible({ timeout: 20_000 });
  await inputs.nth(0).fill(username);
  await inputs.nth(1).fill(password);

  // 登录按钮是 wd-button，无 native button role
  await page.locator('.login-btn, .wd-button').filter({ hasText: '登录' }).first().click();

  await expect(page).not.toHaveURL(/pages\/login\/index/, { timeout: 20_000 });
}

/**
 * API 登录后写入 pinia-unistorage key=`user`
 * 适合推广中心等后续页面流程
 */
export async function h5LoginByToken(
  page: Page,
  username = ACCOUNTS.promoter.username,
  password = ACCOUNTS.promoter.password,
) {
  const token = await userLogin(username, password);
  let userId = '';
  try {
    const me = await getMe(token);
    userId = String(me.data.id);
  } catch {
    /* optional */
  }

  await page.goto(h5Path('/pages/index/index'));
  await page.evaluate(
    ({ token, username, userId }) => {
      const payload = {
        token,
        isLogin: true,
        userInfo: {
          id: userId,
          username,
          name: username,
          avatar: '',
          phone: '',
          email: '',
          status: '',
        },
      };
      localStorage.setItem('user', JSON.stringify(payload));
    },
    { token, username, userId },
  );
  await page.reload();
  await page.waitForTimeout(500);
}

export async function h5Goto(page: Page, path: string) {
  await page.goto(h5Path(path));
}
