# 模块一：系统与权限管理 (System & RBAC)

## 1. 业务需求概述

系统与权限管理模块是管理后台的基石，负责所有管理员的身份认证、操作权限控制以及系统基础配置。该模块确保只有经过授权的人员才能访问特定功能。

### 核心功能点
1.  **管理员登录**：支持账号密码登录，返回 JWT Token。
2.  **个人信息**：获取当前登录管理员的详细信息、角色列表及权限标识集合。
3.  **动态菜单**：根据管理员拥有的权限，动态返回前端路由菜单树。
4.  **角色管理**：定义系统角色（如超级管理员、运营、财务），分配对应的菜单和操作权限。
5.  **菜单管理**：维护系统菜单结构（目录、菜单、按钮）及对应的权限标识。
6.  **管理员管理**：创建、编辑、删除后台管理员账号，分配角色，重置密码。
7.  **操作日志**：查询管理员的关键操作记录，用于审计追踪。

---

## 2. 接口 API 文档

### 2.1 认证与基础 (Auth)

#### 2.1.1 管理员登录
*   **接口地址**: `POST /api/v1/admin/auth/login`
*   **功能描述**: 验证用户名密码，颁发 JWT Token。
*   **权限要求**: 无需鉴权

**请求参数 (Body)**:
```json
{
  "username": "admin",  // 必填，用户名
  "password": "123456"  // 必填，密码
}
```

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Access Token
  }
}
```

#### 2.1.2 获取管理员信息
*   **接口地址**: `GET /api/v1/admin/auth/info`
*   **功能描述**: 获取当前登录用户的基础信息及权限集合（用于前端控制按钮显隐）。
*   **权限要求**: 登录状态

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "avatar": "https://...",
      "roles": [
        { "id": 1, "name": "Super Admin", "key": "admin" }
      ]
    },
    "roles": ["admin"],           // 角色标识列表
    "permissions": ["*:*:*"]      // 权限标识列表 (如 system:user:list)
  }
}
```

#### 2.1.3 获取动态菜单树
*   **接口地址**: `GET /api/v1/admin/auth/menus/tree`
*   **功能描述**: 根据用户权限构建前端可访问的路由菜单树。
*   **权限要求**: 登录状态

**响应参数**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "System",
      "path": "/system",
      "component": "Layout",
      "meta": { "title": "系统管理", "icon": "setting" },
      "children": [
        {
          "id": 2,
          "name": "UserManage",
          "path": "users",
          "component": "views/system/user/index",
          "meta": { "title": "用户管理" }
        }
      ]
    }
  ]
}
```

---

### 2.2 角色管理 (Role)

#### 2.2.1 角色列表
*   **接口地址**: `GET /api/v1/admin/system/roles`
*   **权限标识**: `system:role:list`

**响应参数**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "超级管理员",
      "key": "admin",
      "status": 1,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### 2.2.2 创建角色
*   **接口地址**: `POST /api/v1/admin/system/roles`
*   **权限标识**: `system:role:add`

**请求参数**:
```json
{
  "name": "财务",
  "key": "finance",
  "status": 1
}
```

#### 2.2.3 分配菜单权限
*   **接口地址**: `POST /api/v1/admin/system/roles/:id/menus`
*   **权限标识**: `system:role:assign`

**请求参数**:
```json
{
  "menu_ids": [1, 2, 3, 4] // 选中的菜单ID集合
}
```

---

### 2.3 菜单管理 (Menu)

#### 2.3.1 菜单列表
*   **接口地址**: `GET /api/v1/admin/system/menus`
*   **权限标识**: `system:menu:list`
*   **说明**: 返回全量菜单列表（通常为平铺结构，前端自行转树或后端已转树）。

#### 2.3.2 创建菜单/按钮
*   **接口地址**: `POST /api/v1/admin/system/menus`
*   **权限标识**: `system:menu:add`

**请求参数**:
```json
{
  "parent_id": 0,       // 父级ID，0为顶级
  "name": "用户管理",
  "type": 1,            // 1=目录, 2=菜单, 3=按钮
  "path": "/users",
  "component": "Layout",
  "permission": "user:list",
  "sort": 1,
  "visible": true
}
```

---

### 2.4 管理员管理 (Admin User)

#### 2.4.1 管理员列表
*   **接口地址**: `GET /api/v1/admin/system/admins`
*   **权限标识**: `system:admin:list`

**请求参数 (Query)**:
*   `page`: 页码 (默认1)
*   `page_size`: 每页数量 (默认20)

#### 2.4.2 创建管理员
*   **接口地址**: `POST /api/v1/admin/system/admins`
*   **权限标识**: `system:admin:add`

**请求参数**:
```json
{
  "username": "operator01",
  "password": "password123",
  "role_ids": [2] // 分配的角色ID列表
}
```

#### 2.4.3 重置密码
*   **接口地址**: `POST /api/v1/admin/system/admins/:id/reset-pwd`
*   **权限标识**: `system:admin:reset`

**请求参数**:
```json
{
  "password": "newPassword123"
}
```

---

### 2.5 操作日志 (Audit Log)

#### 2.5.1 查询操作日志
*   **接口地址**: `GET /api/v1/admin/system/audit-logs`
*   **权限标识**: `system:log:list`

**请求参数 (Query)**:
*   `admin_id`: 筛选特定管理员
*   `action`: 筛选动作类型 (如 `BAN_USER`)
*   `start_time`, `end_time`: 时间范围
*   `page`, `page_size`: 分页

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "admin_id": 1,
        "admin_name": "admin",
        "action": "BAN_USER",
        "target_type": "user",
        "target_id": 1001,
        "reason": "违规操作",
        "created_at": "..."
      }
    ]
  }
}
```
