<template>
  <view class="order-list-page">
    <view class="nav-bar">
      <view class="nav-bar__back" @click="onBack">
        <wd-icon name="arrow-left" size="22" color="#333" />
      </view>
      <text class="nav-bar__title">订单列表</text>
    </view>

    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="status-tab"
        :class="{ 'status-tab--active': activeStatus === tab.value }"
        @click="onTabChange(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll-content"
      :show-scrollbar="false"
      @scrolltolower="loadMore"
    >
      <view
        v-for="item in orderList"
        :key="item.order_id || item.id"
        class="order-card"
        @click="onOrderClick(item)"
      >
        <view class="order-card__header">
          <text class="order-card__id">订单号 {{ item.order_no || item.order_id || item.id }}</text>
          <view class="order-card__status" :class="'order-card__status--' + (item.status || '').toLowerCase()">
            {{ statusText(item.status) }}
          </view>
        </view>
        <view class="order-card__body">
          <text class="order-card__name">{{ item.product_name || "碳期权产品" }}</text>
          <view class="order-card__row">
            <text class="order-card__label">投资金额</text>
            <text class="order-card__amount">¥{{ item.amount ?? 0 }}</text>
          </view>
          <text class="order-card__time">{{ formatTime(item.created_at) }}</text>
        </view>
      </view>
      <view v-if="loading" class="load-more">
        <wd-loading type="circular" size="24" />
      </view>
      <view v-else-if="!hasMore && orderList.length > 0" class="load-more">
        <text class="load-more__text">没有更多了</text>
      </view>
      <view v-else-if="!loading && orderList.length === 0 && !loadError" class="empty-wrap">
        <wd-icon name="file" size="80" color="#ddd" />
        <text class="empty-text">暂无订单</text>
      </view>
      <view v-else-if="loadError" class="empty-wrap">
        <text class="empty-text">加载失败</text>
        <wd-button size="small" type="primary" custom-class="retry-btn" @click="onRetry">重试</wd-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchOrderList } from "@/api/order";
import { useUserStore } from "@/store/user";
import type { OrderItem } from "@/api/order";
import { getPageData } from "@/utils/api-helper";
import { ORDER_STATUS_TABS, orderStatusText } from "@/utils/order-status";

const userStore = useUserStore();
const orderList = ref<OrderItem[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const hasMore = ref(true);
const loadError = ref(false);
const activeStatus = ref("");

const statusTabs = ORDER_STATUS_TABS;

function statusText(s?: string) {
  return orderStatusText(s);
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onLoad(() => {
  loadList();
});

async function loadList() {
  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => uni.navigateTo({ url: "/pages/login/index" }), 500);
    return;
  }
  if (loading.value) return;
  loading.value = true;
  loadError.value = false;
  try {
    const res = await fetchOrderList({
      page: page.value,
      page_size: pageSize,
      status: activeStatus.value || undefined,
    });
    const { list, total: t } = getPageData<OrderItem>(res);
    total.value = t;
    if (page.value === 1) orderList.value = list;
    else orderList.value = [...orderList.value, ...list];
    hasMore.value = orderList.value.length < total.value;
  } catch (e) {
    console.error("loadOrderList error:", e);
    loadError.value = page.value === 1;
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadList();
}

function onTabChange(status: string) {
  activeStatus.value = status;
  page.value = 1;
  orderList.value = [];
  hasMore.value = true;
  loadList();
}

function onRetry() {
  page.value = 1;
  orderList.value = [];
  hasMore.value = true;
  loadList();
}

function onBack() {
  uni.navigateBack();
}

function onOrderClick(item: OrderItem) {
  const id = item.order_id ?? item.id;
  if (id) uni.navigateTo({ url: `/pages/order/detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background: #f6f6f7;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: #fff;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.nav-bar__back {
  position: absolute;
  left: 24rpx;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.status-tabs {
  display: flex;
  background: #fff;
  padding: 0 24rpx 24rpx;
  gap: 24rpx;
  overflow-x: auto;
}

.status-tab {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 32rpx;

  &--active {
    background: #1989fa;
    color: #fff;
  }
}

.scroll-content {
  height: calc(100vh - 88rpx - 120rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: 24rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-card__id {
  font-size: 24rpx;
  color: #999;
}

.order-card__status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;

  &--pending {
    background: #fff7e6;
    color: #fa8c16;
  }

  &--paid,
  &--active {
    background: #f6ffed;
    color: #52c41a;
  }

  &--settled {
    background: #e6f7ff;
    color: #1890ff;
  }

  &--cancelled,
  &--refunded {
    background: #f5f5f5;
    color: #999;
  }
}

.order-card__body {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-card__name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.order-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.order-card__label {
  font-size: 26rpx;
  color: #666;
}

.order-card__amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #ee0a24;
}

.order-card__time {
  font-size: 24rpx;
  color: #999;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx;
}

.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}

.retry-btn {
  margin-top: 24rpx;
}
</style>
