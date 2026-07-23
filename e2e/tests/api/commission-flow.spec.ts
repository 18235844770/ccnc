import { test, expect } from '@playwright/test';
import {
  adminLogin,
  userRegister,
  userLogin,
  submitRealname,
  getMe,
  adjustBalance,
  createOrder,
  payOrder,
  listAdminCommissions,
  getWallets,
  runSettlement,
  healthCheck,
} from '../../helpers/api';
import { INVITE_CODE } from '../../helpers/env';

/**
 * 分润主路径（API 流程化，对齐手动清单 C～E 的数据侧）
 * 页面断言放在 H5/admin 用例；此处保证可重复造数 + 结算幂等。
 */
test.describe('分润 API 流程', () => {
  test.beforeAll(async () => {
    await healthCheck();
  });

  test('新下线首投产生 PENDING 分润，支付瞬间推广员余额不增加', async () => {
    const adminToken = await adminLogin();
    const suffix = `${Date.now()}`.slice(-8);
    const username = `e2e${suffix}`;

    await userRegister(username, '123456', INVITE_CODE);
    const userToken = await userLogin(username, '123456');
    await submitRealname(userToken);
    const me = await getMe(userToken);
    const userId = me.data.id;

    const promoterToken = await userLogin('promoter', '123456');
    const beforeWallets = await getWallets(promoterToken);
    const beforeBal = beforeWallets.data.find((w) => w.type === 'BALANCE')?.balance_available ?? 0;

    await adjustBalance(adminToken, userId, 5000);
    const created = await createOrder(userToken, 1, 1000);
    const orderId = created.data.order_id;
    await payOrder(userToken, orderId, 1000);

    // 等待同步/队列计算
    await new Promise((r) => setTimeout(r, 1500));

    const commissions = await listAdminCommissions(adminToken);
    const related = commissions.data.list.filter((c) => String(c.source_order_id) === String(orderId));
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((c) => c.status === 'PENDING')).toBeTruthy();

    const afterWallets = await getWallets(promoterToken);
    const afterBal = afterWallets.data.find((w) => w.type === 'BALANCE')?.balance_available ?? 0;
    expect(afterBal).toBe(beforeBal);
  });

  test('run-settlement 幂等：无待结算订单时 settled/paid 为 0', async () => {
    const adminToken = await adminLogin();
    // 先空跑一次清掉可能残留（ACTIVE 订单的 PENDING 不会被结算）
    const first = await runSettlement(adminToken);
    expect(first.status).toBe('success');
    expect(typeof first.data.settled).toBe('number');
    expect(typeof first.data.paid).toBe('number');

    const second = await runSettlement(adminToken);
    expect(second.data.settled).toBe(0);
    expect(second.data.paid).toBe(0);
  });
});
