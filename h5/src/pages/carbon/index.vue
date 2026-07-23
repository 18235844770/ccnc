<template>
  <view class="carbon-page">
    <page-nav-bar
      :title="activeTab === 'carbon' ? '碳期权' : '一键去碳'"
      fallback="/pages/index/index"
      background="linear-gradient(180deg, #e8f4ff 0%, #f0f8ff 100%)"
      :shadow="false"
    />

    <!-- 碳期权：产品列表 -->
    <scroll-view
      v-show="activeTab === 'carbon'"
      scroll-y
      class="scroll-content"
      :show-scrollbar="false"
      @scrolltolower="loadMore"
    >
      <view
        v-for="item in productList"
        :key="item.id"
        class="product-card"
        @click="onProductClick(item)"
      >
        <view class="product-card__header">
          <text class="product-card__title">{{ item.name }}</text>
          <view class="product-card__tag" :class="{ 'product-card__tag--sale': item.status === 'ON_SALE' }">
            {{ item.status === "ON_SALE" ? "在售" : "已下架" }}
          </view>
        </view>
        <view class="product-card__body">
          <view class="product-row">
            <text class="product-label">年化收益率</text>
            <text class="product-value product-value--green">{{ formatYieldRate(item.yield_rate) }}%</text>
          </view>
          <view class="product-row">
            <text class="product-label">投资周期</text>
            <text class="product-value">{{ item.cycle_days ?? 0 }}天</text>
          </view>
          <view class="product-row">
            <text class="product-label">起投金额</text>
            <text class="product-value">{{ item.min_amount ?? 0 }}元</text>
          </view>
        </view>
      </view>
      <view v-if="loading" class="load-more">
        <wd-loading type="circular" size="24" />
      </view>
      <view v-else-if="!hasMore && productList.length > 0" class="load-more">
        <text class="load-more__text">没有更多了</text>
      </view>
      <view v-else-if="!loading && productList.length === 0" class="empty-wrap">
        <text class="empty-text">暂无产品</text>
      </view>
    </scroll-view>

    <!-- 一键去碳：占位 -->
    <view v-show="activeTab === 'decarbon'" class="decarbon-placeholder">
      <wd-icon name="chart-pie" size="80" color="#ddd" />
      <text class="decarbon-placeholder__text">一键去碳功能敬请期待</text>
    </view>

    <!-- 底部切换栏 -->
    <view class="bottom-bar">
      <view
        class="bottom-bar__btn bottom-bar__btn--active"
        @click="onTabChange('carbon')"
      >
        碳期权
      </view>
      <view
        class="bottom-bar__btn"
        @click="onTabChange('decarbon')"
      >
        一键去碳
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchProducts } from "@/api/product";
import type { ProductItem } from "@/api/product";
import { getPageData } from "@/utils/api-helper";
import { formatYieldRate } from "@/utils/format";

const activeTab = ref<"carbon" | "decarbon">("carbon");
const productList = ref<ProductItem[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const hasMore = ref(true);

onLoad(() => {
  loadProducts();
});

async function loadProducts() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fetchProducts({ page: page.value, page_size: pageSize, status: "ON_SALE" });
    const { list, total: t } = getPageData<ProductItem>(res);
    total.value = t;
    if (page.value === 1) productList.value = list;
    else productList.value = [...productList.value, ...list];
    hasMore.value = productList.value.length < total.value;
  } catch (e) {
    console.error("loadProducts error:", e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadProducts();
}

function onBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/index/index" }) });
}

function onProductClick(item: ProductItem) {
  uni.navigateTo({ url: `/pages/carbon/detail?id=${item.id}` });
}

function onTabChange(tab: "carbon" | "decarbon") {
  activeTab.value = tab;
  if (tab === "decarbon") {
    uni.showToast({ title: "一键去碳功能敬请期待", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.carbon-page {
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f6f6f7;
  /* 底栏切换 + 原生 tabBar + 安全区 */
  padding-bottom: calc(120rpx + 100rpx + env(safe-area-inset-bottom));
}

/* 导航栏 */
.nav-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, #e8f4ff 0%, #f0f8ff 100%);
  position: relative;
}

.nav-bar__back {
  position: absolute;
  left: 24rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

/* 内容区 */
.scroll-content {
  flex: 1;
  height: 0;
  min-height: 0;
  padding: 24rpx;
}

/* 产品卡片 */
.product-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.product-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.product-card__title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-right: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card__tag {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  background: #e0e0e0;
  color: #999;
  font-size: 22rpx;
  border-radius: 8rpx;

  &--sale {
    background: rgba(7, 193, 96, 0.15);
    color: #07c160;
  }
}

.product-card__body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-label {
  font-size: 26rpx;
  color: #666;
}

.product-value {
  font-size: 26rpx;
  color: #333;

  &--green {
    color: #07c160;
    font-weight: 600;
  }
}

.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more__text {
  font-size: 26rpx;
  color: #999;
}

.empty-wrap {
  padding: 120rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.decarbon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx;
}

.decarbon-placeholder__text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}

/* 底部切换栏 */
.bottom-bar {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  z-index: 100;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.bottom-bar__btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 12rpx;
  background: #fff;
  color: #1989fa;
  border: 2rpx solid #1989fa;

  &--active {
    background: #1989fa;
    color: #fff;
    border-color: #1989fa;
  }
}
</style>
