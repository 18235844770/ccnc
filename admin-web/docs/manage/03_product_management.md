# 模块三：理财产品 (Product Management)

## 1. 业务需求概述

理财产品模块是平台的核心业务配置中心。管理员通过此模块管理所有投资标的物（产品），定义其属性如收益率、周期、起投金额等。用户端的“投资”行为即基于这些配置产生订单。

### 核心功能点
1.  **产品列表**：查看所有已创建的理财产品，支持按状态（上架/下架）筛选。
2.  **产品详情**：查看产品的完整配置参数。
3.  **新建产品**：配置新产品的各项参数（名称、年化收益率、周期天数、限额等）。
4.  **编辑产品**：修改现有产品的非关键属性（如描述、状态）。*注：涉及核心交易逻辑的字段在产品产生订单后建议禁止修改，或仅修改新订单生效。*
5.  **上下架管理**：控制产品在用户端的可见性。
6.  **删除产品**：物理删除或软删除未产生交易的产品。

---

## 2. 接口 API 文档

### 2.1 产品查询

#### 2.1.1 产品列表
*   **接口地址**: `GET /api/v1/admin/products`
*   **权限标识**: `product:list`
*   **功能描述**: 分页查询产品列表。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `page` | int | 否 | 页码，默认 1 |
| `page_size` | int | 否 | 每页数量，默认 20 |
| `status` | string | 否 | 状态筛选 (`active`, `inactive`) |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "records": [
      {
        "id": 1,
        "name": "新手专享计划",
        "type": "FIXED_TERM",
        "apr": 12.5,          // 年化收益率 %
        "duration": 7,        // 周期 (天)
        "min_amount": 100,    // 起投金额
        "max_amount": 5000,   // 限投金额
        "total_stock": 1000000, // 总额度
        "remaining_stock": 900000,
        "status": "active",
        "created_at": "2023-01-01T12:00:00Z"
      }
    ]
  }
}
```

#### 2.1.2 产品详情
*   **接口地址**: `GET /api/v1/admin/products/:id`
*   **权限标识**: `product:detail`
*   **功能描述**: 获取单个产品的详细配置。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "新手专享计划",
    "description": "新用户注册专享高收益短周期产品...",
    "type": "FIXED_TERM",
    "apr": 12.5,
    "duration": 7,
    "min_amount": 100,
    "max_amount": 5000,
    "status": "active",
    "...": "其他字段同列表"
  }
}
```

---

### 2.2 产品维护

#### 2.2.1 创建产品
*   **接口地址**: `POST /api/v1/admin/products`
*   **权限标识**: `product:add`
*   **功能描述**: 发布新的理财产品。

**请求参数 (Body)**:
```json
{
  "name": "稳健季度盈",
  "type": "FIXED_TERM",
  "apr": 8.0,
  "duration": 90,
  "min_amount": 1000,
  "max_amount": 0,      // 0表示不限制
  "total_stock": 5000000,
  "description": "适合长期持有的稳健型产品",
  "status": "active"    // 创建即上架，或 "inactive" 暂存
}
```

#### 2.2.2 编辑产品
*   **接口地址**: `PUT /api/v1/admin/products/:id`
*   **权限标识**: `product:edit`
*   **功能描述**: 更新产品信息。

**请求参数 (Body)**:
```json
{
  "name": "稳健季度盈 (第二期)", // 修改名称
  "status": "inactive",         // 下架
  "description": "..."
}
```

#### 2.2.3 删除产品
*   **接口地址**: `DELETE /api/v1/admin/products/:id`
*   **权限标识**: `product:delete`
*   **功能描述**: 删除产品。建议仅允许删除无关联订单的产品。

**响应参数**:
```json
{
  "status": "success",
  "message": "Product deleted"
}
```
