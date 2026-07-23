# 移动端 / 用户端 API 接口文档

本文档汇总所有供移动端 App 或 C 端用户使用的 API 接口，按业务模块分类。

**Base URL**: `/api/v1`  
**认证方式**: Bearer Token（需登录接口在 Header 中携带 `Authorization: Bearer <token>`）

---

## 通用说明

### 响应格式
统一格式：
```json
{
  "status": "success",
  "message": "可选说明",
  "data": {},
  "token": "登录接口返回"
}
```

### 错误响应
| HTTP 状态码 | 说明 |
| :--- | :--- |
| 400 | 请求参数无效 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 / 账号被禁用 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 一、内容展示（无需登录）

### 1.1 Banner 轮播

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/banners` | 获取首页轮播 Banner 列表 |

**GET /api/v1/banners**
- **认证**: 无需登录
- **说明**: 返回当前有效（ACTIVE 且在有效期内）的 Banner，按 sort_order 排序，最多 10 条

**响应**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "新春活动",
      "image_url": "https://example.com/banner1.jpg",
      "link_url": "https://example.com/activity",
      "status": "ACTIVE",
      "sort_order": 1,
      "start_time": "2025-02-24T00:00:00+08:00",
      "end_time": "2025-03-24T23:59:59+08:00",
      "created_at": "2025-02-24T10:00:00Z",
      "updated_at": "2025-02-24T10:00:00Z"
    }
  ]
}
```

---

### 1.2 文章资讯

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/articles` | 获取文章列表 |
| GET | `/articles/:id` | 获取文章详情（含正文） |

**GET /api/v1/articles**
- **认证**: 无需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | page | int | 否 | 页码，默认 1 |
  | page_size | int | 否 | 每页数量，默认 20 |

- **说明**: 列表不包含 `content`，正文需通过详情接口获取

**响应**:
```json
{
  "status": "success",
  "data": {
    "total": 10,
    "records": [
      {
        "id": 1,
        "title": "理财入门指南",
        "tags": "理财,投资,入门",
        "description": "本文介绍理财基础知识...",
        "publish_time": "2025-02-24T10:00:00+08:00",
        "cover_image": "https://example.com/cover.jpg",
        "status": "PUBLISHED",
        "sort_order": 0,
        "view_count": 128,
        "created_at": "2025-02-24T09:00:00Z",
        "updated_at": "2025-02-24T10:00:00Z"
      }
    ]
  }
}
```

**GET /api/v1/articles/:id**
- **认证**: 无需登录
- **说明**: 返回完整文章（含正文），每次访问自动增加浏览量

**响应**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "理财入门指南",
    "tags": "理财,投资,入门",
    "description": "本文介绍理财基础知识...",
    "publish_time": "2025-02-24T10:00:00+08:00",
    "cover_image": "https://example.com/cover.jpg",
    "content": "<p>正文内容，支持 HTML...</p>",
    "status": "PUBLISHED",
    "sort_order": 0,
    "view_count": 129,
    "created_at": "2025-02-24T09:00:00Z",
    "updated_at": "2025-02-24T10:00:00Z"
  }
}
```

---

## 二、用户与认证（需登录）

### 2.1 注册与登录

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| POST | `/users/register` | 用户注册 |
| POST | `/users/login` | 用户登录 |

**POST /api/v1/users/register**
- **认证**: 无需登录
- **Body**:
```json
{
  "username": "user01",
  "password": "123456",
  "email": "user@example.com",
  "phone_number": "13800138000",
  "captcha": ""
}
```
| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| email | string | 否 | 邮箱 |
| phone_number | string | 否 | 手机号 |
| captcha | string | 否 | 验证码 |

**响应**:
```json
{
  "status": "success",
  "message": "User registered successfully"
}
```

**POST /api/v1/users/login**
- **认证**: 无需登录
- **Body**:
```json
{
  "username": "user01",
  "password": "123456"
}
```

