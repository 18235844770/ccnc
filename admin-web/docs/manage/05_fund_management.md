# 模块五：资金管理 (Fund Management)

## 1. 业务需求概述

资金管理是平台风控的重中之重。该模块主要处理用户的提现请求审核、全平台资金流水的监控，以及特殊情况下的系统级资金干预（调账）。

### 核心功能点
1.  **提现审核**：财务人员查看用户的提现申请，核对无误后进行“通过”或“拒绝”操作。通过后系统扣除冻结资金；拒绝后资金解冻回退。
2.  **资金流水 (Ledger)**：全视角的资金变动记录，用于对账和排查资金去向（如充值、提现、下单扣款、收益入账）。
3.  **人工调账**：在发生充值未到账、活动奖励补发或违规资金扣除时，管理员可直接增减用户的余额钱包。此操作极为敏感，需严格记录日志。

---

## 2. 接口 API 文档

### 2.1 提现管理

#### 2.1.1 提现申请列表
*   **接口地址**: `GET /api/v1/admin/withdraws`
*   **权限标识**: `fund:withdraw:list`
*   **功能描述**: 查看待审核及历史提现记录。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | int | 否 | 页码，默认 1 |
| `page_size` | int | 否 | 每页数量，默认 20 |
| `user_id` | int | 否 | 按用户筛选 |
| `status` | string | 否 | 状态: `PENDING` (待审核), `SUCCESS`, `REJECTED` |
| `time_from` | time | 否 | 申请时间起 |
| `time_to` | time | 否 | 申请时间止 |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 20,
    "records": [
      {
        "id": 55,
        "user_id": 1001,
        "amount": 500.00,
        "address": "TRC20-Txxxx...",
        "network": "TRC20",
        "status": "PENDING",
        "created_at": "..."
      }
    ]
  }
}
```

#### 2.1.2 审核通过 (打款)
*   **接口地址**: `POST /api/v1/admin/withdraws/:id/approve`
*   **权限标识**: `fund:withdraw:audit`
*   **功能描述**: 确认提现请求有效，系统扣除用户冻结资金（实际打款可能需对接三方支付或线下转账后由系统标记成功）。

**请求参数 (Body)**:
```json
{
  "admin_id": 1 // 操作管理员ID
}
```

#### 2.1.3 审核拒绝 (驳回)
*   **接口地址**: `POST /api/v1/admin/withdraws/:id/reject`
*   **权限标识**: `fund:withdraw:audit`
*   **功能描述**: 驳回提现请求，冻结资金自动退回至用户可用余额。

**请求参数 (Body)**:
```json
{
  "admin_id": 1,
  "reason": "收款地址格式错误" // 驳回原因
}
```

---

### 2.2 资金流水

#### 2.2.1 全局流水查询
*   **接口地址**: `GET /api/v1/admin/wallets/ledger`
*   **权限标识**: `fund:ledger:list`
*   **功能描述**: 查询所有用户的资金变动明细。

**请求参数 (Query)**:
*   `user_id`: int
*   `biz_type`: string (业务类型: `RECHARGE`, `WITHDRAW`, `PAY_ORDER`, `PROFIT`, `COMMISSION`)
*   `page`, `page_size`: 分页参数

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 1000,
    "records": [
      {
        "id": 999,
        "user_id": 1001,
        "type": "PAY_ORDER",
        "amount": -100.00,
        "balance_after": 900.00,
        "description": "购买产品消耗",
        "created_at": "..."
      }
    ]
  }
}
```

---

### 2.3 资金调节

#### 2.3.1 人工调账
*   **接口地址**: `POST /api/v1/admin/wallets/adjustment`
*   **权限标识**: `fund:adjustment`
*   **功能描述**: 管理员手动调整用户余额。

**请求参数 (Body)**:
```json
{
  "user_id": 1001,
  "amount": 100.00,        // 正数=加款，负数=扣款
  "description": "活动奖励补发" // 必填，备注原因
}
```

**响应参数**:
```json
{
  "status": "success",
  "message": "Balance adjusted successfully"
}
```
