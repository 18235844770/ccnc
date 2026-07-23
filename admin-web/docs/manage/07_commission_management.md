# 模块七：佣金管理 (Commission Management)

## 1. 业务需求概述

佣金管理模块负责监控和干预平台的分润分发过程。管理员需要通过此模块核对系统计算的佣金记录是否正确，处理异常状态的佣金（如冻结违规所得），并在必要时进行人工补发或扣除。

### 核心功能点
1.  **佣金明细**：全量查询系统生成的每一笔佣金记录，支持按用户、状态、来源订单进行追踪。
2.  **状态干预**：
    *   **冻结**：对涉嫌违规（如刷单）产生的佣金进行冻结，暂停发放。
    *   **解冻**：确认无误后恢复正常状态。
    *   **作废**：确认订单退款或违规后，将佣金记录作废。
3.  **人工调账**：不经过自动计算流程，管理员手动创建一笔佣金记录（如活动奖励）或负向记录（如扣除错发佣金）。
4.  **规则配置**：发布或更新全局的分佣比例配置（*注：当前后端已预留接口，通常配合前端表单使用*）。

---

## 2. 接口 API 文档

### 2.1 佣金查询

#### 2.1.1 佣金记录列表
*   **接口地址**: `GET /api/v1/admin/commissions`
*   **权限标识**: `commission:list`
*   **功能描述**: 分页查询佣金记录。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | int | 否 | 页码 |
| `page_size` | int | 否 | 每页数量 |
| `user_id` | int | 否 | 收款用户ID |
| `status` | string | 否 | 状态: `PENDING`, `SETTLED`, `PAID`, `FROZEN`, `VOID` |
| `type` | string | 否 | 类型: `DIRECT` (直推), `TEAM` (团队), `SAME_LEVEL` (平级) |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 200,
    "list": [
      {
        "id": 5001,
        "user_id": 1001,
        "amount": 50.00,
        "source_order_id": "2023...",
        "from_user_id": 1002,
        "status": "PENDING",
        "created_at": "..."
      }
    ]
  }
}
```

#### 2.1.2 佣金详情
*   **接口地址**: `GET /api/v1/admin/commissions/:id`
*   **权限标识**: `commission:detail`
*   **功能描述**: 查看单笔佣金的详细信息。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "id": 5001,
    "user_id": 1001,
    "amount": 50.00,
    "status": "PENDING",
    "rule_snapshot": "{...}", // 计算时的规则快照
    "manual_flag": false      // 是否人工创建
  }
}
```

---

### 2.2 状态管理

#### 2.2.1 冻结佣金
*   **接口地址**: `POST /api/v1/admin/commissions/:id/freeze`
*   **权限标识**: `commission:freeze`
*   **功能描述**: 将 `PENDING` 或 `SETTLED` 状态的佣金转为 `FROZEN`，阻止其结算发放。

**请求参数 (Body)**:
```json
{
  "reason": "关联订单存在风险"
}
```

#### 2.2.2 解冻佣金
*   **接口地址**: `POST /api/v1/admin/commissions/:id/unfreeze`
*   **权限标识**: `commission:freeze`
*   **功能描述**: 将 `FROZEN` 状态恢复为之前的状态。

**请求参数 (Body)**:
```json
{
  "reason": "排除风险"
}
```

#### 2.2.3 作废佣金
*   **接口地址**: `POST /api/v1/admin/commissions/:id/void`
*   **权限标识**: `commission:audit`
*   **功能描述**: 将佣金状态置为 `VOID`，终结该记录。

**请求参数 (Body)**:
```json
{
  "reason": "订单已退款"
}
```

---

### 2.3 人工干预

#### 2.3.1 手动补发 (Manual Credit)
*   **接口地址**: `POST /api/v1/admin/commissions/manual-credit`
*   **权限标识**: `commission:manual`
*   **功能描述**: 创建一笔正向佣金记录。

**请求参数 (Body)**:
```json
{
  "user_id": 1001,
  "amount": 100.00,
  "reason": "系统故障漏发补偿"
}
```

#### 2.3.2 手动扣除 (Manual Reverse)
*   **接口地址**: `POST /api/v1/admin/commissions/manual-reverse`
*   **权限标识**: `commission:manual`
*   **功能描述**: 创建一笔负向记录，或标记扣除逻辑。

**请求参数 (Body)**:
```json
{
  "user_id": 1001,
  "amount": 50.00,
  "reason": "多发佣金追回"
}
```

---

### 2.4 规则配置

#### 2.4.1 发布规则
*   **接口地址**: `POST /api/v1/admin/commission-rules/publish`
*   **权限标识**: `commission:rule`
*   **功能描述**: 更新系统的分佣规则配置（JSON格式）。

**请求参数 (Body)**:
```json
{
  "name": "2023 Q1 Version",
  "config": "{\"level_1\": 0.10, \"level_2\": 0.05, ...}"
}
```
