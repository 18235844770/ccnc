<template>
  <view class="recharge-page">
    <page-nav-bar title="充值" fallback="/pages/wallet/index" />

    <scroll-view scroll-y class="scroll-content">
      <view class="balance-tip">当前可用余额 ¥{{ formatAmount(available) }}</view>
      <view class="form-card">
        <text class="form-label">充值金额</text>
        <wd-input v-model="amount" type="digit" placeholder="最低 100 元" :border="true" />
        <view class="quick-amounts">
          <text
            v-for="n in quickAmounts"
            :key="n"
            class="quick-amount"
            @click="amount = String(n)"
          >{{ n }} 元</text>
        </view>
        <text class="form-label form-label--mt">支付方式</text>
        <view class="channel-row">
          <view
            class="channel-item"
            :class="{ 'channel-item--active': channel === 'ALIPAY' }"
            @click="channel = 'ALIPAY'"
          >支付宝（模拟）</view>
          <view
            class="channel-item"
            :class="{ 'channel-item--active': channel === 'MOCK' }"
            @click="channel = 'MOCK'"
          >快捷充值</view>
        </view>
        <wd-button type="primary" block :loading="submitting" custom-class="submit-btn" @click="onSubmit">
          确认充值
        </wd-button>
      </view>

      <view class="section-title">充值记录</view>
      <view v-for="item in records" :key="item.id" class="record-card">
        <view>
          <text class="record-card__amount">+¥{{ formatAmount(item.amount) }}</text>
          <text class="record-card__time">{{ formatTime(item.created_at) }}</text>
        </view>
        <text class="record-card__status">{{ statusText(item.status) }}</text>
      </view>
      <view v-if="!records.length && !loading" class="empty-tip">暂无充值记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchWallets, createRecharge, fetchRecharges } from "@/api/wallet";
import type { RechargeItem } from "@/api/wallet";
import { formatAmount } from "@/utils/format";

const available = ref(0);
const amount = ref("");
const channel = ref("ALIPAY");
const submitting = ref(false);
const loading = ref(false);
const records = ref<RechargeItem[]>([]);
const quickAmounts = [100, 500, 1000, 5000];

onShow(() => {
  loadWallet();
  loadRecords();
});

async function loadWallet() {
  try {
    const res = await fetchWallets();
    const list = (res as any)?.data ?? [];
    available.value = list.find((w: any) => w.type === "BALANCE")?.balance_available ?? 0;
  } catch (e) {
    console.error(e);
  }
}

async function loadRecords() {
  loading.value = true;
  try {
    const res = await fetchRecharges({ page: 1, page_size: 10 });
    records.value = (res as any)?.data?.records ?? [];
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  const n = parseFloat(amount.value);
  if (isNaN(n) || n < 100) {
    uni.showToast({ title: "充值金额不能低于 100 元", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    const res = await createRecharge({ amount: n, channel: channel.value });
    const data = (res as any)?.data;
    if (channel.value === "MOCK" && data?.biz_id) {
      uni.navigateTo({
        url: `/pages/wallet/recharge-result?biz_id=${encodeURIComponent(data.biz_id)}&amount=${n}`,
      });
      return;
    }
    if (data?.pay_url) {
      // #ifdef H5
      window.location.href = data.pay_url;
      // #endif
      // #ifndef H5
      uni.navigateTo({
        url: `/pages/wallet/recharge-result?biz_id=${encodeURIComponent(data.biz_id)}&amount=${n}`,
      });
      // #endif
    }
  } catch (e) {
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

function statusText(s?: string) {
  const map: Record<string, string> = {
    PENDING: "待支付",
    SUCCESS: "成功",
    FAILED: "失败",
  };
  return map[s || ""] || s || "";
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN");
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.recharge-page { min-height: 100vh; background: $ccnc-bg-page; }
.nav-bar { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding-top: env(safe-area-inset-top); background: $ccnc-bg-card; position: relative; }
.nav-bar__back { position: absolute; left: $ccnc-page-padding; padding: 16rpx; }
.nav-bar__title { font-size: 34rpx; font-weight: 600; }
.scroll-content { height: calc(100vh - 88rpx - env(safe-area-inset-top)); padding: $ccnc-page-padding; }
.balance-tip { font-size: 28rpx; color: $ccnc-text-secondary; margin-bottom: 24rpx; }
.form-card { background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 32rpx; box-shadow: $ccnc-shadow-card; margin-bottom: 32rpx; }
.form-label { display: block; font-size: 28rpx; color: $ccnc-text-primary; margin-bottom: 16rpx; &--mt { margin-top: 24rpx; } }
.quick-amounts { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 20rpx; }
.quick-amount { padding: 12rpx 24rpx; background: #f5f6f8; border-radius: 32rpx; font-size: 24rpx; color: $ccnc-text-secondary; }
.channel-row { display: flex; gap: 16rpx; margin-bottom: 8rpx; }
.channel-item { flex: 1; text-align: center; padding: 20rpx; border: 2rpx solid #eee; border-radius: 12rpx; font-size: 26rpx; &--active { border-color: $ccnc-primary; color: $ccnc-primary; background: rgba(25, 137, 250, 0.06); } }
.submit-btn { margin-top: 40rpx !important; height: 88rpx !important; border-radius: 44rpx !important; }
.section-title { font-size: 30rpx; font-weight: 600; margin-bottom: 20rpx; }
.record-card { display: flex; justify-content: space-between; align-items: center; background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 28rpx; margin-bottom: 16rpx; }
.record-card__amount { display: block; font-size: 32rpx; font-weight: 600; color: #07c160; }
.record-card__time { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.record-card__status { font-size: 26rpx; color: $ccnc-primary; }
.empty-tip { text-align: center; color: $ccnc-text-placeholder; padding: 48rpx; }
</style>
