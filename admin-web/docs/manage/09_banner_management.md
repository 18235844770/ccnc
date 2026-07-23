# 模块九：Banner 管理 (Banner Management)

## 1. 业务需求概述

Banner 模块用于管理移动端首页轮播图/横幅展示。管理员可配置多张 Banner，设置展示时间、排序和跳转链接。移动端通过公开接口获取当前有效的 Banner 列表，用于首页展示。

### 核心功能点
1.  **Banner 列表**：管理端分页查看所有 Banner，支持按状态筛选。
2.  **Banner 详情**：查看单个 Banner 的完整配置。
3.  **新建 Banner**：配置标题、图片、链接、状态、排序及生效时间。
4.  **编辑 Banner**：修改现有 Banner 的各项属性。
5.  **删除 Banner**：软删除 Banner。
6.  **移动端展示**：公开接口，返回当前有效（ACTIVE 且在有效期内）的 Banner 列表，按 sort_order 排序。

### 状态与时间规则
- **status**: `ACTIVE` 启用，`INACTIVE` 停用
- **start_time / end_time**: 可选，为空表示不限制。仅当 `start_time <= 当前时间 <= end_time` 时，Banner 在移动端展示接口中可见。

---

## 2. 接口 API 文档

### 2.1 移动端展示接口

#### 2.1.1 获取展示 Banner 列表
*   **接口地址**: `GET /api/v1/banners`
*   **认证要求**: 无需登录（公开接口）
*   **功能描述**: 获取当前有效的 Banner 列表，供移动端首页轮播展示。仅返回 status=ACTIVE 且在 start_time～end_time 有效期内（或时间为空）的 Banner，按 sort_order 升序排列。

**请求参数**: 无

**响应参数**:
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

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | uint | Banner ID |
| title | string | 标题 |
| image_url | string | 图片地址 |
| link_url | string | 点击跳转链接 |
| status | string | 状态 (ACTIVE) |
| sort_order | int | 排序值，越小越靠前 |
| start_time | string | 生效开始时间，ISO8601 格式，可为 null |
| end_time | string | 生效结束时间，ISO8601 格式，可为 null |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

---

### 2.2 管理端接口

#### 2.2.1 Banner 列表
*   **接口地址**: `GET /api/v1/admin/banners`
*   **权限标识**: `banner:list`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 分页查询 Banner 列表。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态筛选 (`ACTIVE`, `INACTIVE`) |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "records": [
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
}
```

#### 2.2.2 Banner 详情
*   **接口地址**: `GET /api/v1/admin/banners/:id`
*   **权限标识**: `banner:detail`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 获取单个 Banner 的详细配置。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | Banner ID |

**响应参数**:
```json
{
  "status": "success",
  "data": {
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
}
```

#### 2.2.3 创建 Banner
*   **接口地址**: `POST /api/v1/admin/banners`
*   **权限标识**: `banner:add`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 新建 Banner。

**请求参数 (Body)**:
```json
{
  "title": "新春活动",
  "image_url": "https://example.com/banner1.jpg",
  "link_url": "https://example.com/activity",
  "status": "ACTIVE",
  "sort_order": 1,
  "start_time": "2025-02-24 00:00:00",
  "end_time": "2025-03-24 23:59:59"
}
```

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| title | string | 是 | 标题 |
| image_url | string | 是 | 图片地址 |
| link_url | string | 否 | 点击跳转链接 |
| status | string | 否 | 状态 `ACTIVE` / `INACTIVE`，默认 `INACTIVE` |
| sort_order | int | 否 | 排序值，默认 0 |
| start_time | string | 否 | 生效开始时间，格式 `2006-01-02 15:04:05` |
| end_time | string | 否 | 生效结束时间，格式 `2006-01-02 15:04:05` |

**响应参数**:
```json
{
  "status": "success",
  "data": {
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
}
```

#### 2.2.4 编辑 Banner
*   **接口地址**: `PUT /api/v1/admin/banners/:id`
*   **权限标识**: `banner:edit`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 更新 Banner 信息，仅更新传入的字段。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | Banner ID |

**请求参数 (Body)**:
```json
{
  "title": "新春活动（已更新）",
  "image_url": "https://example.com/banner1-v2.jpg",
  "link_url": "https://example.com/activity-new",
  "status": "INACTIVE",
  "sort_order": 2,
  "start_time": "2025-02-25 00:00:00",
  "end_time": "2025-03-25 23:59:59"
}
```

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| title | string | 否 | 标题 |
| image_url | string | 否 | 图片地址 |
| link_url | string | 否 | 点击跳转链接 |
| status | string | 否 | 状态 `ACTIVE` / `INACTIVE` |
| sort_order | int | 否 | 排序值 |
| start_time | string | 否 | 生效开始时间，空字符串表示清除 |
| end_time | string | 否 | 生效结束时间，空字符串表示清除 |

**响应参数**:
```json
{
  "status": "success",
  "message": "Banner updated"
}
```

#### 2.2.5 删除 Banner
*   **接口地址**: `DELETE /api/v1/admin/banners/:id`
*   **权限标识**: `banner:delete`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 软删除 Banner。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | Banner ID |

**响应参数**:
```json
{
  "status": "success",
  "message": "Banner deleted"
}
```

---

## 3. 错误响应

| HTTP 状态码 | 说明 |
| :--- | :--- |
| 400 | 请求参数无效 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | Banner 不存在 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "status": "error",
  "message": "Banner not found"
}
```
