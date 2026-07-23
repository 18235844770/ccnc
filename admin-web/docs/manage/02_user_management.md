# 模块二：用户管理 (User Management)

## 1. 业务需求概述

用户管理模块用于维护 C 端用户的全生命周期信息。管理员通过此模块可以查询用户基础资料、资产状况、团队结构，并进行必要的账号管控操作。

### 核心功能点
1.  **用户列表**：全量用户查询，支持多维度筛选（ID、用户名、手机号、注册时间、状态）。
2.  **用户详情**：展示用户的基本信息（实名、联系方式）、资产概览（余额、积分）、团队数据摘要。
3.  **层级关系 (下线)**：查看指定用户的下级网络（支持 1/2/3 级展开），用于排查推广关系。
4.  **关系调整**：特殊情况下（如纠纷处理），管理员可手动修改用户的上级推荐人。
5.  **账号管控**：对违规用户进行封禁（禁止登录）、冻结（禁止资金操作）或解封。

---

## 2. 接口 API 文档

### 2.1 用户查询

#### 2.1.1 用户列表
*   **接口地址**: `GET /api/v1/admin/users`
*   **权限标识**: `user:list`
*   **功能描述**: 分页查询用户列表。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | int | 否 | 页码，默认 1 |
| `page_size` | int | 否 | 每页数量，默认 20 |
| `user_id` | int | 否 | 精确匹配用户ID |
| `keyword` | string | 否 | 模糊搜索 (用户名/邮箱/手机号) |
| `status` | string | 否 | 状态筛选 (`NORMAL`, `BANNED`, `FROZEN`) |
| `created_from` | time | 否 | 注册时间起 (RFC3339) |
| `created_to` | time | 否 | 注册时间止 |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "user_id": 1001,
        "username": "user01",
        "phone": "13800138000",
        "email": "user01@example.com",
        "status": "NORMAL",
        "created_at": "2023-01-01T12:00:00Z",
        "promo_summary": {
          "l1_count": 10,  // 直推人数
          "l2_count": 50,
          "l3_count": 200
        }
      }
    ]
  }
}
```

#### 2.1.2 用户详情
*   **接口地址**: `GET /api/v1/admin/users/:user_id`
*   **权限标识**: `user:detail`
*   **功能描述**: 获取单个用户的详细档案。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "user_id": 1001,
      "username": "user01",
      "phone": "13800138000",
      "status": "NORMAL",
      "created_at": "..."
    },
    "uplines": [ // 上级链路 (最近3级)
      { "user_id": 900, "username": "leaderA" }
    ],
    "downlines": { // 下线概览 (前20条)
      "level_1": [ ... ],
      "level_2": [ ... ],
      "level_3": [ ... ]
    }
  }
}
```

#### 2.1.3 查询下线列表
*   **接口地址**: `GET /api/v1/admin/users/:user_id/downlines`
*   **权限标识**: `user:downlines`
*   **功能描述**: 分页查看指定层级的下线用户。

**请求参数 (Query)**:
*   `level`: int (必填，1/2/3)
*   `page`: int
*   `page_size`: int

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 50,
    "list": [
      { "user_id": 1002, "username": "downline01" }
    ]
  }
}
```

---

### 2.2 关系管理

#### 2.2.1 调整上级 (迁移)
*   **接口地址**: `POST /api/v1/admin/users/:user_id/promo/adjust`
*   **权限标识**: `user:adjust`
*   **功能描述**: 将指定用户迁移到新的上级名下。此操作会记录审计日志。

**请求参数 (Body)**:
```json
{
  "new_parent_user_id": 2001, // 新的上级ID
  "reason": "原上级账号注销，系统迁移" // 操作原因 (必填)
}
```

**响应参数**:
```json
{
  "status": "success",
  "message": "Promotion relation adjusted"
}
```

---

### 2.3 账号管控

#### 2.3.1 封禁/冻结用户
*   **接口地址**: `POST /api/v1/admin/users/:user_id/ban`
*   **权限标识**: `user:ban`
*   **功能描述**: 限制用户登录或交易。

**请求参数 (Body)**:
```json
{
  "mode": "BANNED", // 或 "FROZEN"
  "reason": "涉嫌违规刷单"
}
```

#### 2.3.2 解封用户
*   **接口地址**: `POST /api/v1/admin/users/:user_id/unban`
*   **权限标识**: `user:ban`
*   **功能描述**: 恢复用户正常状态。

**请求参数 (Body)**:
```json
{
  "reason": "误判申诉通过"
}
```
