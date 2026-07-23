# H5 用户端 UI 规范

**参考项目**：`新建文件夹/H5`（碳中和服务平台）  
**正式开发目录**：`h5/`（已与参考项目对齐，新页面须延续同一视觉语言）

---

## 1. 设计原则

- 移动端优先，浅灰页面底 + 白色卡片
- 主色 `#1989fa`，强调环保/金融可信感
- 组件库：**wot-design-uni**（`wd-*` 前缀）
- 自定义导航：`navigationStyle: "custom"`，二级页自绘顶栏
- 所有 API 字段 **snake_case**，类型来自 `@ccnc/shared`

---

## 2. 色彩

| 用途 | 变量 | 色值 |
| ---- | ---- | ---- |
| 主色 / Tab 选中 | `$ccnc-primary` | `#1989fa` |
| 成功 / 收益绿 | `$ccnc-success` | `#07c160` |
| 警示红 | `$ccnc-danger` | `#ee0a24` |
| 强调青 | `$ccnc-accent` | `#00d4ff` |
| 页面背景 | `$ccnc-bg-page` | `#f6f6f7` |
| 卡片背景 | `$ccnc-bg-card` | `#ffffff` |
| 主文字 | `$ccnc-text-primary` | `#333333` |
| 次文字 | `$ccnc-text-secondary` | `#666666` |
| 辅助文字 | `$ccnc-text-placeholder` | `#999999` |

变量定义：[h5/src/styles/variables.scss](../h5/src/styles/variables.scss)

---

## 3. 布局与间距

| 元素 | 规范 |
| ---- | ---- |
| 页面左右边距 | `24rpx`（`$ccnc-page-padding`） |
| 卡片圆角 | `16rpx` |
| 卡片阴影 | `0 2rpx 12rpx rgba(0,0,0,0.04)` |
| 区块间距 | `24rpx` |
| 底部 Tab 预留 | `padding-bottom: calc(100rpx + env(safe-area-inset-bottom))` |
| 最小点击区域 | `44px` 等效 |

---

## 4. 页面模板（参考实现）

| 页面 | 参考文件 | 结构要点 |
| ---- | -------- | -------- |
| 首页 | `pages/index/index.vue` | Banner 轮播 + 通知条 + 4 列功能网格 + 反诈 Banner |
| 登录/注册 | `pages/login/index.vue` | 渐变顶栏 + 白卡片表单 + 底部协议 |
| 碳期权列表 | `pages/carbon/index.vue` | 自定义 nav-bar + 产品卡片列表 + 底部 Tab 切换 |
| 产品详情 | `pages/carbon/detail.vue` | nav-bar + 产品信息卡片 + 主按钮 |
| 我的 | `pages/user/index.vue` | 浅蓝头部 + 资产卡片 + 快捷操作 + 功能列表 |
| 资讯 | `pages/consultation/*.vue` | 列表卡片 + 详情正文 |

---

## 5. 组件使用

### 5.1 wot-design-uni

```vue
<wd-button type="primary" block>确认</wd-button>
<wd-input v-model="form.username" label="用户名" clearable />
<wd-icon name="arrow-left" size="22" color="#333" />
<wd-grid :column="4" :border="false">
  <wd-grid-item icon="file" text="功能名" />
</wd-grid>
```

### 5.2 自定义 Navbar

- 通用组件：[h5/src/components/navbar/navbar.vue](../h5/src/components/navbar/navbar.vue)
- 二级页简易顶栏：参考 `carbon/index.vue` 的 `.nav-bar` 结构

### 5.3 公共样式

- 工具类：[h5/src/static/css/modules/index.scss](../h5/src/static/css/modules/index.scss)（flex、ellipsis、间距）
- 全局 base：[h5/src/static/css/modules/base.scss](../h5/src/static/css/modules/base.scss)
- SCSS 混入：[h5/src/styles/mixins.scss](../h5/src/styles/mixins.scss)

---

## 6. 新页面开发 checklist

- [ ] 使用 `$ccnc-bg-page` 页面背景
- [ ] 内容区用白卡片 + `$ccnc-shadow-card`
- [ ] 主操作按钮 `wd-button type="primary" block`
- [ ] 处理 loading / empty / error 三态
- [ ] 预留 TabBar 或安全区 bottom padding
- [ ] 收益率用 `formatYieldRate()` 格式化（小数 → 百分比）
- [ ] 金额用 `formatAmount()`，保留 2 位小数
- [ ] 类型从 `@ccnc/shared` 引入，字段与后端一致

---

## 7. 禁止事项

- 禁止使用「保本保收益」「稳赚不赔」等文案
- 禁止硬编码与参考项目冲突的主色（如 `#007aff` uni 默认蓝）
- 禁止在页面内直接 `axios`，统一走 `@/utils/request`
- 禁止 `list` 作为分页字段，统一 `records`

---

## 8. 相关文档

- [开发规范.md](./开发规范.md) — 前端工程规范
- [packages/shared](../packages/shared/) — 三端统一类型
