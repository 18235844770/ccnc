import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });

  const role = await prisma.sysRole.upsert({
    where: { key: 'admin' },
    update: {},
    create: { name: '超级管理员', key: 'admin', status: 'ACTIVE' },
  });

  await prisma.adminUserRole.upsert({
    where: { user_id_role_id: { user_id: admin.id, role_id: role.id } },
    update: {},
    create: { user_id: admin.id, role_id: role.id },
  });

  const menus = [
    { id: 1, parent_id: 0, name: '仪表盘', type: 2, path: '/dashboard', component: 'views/dashboard/index', permission: 'stats:view', sort: 0 },
    { id: 200, parent_id: 0, name: '用户管理', type: 1, path: '/user', component: 'Layout', permission: '', sort: 2 },
    { id: 201, parent_id: 200, name: '用户列表', type: 2, path: 'manage', component: 'views/user/manage/index', permission: 'user:list', sort: 1 },
    { id: 300, parent_id: 0, name: '产品管理', type: 1, path: '/product', component: 'Layout', permission: '', sort: 3 },
    { id: 301, parent_id: 300, name: '产品列表', type: 2, path: 'list', component: 'views/product/list/index', permission: 'product:list', sort: 1 },
    { id: 400, parent_id: 0, name: '财务管理', type: 1, path: '/finance', component: 'Layout', permission: '', sort: 4 },
    { id: 401, parent_id: 400, name: '订单管理', type: 2, path: 'order', component: 'views/finance/order/index', permission: 'finance:order:list', sort: 1 },
    { id: 402, parent_id: 400, name: '提现审核', type: 2, path: 'withdraw', component: 'views/finance/withdraw/index', permission: 'finance:withdraw:list', sort: 2 },
    { id: 403, parent_id: 400, name: '资金流水', type: 2, path: 'ledger', component: 'views/finance/ledger/index', permission: 'finance:ledger:list', sort: 3 },
    { id: 404, parent_id: 400, name: '佣金管理', type: 2, path: 'commission', component: 'views/finance/commission/index', permission: 'finance:commission:list', sort: 4 },
    { id: 500, parent_id: 0, name: '推广管理', type: 1, path: '/promotion', component: 'Layout', permission: '', sort: 5 },
    { id: 501, parent_id: 500, name: '分销商管理', type: 2, path: 'distributor', component: 'views/promotion/distributor/index', permission: 'promo:list', sort: 1 },
    { id: 600, parent_id: 0, name: '内容管理', type: 1, path: '/content', component: 'Layout', permission: '', sort: 6 },
    { id: 601, parent_id: 600, name: 'Banner管理', type: 2, path: 'banner', component: 'views/content/banner/index', permission: 'content:banner:list', sort: 1 },
    { id: 602, parent_id: 600, name: '文章管理', type: 2, path: 'article', component: 'views/content/article/index', permission: 'content:article:list', sort: 2 },
    { id: 700, parent_id: 0, name: '风控中心', type: 2, path: '/risk', component: 'views/risk/index', permission: 'risk:view', sort: 7 },
    { id: 100, parent_id: 0, name: '系统管理', type: 1, path: '/system', component: 'Layout', permission: '', sort: 8 },
    { id: 101, parent_id: 100, name: '管理员管理', type: 2, path: 'admin', component: 'views/system/admin/index', permission: 'system:admin:list', sort: 1 },
    { id: 102, parent_id: 100, name: '角色管理', type: 2, path: 'role', component: 'views/system/role/index', permission: 'system:role:list', sort: 2 },
    { id: 103, parent_id: 100, name: '菜单管理', type: 2, path: 'menu', component: 'views/system/menu/index', permission: 'system:menu:list', sort: 3 },
    { id: 104, parent_id: 100, name: '审计日志', type: 2, path: 'log', component: 'views/system/log/index', permission: 'system:log:list', sort: 4 },
    { id: 11, parent_id: 1, name: '导出报表', type: 3, path: '', component: '', permission: 'stats:export', sort: 1 },
    { id: 2011, parent_id: 201, name: '用户封禁', type: 3, path: '', component: '', permission: 'user:ban', sort: 2 },
    { id: 2012, parent_id: 201, name: '关系调整', type: 3, path: '', component: '', permission: 'user:adjust', sort: 3 },
    { id: 3011, parent_id: 301, name: '发布产品', type: 3, path: '', component: '', permission: 'product:add', sort: 2 },
    { id: 3012, parent_id: 301, name: '编辑产品', type: 3, path: '', component: '', permission: 'product:edit', sort: 3 },
    { id: 3013, parent_id: 301, name: '删除产品', type: 3, path: '', component: '', permission: 'product:delete', sort: 4 },
    { id: 3014, parent_id: 301, name: '上下架', type: 3, path: '', component: '', permission: 'product:status', sort: 5 },
  ];

  for (const m of menus) {
    await prisma.sysMenu.upsert({
      where: { id: m.id },
      update: { ...m, visible: true },
      create: { ...m, visible: true },
    });
    await prisma.sysRoleMenu.upsert({
      where: { role_id_menu_id: { role_id: role.id, menu_id: m.id } },
      update: {},
      create: { role_id: role.id, menu_id: m.id },
    });
  }

  const presetRoles = [
    { key: 'ops', name: '运营', menus: [1, 11, 200, 201, 2011, 2012, 300, 301, 3011, 3012, 3013, 3014, 500, 501, 600, 601, 602] },
    { key: 'finance', name: '财务', menus: [1, 11, 400, 401, 402, 403, 404] },
    { key: 'risk', name: '风控', menus: [1, 700] },
  ];

  for (const r of presetRoles) {
    const presetRole = await prisma.sysRole.upsert({
      where: { key: r.key },
      update: { name: r.name, status: 'ACTIVE' },
      create: { name: r.name, key: r.key, status: 'ACTIVE' },
    });
    for (const menuId of r.menus) {
      await prisma.sysRoleMenu.upsert({
        where: { role_id_menu_id: { role_id: presetRole.id, menu_id: menuId } },
        update: {},
        create: { role_id: presetRole.id, menu_id: menuId },
      });
    }
  }

  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '碳汇稳健型 30 天',
      description: '碳交易相关固定收益产品',
      yield_rate: 0.08,
      cycle_days: 30,
      min_amount: 1000,
      status: 'ON_SALE',
    },
  });

  await prisma.banner.upsert({
    where: { id: 1 },
    update: {
      title: '欢迎使用 CCNC',
      image_url: 'https://picsum.photos/800/400?random=1',
      link_url: '/pages/carbon/index',
      status: 'ACTIVE',
      sort_order: 1,
    },
    create: {
      id: 1,
      title: '欢迎使用 CCNC',
      image_url: 'https://picsum.photos/800/400?random=1',
      link_url: '/pages/carbon/index',
      status: 'ACTIVE',
      sort_order: 1,
    },
  });

  await prisma.banner.upsert({
    where: { id: 2 },
    update: {
      title: '碳中和资讯',
      image_url: 'https://picsum.photos/800/400?random=2',
      link_url: '/pages/consultation/index',
      status: 'ACTIVE',
      sort_order: 2,
    },
    create: {
      id: 2,
      title: '碳中和资讯',
      image_url: 'https://picsum.photos/800/400?random=2',
      link_url: '/pages/consultation/index',
      status: 'ACTIVE',
      sort_order: 2,
    },
  });

  await prisma.article.upsert({
    where: { id: 1 },
    update: {
      title: '考克利尔竞立助力全球碳中和发展',
      description: '推动绿色能源转型，共建可持续未来',
      content: '<p>碳中和目标下，新能源与碳汇项目正成为重要投资方向。请理性看待收益，注意投资风险。</p>',
      tags: '资讯,碳中和',
      cover_image: 'https://picsum.photos/400/300?random=1',
      status: 'PUBLISHED',
      sort_order: 1,
      publish_time: new Date(),
    },
    create: {
      id: 1,
      title: '考克利尔竞立助力全球碳中和发展',
      description: '推动绿色能源转型，共建可持续未来',
      content: '<p>碳中和目标下，新能源与碳汇项目正成为重要投资方向。请理性看待收益，注意投资风险。</p>',
      tags: '资讯,碳中和',
      cover_image: 'https://picsum.photos/400/300?random=1',
      status: 'PUBLISHED',
      sort_order: 1,
      publish_time: new Date(),
    },
  });

  await prisma.article.upsert({
    where: { id: 2 },
    update: {
      title: '新手投资攻略：如何开启第一笔碳期权',
      description: '从实名认证到下单支付，四步完成首投',
      content: '<p><strong>第一步</strong>：完成实名认证。</p><p><strong>第二步</strong>：在碳期权页选择产品。</p><p><strong>第三步</strong>：确认金额并支付。</p><p><strong>第四步</strong>：在订单列表查看计息状态。</p>',
      tags: '攻略,新手',
      cover_image: 'https://picsum.photos/400/300?random=2',
      status: 'PUBLISHED',
      sort_order: 2,
      publish_time: new Date(Date.now() - 86400000),
    },
    create: {
      id: 2,
      title: '新手投资攻略：如何开启第一笔碳期权',
      description: '从实名认证到下单支付，四步完成首投',
      content: '<p><strong>第一步</strong>：完成实名认证。</p><p><strong>第二步</strong>：在碳期权页选择产品。</p><p><strong>第三步</strong>：确认金额并支付。</p><p><strong>第四步</strong>：在订单列表查看计息状态。</p>',
      tags: '攻略,新手',
      cover_image: 'https://picsum.photos/400/300?random=2',
      status: 'PUBLISHED',
      sort_order: 2,
      publish_time: new Date(Date.now() - 86400000),
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '默认分佣规则',
      version: 'v1',
      config: JSON.stringify({
        base_type: 'AMOUNT',
        max_level: 5,
        rates: [0.05, 0.03, 0.02, 0.01, 0.005],
      }),
      status: 'ACTIVE',
      published_at: new Date(),
    },
  });

  const promoter = await prisma.user.upsert({
    where: { username: 'promoter' },
    update: {},
    create: {
      username: 'promoter',
      password_hash: passwordHash,
      status: 'NORMAL',
    },
  });
  await prisma.wallet.upsert({
    where: { user_id_type: { user_id: promoter.id, type: 'BALANCE' } },
    update: {},
    create: { user_id: promoter.id, type: 'BALANCE', balance_available: 100000 },
  });
  const promoterLink = await prisma.promotionLink.upsert({
    where: { user_id: promoter.id },
    update: {},
    create: { user_id: promoter.id, invite_code: 'PROMO001', status: 'ACTIVE' },
  });

  const testuser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      password_hash: passwordHash,
      status: 'NORMAL',
    },
  });
  await prisma.wallet.upsert({
    where: { user_id_type: { user_id: testuser.id, type: 'BALANCE' } },
    update: { balance_available: 50000 },
    create: { user_id: testuser.id, type: 'BALANCE', balance_available: 50000 },
  });
  await prisma.promotionLink.upsert({
    where: { user_id: testuser.id },
    update: {},
    create: { user_id: testuser.id, invite_code: 'TEST0001', status: 'ACTIVE' },
  });
  await prisma.userRelation.upsert({
    where: { user_id: testuser.id },
    update: {},
    create: {
      user_id: testuser.id,
      parent_user_id: promoter.id,
      level: 1,
      path: String(promoter.id),
    },
  });

  for (const u of [
    { user_id: testuser.id, real_name: '测试用户' },
    { user_id: promoter.id, real_name: '推广员' },
  ]) {
    await prisma.realnameAuth.upsert({
      where: { user_id: u.user_id },
      update: { real_name: u.real_name, id_card: '110101199001011234', auth_status: 'APPROVED' },
      create: {
        user_id: u.user_id,
        real_name: u.real_name,
        id_card: '110101199001011234',
        auth_status: 'APPROVED',
      },
    });
  }

  console.log('Seed completed. Admin: admin / 123456');
  console.log(`Promoter: promoter / 123456, invite=${promoterLink.invite_code}`);
  console.log('Test user: testuser / 123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