**响应**:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2.2 个人信息

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/users/:user_id` | 获取用户信息 |
| PUT | `/users/:user_id` | 更新用户信息 |
| POST | `/users/:user_id/realname-auth` | 实名认证 |
| POST | `/users/:user_id/bind` | 绑定推广关系 |

**GET /api/v1/users/:user_id**
- **认证**: 需登录（用户 JWT）
- **说明**: 获取当前用户信息

**响应**:
```json
{
  "status": "success",
  "user": {
    "id": 1001,
    "username": "user01",
    "email": "user@example.com",
    "phone_number": "13800138000",
    "status": "NORMAL",
    "created_at": "2025-02-24T10:00:00Z"
  }
}
```

**PUT /api/v1/users/:user_id**
- **认证**: 需登录
- **Body**:
```json
{
  "username": "newname",
  "email": "new@example.com",
  "phone_number": "13900139000",
  "password": "newpassword"
}
```

**POST /api/v1/users/:user_id/realname-auth**
- **认证**: 需登录
- **Body**:
```json
{
  "real_name": "张三",
  "id_card": "110101199001011234"
}
```

**POST /api/v1/users/:user_id/bind**
- **认证**: 需登录
- **Body**:
```json
{
  "parent_user_id": 1000
}
```
- **说明**: 绑定推广关系（上级用户），仅限新用户或未绑定用户

---

## 三、理财产品（需登录）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/products` | 产品列表 |
| GET | `/products/:id` | 产品详情 |

**GET /api/v1/products**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | page | int | 否 | 页码，默认 1 |
  | page_size | int | 否 | 每页数量，默认 20 |
  | status | string | 否 | 状态筛选 (ON_SALE, OFF_SHELF) |

**响应**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "records": [
      {
        "id": 1,
        "name": "新手专享计划",
        "description": "新用户专享...",
        "yield_rate": 12.5,
        "cycle_days": 7,
        "min_amount": 100,
        "status": "ON_SALE",
        "rule_version": "v1",
        "created_at": "2025-02-24T10:00:00Z",
        "updated_at": "2025-02-24T10:00:00Z"
      }
    ]
  }
}
```

**GET /api/v1/products/:id**
- **认证**: 需登录
- **说明**: 获取单个产品详情

---

## 四、订单（需登录）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/orders` | 订单列表 |
| POST | `/orders` | 创建订单 |
| POST | `/orders/:order_id/pay` | 支付订单 |
| POST | `/orders/:order_id/cancel` | 取消订单 |
| POST | `/orders/:order_id/refund` | 申请退款 |
| GET | `/orders/:order_id` | 订单详情 |
| GET | `/orders/:order_id/commission` | 订单佣金明细 |

**GET /api/v1/orders**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |
  | page | int | 否 | 页码，默认 1 |
  | page_size | int | 否 | 每页数量，默认 20 |
  | status | string | 否 | 状态筛选 (PENDING, PAID, CANCELLED, REFUNDED) |

- **响应**: 同文章列表格式，`data: { total, records }`，records 为订单项数组

**POST /api/v1/orders**
- **认证**: 需登录
- **Body**:
```json
{
  "user_id": 1001,
  "product_id": 1,
  "amount": 1000.00
}
```

**响应**:
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order_id": 202301010001
  }
}
```

**POST /api/v1/orders/:order_id/pay**
- **认证**: 需登录
- **Body**:
```json
{
  "payment_method": "BALANCE",
  "payment_amount": 1000.00
}
```

**POST /api/v1/orders/:order_id/cancel**
- **认证**: 需登录
- **Body**: 无

**POST /api/v1/orders/:order_id/refund**
- **认证**: 需登录
- **Body**: 无

**GET /api/v1/orders/:order_id**
- **认证**: 需登录
- **说明**: 获取订单详情

**GET /api/v1/orders/:order_id/commission**
- **认证**: 需登录
- **说明**: 获取该订单关联的佣金记录

---

## 五、资金（需登录）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/wallets` | 钱包列表 |
| GET | `/wallets/ledger` | 资金流水 |
| POST | `/recharge` | 申请充值 |
| POST | `/withdraw` | 申请提现 |
| GET | `/withdraws` | 提现记录 |

**GET /api/v1/wallets**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |

