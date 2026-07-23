<template>
  <view class="pay-callback-page">
    <view v-if="status === 'success'" class="result-card result-card--success">
      <wd-icon name="check-circle" size="80" color="#07c160" />
      <text class="result-title">支付成功</text>
      <text class="result-desc">感谢您的投资</text>
    </view>
    <view v-else-if="status === 'fail'" class="result-card result-card--fail">
      <wd-icon name="close-circle" size="80" color="#ee0a24" />
      <text class="result-title">支付失败</text>
      <text class="result-desc">请重试或联系客服</text>
    </view>
    <view v-else class="result-card">
      <wd-loading type="circular" size="48" />
      <text class="result-desc">正在处理...</text>
    </view>
    <wd-button
      v-if="orderId"
      type="primary"
      block
      custom-class="action-btn"
      @click="onViewOrder"
    >
      查看订单
    </wd-button>
    <wd-button
      block
      custom-class="action-btn action-btn--plain"
      @click="onBack"
    >
      返回首页
    </wd-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

/** success | fail | pending */
const status = ref<"success" | "fail" | "pending">("pending");
const orderId = ref("");

onLoad((options) => {
  orderId.value = String(options?.order_id || "");
  const tradeStatus = options?.trade_status ?? options?.resultStatus;
  if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "9000" || options?.pay_success === "1") {
    status.value = "success";
  } else if (tradeStatus === "TRADE_CLOSED" || tradeStatus === "6001" || options?.pay_fail === "1") {
    status.value = "fail";
  } else if (Object.keys(options || {}).length > 0) {
    status.value = "success";
  }
});

function onViewOrder() {
  if (!orderId.value) return;
  uni.redirectTo({ url: `/pages/order/detail?id=${orderId.value}` });
}

function onBack() {
  uni.switchTab({ url: "/pages/carbon/index" });
}
</script>

<style lang="scss" scoped>
.pay-callback-page {
  min-height: 100vh;
  background: #f6f6f7;
  padding: 80rpx 48rpx;
  padding-top: calc(120rpx + env(safe-area-inset-top));
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 48rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-top: 24rpx;
}

.result-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 12rpx;
}

.action-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  border-radius: 44rpx !important;
  margin-bottom: 24rpx;

  &--plain {
    background: #fff !important;
    color: #333 !important;
  }
}
</style>
