import { type Page, expect } from '@playwright/test';
import { ACCOUNTS } from './env';

export async function adminUiLogin(
  page: Page,
  username = ACCOUNTS.admin.username,
  password = ACCOUNTS.admin.password,
) {
  await page.goto('/login');
  await page.getByPlaceholder('admin').fill(username);
  await page.getByPlaceholder('password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}
