# 模块六：推广与分销 (Promotion & Distributor)

## 1. 业务需求概述

本模块负责管理平台的分销体系。除了普通用户的“邀请好友”功能外，系统还支持更专业的“分销员”身份，拥有独立的审核流程和等级权益。

### 核心功能点
1.  **推广链接管理**：查看和重置用户的邀请码/链接，处理邀请码泄露或被恶意利用的情况。
2.  **分销员档案**：专门管理申请成为“分销员”的用户，查看其团队业绩（总销量、总佣金）。
3.  **资格审核**：审核分销员申请，控制分销权限的准入。
4.  **等级管理**：手动调整分销员等级（如金牌、银牌），不同等级通常对应不同的佣金比例（由业务规则决定）。
5.  **业绩查询**：透视分销员名下的所有订单贡献，用于评估其推广效果。

---

## 2. 接口 API 文档

### 2.1 推广基础管理

#### 2.1.1 查看推广链接
*   **接口地址**: `GET /api/v1/admin/promo/users/:user_id/link`
*   **权限标识**: `promo:link:view`
*   **功能描述**: 获取指定用户的专属推广链接信息。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "user_id": 1001,
    "invite_code": "ABC123",
    "link": "https://h5.xxx.com/r/ABC123",
    "status": "ACTIVE"
  }
}
```

#### 2.1.2 重置推广链接
*   **接口地址**: `POST /api/v1/admin/promo/users/:user_id/link/reset`
*   **权限标识**: `promo:link:edit`
*   **功能描述**: 强制生成新的邀请码，旧码即刻失效。

**请求参数 (Body)**:
```json
{
  "reason": "用户报告旧码泄露",
  "admin_id": 1
}
```

---

### 2.2 分销员管理

#### 2.2.1 分销员列表
*   **接口地址**: `GET /api/v1/admin/distributors`
*   **权限标识**: `distributor:list`
*   **功能描述**: 查询分销员档案列表。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | int | 否 | 页码 |
| `page_size` | int | 否 | 每页数量 |
| `level_id` | int | 否 | 等级筛选 |
| `audit_status` | int | 否 | 审核状态: `0`=待审核, `1`=已通过, `2`=驳回 |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 10,
    "list": [
      {
        "user_id": 1001,
        "level_id": 1,
        "audit_status": 1,
        "total_commission": 5000.00,
        "total_sales": 100000.00,
        "join_time": "..."
      }
    ]
  }
}
```

#### 2.2.2 分销员详情
*   **接口地址**: `GET /api/v1/admin/distributors/:user_id`
*   **权限标识**: `distributor:detail`
*   **功能描述**: 获取分销员详细信息，包括关联的用户基础信息和团队概况。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "profile": { ... }, // 分销档案
    "user": { ... },    // 基础信息
    "team": {           // 团队人数统计
      "l1_count": 10,
      "l2_count": 50,
      "l3_count": 200
    }
  }
}
```

#### 2.2.3 资格审核
*   **接口地址**: `POST /api/v1/admin/distributors/:user_id/audit`
*   **权限标识**: `distributor:audit`
*   **功能描述**: 处理分销员申请。

**请求参数 (Body)**:
```json
{
  "status": 1,        // 1=通过, 2=驳回
  "reason": "资料合规" // 审核意见
}
```

#### 2.2.4 等级调整
*   **接口地址**: `POST /api/v1/admin/distributors/:user_id/level`
*   **权限标识**: `distributor:level`
*   **功能描述**: 修改分销员等级。

**请求参数 (Body)**:
```json
{
  "level_id": 2,      // 目标等级ID
  "reason": "业绩达标晋升"
}
```

#### 2.2.5 业绩订单查询
*   **接口地址**: `GET /api/v1/admin/distributors/:user_id/orders`
*   **权限标识**: `distributor:orders`
*   **功能描述**: 查询该分销员团队（下线）产生的所有有效订单，用于业绩核对。

**请求参数 (Query)**:
*   `page`: int
*   `page_size`: int

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 2023...,
        "user_id": 1005, // 下线用户ID
        "username": "downline01",
        "amount": 1000.00,
        "created_at": "..."
      }
    ]
  }
}
```
