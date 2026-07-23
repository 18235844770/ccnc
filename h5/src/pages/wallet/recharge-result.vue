<template>
  <view class="result-page">
    <view class="nav-bar">
      <text class="nav-bar__title">充值结果</text>
    </view>

    <view v-if="loading" class="state-wrap">
      <wd-loading type="circular" />
      <text class="state-text">正在确认充值...</text>
    </view>

    <view v-else-if="success" class="state-wrap">
      <wd-icon name="check-circle" size="64" color="#07c160" />
      <text class="state-title">充值成功</text>
      <text class="state-desc">¥{{ amount }} 已到账</text>
      <wd-button type="primary" custom-class="action-btn" @click="goWallet">返回钱包</wd-button>
    </view>

    <view v-else class="state-wrap">
      <wd-icon name="close-circle" size="64" color="#ee0a24" />
      <text class="state-title">充值失败</text>
      <text class="state-desc">{{ errorMsg || "请稍后重试" }}</text>
      <wd-button type="primary" custom-class="action-btn" @click="onRetry">重试</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { confirmRechargeNotify } from "@/api/wallet";

const loading = ref(true);
const success = ref(false);
const errorMsg = ref("");
const bizId = ref("");
const amount = ref("0");

onLoad((options) => {
  bizId.value = String(options?.biz_id || "");
  amount.value = String(options?.amount || "0");
  if (bizId.value) confirmPay();
  else {
    loading.value = false;
    errorMsg.value = "缺少充值单号";
  }
});

async function confirmPay() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await confirmRechargeNotify({
      biz_id: bizId.value,
      amount: parseFloat(amount.value) || undefined,
      status: "SUCCESS",
    });
    success.value = (res as any)?.status === "success" || !!(res as any)?.recharge_id;
    if (!success.value) errorMsg.value = (res as any)?.message || "确认失败";
  } catch (e: any) {
    success.value = false;
    errorMsg.value = e?.message || "网络错误";
  } finally {
    loading.value = false;
  }
}

function onRetry() {
  confirmPay();
}

function goWallet() {
  uni.redirectTo({ url: "/pages/wallet/index" });
}
</script>

<style lang="scss" scoped>
.result-page { min-height: 100vh; background: $ccnc-bg-page; }
.nav-bar { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding-top: env(safe-area-inset-top); background: $ccnc-bg-card; }
.nav-bar__title { font-size: 34rpx; font-weight: 600; }
.state-wrap { display: flex; flex-direction: column; align-items: center; padding: 120rpx 48rpx; }
.state-text { margin-top: 24rpx; font-size: 28rpx; color: $ccnc-text-secondary; }
.state-title { margin-top: 32rpx; font-size: 36rpx; font-weight: 600; }
.state-desc { margin-top: 16rpx; font-size: 28rpx; color: $ccnc-text-secondary; }
.action-btn { margin-top: 48rpx !important; min-width: 320rpx !important; height: 88rpx !important; border-radius: 44rpx !important; }
</style>
