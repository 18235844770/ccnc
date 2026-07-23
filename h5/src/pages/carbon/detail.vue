<template>
  <view class="product-detail-page">
    <page-nav-bar
      title="产品详情"
      fallback="/pages/carbon/index"
      background="linear-gradient(180deg, #e8f4ff 0%, #f0f8ff 100%)"
      :shadow="false"
    />

    <scroll-view v-if="product" scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="product-card">
        <text class="product-name">{{ product.name }}</text>
        <text class="product-desc">{{ product.description || "暂无描述" }}</text>
        <view class="product-info">
          <view class="info-row">
            <text class="info-label">年化收益率</text>
            <text class="info-value info-value--green">{{ formatYieldRate(product.yield_rate) }}%</text>
          </view>
          <view class="info-row">
            <text class="info-label">投资周期</text>
            <text class="info-value">{{ product.cycle_days ?? 0 }}天</text>
          </view>
          <view class="info-row">
            <text class="info-label">起投金额</text>
            <text class="info-value">{{ formatAmount(product.min_amount) }}元</text>
          </view>
        </view>
      </view>

      <view class="risk-card">
        <text class="risk-card__title">产品说明</text>
        <text class="risk-card__text">
          本产品与碳汇/碳期权相关，收益受市场及项目周期影响，历史表现不代表未来收益。
        </text>
        <text class="risk-card__title">风险揭示</text>
        <text class="risk-card__text">· 不承诺保本保收益，请勿相信稳赚不赔宣传</text>
        <text class="risk-card__text">· 请确认投资金额在自身承受范围内</text>
        <text class="risk-card__text">· 下单前请仔细阅读相关协议与规则</text>
      </view>
    </scroll-view>

    <view v-if="product" class="bottom-bar">
      <wd-button type="primary" block custom-class="invest-btn" @click="onInvest">
        立即投资
      </wd-button>
    </view>

    <view v-else-if="loading" class="loading-wrap">
      <wd-loading type="circular" />
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else class="empty-wrap">
      <text class="empty-text">产品不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchProductDetail } from "@/api/product";
import { useUserStore } from "@/store/user";
import type { ProductItem } from "@/api/product";
import { formatYieldRate, formatAmount } from "@/utils/format";

const product = ref<ProductItem | null>(null);
const loading = ref(true);
const userStore = useUserStore();
const productId = ref("");

onLoad((options) => {
  productId.value = String(options?.id || "");
  if (productId.value) loadDetail(productId.value);
  else loading.value = false;
});

async function loadDetail(id: string) {
  try {
    const res = await fetchProductDetail(id);
    product.value = (res as any)?.data ?? res ?? null;
  } catch (e) {
    console.error("loadProductDetail error:", e);
    product.value = null;
  } finally {
    loading.value = false;
  }
}

function onBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/carbon/index" }) });
}

function onInvest() {
  if (!productId.value) return;
  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/login/index?redirect=${encodeURIComponent("/pages/carbon/detail?id=" + productId.value)}`,
      });
    }, 500);
    return;
  }
  uni.navigateTo({ url: `/pages/order/create?product_id=${productId.value}` });
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: linear-gradient(180deg, #e8f4ff 0%, #f0f8ff 100%);
  position: relative;
}

.nav-bar__back {
  position: absolute;
  left: $ccnc-page-padding;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.scroll-content {
  height: calc(100vh - 88rpx - 120rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: $ccnc-page-padding;
}

.product-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 40rpx;
  box-shadow: $ccnc-shadow-card;
  margin-bottom: $ccnc-section-gap;
}

.product-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $ccnc-text-primary;
  margin-bottom: 20rpx;
}

.product-desc {
  display: block;
  font-size: 28rpx;
  color: $ccnc-text-secondary;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 28rpx;
  color: $ccnc-text-secondary;
}

.info-value {
  font-size: 30rpx;
  font-weight: 500;
  color: $ccnc-text-primary;

  &--green {
    @include ccnc-value-green;
    font-size: 34rpx;
  }
}

.risk-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  box-shadow: $ccnc-shadow-card;
}

.risk-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  margin-bottom: 16rpx;
  margin-top: 8rpx;

  &:first-child {
    margin-top: 0;
  }
}

.risk-card__text {
  display: block;
  font-size: 26rpx;
  color: $ccnc-text-secondary;
  line-height: 1.7;
  margin-bottom: 8rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx $ccnc-page-padding;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: $ccnc-bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.invest-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  border-radius: 44rpx !important;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx;
}

.loading-text,
.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: $ccnc-text-placeholder;
}
</style>
