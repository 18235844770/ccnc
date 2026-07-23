# 模块十：文章咨询管理 (Article Management)

## 1. 业务需求概述

文章咨询模块用于管理平台资讯内容。管理员可创建、编辑文章，配置标题、标签、描述、发布时间、封面图、正文等。移动端通过公开接口获取已发布文章列表及详情，支持分页和浏览量统计。

### 核心功能点
1.  **文章列表**：管理端分页查看所有文章，支持按状态筛选。
2.  **文章详情**：管理端查看单篇文章完整配置。
3.  **新建文章**：配置标题、标签、描述、发布时间、封面图、正文等。
4.  **编辑文章**：修改现有文章各项属性。
5.  **删除文章**：软删除文章。
6.  **移动端列表**：公开接口，分页返回已发布且已到发布时间的文章。
7.  **移动端详情**：公开接口，返回文章正文，访问时自动增加浏览量。

### 状态与时间规则
- **status**: `DRAFT` 草稿，`PUBLISHED` 已发布
- **publish_time**: 发布时间，为空表示立即发布。移动端仅展示 status=PUBLISHED 且 publish_time <= 当前时间 的文章。

---

## 2. 接口 API 文档

### 2.1 移动端展示接口

#### 2.1.1 获取文章列表
*   **接口地址**: `GET /api/v1/articles`
*   **认证要求**: 无需登录（公开接口）
*   **功能描述**: 分页获取已发布的文章列表，按发布时间倒序。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 20 |

**响应参数**:
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
        "content": "<p>正文内容...</p>",
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

#### 2.1.2 获取文章详情（含正文）
*   **接口地址**: `GET /api/v1/articles/:id`
*   **认证要求**: 无需登录（公开接口）
*   **功能描述**: 获取已发布文章的完整内容，包含正文。每次访问自动增加浏览量。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | 文章 ID |

**响应参数**:
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

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | uint | 文章 ID |
| title | string | 标题 |
| tags | string | 标签，逗号分隔 |
| description | string | 描述/摘要 |
| publish_time | string | 发布时间，ISO8601，可为 null |
| cover_image | string | 封面图 URL |
| content | string | 正文内容（支持 HTML） |
| status | string | 状态 |
| sort_order | int | 排序值 |
| view_count | int | 浏览量 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

---

### 2.2 管理端接口

#### 2.2.1 文章列表
*   **接口地址**: `GET /api/v1/admin/articles`
*   **权限标识**: `article:list`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 分页查询文章列表，包含草稿和已发布。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态筛选 (`DRAFT`, `PUBLISHED`) |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "records": [
      {
        "id": 1,
        "title": "理财入门指南",
        "tags": "理财,投资,入门",
        "description": "本文介绍理财基础知识...",
        "publish_time": "2025-02-24T10:00:00+08:00",
        "cover_image": "https://example.com/cover.jpg",
        "content": "<p>正文内容...</p>",
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

#### 2.2.2 文章详情
*   **接口地址**: `GET /api/v1/admin/articles/:id`
*   **权限标识**: `article:detail`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 获取单篇文章的完整配置（含草稿）。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | 文章 ID |

**响应参数**: 同 2.1.2，管理端可查看草稿状态文章。

#### 2.2.3 创建文章
*   **接口地址**: `POST /api/v1/admin/articles`
*   **权限标识**: `article:add`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 新建文章。

**请求参数 (Body)**:
```json
{
  "title": "理财入门指南",
  "tags": "理财,投资,入门",
  "description": "本文介绍理财基础知识...",
  "publish_time": "2025-02-24 10:00:00",
  "cover_image": "https://example.com/cover.jpg",
  "content": "<p>正文内容，支持 HTML...</p>",
  "status": "PUBLISHED",
  "sort_order": 0
}
```

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| title | string | 是 | 标题 |
| tags | string | 否 | 标签，逗号分隔 |
| description | string | 否 | 描述/摘要 |
| publish_time | string | 否 | 发布时间，格式 `2006-01-02 15:04:05`，为空则立即发布 |
| cover_image | string | 否 | 封面图 URL |
| content | string | 否 | 正文内容 |
| status | string | 否 | 状态 `DRAFT` / `PUBLISHED`，默认 `DRAFT` |
| sort_order | int | 否 | 排序值，默认 0 |

**响应参数**:
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
    "content": "<p>正文内容...</p>",
    "status": "PUBLISHED",
    "sort_order": 0,
    "view_count": 0,
    "created_at": "2025-02-24T09:00:00Z",
    "updated_at": "2025-02-24T09:00:00Z"
  }
}
```

#### 2.2.4 编辑文章
*   **接口地址**: `PUT /api/v1/admin/articles/:id`
*   **权限标识**: `article:edit`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 更新文章信息，仅更新传入的非空字段。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | 文章 ID |

**请求参数 (Body)**:
```json
{
  "title": "理财入门指南（修订版）",
  "tags": "理财,投资,入门,进阶",
  "description": "更新后的描述...",
  "publish_time": "2025-02-25 10:00:00",
  "cover_image": "https://example.com/cover-v2.jpg",
  "content": "<p>更新后的正文...</p>",
  "status": "DRAFT",
  "sort_order": 1
}
```

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| title | string | 否 | 标题 |
| tags | string | 否 | 标签 |
| description | string | 否 | 描述 |
| publish_time | string | 否 | 发布时间，空字符串表示清除 |
| cover_image | string | 否 | 封面图 |
| content | string | 否 | 正文 |
| status | string | 否 | 状态 |
| sort_order | int | 否 | 排序值 |

**响应参数**:
```json
{
  "status": "success",
  "message": "Article updated"
}
```

#### 2.2.5 删除文章
*   **接口地址**: `DELETE /api/v1/admin/articles/:id`
*   **权限标识**: `article:delete`
*   **认证要求**: 管理员 JWT (Bearer Token)
*   **功能描述**: 软删除文章。

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| id | uint | 是 | 文章 ID |

**响应参数**:
```json
{
  "status": "success",
  "message": "Article deleted"
}
```

---

## 3. 错误响应

| HTTP 状态码 | 说明 |
| :--- | :--- |
| 400 | 请求参数无效 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 文章不存在或未发布 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "status": "error",
  "message": "Article not found"
}
```
