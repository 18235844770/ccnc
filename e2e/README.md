# CCNC E2E 页面流程化测试

基于 Playwright，对齐 [`docs/手动流程测试步骤清单.md`](../docs/手动流程测试步骤清单.md)。

## 前置

1. PostgreSQL `5432` / Redis `6380`
2. 启动服务：

```bash
pnpm dev:service
pnpm dev:h5
pnpm dev:admin
```

3. 本机已安装 **Google Chrome**（配置使用 `channel: 'chrome'`，无需下载 Playwright 自带 Chromium）

默认地址：

- API `http://localhost:3000`
- H5 `http://localhost:5174`
- 管理端 `http://localhost:5173`

## 命令

```bash
# 安装浏览器（首次）
pnpm exec playwright install chromium

# 跑全部
pnpm test:e2e

# 只跑某一类
pnpm test:e2e:h5
pnpm test:e2e:admin
pnpm test:e2e:api

# UI 模式
pnpm test:e2e:ui
```

环境变量（可选）：

- `E2E_API_URL`
- `E2E_H5_URL`
- `E2E_ADMIN_URL`

## 用例目录

| 目录 | 覆盖清单 | 说明 |
|------|----------|------|
| `tests/api/smoke.spec.ts` | A 冒烟 | Swagger / H5 / 管理端可打开 |
| `tests/h5/promo.spec.ts` | B / F / G | 推广中心、邀请码、二维码、收益明细 |
| `tests/admin/login.spec.ts` | A5 / 佣金页 | 管理端登录与佣金相关页 |
| `tests/api/commission-flow.spec.ts` | C～E 数据侧 | 注册绑定→支付 PENDING→结算幂等 |

## 设计说明

- **页面测交互**：登录、推广中心、二维码渲染。
- **API 造数/断言资金**：调账、下单、分润状态、幂等结算（避免干等 cron）。
- 订单到期 cron 仍建议手工或脚本改 `end_date` 后验证；完整「到期→发放」可后续加 fixture。
