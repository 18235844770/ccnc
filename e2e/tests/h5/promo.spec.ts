import { test, expect } from '@playwright/test';
import { h5Login, h5LoginByToken, h5Goto } from '../../helpers/h5';
import { ACCOUNTS, INVITE_CODE } from '../../helpers/env';

test.describe('H5 登录（UI）', () => {
  test('推广员可从表单登录并离开登录页', async ({ page }) => {
    await h5Login(page, ACCOUNTS.promoter.username, ACCOUNTS.promoter.password);
    await expect(page.getByText('碳中和服务平台')).toHaveCount(0);
  });
});

test.describe('H5 推广中心与二维码', () => {
  test.beforeEach(async ({ page }) => {
    await h5LoginByToken(page, ACCOUNTS.promoter.username, ACCOUNTS.promoter.password);
  });

  test('进入推广中心，展示邀请码与二维码', async ({ page }) => {
    await h5Goto(page, '/pages/promo/index');

    await expect(page.getByText('推广中心').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('我的邀请码')).toBeVisible();
    await expect(page.getByText(INVITE_CODE)).toBeVisible();

    await expect(page.getByText('扫码注册')).toBeVisible();
    // uni-app H5 image 可能渲染为 img
    const qr = page.locator('.qr-card__img, img.qr-card__img, .qr-card image, .qr-card img').first();
    await expect(qr).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('保存二维码')).toBeVisible();
    await expect(page.getByText('复制邀请码')).toBeVisible();
    await expect(page.getByText('复制推广链接')).toBeVisible();
  });

  test('收益明细汇总含待结算/已结算/已发放', async ({ page }) => {
    await h5Goto(page, '/pages/promo/commission');

    await expect(page.getByText('推广收益').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.summary-item__lbl').filter({ hasText: '待结算' })).toBeVisible();
    await expect(page.locator('.summary-item__lbl').filter({ hasText: '已结算' })).toBeVisible();
    await expect(page.locator('.summary-item__lbl').filter({ hasText: '已发放' })).toBeVisible();
  });
});