**GET /api/v1/wallets/ledger**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |
  | wallet_type | string | 否 | 钱包类型 |
  | biz_type | string | 否 | 业务类型 |
  | time_from | string | 否 | 开始时间 |
  | time_to | string | 否 | 结束时间 |
  | page | int | 否 | 页码 |
  | page_size | int | 否 | 每页数量 |

**POST /api/v1/recharge**
- **认证**: 需登录
- **Body**:
```json
{
  "user_id": 1001,
  "amount": 100.00,
  "currency": "USDT",
  "network": "TRC20",
  "tx_hash": "",
  "biz_id": "",
  "channel": ""
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "biz_id": "RECHARGE_xxx",
    "order_id": 1
  }
}
```

**POST /api/v1/withdraw**
- **认证**: 需登录
- **Body**:
```json
{
  "user_id": 1001,
  "amount": 100.00,
  "wallet_type": "BALANCE",
  "address": "TRC20-Txxxx...",
  "network": "TRC20",
  "bank_account_snapshot": ""
}
```

**响应**:
```json
{
  "status": "success",
  "data": {
    "withdraw_id": 55
  }
}
```

**GET /api/v1/withdraws**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |
  | status | string | 否 | 状态筛选 |
  | time_from | string | 否 | 开始时间 |
  | time_to | string | 否 | 结束时间 |
  | page | int | 否 | 页码 |
  | page_size | int | 否 | 每页数量 |

---

## 六、推广与佣金（需登录）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/promotion/link/:user_id` | 获取推广链接 |
| GET | `/promotion/tree/:user_id` | 获取推广树 |
| GET | `/promotion/reward/:user_id` | 获取推广奖励 |
| POST | `/promotion/reward/distribute` | 发放推广奖励 |
| GET | `/commissions` | 佣金记录列表 |
| GET | `/commissions/summary` | 佣金汇总 |

**GET /api/v1/promotion/link/:user_id**
- **认证**: 需登录
- **说明**: 获取当前用户的推广链接/邀请码

**GET /api/v1/promotion/tree/:user_id**
- **认证**: 需登录
- **说明**: 获取推广树（下级结构）

**GET /api/v1/promotion/reward/:user_id**
- **认证**: 需登录
- **说明**: 获取推广奖励列表

**POST /api/v1/promotion/reward/distribute**
- **认证**: 需登录
- **Body**: 视业务而定

**GET /api/v1/commissions**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |
  | page | int | 否 | 页码 |
  | page_size | int | 否 | 每页数量 |

**GET /api/v1/commissions/summary**
- **认证**: 需登录
- **Query**:
  | 参数 | 类型 | 必填 | 说明 |
  | :--- | :--- | :--- | :--- |
  | user_id | uint | 是 | 用户 ID |

**响应**: 佣金汇总数据（总佣金、待结算、已发放等）

---

## 七、风控（需登录）

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| POST | `/risk/evaluate` | 风控评估 |

**POST /api/v1/risk/evaluate**
- **认证**: 需登录
- **Body**:
```json
{
  "scene": "ORDER",
  "user_id": 1001,
  "biz_id": "ORDER_202301010001",
  "ip": "192.168.1.1",
  "device_id": "xxx",
  "payload": {
    "amount": 1000,
    "product_id": 1
  }
}
```
| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| scene | string | 是 | 场景 |
| user_id | uint | 是 | 用户 ID |
| biz_id | string | 否 | 业务 ID |
| ip | string | 否 | 客户端 IP |
| device_id | string | 否 | 设备 ID |
| payload | object | 否 | 业务参数 |

**响应**: 风控评估结果（决策、风险等级、建议动作等）

---

## 接口汇总表

| 业务模块 | 认证 | 接口数 |
| :--- | :--- | :--- |
| 内容展示（Banner、文章） | 无需登录 | 3 |
| 用户与认证 | 部分需登录 | 6 |
| 理财产品 | 需登录 | 2 |
| 订单 | 需登录 | 6 |
| 资金 | 需登录 | 5 |
| 推广与佣金 | 需登录 | 6 |
| 风控 | 需登录 | 1 |
