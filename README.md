# CCNC 碳交易理财推广系统

pnpm monorepo：H5 + 管理后台 + Node.js 后端 + 共享类型包

## 目录

```
CCNC/
├── packages/shared/   # 前后端统一类型与枚举（snake_case）
├── service/           # NestJS + Prisma 后端
├── admin-web/         # Vue3 管理后台
├── h5/                # uni-app H5 用户端
└── docs/              # 项目文档（含 [H5UI规范.md](./docs/H5UI规范.md)）
```

## 快速启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动数据库（MariaDB + Redis）

```bash
docker compose up -d mysql
```

> 本机 3306 端口已被占用时，MariaDB 映射到 **3307**，连接串见 `service/.env`  
> `DATABASE_URL=mysql://ccnc:ccnc123@localhost:3307/ccnc`

### 3. 初始化后端

```bash
cp service/.env.example service/.env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. 启动服务

```bash
# 终端 1 - 后端 (http://localhost:3000)
pnpm dev:service

# 终端 2 - 管理后台 (http://localhost:5173)
pnpm dev:admin

# 终端 3 - H5 (http://localhost:5174)
pnpm dev:h5
```

### 默认账号

- 管理后台：`admin` / `123456`

## 字段统一规范

所有 API 请求/响应字段使用 **snake_case**，类型定义在 `packages/shared`：

| 模块 | 关键字段 |
| ---- | -------- |
| 产品 | `yield_rate`, `cycle_days`, `min_amount`, `status: ON_SALE \| OFF_SALE \| DRAFT` |
| 用户 | `phone_number`, `user_id`, `status: NORMAL \| BANNED \| FROZEN` |
| 分页 | `{ total, records }` |
| 响应 | `{ status, message, data, token? }` |

前端通过 `@ccnc/shared` 引用类型，避免三端字段不一致。

## API 文档

启动后端后访问：http://localhost:3000/api/docs
