# 模块八：数据统计 (Data Statistics)

## 1. 业务需求概述

数据统计模块是运营人员进行决策分析的核心工具。它汇总了用户、资金、交易、推广等各个维度的数据，通过可视化图表和关键指标卡片的形式展示平台运营状况。

### 核心功能点
1.  **控制台 (Dashboard)**：一站式查看今日/累计的核心指标（新增用户、充值金额、提现金额、佣金发放等）。
2.  **用户分析**：分析用户增长趋势和转化漏斗（注册->实名->首投）。
3.  **资金分析**：监控平台资金池的流入流出情况及产品销售分布。
4.  **推广分析**：评估裂变效果，查看推广层级分布和TOP推广员排行。
5.  **佣金分析**：核算佣金成本率，监控待发佣金规模。
6.  **数据导出**：支持将统计报表导出为文件（目前后端返回任务ID，需配合异步任务模块）。

---

## 2. 接口 API 文档

### 2.1 综合看板

#### 2.1.1 数据总览
*   **接口地址**: `GET /api/v1/admin/stats/overview`
*   **权限标识**: `stats:view`
*   **功能描述**: 获取仪表盘所需的各类汇总数据和趋势图数据。

**请求参数 (Query)**:
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `from` | time | 否 | 开始时间 (RFC3339) |
| `to` | time | 否 | 结束时间 |
| `granularity` | string | 否 | 粒度: `day` (默认), `week`, `month` |

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "cards": {
      "new_users": 100,
      "invest_amount": 50000.00,
      "withdraw_success_amount": 10000.00,
      "commission_paid": 5000.00,
      "...": "更多指标"
    },
    "new_users_series": [
      { "bucket": "2023-01-01", "value": 10 },
      { "bucket": "2023-01-02", "value": 15 }
    ],
    "invest_amount_series": [ ... ]
  }
}
```

---

### 2.2 专项报表

#### 2.2.1 用户增长
*   **接口地址**: `GET /api/v1/admin/stats/users/growth`
*   **权限标识**: `stats:view`
*   **功能描述**: 单独获取用户增长趋势数据。

#### 2.2.2 转化漏斗
*   **接口地址**: `GET /api/v1/admin/stats/users/conversion`
*   **权限标识**: `stats:view`
*   **功能描述**: 分析从注册到首投的转化率。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "new_users": 1000,
    "first_invest_users": 200,
    "conversion_rate": 0.2
  }
}
```

#### 2.2.3 推广概况
*   **接口地址**: `GET /api/v1/admin/stats/promo/summary`
*   **权限标识**: `stats:view`
*   **功能描述**: 查看 1/2/3 级下线的人数分布趋势。

#### 2.2.4 推广排行榜
*   **接口地址**: `GET /api/v1/admin/stats/promo/top`
*   **权限标识**: `stats:view`
*   **功能描述**: 获取推广业绩最好的用户列表。

**请求参数 (Query)**:
*   `by`: string (排序依据: `invite_count`, `team_invest`, `team_commission`)
*   `limit`: int (默认50)

#### 2.2.5 资金概况
*   **接口地址**: `GET /api/v1/admin/stats/invest/summary`
*   **权限标识**: `stats:view`
*   **功能描述**: 投资金额与订单量的趋势分析。

#### 2.2.6 产品销量排行
*   **接口地址**: `GET /api/v1/admin/stats/invest/by-product`
*   **权限标识**: `stats:view`
*   **功能描述**: 按产品维度统计销售额和订单数。

#### 2.2.7 佣金概况
*   **接口地址**: `GET /api/v1/admin/stats/commission/summary`
*   **权限标识**: `stats:view`
*   **功能描述**: 各状态（待结算、已发放等）佣金的金额趋势。

#### 2.2.8 佣金成本率
*   **接口地址**: `GET /api/v1/admin/stats/commission/cost-rate`
*   **权限标识**: `stats:view`
*   **功能描述**: 计算佣金支出占总营收（投资额或利润）的比例。

---

### 2.3 数据工具

#### 2.3.1 导出报表
*   **接口地址**: `POST /api/v1/admin/stats/export`
*   **权限标识**: `stats:export`
*   **功能描述**: 创建一个异步导出任务，返回任务ID。

**响应参数**:
```json
{
  "status": "success",
  "data": {
    "task_id": "EXPORT-1672531200"
  }
}
```
